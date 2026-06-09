import { useEffect, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toastController } from "@ionic/core"
import { useHistory } from "react-router-dom"
import { socketClient } from "./socketClient"
import { useSessionStore } from "../auth/sessionStore"
import { finalizeClientLogout } from "../auth/sessionLifecycle"
import { useAlertStore } from "../../app/stores/alertStore"
import type { OperationalAlertSeverity } from "../../app/stores/alertStore"
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
  puertoId?: number
  muelleId?: number
}

interface AtencionNuevaPayload {
  notificationId?: string
  atencionId: number
  recaladaId?: number
  fechaInicio?: string
  fechaFin?: string
}

interface RecaladaNuevaPayload {
  notificationId?: string
  recaladaId: number
}

interface DisponibilidadPenalizadoPayload {
  turnoId?: number
  atencionId?: number
  mensaje: string
}

interface DisponibilidadGlobalPayload {
  userId?: string
}

interface OpNotifPayload {
  notificationId: string
  type: string
  route: string
  title: string
  body: string
  recaladaId?: number | null
  atencionId?: number | null
  turnoId?: number | null
}

const DETAIL_ROUTE = /^\/(recaladas|atenciones|turnos)\/\d+(\?.*)?$/

/**
 * Normaliza la ruta de una notificación a una ruta válida en mobile.
 * - `GUIDE_PENALIZED` / rutas `/perfil*` → `/profile` (no existe `/perfil`).
 * - Rutas de detalle conocidas pasan tal cual.
 * - En último caso se reconstruye desde los ids del payload.
 */
function normalizeAlertRoute(payload: OpNotifPayload): string | null {
  const raw = payload.route ?? ""

  if (payload.type === "GUIDE_PENALIZED" || raw.startsWith("/perfil")) {
    return "/profile"
  }

  if (DETAIL_ROUTE.test(raw)) return raw

  if (payload.turnoId) return `/turnos/${payload.turnoId}`
  if (payload.atencionId) return `/atenciones/${payload.atencionId}`
  if (payload.recaladaId) return `/recaladas/${payload.recaladaId}`

  if (
    raw.startsWith("/recaladas") ||
    raw.startsWith("/atenciones") ||
    raw.startsWith("/turnos")
  ) {
    return raw
  }

  return null
}

// Cooldown de toast por notificationId. Las alertas job-driven repiten cada
// minuto en el server (limitadas a 30 min por socket); aquí mantenemos un único
// toast visible por ventana. Las dirigidas al usuario llevan id único.
const JOB_ALERT_TOAST_COOLDOWN_MS = 5 * 60 * 1000
const USER_ALERT_TOAST_COOLDOWN_MS = 15 * 1000
const lastToastAtByNotificationId = new Map<string, number>()

function shouldShowToast(notificationId: string, cooldownMs: number): boolean {
  const now = Date.now()
  const last = lastToastAtByNotificationId.get(notificationId)
  if (last !== undefined && now - last < cooldownMs) return false
  lastToastAtByNotificationId.set(notificationId, now)
  return true
}

const SEVERITY_COLOR: Record<OperationalAlertSeverity, "success" | "primary" | "warning"> = {
  success: "success",
  info: "primary",
  warning: "warning",
}

