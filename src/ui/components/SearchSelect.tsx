import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

/* ─────────────────────────────────────────────
   SearchSelect — selector custom buscable, reutilizable.
   Reemplaza los <select> nativos (que en mobile abren el desplegable
   blanco del navegador y rompen el tema oscuro).

   · Desktop / responsive ancho (≥ 640px): dropdown anclado bajo el campo.
   · Mobile (< 640px): bottom sheet con buscador y lista scrolleable.
   · Búsqueda, teclado (↑/↓/Enter/Esc), loading, empty, clearable, disabled.
   · Animaciones suaves (opacity + translateY/scale) con prefers-reduced-motion.
   · Sin gestos de Ionic → sin rebotes de scroll.
───────────────────────────────────────────── */

const BREAKPOINT = 640;

type Pos =
  | { mode: "sheet" }
  | { mode: "anchored"; left: number; width: number; maxHeight: number; top?: number; bottom?: number };

function useReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const h = () => setReduce(mq.matches);
    mq.addEventListener?.("change", h);
    return () => mq.removeEventListener?.("change", h);
  }, []);
  return reduce;
}

export interface SearchSelectProps<T> {
  value: string;
  onChange: (value: string) => void;
  options: T[];
  getOptionValue: (option: T) => string;
  getOptionLabel: (option: T) => string;
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
  disabled?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  clearable?: boolean;
  error?: string;
  /** Oculta el buscador si la lista es corta (por defecto se muestra con > 6 opciones). */
  searchable?: boolean;
  className?: string;
}

