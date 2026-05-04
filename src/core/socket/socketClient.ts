import { io, type Socket } from "socket.io-client"
import { useSessionStore } from "../auth/sessionStore"
import { ENV } from "../config/env"

// Derive socket origin from API_URL (strip /api/v1 suffix)
function getSocketUrl(): string {
  try {
    return ENV.apiUrl.replace(/\/api\/v\d+\/?$/, "")
  } catch {
    return "http://localhost:3000"
  }
}

let _socket: Socket | null = null

export const socketClient = {
  connect(token: string): void {
    if (_socket?.connected) return

    _socket = io(getSocketUrl(), {
      path: "/socket.io",
      // Dynamic auth: always use latest token on reconnection attempts
      auth: (cb: (data: { token: string }) => void) => {
        const current = useSessionStore.getState().accessToken
        cb({ token: current ?? token })
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    })
  },

  disconnect(): void {
    _socket?.disconnect()
    _socket = null
  },

  getSocket(): Socket | null {
    return _socket
  },
}
