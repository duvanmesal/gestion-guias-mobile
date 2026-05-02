import { create } from "zustand"

type ThemeMode = "light" | "dark"

interface ThemeState {
  mode: ThemeMode
  toggle: () => void
  setMode: (mode: ThemeMode) => void
}

const STORAGE_KEY = "app-theme"

function getInitialMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === "dark" || stored === "light") return stored
  } catch (e) {
    if (import.meta.env.DEV) console.warn("[themeStore] Failed to read theme from storage", e)
  }
  return "light"
}

function applyTheme(mode: ThemeMode) {
  document.documentElement.classList.toggle("dark", mode === "dark")
}

// Apply immediately when this module is imported — prevents flash
applyTheme(getInitialMode())

export const useThemeStore = create<ThemeState>((set) => ({
  mode: getInitialMode(),
  toggle: () =>
    set((s) => {
      const next: ThemeMode = s.mode === "light" ? "dark" : "light"
      localStorage.setItem(STORAGE_KEY, next)
      applyTheme(next)
      return { mode: next }
    }),
  setMode: (mode) => {
    localStorage.setItem(STORAGE_KEY, mode)
    applyTheme(mode)
    set({ mode })
  },
}))
