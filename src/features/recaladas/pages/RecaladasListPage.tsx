import { IonContent, IonPage } from "@ionic/react";
import { useEffect, useMemo, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useSessionStore } from "../../../core/auth/sessionStore";
import ErrorState from "../../../ui/components/ErrorState";
import { useRecaladasList } from "../hooks/useRecaladasList";
import { useRecaladaSocket } from "../hooks/useRecaladaSocket";
import type {
  ListRecaladasParams,
  RecaladaItem,
  RecaladaOperationalStatus,
} from "../types/recaladas.types";

/* ─────────────────────────────────────────────
   PALETTE
───────────────────────────────────────────── */
const C = {
  cyan:         "var(--color-info)",
  cyanFaint:    "var(--color-info-soft)",
  cyanBorder:   "var(--color-info-border)",
  amber:        "var(--color-accent)",
  amberFaint:   "var(--color-accent-glow)",
  amberBorder:  "var(--color-accent-glow)",
  teal:         "var(--color-success)",
  tealFaint:    "var(--color-success-soft)",
  tealBorder:   "var(--color-success-soft)",
  danger:       "var(--color-danger)",
  dangerFaint:  "var(--color-danger-soft)",
  dangerBorder: "var(--color-danger-border)",
  violet:       "var(--color-primary)",
  violetFaint:  "var(--color-primary-glow)",
  violetBorder: "var(--color-primary-glow)",
  violetGlow:   "var(--color-primary-glow)",
  fg:           "var(--color-fg-primary)",
  fgSec:        "var(--color-fg-secondary)",
  fgMuted:      "var(--color-fg-muted)",
  bg:           "var(--color-bg-base)",
  surface: "var(--color-bg-elevated)",
};

type StatusCfg = { color: string; faint: string; border: string; label: string };
const STATUS_CFG: Record<RecaladaOperationalStatus, StatusCfg> = {
  SCHEDULED: { color: C.cyan,   faint: C.cyanFaint,   border: C.cyanBorder,   label: "Programada" },
  ARRIVED:   { color: C.amber,  faint: C.amberFaint,  border: C.amberBorder,  label: "Llegada" },
  DEPARTED:  { color: C.teal,   faint: C.tealFaint,   border: C.tealBorder,   label: "Partida" },
  CANCELED:  { color: C.danger, faint: C.dangerFaint, border: C.dangerBorder, label: "Cancelada" },
};

