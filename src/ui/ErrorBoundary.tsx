import { Component, type ErrorInfo, type ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("[ErrorBoundary]", error, info.componentStack)
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div style={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          padding: "24px",
          background: "var(--color-bg-base)",
        }}>
          <p style={{ fontSize: "20px", fontWeight: 700, color: "var(--color-fg-primary)", margin: 0 }}>
            Algo salió mal
          </p>
          <p style={{ fontSize: "14px", color: "var(--color-fg-secondary)", textAlign: "center", maxWidth: "280px", margin: 0 }}>
            Ocurrió un error inesperado. Recarga la app para continuar.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "8px",
              padding: "10px 24px",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#fff",
              background: "var(--color-primary)",
              border: "none",
              cursor: "pointer",
            }}
          >
            Recargar
          </button>
          {import.meta.env.DEV && this.state.error && (
            <pre style={{
              marginTop: "16px",
              fontSize: "11px",
              color: "var(--color-danger)",
              background: "var(--color-danger-soft)",
              borderRadius: "8px",
              padding: "12px",
              maxWidth: "360px",
              overflow: "auto",
            }}>
              {this.state.error.message}
            </pre>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
