import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { socketClient } from "./socketClient"
import { useSessionStore } from "../auth/sessionStore"
import { finalizeClientLogout } from "../auth/sessionLifecycle"
import { recaladasKeys } from "../../features/recaladas/data/recaladas.keys"
import { atencionesKeys } from "../../features/atenciones/data/atenciones.keys"
import { turnosKeys } from "../../features/turnos/data/turnos.keys"
import { usersKeys } from "../../features/users/data/users.keys"
import { adminUsersKeys } from "../../features/admin/users/data/adminUsers.keys"
import { invitationsKeys } from "../../features/admin/invitations/data/invitations.keys"
import { catalogsKeys } from "../../features/admin/catalogs/data/catalogs.keys"

interface TurnoSocketPayload {
  turnoId: number
  atencionId?: number
  recaladaId?: number | null
}

interface AtencionSocketPayload {
  atencionId: number
  recaladaId?: number | null
}

interface RecaladaSocketPayload {
  recaladaId: number
}

interface UserSocketPayload {
  userId?: string
}

interface CatalogSocketPayload {
  paisId?: number
  buqueId?: number
}

export function useGlobalRealtime() {
  const queryClient = useQueryClient()
  const accessToken = useSessionStore((s) => s.accessToken)
  const currentUserId = useSessionStore((s) => s.user?.id)

  useEffect(() => {
    if (!accessToken) return

    socketClient.connect(accessToken)
    const socket = socketClient.getSocket()
    if (!socket) return

    const forceLogout = () => {
      void finalizeClientLogout({
        notice: {
          kind: "warning",
          message: "Tu sesión fue cerrada. Inicia sesión nuevamente.",
        },
      })
    }

    const invalidateSessions = () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] })
    }

    const invalidateTurnos = (payload: TurnoSocketPayload) => {
      queryClient.invalidateQueries({ queryKey: turnosKeys.all })
      queryClient.invalidateQueries({ queryKey: ["myTurnos"] })
      queryClient.invalidateQueries({ queryKey: ["myNextTurno"] })
      queryClient.invalidateQueries({ queryKey: ["myActiveTurno"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] })
      if (payload.turnoId) {
        queryClient.invalidateQueries({ queryKey: turnosKeys.detail(payload.turnoId) })
      }
      if (payload.atencionId) {
        queryClient.invalidateQueries({ queryKey: atencionesKeys.detail(payload.atencionId) })
        queryClient.invalidateQueries({ queryKey: atencionesKeys.turnos(payload.atencionId) })
        queryClient.invalidateQueries({ queryKey: atencionesKeys.summary(payload.atencionId) })
      }
      if (payload.recaladaId) {
        queryClient.invalidateQueries({ queryKey: recaladasKeys.detail(payload.recaladaId) })
        queryClient.invalidateQueries({ queryKey: recaladasKeys.atenciones(payload.recaladaId) })
      }
    }

    const invalidateAtenciones = (payload: AtencionSocketPayload) => {
      queryClient.invalidateQueries({ queryKey: atencionesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] })
      if (payload.atencionId) {
        queryClient.invalidateQueries({ queryKey: atencionesKeys.detail(payload.atencionId) })
        queryClient.invalidateQueries({ queryKey: atencionesKeys.turnos(payload.atencionId) })
        queryClient.invalidateQueries({ queryKey: atencionesKeys.summary(payload.atencionId) })
      }
      if (payload.recaladaId) {
        queryClient.invalidateQueries({ queryKey: recaladasKeys.detail(payload.recaladaId) })
        queryClient.invalidateQueries({ queryKey: recaladasKeys.atenciones(payload.recaladaId) })
      }
    }

    const invalidateRecaladas = (payload: RecaladaSocketPayload) => {
      queryClient.invalidateQueries({ queryKey: recaladasKeys.lists() })
      queryClient.invalidateQueries({ queryKey: atencionesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] })
      if (payload.recaladaId) {
        queryClient.invalidateQueries({ queryKey: recaladasKeys.detail(payload.recaladaId) })
        queryClient.invalidateQueries({ queryKey: recaladasKeys.atenciones(payload.recaladaId) })
      }
    }

    const invalidateUsers = (payload: UserSocketPayload) => {
      queryClient.invalidateQueries({ queryKey: adminUsersKeys.lists() })
      queryClient.invalidateQueries({ queryKey: usersKeys.guidesLookup() })
      if (payload.userId) {
        queryClient.invalidateQueries({ queryKey: adminUsersKeys.detail(payload.userId) })
      }
      if (payload.userId && payload.userId === currentUserId) {
        queryClient.invalidateQueries({ queryKey: usersKeys.me() })
      }
    }

    const invalidateInvitations = () => {
      queryClient.invalidateQueries({ queryKey: invitationsKeys.lists() })
    }

    const invalidatePais = (payload: CatalogSocketPayload) => {
      queryClient.invalidateQueries({ queryKey: catalogsKeys.paises.lists() })
      queryClient.invalidateQueries({ queryKey: catalogsKeys.paises.lookup() })
      if (payload.paisId) {
        queryClient.invalidateQueries({ queryKey: catalogsKeys.paises.detail(payload.paisId) })
      }
    }

    const invalidateBuque = (payload: CatalogSocketPayload) => {
      queryClient.invalidateQueries({ queryKey: catalogsKeys.buques.lists() })
      queryClient.invalidateQueries({ queryKey: catalogsKeys.buques.lookup() })
      if (payload.buqueId) {
        queryClient.invalidateQueries({ queryKey: catalogsKeys.buques.detail(payload.buqueId) })
      }
    }

    socket.on("auth:sessionRevoked", forceLogout)
    socket.on("auth:sessionsChanged", invalidateSessions)

    socket.on("turno:assigned", invalidateTurnos)
    socket.on("turno:claimed", invalidateTurnos)
    socket.on("turno:checkedIn", invalidateTurnos)
    socket.on("turno:checkedOut", invalidateTurnos)
    socket.on("turno:unassigned", invalidateTurnos)
    socket.on("turno:noShow", invalidateTurnos)
    socket.on("turno:canceled", invalidateTurnos)

    socket.on("atencion:created", invalidateAtenciones)
    socket.on("atencion:updated", invalidateAtenciones)
    socket.on("atencion:canceled", invalidateAtenciones)
    socket.on("atencion:closed", invalidateAtenciones)

    socket.on("recalada:created", invalidateRecaladas)
    socket.on("recalada:updated", invalidateRecaladas)
    socket.on("recalada:arrived", invalidateRecaladas)
    socket.on("recalada:departed", invalidateRecaladas)
    socket.on("recalada:canceled", invalidateRecaladas)

    socket.on("user:created", invalidateUsers)
    socket.on("user:updated", invalidateUsers)
    socket.on("user:deactivated", invalidateUsers)
    socket.on("guides:lookupChanged", invalidateUsers)

    socket.on("invitation:created", invalidateInvitations)
    socket.on("invitation:resent", invalidateInvitations)
    socket.on("invitation:used", invalidateInvitations)
    socket.on("invitation:expired", invalidateInvitations)

    socket.on("catalog:pais:created", invalidatePais)
    socket.on("catalog:pais:updated", invalidatePais)
    socket.on("catalog:pais:removed", invalidatePais)
    socket.on("catalog:pais:bulkChanged", invalidatePais)
    socket.on("catalog:buque:created", invalidateBuque)
    socket.on("catalog:buque:updated", invalidateBuque)
    socket.on("catalog:buque:removed", invalidateBuque)
    socket.on("catalog:buque:bulkChanged", invalidateBuque)

    return () => {
      socket.off("auth:sessionRevoked", forceLogout)
      socket.off("auth:sessionsChanged", invalidateSessions)

      socket.off("turno:assigned", invalidateTurnos)
      socket.off("turno:claimed", invalidateTurnos)
      socket.off("turno:checkedIn", invalidateTurnos)
      socket.off("turno:checkedOut", invalidateTurnos)
      socket.off("turno:unassigned", invalidateTurnos)
      socket.off("turno:noShow", invalidateTurnos)
      socket.off("turno:canceled", invalidateTurnos)

      socket.off("atencion:created", invalidateAtenciones)
      socket.off("atencion:updated", invalidateAtenciones)
      socket.off("atencion:canceled", invalidateAtenciones)
      socket.off("atencion:closed", invalidateAtenciones)

      socket.off("recalada:created", invalidateRecaladas)
      socket.off("recalada:updated", invalidateRecaladas)
      socket.off("recalada:arrived", invalidateRecaladas)
      socket.off("recalada:departed", invalidateRecaladas)
      socket.off("recalada:canceled", invalidateRecaladas)

      socket.off("user:created", invalidateUsers)
      socket.off("user:updated", invalidateUsers)
      socket.off("user:deactivated", invalidateUsers)
      socket.off("guides:lookupChanged", invalidateUsers)

      socket.off("invitation:created", invalidateInvitations)
      socket.off("invitation:resent", invalidateInvitations)
      socket.off("invitation:used", invalidateInvitations)
      socket.off("invitation:expired", invalidateInvitations)

      socket.off("catalog:pais:created", invalidatePais)
      socket.off("catalog:pais:updated", invalidatePais)
      socket.off("catalog:pais:removed", invalidatePais)
      socket.off("catalog:pais:bulkChanged", invalidatePais)
      socket.off("catalog:buque:created", invalidateBuque)
      socket.off("catalog:buque:updated", invalidateBuque)
      socket.off("catalog:buque:removed", invalidateBuque)
      socket.off("catalog:buque:bulkChanged", invalidateBuque)
    }
  }, [accessToken, currentUserId, queryClient])
}