/* ─────────────────────────────────────────────
   ICONS
───────────────────────────────────────────── */
const Ico = {
  ship:    (s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20a2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1" /><path d="M4 18l-1-5h18l-2 5M12 2v3M8 7h8M6 11V8a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v3" /></svg>,
  search:  (s = 15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>,
  clear:   (s = 13) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>,
  plus:    (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  filter:  (s = 13) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>,
  left:    (s = 15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>,
  right:   (s = 15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>,
  chevron: (s = 13) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>,
  anchor:  (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="3" /><line x1="12" y1="8" x2="12" y2="22" /><path d="M5 15H2a10 10 0 0 0 20 0h-3" /></svg>,
  warning: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
};

const PAGE_SIZE = 20;
type StatusFilter = RecaladaOperationalStatus | "";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "",          label: "Todas" },
  { value: "SCHEDULED", label: "Programadas" },
  { value: "ARRIVED",   label: "Llegadas" },
  { value: "DEPARTED",  label: "Partidas" },
  { value: "CANCELED",  label: "Canceladas" },
];

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
const RecaladasListPage: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const user = useSessionStore((s) => s.user);
  const isSupervisor = user?.role === "SUPERVISOR" || user?.role === "SUPER_ADMIN";
  useRecaladaSocket();

  const initialOverdue = useMemo(() => {
    const v = new URLSearchParams(location.search).get("overdueDeparture");
    return v === "1" || v === "true";
  }, [location.search]);

  const [draft,        setDraft]        = useState("");
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [overdueOnly,  setOverdueOnly]  = useState<boolean>(initialOverdue);
  const [page,         setPage]         = useState(1);

  // Mantener overdueOnly sincronizado con la URL si cambia (deep-link desde dashboard).
  useEffect(() => {
    const v = new URLSearchParams(location.search).get("overdueDeparture");
    const fromUrl = v === "1" || v === "true";
    if (fromUrl !== overdueOnly) {
      setOverdueOnly(fromUrl);
      setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const queryParams = useMemo<ListRecaladasParams>(() => ({
    q: search.trim() || undefined,
    operationalStatus: statusFilter || undefined,
    overdueDeparture: overdueOnly || undefined,
    page,
    pageSize: PAGE_SIZE,
  }), [page, search, statusFilter, overdueOnly]);

  const { data, isLoading, isFetching, error, refetch } = useRecaladasList(queryParams);

  const items      = data?.items ?? [];
  const total      = data?.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const canPrev    = page > 1;
  const canNext    = page < totalPages;
  const hasFilters = Boolean(search.trim() || statusFilter || overdueOnly);

  function clearSearch() { setDraft(""); setSearch(""); setPage(1); }

  function clearOverdue() {
    setOverdueOnly(false);
    setPage(1);
    const params = new URLSearchParams(location.search);
    params.delete("overdueDeparture");
    history.replace({
      pathname: location.pathname,
      search: params.toString() ? `?${params.toString()}` : "",
    });
  }

  return (
    <IonPage>
      <IonContent scrollY={true}>
        <div style={{ minHeight: "100vh", background: C.bg, paddingBottom: "1.5rem" }}>

          <div style={{ maxWidth: 480, margin: "0 auto", padding: "52px 1.25rem 0" }}>

            {/* ── Page Header ── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
              <div>
                <p style={{ margin: 0, fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: C.cyan }}>Operaciones</p>
                <h1 style={{ margin: "2px 0 0", fontSize: "1.5rem", fontWeight: 800, color: C.fg, letterSpacing: "-0.02em", lineHeight: 1.1 }}>Recaladas</h1>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {total > 0 && (
                  <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: C.fgMuted }}>{total} total</span>
                )}
                {isSupervisor && (
                  <button
                    type="button"
                    onClick={() => history.push("/recaladas/nueva")}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      borderRadius: 12, padding: "9px 14px",
                      background: "var(--color-primary)",
                      border: "none",
                      color: "white", fontSize: "0.8125rem", fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {Ico.plus()} Nueva
                  </button>
                )}
              </div>
            </div>

            {overdueOnly && (
              <div
                className="animate-fade-up"
                style={{
                  position: "relative",
                  overflow: "hidden",
                  marginBottom: "1rem",
                  borderRadius: 18,
                  padding: "14px 14px 13px",
                  background:
                    "linear-gradient(135deg, var(--color-danger-soft) 0%, var(--color-bg-elevated) 65%, var(--color-danger-soft) 100%)",
                  border: `1px solid ${C.dangerBorder}`,
                  boxShadow: "0 6px 18px -12px var(--color-danger-soft)",
                }}
              >
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: C.danger }} />
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    right: -30,
                    top: -30,
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    background: "var(--color-danger-soft)",
                    opacity: 0.5,
                    filter: "blur(24px)",
                    pointerEvents: "none",
                  }}
                />

                <div style={{ position: "relative", display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div
                    style={{
                      position: "relative",
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      background: "var(--color-danger-soft)",
                      border: `1px solid ${C.dangerBorder}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: C.danger,
                      flexShrink: 0,
                    }}
                  >
                    <span className="live-pulse-dot" style={{ position: "absolute", top: 4, right: 4, width: 5, height: 5, background: C.danger }} />
                    {Ico.warning()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em", color: C.danger }}>
                        Filtro crítico
                      </span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, borderRadius: 9999, padding: "2px 7px", background: "var(--color-danger-soft)", border: `1px solid ${C.dangerBorder}`, color: C.danger, fontSize: "0.6rem", fontWeight: 700 }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.danger }} />
                        ARRIVED
                      </span>
                    </div>
                    <p style={{ margin: "5px 0 0", fontSize: "0.875rem", fontWeight: 800, color: C.fg, letterSpacing: "-0.01em" }}>
                      Vencidas pendientes de zarpe
                    </p>
                    <p style={{ margin: "3px 0 0", fontSize: "0.72rem", color: C.fgMuted, lineHeight: 1.4 }}>
                      Solo buques arribados con salida programada ya vencida.
                    </p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    <span
                      className="t-mono"
                      style={{
                        minWidth: 36,
                        textAlign: "center",
                        borderRadius: 10,
                        padding: "6px 9px",
                        background: C.danger,
                        color: "white",
                        fontSize: "0.95rem",
                        lineHeight: 1,
                        fontWeight: 900,
                        boxShadow: "0 4px 10px -4px var(--color-danger-soft)",
                      }}
                    >
                      {isLoading ? "…" : total}
                    </span>
                    <button
                      type="button"
                      onClick={clearOverdue}
                      style={{
                        borderRadius: 10,
                        padding: "5px 10px",
                        background: "var(--color-bg-elevated)",
                        border: `1px solid ${C.dangerBorder}`,
                        color: C.danger,
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Search + filters ── */}
            <div className="animate-fade-up" style={{ animationFillMode: "backwards" }}>
              <div style={{ borderRadius: 18, background: C.surface, border: "1px solid var(--color-glass-medium)", padding: "0.875rem 1rem", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                  <span style={{ color: C.fgMuted }}>{Ico.filter()}</span>
                  <span style={{ fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: C.fgMuted }}>Búsqueda y filtros</span>
                </div>

                {/* Status pills */}
                <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 10 }}>
                  {STATUS_FILTERS.map(({ value: v, label }) => {
                    const active = statusFilter === v;
                    const cfg = v ? STATUS_CFG[v as RecaladaOperationalStatus] : null;
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => { setStatusFilter(v); setPage(1); }}
                        style={{
                          flexShrink: 0, borderRadius: 9999, padding: "5px 13px",
                          fontSize: "0.72rem", fontWeight: active ? 700 : 500,
                          border: `1px solid ${active && cfg ? cfg.border : "var(--color-glass-medium)"}`,
                          background: active && cfg ? cfg.faint : "var(--color-glass-subtle)",
                          color: active && cfg ? cfg.color : C.fgSec,
                          transition: "all 160ms ease",
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                {/* Search input */}
                <form onSubmit={(e) => { e.preventDefault(); setSearch(draft); setPage(1); }}>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: C.fgMuted, pointerEvents: "none" }}>
                      {Ico.search()}
                    </span>
                    <input
                      type="text"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Buscar por código o buque…"
                      style={{
                        width: "100%", boxSizing: "border-box",
                        borderRadius: 13, padding: "11px 42px 11px 40px",
                        background: "var(--color-glass-soft)",
                        border: "1px solid var(--color-glass-medium)",
                        color: C.fg, fontSize: "0.875rem",
                        outline: "none",
                      }}
                    />
                    {draft && (
                      <button type="button" onClick={clearSearch} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: C.fgMuted, background: "none", border: "none", cursor: "pointer", display: "flex" }}>
                        {Ico.clear()}
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    style={{
                      marginTop: 8, width: "100%", borderRadius: 13, padding: "11px",
                      background: C.cyanFaint, border: `1px solid ${C.cyanBorder}`,
                      color: C.cyan, fontSize: "0.825rem", fontWeight: 700, cursor: "pointer",
                    }}
                  >
                    Buscar
                  </button>
                </form>
              </div>
            </div>

            {/* ── Results ── */}
            <div className="animate-fade-up" style={{ animationDelay: "80ms", animationFillMode: "backwards" }}>
              <div style={{ borderRadius: 20, background: C.surface, border: "1px solid var(--color-glass-medium)", overflow: "hidden" }}>
                {/* Header */}
                <div style={{ padding: "0.9rem 1.25rem 0.7rem", borderBottom: "1px solid var(--color-glass-soft)", display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 3, height: 13, borderRadius: 2, background: overdueOnly ? C.danger : C.cyan, opacity: 0.9 }} />
                  <span style={{ fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: overdueOnly ? C.danger : C.cyan }}>
                    {overdueOnly ? "Zarpes vencidos" : "Agenda operativa"}
                  </span>
                  {total > 0 && (
                    <span style={{ marginLeft: "auto", fontSize: "0.6875rem", fontWeight: 600, color: C.fgMuted }}>Pág. {page} de {totalPages}</span>
                  )}
                </div>

                <div style={{ padding: "0.75rem 1rem 1rem" }}>
                  {isLoading ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="animate-pulse" style={{ height: 72, borderRadius: 16, background: "var(--color-glass-subtle)", animationDelay: `${i * 60}ms` }} />
                      ))}
                    </div>
                  ) : error ? (
                    <ErrorState
                      compact
                      title="No pude cargar las recaladas"
                      message={error instanceof Error ? error.message : "Ocurrió un problema inesperado."}
                      onRetry={() => void refetch()}
                    />
                  ) : items.length === 0 ? (
                    <EmptyRecaladas hasFilters={hasFilters} isOverdue={overdueOnly} isSupervisor={isSupervisor} onClearOverdue={clearOverdue} onNew={() => history.push("/recaladas/nueva")} />
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {items.map((r) => (
                        <RecaladaRow key={r.id} overdueMode={overdueOnly} recalada={r} onPress={() => history.push(`/recaladas/${r.id}`)} />
                      ))}
                    </div>
                  )}

                  {!isLoading && !error && items.length > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
                      <PagBtn label="Anterior" icon={Ico.left()} disabled={!canPrev || isFetching} onClick={() => setPage((p) => Math.max(1, p - 1))} />
                      <PagBtn label="Siguiente" icon={Ico.right()} iconRight disabled={!canNext || isFetching} onClick={() => setPage((p) => p + 1)} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

/* ─────────────────────────────────────────────
   ROW
───────────────────────────────────────────── */
const RecaladaRow: React.FC<{ recalada: RecaladaItem; overdueMode?: boolean; onPress: () => void }> = ({ recalada, overdueMode = false, onPress }) => {
  const cfg = STATUS_CFG[recalada.operationalStatus];
  const isLive = recalada.operationalStatus === "ARRIVED";
  const isOverdue =
    recalada.operationalStatus === "ARRIVED" &&
    !!recalada.fechaSalida &&
    new Date(recalada.fechaSalida).getTime() < Date.now();

  const accentColor  = isOverdue ? C.danger       : cfg.color;
  const accentFaint  = isOverdue ? C.dangerFaint  : cfg.faint;
  const accentBorder = isOverdue ? C.dangerBorder : cfg.border;

  return (
    <button
      type="button"
      onClick={onPress}
      className="w-full text-left transition-all active:scale-[0.98]"
      style={{
        position: "relative",
        borderRadius: 16,
        padding: "12px 13px 12px 16px",
        background: isOverdue ? "var(--color-danger-soft)" : "var(--color-glass-subtle)",
        border: `1px solid ${isOverdue ? C.dangerBorder : "var(--color-glass-medium)"}`,
        borderLeft: `3px solid ${accentColor}`,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      {/* Icon */}
      <div style={{
        width: 42, height: 42, borderRadius: 13, flexShrink: 0,
        background: accentFaint, border: `1px solid ${accentBorder}`,
        display: "flex", alignItems: "center", justifyContent: "center", color: accentColor,
      }}>
        {isLive
          ? <span className="live-pulse-dot" style={{ background: accentColor, width: 9, height: 9 }} />
          : Ico.ship(18)
        }
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <p className="truncate" style={{ fontSize: "0.875rem", fontWeight: 700, color: C.fg, margin: 0, maxWidth: "100%" }}>
            {recalada.buque.nombre}
          </p>
          {isOverdue && (
            <span
              style={{
                display: "inline-flex", alignItems: "center", gap: 3,
                borderRadius: 9999, padding: "1px 7px",
                background: "var(--color-danger-soft)",
                border: `1px solid ${C.dangerBorder}`,
                color: C.danger,
                fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              <span style={{ display: "flex" }}>{Ico.warning(9)}</span>
              Zarpe vencido
            </span>
          )}
        </div>
        <p className="truncate" style={{ fontSize: "0.6875rem", fontWeight: 600, color: C.fgSec, marginTop: 2 }}>{recalada.codigoRecalada}</p>
        <p
          className="truncate"
          style={{
            fontSize: "0.6875rem",
            color: isOverdue ? C.danger : C.fgMuted,
            fontWeight: isOverdue ? 600 : 400,
            marginTop: 2,
            display: "flex", alignItems: "center", gap: 4,
          }}
        >
          <span style={{ display: "flex" }}>{Ico.anchor()}</span>
          {isOverdue && recalada.fechaSalida
            ? <>Salida venció: {shortDt(recalada.fechaSalida)}</>
            : <>Llegada: {shortDt(recalada.fechaLlegada)}</>
          }
        </p>
      </div>

      {/* Status + chevron */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, flexShrink: 0 }}>
        <span style={{
          display: "inline-flex", alignItems: "center",
          borderRadius: 9999, padding: "2px 8px",
          background: cfg.faint, border: `1px solid ${cfg.border}`,
          fontSize: "0.6875rem", fontWeight: 700, color: cfg.color,
        }}>
          {cfg.label}
        </span>
        <span style={{ color: isOverdue ? C.danger : "var(--color-fg-disabled)" }}>{Ico.chevron()}</span>
      </div>

      {overdueMode && !isOverdue && null}
    </button>
  );
};

/* ─────────────────────────────────────────────
   ATOMS
───────────────────────────────────────────── */
const EmptyRecaladas: React.FC<{
  hasFilters: boolean;
  isOverdue: boolean;
  isSupervisor: boolean;
  onClearOverdue: () => void;
  onNew: () => void;
}> = ({ hasFilters, isOverdue, isSupervisor, onClearOverdue, onNew }) => {
  const isOverdueEmpty = isOverdue;

  return (
    <div style={{ padding: "2.25rem 0 1.75rem", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: 56, height: 56, borderRadius: 18,
          background: isOverdueEmpty ? C.dangerFaint : C.cyanFaint,
          border: `1px solid ${isOverdueEmpty ? C.dangerBorder : C.cyanBorder}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: isOverdueEmpty ? C.danger : C.cyan,
        }}
      >
        {isOverdueEmpty ? Ico.warning(26) : Ico.ship(24)}
      </div>
      <p style={{ fontSize: "0.95rem", fontWeight: 800, color: C.fg, marginTop: 2 }}>
        {isOverdueEmpty
          ? "Sin zarpes vencidos"
          : hasFilters
            ? "Sin resultados"
            : "Sin recaladas"}
      </p>
      <p style={{ fontSize: "0.75rem", color: C.fgMuted, textAlign: "center", maxWidth: 260, lineHeight: 1.45 }}>
        {isOverdueEmpty
          ? "No hay recaladas arribadas con salida vencida en este momento."
          : hasFilters
            ? "Prueba con otros filtros."
            : "Cuando registres recaladas aparecerán aquí."}
      </p>
      {isOverdueEmpty ? (
        <button
          type="button"
          onClick={onClearOverdue}
          style={{
            marginTop: 6, borderRadius: 12, padding: "10px 18px",
            background: "var(--color-bg-elevated)",
            border: `1px solid ${C.dangerBorder}`,
            color: C.danger, fontSize: "0.8125rem", fontWeight: 700, cursor: "pointer",
          }}
        >
          Ver todas las recaladas
        </button>
      ) : isSupervisor && !hasFilters ? (
        <button
          type="button"
          onClick={onNew}
          style={{
            marginTop: 6, borderRadius: 12, padding: "10px 20px",
            background: "var(--color-primary)",
            border: "none",
            color: "white", fontSize: "0.8125rem", fontWeight: 700, cursor: "pointer",
          }}
        >
          Crear recalada
        </button>
      ) : null}
    </div>
  );
};

const PagBtn: React.FC<{ label: string; icon: React.ReactElement; iconRight?: boolean; disabled: boolean; onClick: () => void }> = ({ label, icon, iconRight, disabled, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      padding: "10px 14px", borderRadius: 13,
      background: "var(--color-glass-subtle)",
      border: "1px solid var(--color-glass-medium)",
      color: disabled ? "var(--color-fg-disabled)" : C.fg,
      fontSize: "0.8125rem", fontWeight: 600,
      cursor: disabled ? "not-allowed" : "pointer",
    }}
  >
    {!iconRight && icon}<span>{label}</span>{iconRight && icon}
  </button>
);

function shortDt(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default RecaladasListPage;