export function useGlobalRealtime() {
  const queryClient = useQueryClient()
  const accessToken = useSessionStore((s) => s.accessToken)
  const currentUserId = useSessionStore((s) => s.user?.id)
  const history = useHistory()
  // Ref para navegar desde el handler imperativo del toast sin recapturar.
  const navigateRef = useRef(history)
  navigateRef.current = history

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

    const invalidateDisponibilidadGlobal = (payload: DisponibilidadGlobalPayload) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.guidesLookup() })
      queryClient.invalidateQueries({ queryKey: usersKeys.guideAvailability() })
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] })
      if (payload.userId && payload.userId === currentUserId) {
        queryClient.invalidateQueries({ queryKey: usersKeys.me() })
      }
    }

    const invalidateOperationalConfig = () => {
      queryClient.invalidateQueries({ queryKey: ["operational-config"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] })
      queryClient.invalidateQueries({ queryKey: usersKeys.me() })
      queryClient.invalidateQueries({ queryKey: usersKeys.guidesLookup() })
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

    const invalidatePuerto = (payload: CatalogSocketPayload) => {
      queryClient.invalidateQueries({ queryKey: catalogsKeys.puertos.lists() })
      queryClient.invalidateQueries({ queryKey: catalogsKeys.puertos.lookup() })
      queryClient.invalidateQueries({ queryKey: recaladasKeys.lists() })
      if (payload.puertoId) {
        queryClient.invalidateQueries({ queryKey: catalogsKeys.puertos.detail(payload.puertoId) })
      }
    }

    const invalidateMuelle = (payload: CatalogSocketPayload) => {
      queryClient.invalidateQueries({ queryKey: catalogsKeys.muelles.lists() })
      queryClient.invalidateQueries({ queryKey: catalogsKeys.muelles.lookup() })
      queryClient.invalidateQueries({ queryKey: recaladasKeys.lists() })
      if (payload.muelleId) {
        queryClient.invalidateQueries({ queryKey: catalogsKeys.muelles.detail(payload.muelleId) })
      }
    }

    const showToast = async (
      message: string,
      color: "success" | "danger" | "warning" | "primary"
    ) => {
      const toast = await toastController.create({
        message,
        duration: 4000,
        position: "top",
        color,
      })
      await toast.present()
    }

    const handleAtencionNueva = (payload: AtencionNuevaPayload) => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] })
      queryClient.invalidateQueries({ queryKey: atencionesKeys.lists() })
      if (payload.recaladaId) {
        queryClient.invalidateQueries({ queryKey: recaladasKeys.atenciones(payload.recaladaId) })
      }
      void showToast("Nueva atención disponible", "primary")
    }

    const handleRecaladaNueva = (payload: RecaladaNuevaPayload) => {
      invalidateRecaladas(payload)
      void showToast("Nueva recalada programada", "primary")
    }

    const handleDisponibilidadPenalizado = (payload: DisponibilidadPenalizadoPayload) => {
      void showToast(
        payload.mensaje || "Fuiste penalizado por no presentarte al turno.",
        "warning"
      )
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
    socket.on("atencion:evaluation:updated", invalidateAtenciones)
    socket.on("atencion:nueva", handleAtencionNueva)
    socket.on("disponibilidad:penalizado", handleDisponibilidadPenalizado)
    socket.on("disponibilidad:globalChanged", invalidateDisponibilidadGlobal)
    socket.on("operational-config:changed", invalidateOperationalConfig)

    socket.on("recalada:created", invalidateRecaladas)
    socket.on("recalada:nueva", handleRecaladaNueva)
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
    socket.on("catalog:puerto:created", invalidatePuerto)
    socket.on("catalog:puerto:updated", invalidatePuerto)
    socket.on("catalog:puerto:removed", invalidatePuerto)
    socket.on("catalog:muelle:created", invalidateMuelle)
    socket.on("catalog:muelle:updated", invalidateMuelle)
    socket.on("catalog:muelle:removed", invalidateMuelle)

    // Epica 7 — Notificaciones operativas accionables (in-app).
    // Cada notif:* registra una alerta en la bandeja (campana global) y dispara
    // un toast con botón "Ver" que navega a su contexto. El toast se silencia
    // por notificationId dentro de la ventana de cooldown; la entrada en la
    // bandeja sí se conserva.
    const emitAlert = (
      payload: OpNotifPayload,
      severity: OperationalAlertSeverity,
      cooldownMs: number,
    ) => {
      const route = normalizeAlertRoute(payload)

      useAlertStore.getState().pushAlert({
        notificationId: payload.notificationId,
        type: payload.type,
        severity,
        title: payload.title,
        body: payload.body,
        route,
      })

      if (!shouldShowToast(payload.notificationId, cooldownMs)) return

      void (async () => {
        const buttons: Parameters<typeof toastController.create>[0]["buttons"] = []
        if (route) {
          buttons.push({
            text: "Ver",
            handler: () => {
              navigateRef.current.push(route)
            },
          })
        }
        buttons.push({ text: "Cerrar", role: "cancel" })

        const toast = await toastController.create({
          header: payload.title,
          message: payload.body,
          duration: severity === "warning" ? 7000 : 5000,
          position: "top",
          color: SEVERITY_COLOR[severity],
          buttons,
        })
        await toast.present()
      })()
    }

    const handleOpNotifAtencionAvailable = (payload: OpNotifPayload) => {
      emitAlert(payload, "success", USER_ALERT_TOAST_COOLDOWN_MS)
      queryClient.invalidateQueries({ queryKey: atencionesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] })
      if (payload.atencionId) {
        queryClient.invalidateQueries({ queryKey: atencionesKeys.detail(payload.atencionId) })
      }
    }
    const handleOpNotifTurno = (payload: OpNotifPayload) => {
      emitAlert(payload, "info", USER_ALERT_TOAST_COOLDOWN_MS)
      queryClient.invalidateQueries({ queryKey: turnosKeys.all })
      queryClient.invalidateQueries({ queryKey: ["myTurnos"] })
      queryClient.invalidateQueries({ queryKey: ["myNextTurno"] })
      queryClient.invalidateQueries({ queryKey: ["myActiveTurno"] })
      if (payload.turnoId) {
        queryClient.invalidateQueries({ queryKey: turnosKeys.detail(payload.turnoId) })
      }
    }
    const handleOpNotifCheckInPending = (payload: OpNotifPayload) => {
      emitAlert(payload, "warning", USER_ALERT_TOAST_COOLDOWN_MS)
      queryClient.invalidateQueries({ queryKey: ["turnos", "check-ins", "pending"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] })
    }
    const handleOpNotifPenalty = (payload: OpNotifPayload) => {
      emitAlert(payload, "warning", USER_ALERT_TOAST_COOLDOWN_MS)
      queryClient.invalidateQueries({ queryKey: usersKeys.me() })
      queryClient.invalidateQueries({ queryKey: usersKeys.guidesLookup() })
    }
    const handleOpNotifRecaladaOverdue = (payload: OpNotifPayload) => {
      emitAlert(payload, "warning", JOB_ALERT_TOAST_COOLDOWN_MS)
      queryClient.invalidateQueries({ queryKey: recaladasKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] })
    }
    const handleOpNotifAtencionNear = (payload: OpNotifPayload) => {
      emitAlert(payload, "warning", JOB_ALERT_TOAST_COOLDOWN_MS)
      queryClient.invalidateQueries({ queryKey: atencionesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] })
    }

    socket.on("notif:atencion:available", handleOpNotifAtencionAvailable)
    socket.on("notif:turno:claimed", handleOpNotifTurno)
    socket.on("notif:turno:assigned", handleOpNotifTurno)
    socket.on("notif:turno:canceled", handleOpNotifTurno)
    socket.on("notif:turno:changed", handleOpNotifTurno)
    socket.on("notif:turno:checkInReminder", handleOpNotifTurno)
    socket.on("notif:guide:penalized", handleOpNotifPenalty)
    socket.on("notif:supervisor:checkInPending", handleOpNotifCheckInPending)
    socket.on("notif:recalada:overdue", handleOpNotifRecaladaOverdue)
    socket.on("notif:atencion:nearWithFreeTurnos", handleOpNotifAtencionNear)

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
      socket.off("atencion:evaluation:updated", invalidateAtenciones)
      socket.off("atencion:nueva", handleAtencionNueva)
      socket.off("disponibilidad:penalizado", handleDisponibilidadPenalizado)
      socket.off("disponibilidad:globalChanged", invalidateDisponibilidadGlobal)
      socket.off("operational-config:changed", invalidateOperationalConfig)

      socket.off("recalada:created", invalidateRecaladas)
      socket.off("recalada:nueva", handleRecaladaNueva)
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
      socket.off("catalog:puerto:created", invalidatePuerto)
      socket.off("catalog:puerto:updated", invalidatePuerto)
      socket.off("catalog:puerto:removed", invalidatePuerto)
      socket.off("catalog:muelle:created", invalidateMuelle)
      socket.off("catalog:muelle:updated", invalidateMuelle)
      socket.off("catalog:muelle:removed", invalidateMuelle)

      socket.off("notif:atencion:available", handleOpNotifAtencionAvailable)
      socket.off("notif:turno:claimed", handleOpNotifTurno)
      socket.off("notif:turno:assigned", handleOpNotifTurno)
      socket.off("notif:turno:canceled", handleOpNotifTurno)
      socket.off("notif:turno:changed", handleOpNotifTurno)
      socket.off("notif:turno:checkInReminder", handleOpNotifTurno)
      socket.off("notif:guide:penalized", handleOpNotifPenalty)
      socket.off("notif:supervisor:checkInPending", handleOpNotifCheckInPending)
      socket.off("notif:recalada:overdue", handleOpNotifRecaladaOverdue)
      socket.off("notif:atencion:nearWithFreeTurnos", handleOpNotifAtencionNear)
    }
  }, [accessToken, currentUserId, queryClient])
}
