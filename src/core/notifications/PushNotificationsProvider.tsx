import React, { useEffect, useRef } from "react"
import { Capacitor } from "@capacitor/core"
import {
  PushNotifications,
  type ActionPerformed,
  type PushNotificationSchema,
  type Token,
} from "@capacitor/push-notifications"
import { useHistory } from "react-router-dom"

import { useSessionStore } from "../auth/sessionStore"
import { persistCurrentPushToken } from "./pushDeviceToken"
import { registerPushToken } from "./pushTokenApi"

type NotificationData = {
  notificationId?: string
  route?: string
  recaladaId?: string | number
  atencionId?: string | number
  type?: string
}

function getData(raw: PushNotificationSchema | ActionPerformed): NotificationData {
  if ("notification" in raw) {
    return (raw.notification.data ?? {}) as NotificationData
  }

  return (raw.data ?? {}) as NotificationData
}

function routeFromData(data: NotificationData): string | null {
  if (typeof data.route === "string" && data.route.startsWith("/")) {
    return data.route
  }

  if (data.atencionId) return `/atenciones/${data.atencionId}`
  if (data.recaladaId) return `/recaladas/${data.recaladaId}`
  return null
}

const PushNotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const status = useSessionStore((state) => state.status)
  const accessToken = useSessionStore((state) => state.accessToken)
  const history = useHistory()
  const seenNotificationIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (status !== "authed" || !accessToken || !Capacitor.isNativePlatform()) return

    let cancelled = false

    const remember = (data: NotificationData): boolean => {
      if (!data.notificationId) return true
      if (seenNotificationIds.current.has(data.notificationId)) return false
      seenNotificationIds.current.add(data.notificationId)
      return true
    }

    const setup = async () => {
      const permission = await PushNotifications.requestPermissions()
      if (permission.receive !== "granted" || cancelled) return

      const registration = await PushNotifications.addListener(
        "registration",
        async (token: Token) => {
          await persistCurrentPushToken(token.value)
          await registerPushToken(token.value)
        },
      )

      const registrationError = await PushNotifications.addListener(
        "registrationError",
        (error) => {
          console.warn("[push] registration error", error)
        },
      )

      const received = await PushNotifications.addListener(
        "pushNotificationReceived",
        (notification: PushNotificationSchema) => {
          remember(getData(notification))
        },
      )

      const action = await PushNotifications.addListener(
        "pushNotificationActionPerformed",
        (event: ActionPerformed) => {
          const data = getData(event)
          if (!remember(data)) return

          const route = routeFromData(data)
          if (route) history.push(route)
        },
      )

      await PushNotifications.register()

      return () => {
        registration.remove()
        registrationError.remove()
        received.remove()
        action.remove()
      }
    }

    let cleanup: (() => void) | undefined
    void setup().then((fn) => {
      cleanup = fn
      if (cancelled && cleanup) cleanup()
    })

    return () => {
      cancelled = true
      if (cleanup) cleanup()
    }
  }, [accessToken, history, status])

  return <>{children}</>
}

export default PushNotificationsProvider
