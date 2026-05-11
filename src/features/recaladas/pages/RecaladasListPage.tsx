import { IonContent, IonPage } from "@ionic/react";
import { useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
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
  const user = useSessionStore((s) => s.user);
  const isSupervisor = user?.role === "SUPERVISOR" || user?.role === "SUPER_ADMIN";
  useRecaladaSocket();

  const [draft,        setDraft]        = useState("");
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [page,         setPage]         = useState(1);

  const queryParams = useMemo<ListRecaladasParams>(() => ({
    q: search.trim() || undefined,
    operationalStatus: statusFilter || undefined,
    page,
    pageSize: PAGE_SIZE,
  }), [page, search, statusFilter]);

  const { data, isLoading, isFetching, error, refetch } = useRecaladasList(queryParams);

  const items      = data?.items ?? [];
  const total      = data?.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const canPrev    = page > 1;
  const canNext    = page < totalPages;
  const hasFilters = Boolean(search.trim() || statusFilter);

  function clearSearch() { setDraft(""); setSearch(""); setPage(1); }

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
                  <div style={{ width: 3, height: 13, borderRadius: 2, background: C.cyan, opacity: 0.9 }} />
                  <span style={{ fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: C.cyan }}>Agenda operativa</span>
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
                    <EmptyRecaladas hasFilters={hasFilters} isSupervisor={isSupervisor} onNew={() => history.push("/recaladas/nueva")} />
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {items.map((r) => (
                        <RecaladaRow key={r.id} recalada={r} onPress={() => history.push(`/recaladas/${r.id}`)} />
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
const RecaladaRow: React.FC<{ recalada: RecaladaItem; onPress: () => void }> = ({ recalada, onPress }) => {
  const cfg = STATUS_CFG[recalada.operationalStatus];
  const isLive = recalada.operationalStatus === "ARRIVED";

  return (
    <button
      type="button"
      onClick={onPress}
      className="w-full text-left transition-all active:scale-[0.98]"
      style={{
        borderRadius: 16, padding: "12px 13px",
        background: "var(--color-glass-subtle)",
        border: "1px solid var(--color-glass-medium)",
        borderLeft: `3px solid ${cfg.color}`,
        display: "flex", alignItems: "center", gap: 12,
      }}
    >
      {/* Icon */}
      <div style={{
        width: 42, height: 42, borderRadius: 13, flexShrink: 0,
        background: cfg.faint, border: `1px solid ${cfg.border}`,
        display: "flex", alignItems: "center", justifyContent: "center", color: cfg.color,
      }}>
        {isLive
          ? <span className="live-pulse-dot" style={{ background: cfg.color, width: 9, height: 9 }} />
          : Ico.ship(18)
        }
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p className="truncate" style={{ fontSize: "0.875rem", fontWeight: 700, color: C.fg }}>{recalada.buque.nombre}</p>
        <p className="truncate" style={{ fontSize: "0.6875rem", fontWeight: 600, color: C.fgSec, marginTop: 2 }}>{recalada.codigoRecalada}</p>
        <p className="truncate" style={{ fontSize: "0.6875rem", color: C.fgMuted, marginTop: 2 }}>
          {Ico.anchor()} Llegada: {shortDt(recalada.fechaLlegada)}
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
        <span style={{ color: "var(--color-fg-disabled)" }}>{Ico.chevron()}</span>
      </div>
    </button>
  );
};

/* ─────────────────────────────────────────────
   ATOMS
───────────────────────────────────────────── */
const EmptyRecaladas: React.FC<{ hasFilters: boolean; isSupervisor: boolean; onNew: () => void }> = ({ hasFilters, isSupervisor, onNew }) => (
  <div style={{ padding: "2rem 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
    <div style={{ width: 52, height: 52, borderRadius: 16, background: C.cyanFaint, border: `1px solid ${C.cyanBorder}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.cyan }}>
      {Ico.ship(24)}
    </div>
    <p style={{ fontSize: "0.875rem", fontWeight: 700, color: C.fg }}>{hasFilters ? "Sin resultados" : "Sin recaladas"}</p>
    <p style={{ fontSize: "0.75rem", color: C.fgMuted, textAlign: "center", maxWidth: 220 }}>
      {hasFilters ? "Prueba con otros filtros." : "Cuando registres recaladas aparecerán aquí."}
    </p>
    {isSupervisor && !hasFilters && (
      <button
        type="button"
        onClick={onNew}
        style={{
          marginTop: 4, borderRadius: 12, padding: "10px 20px",
          background: "var(--color-primary)",
          border: "none",
          color: "white", fontSize: "0.8125rem", fontWeight: 700, cursor: "pointer",
        }}
      >
        Crear recalada
      </button>
    )}
  </div>
);

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
