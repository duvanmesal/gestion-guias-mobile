import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toastController } from "@ionic/core"
import { socketClient } from "../../../core/socket/socketClient"
import { useSessionStore } from "../../../core/auth/sessionStore"

interface TurnoSocketPayload {
  turnoId: number
  atencionId: number
  recaladaId?: number | null
  status: string
  guiaId?: string | null
}

interface AtencionSocketPayload {
  atencionId: number
  recaladaId: number
}

async function showToast(message: string, color: "success" | "danger" | "warning" | "primary") {
  const toast = await toastController.create({
    message,
    duration: 3000,
    position: "top",
    color,
  })
  await toast.present()
}

export function useTurnoSocket(atencionId?: number) {
  const queryClient = useQueryClient()
  const user = useSessionStore((s) => s.user)
  const isSupervisor = user?.role === "SUPERVISOR" || user?.role === "SUPER_ADMIN"

  useEffect(() => {
    const socket = socketClient.getSocket()
    if (!socket) return

    if (atencionId) {
      socket.emit("join:atencion", { atencionId })
    }

    const invalidateTurnos = (payload: TurnoSocketPayload) => {
      queryClient.invalidateQueries({ queryKey: ["turnos"] })
      queryClient.invalidateQueries({ queryKey: ["turno", payload.turnoId] })
      queryClient.invalidateQueries({ queryKey: ["myTurnos"] })
      queryClient.invalidateQueries({ queryKey: ["myNextTurno"] })
      queryClient.invalidateQueries({ queryKey: ["myActiveTurno"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] })
      queryClient.invalidateQueries({ queryKey: ["atencion-turnos", payload.atencionId] })
      queryClient.invalidateQueries({ queryKey: ["atencion-summary", payload.atencionId] })
      if (payload.recaladaId) {
        queryClient.invalidateQueries({ queryKey: ["recalada", payload.recaladaId] })
        queryClient.invalidateQueries({ queryKey: ["recalada", payload.recaladaId, "atenciones"] })
      }
    }

    const invalidateAtencion = (payload: AtencionSocketPayload) => {
      queryClient.invalidateQueries({ queryKey: ["atenciones"] })
      queryClient.invalidateQueries({ queryKey: ["atencion", payload.atencionId] })
      queryClient.invalidateQueries({ queryKey: ["atencion-turnos", payload.atencionId] })
      queryClient.invalidateQueries({ queryKey: ["atencion-summary", payload.atencionId] })
      if (payload.recaladaId) {
        queryClient.invalidateQueries({ queryKey: ["recalada", payload.recaladaId] })
        queryClient.invalidateQueries({ queryKey: ["recalada", payload.recaladaId, "atenciones"] })
      }
    }

    const onAssigned = (p: TurnoSocketPayload) => {
      invalidateTurnos(p)
      if (!isSupervisor) showToast(`Se te asignó el turno #${p.turnoId}`, "primary")
    }

    const onCheckedOut = (p: TurnoSocketPayload) => {
      invalidateTurnos(p)
      if (!isSupervisor) showToast(`Turno #${p.turnoId} completado`, "success")
    }

    const onAtencionCanceled = (p: AtencionSocketPayload) => {
      invalidateAtencion(p)
      showToast(`Atención #${p.atencionId} cancelada`, "danger")
    }

    const onAtencionCreated = (_p: AtencionSocketPayload) => {
      queryClient.invalidateQueries({ queryKey: ["atenciones"] })
    }

    socket.on("turno:assigned", onAssigned)
    socket.on("turno:claimed", invalidateTurnos)
    socket.on("turno:checkedIn", invalidateTurnos)
    socket.on("turno:checkedOut", onCheckedOut)
    socket.on("turno:unassigned", invalidateTurnos)
    socket.on("turno:noShow", invalidateTurnos)
    socket.on("turno:canceled", invalidateTurnos)
    socket.on("atencion:closed", invalidateAtencion)
    socket.on("atencion:canceled", onAtencionCanceled)
    socket.on("atencion:created", onAtencionCreated)
    socket.on("atencion:updated", invalidateAtencion)

    return () => {
      if (atencionId) {
        socket.emit("leave:atencion", { atencionId })
      }
      socket.off("turno:assigned", onAssigned)
      socket.off("turno:claimed", invalidateTurnos)
      socket.off("turno:checkedIn", invalidateTurnos)
      socket.off("turno:checkedOut", onCheckedOut)
      socket.off("turno:unassigned", invalidateTurnos)
      socket.off("turno:noShow", invalidateTurnos)
      socket.off("turno:canceled", invalidateTurnos)
      socket.off("atencion:closed", invalidateAtencion)
      socket.off("atencion:canceled", onAtencionCanceled)
      socket.off("atencion:created", onAtencionCreated)
      socket.off("atencion:updated", invalidateAtencion)
    }
  }, [queryClient, isSupervisor, atencionId])
}