function SearchSelect<T>({
  value,
  onChange,
  options,
  getOptionValue,
  getOptionLabel,
  placeholder = "Selecciona una opción",
  searchPlaceholder = "Buscar…",
  label,
  disabled = false,
  loading = false,
  emptyMessage = "Sin resultados",
  clearable = false,
  error,
  searchable,
  className,
}: SearchSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [pos, setPos] = useState<Pos | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reduce = useReducedMotion();
  const DURATION = reduce ? 0 : 190;

  const showSearch = searchable ?? options.length > 6;

  const selected = useMemo(
    () => options.find((o) => getOptionValue(o) === value) ?? null,
    [options, value, getOptionValue]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => getOptionLabel(o).toLowerCase().includes(q));
  }, [options, query, getOptionLabel]);

  const updatePos = useCallback(() => {
    if (!triggerRef.current) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (vw < BREAKPOINT) {
      setPos({ mode: "sheet" });
      return;
    }
    const rect = triggerRef.current.getBoundingClientRect();
    const width = Math.max(rect.width, 240);
    const left = Math.max(12, Math.min(rect.left, vw - width - 12));
    const spaceBelow = vh - rect.bottom - 12;
    const spaceAbove = rect.top - 12;
    const openUp = spaceBelow < 280 && spaceAbove > spaceBelow;
    const maxHeight = Math.max(200, Math.min(360, openUp ? spaceAbove : spaceBelow));
    setPos(
      openUp
        ? { mode: "anchored", left, width, maxHeight, bottom: vh - rect.top + 6 }
        : { mode: "anchored", left, width, maxHeight, top: rect.bottom + 6 }
    );
  }, []);

  const openMenu = useCallback(() => {
    if (disabled) return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setQuery("");
    const idx = Math.max(0, options.findIndex((o) => getOptionValue(o) === value));
    setActiveIndex(idx);
    updatePos();
    setMounted(true);
    setOpen(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
  }, [disabled, options, value, getOptionValue, updatePos]);

  const closeMenu = useCallback(() => {
    setShown(false);
    setOpen(false);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMounted(false), DURATION);
  }, [DURATION]);

  // Reposicionar al hacer scroll/resize (modo anclado).
  useEffect(() => {
    if (!open) return;
    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
    return () => {
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [open, updatePos]);

  // Foco al buscador al abrir.
  useEffect(() => {
    if (open && showSearch) {
      const t = setTimeout(() => inputRef.current?.focus(), reduce ? 0 : 60);
      return () => clearTimeout(t);
    }
  }, [open, showSearch, reduce]);

  // Cerrar al hacer click fuera.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        panelRef.current && !panelRef.current.contains(e.target as Node)
      ) {
        closeMenu();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, closeMenu]);

  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  // Mantener visible la opción activa.
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(`[data-idx="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const select = (option: T) => {
    onChange(getOptionValue(option));
    closeMenu();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = filtered[activeIndex];
      if (opt) select(opt);
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeMenu();
    }
  };

  // ── Estilos ──
  const accent = "var(--color-primary)";
  const triggerStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    gap: 8,
    textAlign: "left",
    borderRadius: 13,
    padding: "11px 12px 11px 14px",
    background: "var(--color-glass-soft)",
    border: error
      ? "1px solid var(--color-danger)"
      : open
      ? `1px solid ${accent}`
      : "1px solid var(--color-primary-glow)",
    color: "var(--color-fg-primary)",
    fontSize: "0.875rem",
    outline: "none",
    opacity: disabled ? 0.4 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "border-color 150ms ease, box-shadow 150ms ease",
  };

  const SearchRow = showSearch ? (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 12px",
        borderBottom: "1px solid var(--color-glass-medium)",
        background: "var(--color-bg-elevated)",
        flexShrink: 0,
      }}
    >
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--color-fg-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
        onKeyDown={onKeyDown}
        placeholder={searchPlaceholder}
        style={{
          flex: 1,
          minWidth: 0,
          background: "transparent",
          border: "none",
          outline: "none",
          color: "var(--color-fg-primary)",
          fontSize: "0.875rem",
        }}
      />
    </div>
  ) : null;

  const List = (
    <div
      ref={listRef}
      role="listbox"
      style={{
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        overscrollBehavior: "contain",
        WebkitOverflowScrolling: "touch",
        padding: 6,
      }}
    >
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "26px 12px", color: "var(--color-fg-muted)", fontSize: "0.8125rem" }}>
          <span className="loading-spinner" style={{ width: 16, height: 16 }} />
          Cargando opciones…
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: "26px 12px", textAlign: "center", color: "var(--color-fg-muted)", fontSize: "0.8125rem" }}>
          {emptyMessage}
        </div>
      ) : (
        filtered.map((opt, i) => {
          const v = getOptionValue(opt);
          const isSel = v === value;
          const isActive = i === activeIndex;
          return (
            <button
              key={v}
              type="button"
              data-idx={i}
              role="option"
              aria-selected={isSel}
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => select(opt)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 8,
                textAlign: "left",
                padding: "10px 12px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: isSel ? 600 : 500,
                color: isSel ? accent : "var(--color-fg-primary)",
                background: isSel
                  ? "var(--color-primary-soft)"
                  : isActive
                  ? "var(--color-glass-medium)"
                  : "transparent",
                transition: "background 120ms ease",
              }}
            >
              <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {getOptionLabel(opt)}
              </span>
              {isSel && (
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          );
        })
      )}
    </div>
  );

  const overlay = mounted && pos
    ? createPortal(
        pos.mode === "sheet" ? (
          <div style={{ position: "fixed", inset: 0, zIndex: 1100 }}>
            <div
              onClick={closeMenu}
              style={{
                position: "absolute", inset: 0,
                background: "rgba(0,0,0,0.5)",
                opacity: shown ? 1 : 0,
                transition: `opacity ${DURATION}ms ease`,
              }}
            />
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              style={{
                position: "absolute", left: 0, right: 0, bottom: 0,
                display: "flex", flexDirection: "column",
                maxHeight: "80dvh",
                background: "var(--color-bg-elevated)",
                borderRadius: "24px 24px 0 0",
                boxShadow: "0 -8px 40px rgba(0,0,0,0.35)",
                transform: shown ? "translateY(0)" : "translateY(100%)",
                transition: `transform ${DURATION}ms cubic-bezier(0.32, 0.72, 0, 1)`,
                willChange: "transform",
              }}
            >
              <div style={{ flexShrink: 0, padding: "10px 20px 8px" }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: "var(--color-glass-medium)", margin: "0 auto 10px" }} />
                {label && (
                  <h2 style={{ margin: "0 0 4px", fontSize: "1rem", fontWeight: 700, color: "var(--color-fg-primary)", letterSpacing: "-0.01em" }}>
                    {label}
                  </h2>
                )}
              </div>
              {SearchRow}
              {List}
            </div>
          </div>
        ) : (
          <div
            ref={panelRef}
            role="dialog"
            style={{
              position: "fixed",
              left: pos.left, width: pos.width,
              top: pos.top, bottom: pos.bottom,
              maxHeight: pos.maxHeight,
              display: "flex", flexDirection: "column",
              zIndex: 1100,
              background: "var(--color-bg-elevated)",
              border: "1px solid var(--color-glass-medium)",
              borderRadius: 14,
              boxShadow: "0 12px 32px rgba(0,0,0,0.28)",
              overflow: "hidden",
              transformOrigin: pos.top ? "top" : "bottom",
              opacity: shown ? 1 : 0,
              transform: shown ? "translateY(0) scale(1)" : `translateY(${pos.top ? -6 : 6}px) scale(0.98)`,
              transition: `opacity ${DURATION}ms ${shown ? "ease-out" : "ease-in"}, transform ${DURATION}ms ${shown ? "ease-out" : "ease-in"}`,
              willChange: "transform, opacity",
            }}
          >
            {SearchRow}
            {List}
          </div>
        ),
        document.body
      )
    : null;

  return (
    <div className={className} style={{ width: "100%" }}>
      <button
        type="button"
        ref={triggerRef}
        disabled={disabled}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={(e) => {
          if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            openMenu();
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={triggerStyle}
      >
        <span
          style={{
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            color: selected ? "var(--color-fg-primary)" : "var(--color-fg-muted)",
            fontWeight: selected ? 500 : 400,
          }}
        >
          {selected ? getOptionLabel(selected) : placeholder}
        </span>

        {clearable && selected && !disabled && (
          <span
            role="button"
            aria-label="Limpiar selección"
            onClick={(e) => { e.stopPropagation(); onChange(""); }}
            style={{ display: "grid", placeItems: "center", width: 24, height: 24, borderRadius: 7, flexShrink: 0, color: "var(--color-fg-muted)" }}
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </span>
        )}

        <svg
          width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--color-fg-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0, transition: "transform 180ms ease", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {overlay}

      {error && (
        <p style={{ fontSize: "0.72rem", color: "var(--color-danger)", fontWeight: 500, marginTop: 5 }}>{error}</p>
      )}
    </div>
  );
}

export default SearchSelect;
