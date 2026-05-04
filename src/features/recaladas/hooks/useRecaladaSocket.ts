import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toastController } from "@ionic/core"
import { socketClient } from "../../../core/socket/socketClient"
import { recaladasKeys } from "../data/recaladas.keys"

interface RecaladaSocketPayload {
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

export function useRecaladaSocket(recaladaId?: number) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const socket = socketClient.getSocket()
    if (!socket) return

    if (recaladaId) {
      socket.emit("join:recalada", { recaladaId })
    }

    const invalidate = (payload: RecaladaSocketPayload) => {
      queryClient.invalidateQueries({ queryKey: recaladasKeys.all })
      queryClient.invalidateQueries({ queryKey: recaladasKeys.detail(payload.recaladaId) })
      queryClient.invalidateQueries({ queryKey: recaladasKeys.atenciones(payload.recaladaId) })
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] })
    }

    const onCreated = (_p: RecaladaSocketPayload) => {
      queryClient.invalidateQueries({ queryKey: recaladasKeys.all })
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] })
    }

    const onArrived = (p: RecaladaSocketPayload) => {
      invalidate(p)
      showToast(`Recalada #${p.recaladaId} marcada como llegada`, "primary")
    }

    const onCanceled = (p: RecaladaSocketPayload) => {
      invalidate(p)
      queryClient.invalidateQueries({ queryKey: ["atenciones"] })
      showToast(`Recalada #${p.recaladaId} cancelada`, "danger")
    }

    socket.on("recalada:created", onCreated)
    socket.on("recalada:updated", invalidate)
    socket.on("recalada:arrived", onArrived)
    socket.on("recalada:departed", invalidate)
    socket.on("recalada:canceled", onCanceled)

    return () => {
      if (recaladaId) {
        socket.emit("leave:recalada", { recaladaId })
      }
      socket.off("recalada:created", onCreated)
      socket.off("recalada:updated", invalidate)
      socket.off("recalada:arrived", onArrived)
      socket.off("recalada:departed", invalidate)
      socket.off("recalada:canceled", onCanceled)
    }
  }, [queryClient, recaladaId])
}
