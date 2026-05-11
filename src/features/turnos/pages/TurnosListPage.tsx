import { IonContent, IonPage } from "@ionic/react";
import { useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { useSessionStore } from "../../../core/auth/sessionStore";
import ErrorState from "../../../ui/components/ErrorState";
import { useMyActiveTurno } from "../hooks/useMyActiveTurno";
import { useMyNextTurno } from "../hooks/useMyNextTurno";
import { useMyTurnos } from "../hooks/useMyTurnos";
import { useTurnosList } from "../hooks/useTurnosList";
import { useTurnoSocket } from "../hooks/useTurnoSocket";
import {
  formatTurnoDate,
  getTurnoLabel,
  getTurnoTone,
} from "../lib/turnoStatus";
import type { TurnoItem, TurnoStatus } from "../types/turnos.types";

/* ─────────────────────────────────────────────
   PALETTE
───────────────────────────────────────────── */
const C = {
  violet:       "var(--color-primary)",
  violetLight:  "var(--color-primary-light)",
  violetGlow:   "var(--color-primary-glow)",
  violetFaint:  "var(--color-primary-glow)",
  violetBorder: "var(--color-primary-glow)",
  amber:        "var(--color-accent)",
  amberGlow:    "var(--color-accent-glow)",
  amberFaint:   "var(--color-accent-glow)",
  amberBorder:  "var(--color-accent-glow)",
  cyan:         "var(--color-info)",
  cyanFaint:    "var(--color-info-soft)",
  cyanBorder:   "var(--color-info-border)",
  teal:         "var(--color-success)",
  tealFaint:    "var(--color-success-soft)",
  tealBorder:   "var(--color-success-soft)",
  danger:       "var(--color-danger)",
  dangerFaint:  "var(--color-danger-soft)",
  dangerBorder: "var(--color-danger-border)",
  fgPrimary:    "var(--color-fg-primary)",
  fgSecondary:  "var(--color-fg-secondary)",
  fgMuted:      "var(--color-fg-muted)",
  bg:           "var(--color-bg-base)",
  surface: "var(--color-bg-elevated)",
};

/* ─────────────────────────────────────────────
   STATUS CONFIG
───────────────────────────────────────────── */
type ToneKey = "available" | "assigned" | "inProgress" | "completed" | "canceled" | "noShow";

const STATUS_CONFIG: Record<TurnoStatus, { color: string; faint: string; border: string; label: string; icon: string }> = {
  AVAILABLE:   { color: C.cyan,   faint: C.cyanFaint,   border: C.cyanBorder,   label: "Disponible",      icon: "○" },
  ASSIGNED:    { color: C.violet, faint: C.violetFaint,  border: C.violetBorder, label: "Asignado",        icon: "◆" },
  IN_PROGRESS: { color: C.amber,  faint: C.amberFaint,   border: C.amberBorder,  label: "En curso",        icon: "●" },
  COMPLETED:   { color: C.teal,   faint: C.tealFaint,    border: C.tealBorder,   label: "Completado",      icon: "✓" },
  CANCELED:    { color: C.danger, faint: C.dangerFaint,  border: C.dangerBorder, label: "Cancelado",       icon: "✕" },
  NO_SHOW:     { color: "var(--color-fg-muted)",faint: "var(--color-glass-soft)", border: "var(--color-glass-medium)", label: "No se presentó", icon: "—" },
};

/* ─────────────────────────────────────────────
   ICONS
───────────────────────────────────────────── */
const Ico = {
  ticket:  (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" /></svg>,
  ship:    (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20a2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1" /><path d="M4 18l-1-5h18l-2 5M12 2v3M8 7h8M6 11V8a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v3" /></svg>,
  clock:   (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  chevron: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>,
  user:    (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  zap:     (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
  filter:  (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>,
  left:    (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>,
  right:   (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>,
};

const PAGE_SIZE = 20;
type StatusFilter = TurnoStatus | "";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "",            label: "Todos" },
  { value: "AVAILABLE",  label: "Disponible" },
  { value: "ASSIGNED",   label: "Asignado" },
  { value: "IN_PROGRESS",label: "En curso" },
  { value: "COMPLETED",  label: "Completado" },
  { value: "CANCELED",   label: "Cancelado" },
  { value: "NO_SHOW",    label: "No-show" },
];

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
const TurnosListPage: React.FC = () => {
  const history = useHistory();
  const user = useSessionStore((state) => state.user);
  const isSupervisor = user?.role === "SUPERVISOR" || user?.role === "SUPER_ADMIN";
  const isGuia = user?.role === "GUIA";

  useTurnoSocket()

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [page, setPage] = useState(1);

  const queryParams = useMemo(
    () => ({ status: statusFilter || undefined, page, pageSize: PAGE_SIZE }),
    [page, statusFilter]
  );

  const supervisorQuery = useTurnosList(isSupervisor ? queryParams : {});
  const guiaQuery       = useMyTurnos(queryParams, isGuia);
  const active          = useMyActiveTurno(isGuia);
  const next            = useMyNextTurno(isGuia);

  const activeItem  = isGuia ? active.data  ?? null : null;
  const nextItem    = isGuia ? next.data    ?? null : null;

  const data      = isSupervisor ? supervisorQuery.data    : guiaQuery.data;
  const isLoading = isSupervisor ? supervisorQuery.isLoading : guiaQuery.isLoading;
  const isFetching= isSupervisor ? supervisorQuery.isFetching: guiaQuery.isFetching;
  const error     = isSupervisor ? supervisorQuery.error   : guiaQuery.error;
  const refetch   = isSupervisor ? supervisorQuery.refetch : guiaQuery.refetch;

  const items      = data?.items ?? [];
  const total      = data?.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const canGoPrev  = page > 1;
  const canGoNext  = page < totalPages;

  return (
    <IonPage>
      <IonContent scrollY={true}>
        <div style={{ minHeight: "100vh", background: C.bg, paddingBottom: "1.5rem" }}>

          {/* Page Header */}
          <div style={{ padding: "52px 1.25rem 0" }}>
            <div style={{ maxWidth: 480, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "var(--text-eyebrow)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "var(--tracking-eyebrow)",
                    color: "var(--color-fg-muted)",
                  }}
                >
                  {isSupervisor ? "Gestión global" : "Mis operaciones"}
                </p>
                <h1
                  style={{
                    margin: "4px 0 0",
                    fontSize: "var(--text-display)",
                    fontWeight: 700,
                    color: "var(--color-fg-primary)",
                    letterSpacing: "var(--tracking-tight)",
                    lineHeight: "var(--leading-tight)",
                  }}
                >
                  Turnos
                </h1>
              </div>
              {total > 0 && (
                <span
                  style={{
                    fontSize: "var(--text-eyebrow)",
                    fontWeight: 600,
                    color: "var(--color-fg-muted)",
                    letterSpacing: "var(--tracking-eyebrow)",
                    textTransform: "uppercase",
                  }}
                >
                  {total} total
                </span>
              )}
            </div>
          </div>

          <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 1.25rem" }}>

            {/* ── Guide: active turno card ── */}
            {isGuia && activeItem && (
              <div className="animate-fade-up" style={{ animationDelay: "0ms", animationFillMode: "backwards", marginTop: "1.25rem" }}>
                <ActiveTurnoCard turno={activeItem} onPress={() => history.push(`/turnos/${activeItem.id}`)} />
              </div>
            )}

            {/* ── Guide: next turno card ── */}
            {isGuia && !activeItem && nextItem && (
              <div className="animate-fade-up" style={{ animationDelay: "60ms", animationFillMode: "backwards", marginTop: "1.25rem" }}>
                <NextTurnoCard turno={nextItem} onPress={() => history.push(`/turnos/${nextItem.id}`)} />
              </div>
            )}

            {/* ── Status filter pills ── */}
            <div className="animate-fade-up" style={{ animationDelay: "80ms", animationFillMode: "backwards", marginTop: "1.25rem" }}>
              <FilterSection
                value={statusFilter}
                onChange={(v) => { setStatusFilter(v); setPage(1); }}
              />
            </div>

            {/* ── List section ── */}
            <div className="animate-fade-up" style={{ animationDelay: "140ms", animationFillMode: "backwards", marginTop: "1rem" }}>
              <ListSection
                items={items}
                isLoading={isLoading}
                isFetching={isFetching}
                error={error}
                page={page}
                totalPages={totalPages}
                total={total}
                canGoPrev={canGoPrev}
                canGoNext={canGoNext}
                isSupervisor={isSupervisor}
                onRefetch={() => void refetch()}
                onNavigate={(id) => history.push(`/turnos/${id}`)}
                onPrev={() => setPage((p) => Math.max(1, p - 1))}
                onNext={() => setPage((p) => p + 1)}
              />
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

/* ─────────────────────────────────────────────
   ACTIVE TURNO CARD
───────────────────────────────────────────── */
const ActiveTurnoCard: React.FC<{ turno: TurnoItem; onPress: () => void }> = ({ turno, onPress }) => {
  const cfg = STATUS_CONFIG[turno.status];
  const shipCode = turno.atencion?.recalada?.codigoRecalada ?? `Atención #${turno.atencionId}`;
  const guiaName = [turno.guia?.usuario?.nombres, turno.guia?.usuario?.apellidos].filter(Boolean).join(" ") || null;

  return (
    <button
      type="button"
      onClick={onPress}
      className="w-full text-left transition-colors active:translate-y-px"
      style={{
        borderRadius: 16,
        background: "var(--color-bg-elevated)",
        border: "1px solid var(--color-border-hairline)",
        borderLeft: "3px solid var(--color-accent)",
        boxShadow: "var(--shadow-card)",
        display: "block", width: "100%",
      }}
    >
      <div style={{ padding: "1.125rem 1.125rem 1rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 14 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 9999, padding: "3px 9px", background: "var(--color-warning-soft)", border: "1px solid var(--color-warning-border)" }}>
            <span className="live-pulse-dot" style={{ background: "var(--color-accent)" }} />
            <span
              style={{
                fontSize: "var(--text-eyebrow)",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "var(--tracking-eyebrow)",
                color: "#B45309",
              }}
            >
              En curso
            </span>
          </span>
          <StatusBadge status={turno.status} />
        </div>

        <p
          className="t-mono"
          style={{
            fontSize: "2.75rem",
            fontWeight: 700,
            color: "var(--color-fg-primary)",
            letterSpacing: "var(--tracking-tight)",
            lineHeight: 1,
          }}
        >
          #{pad(turno.numero)}
        </p>

        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "var(--color-fg-muted)" }}>{Ico.ship(14)}</span>
          <span
            style={{
              fontSize: "var(--text-body)",
              fontWeight: 600,
              color: "var(--color-fg-primary)",
              letterSpacing: "var(--tracking-tight)",
            }}
          >
            {shipCode}
          </span>
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <TimePill label="Inicio" value={shortTime(turno.fechaInicio)} color={C.amber} />
          <TimePill label="Fin"    value={shortTime(turno.fechaFin)} />
          {turno.checkInAt && <TimePill label="Check-in" value={shortTime(turno.checkInAt)} color={C.teal} />}
        </div>

        {guiaName && (
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "var(--color-fg-muted)" }}>{Ico.user(13)}</span>
            <span style={{ fontSize: "var(--text-caption)", color: "var(--color-fg-secondary)", fontWeight: 500 }}>
              {guiaName}
            </span>
          </div>
        )}

        <div style={{ marginTop: 14, height: 1, background: "var(--color-border-hairline)" }} />

        <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span
            style={{
              fontSize: "var(--text-caption)",
              fontWeight: 600,
              color: "var(--color-primary)",
              letterSpacing: "var(--tracking-tight)",
            }}
          >
            Ver detalle completo
          </span>
          <span style={{ color: "var(--color-primary)" }}>{Ico.chevron()}</span>
        </div>
      </div>
    </button>
  );
};

/* ─────────────────────────────────────────────
   NEXT TURNO CARD
───────────────────────────────────────────── */
const NextTurnoCard: React.FC<{ turno: TurnoItem; onPress: () => void }> = ({ turno, onPress }) => {
  const shipCode = turno.atencion?.recalada?.codigoRecalada ?? `Atención #${turno.atencionId}`;

  return (
    <button
      type="button"
      onClick={onPress}
      className="w-full text-left transition-colors active:translate-y-px"
      style={{
        borderRadius: 16,
        background: "var(--color-bg-elevated)",
        border: "1px solid var(--color-border-hairline)",
        borderLeft: "3px solid var(--color-info)",
        boxShadow: "var(--shadow-card)",
        display: "block", width: "100%",
      }}
    >
      <div style={{ padding: "1rem 1.125rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ color: "var(--color-info)" }}>{Ico.clock(13)}</span>
          <span
            style={{
              fontSize: "var(--text-eyebrow)",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "var(--tracking-eyebrow)",
              color: "var(--color-fg-muted)",
            }}
          >
            Próximo turno
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, justifyContent: "space-between" }}>
          <p
            className="t-mono"
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "var(--color-fg-primary)",
              letterSpacing: "var(--tracking-tight)",
              lineHeight: 1,
            }}
          >
            #{pad(turno.numero)}
          </p>
          <StatusBadge status={turno.status} />
        </div>
        <p
          style={{
            marginTop: 8,
            fontSize: "var(--text-body)",
            fontWeight: 600,
            color: "var(--color-fg-primary)",
            letterSpacing: "var(--tracking-tight)",
          }}
        >
          {shipCode}
        </p>
        <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <TimePill label="Inicio" value={shortTime(turno.fechaInicio)} color={C.cyan} />
          <TimePill label="Fin"    value={shortTime(turno.fechaFin)} />
        </div>
      </div>
    </button>
  );
};

/* ─────────────────────────────────────────────
   FILTER SECTION
───────────────────────────────────────────── */
const FilterSection: React.FC<{ value: StatusFilter; onChange: (v: StatusFilter) => void }> = ({ value, onChange }) => (
  <div
    style={{
      borderRadius: 16,
      background: "var(--color-bg-elevated)",
      border: "1px solid var(--color-border-hairline)",
      padding: "0.875rem 1rem",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
      <span style={{ color: "var(--color-fg-muted)" }}>{Ico.filter()}</span>
      <span
        style={{
          fontSize: "var(--text-eyebrow)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "var(--tracking-eyebrow)",
          color: "var(--color-fg-muted)",
        }}
      >
        Filtrar por estado
      </span>
    </div>
    <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
      {STATUS_FILTERS.map(({ value: v, label }) => {
        const isActive = value === v;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            style={{
              flexShrink: 0,
              borderRadius: 9999,
              padding: "5px 12px",
              fontSize: "var(--text-caption)",
              fontWeight: 600,
              letterSpacing: "var(--tracking-base)",
              border: `1px solid ${isActive ? "var(--color-primary)" : "var(--color-border-hairline)"}`,
              background: isActive ? "var(--color-primary)" : "var(--color-bg-elevated)",
              color: isActive ? "#FFFFFF" : "var(--color-fg-secondary)",
              transition: "background 140ms ease, color 140ms ease, border-color 140ms ease",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   LIST SECTION
───────────────────────────────────────────── */
const ListSection: React.FC<{
  items: TurnoItem[];
  isLoading: boolean;
  isFetching: boolean;
  error: unknown;
  page: number;
  totalPages: number;
  total: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  isSupervisor: boolean;
  onRefetch: () => void;
  onNavigate: (id: number) => void;
  onPrev: () => void;
  onNext: () => void;
}> = ({ items, isLoading, isFetching, error, page, totalPages, total, canGoPrev, canGoNext, isSupervisor, onRefetch, onNavigate, onPrev, onNext }) => (
  <div
    style={{
      borderRadius: 16,
      background: "var(--color-bg-elevated)",
      border: "1px solid var(--color-border-hairline)",
      overflow: "hidden",
      boxShadow: "var(--shadow-card)",
    }}
  >
    {/* Section header */}
    <div style={{ padding: "0.875rem 1.125rem", borderBottom: "1px solid var(--color-border-hairline)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            fontSize: "var(--text-eyebrow)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "var(--tracking-eyebrow)",
            color: "var(--color-fg-muted)",
          }}
        >
          {isSupervisor ? "Agenda de turnos" : "Mis turnos"}
        </span>
        {total > 0 && (
          <span
            style={{
              marginLeft: "auto",
              fontSize: "var(--text-eyebrow)",
              fontWeight: 600,
              color: "var(--color-fg-muted)",
              letterSpacing: "var(--tracking-eyebrow)",
              textTransform: "uppercase",
            }}
          >
            Pág. {page} / {totalPages}
          </span>
        )}
      </div>
    </div>

    <div style={{ padding: "0.75rem 1rem 1rem" }}>
      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} delay={i * 60} />
          ))}
        </div>
      ) : error ? (
        <ErrorState
          compact
          title="No pude cargar los turnos"
          message={error instanceof Error ? error.message : "Ocurrió un problema inesperado."}
          onRetry={onRefetch}
        />
      ) : items.length === 0 ? (
        <EmptyTurnos />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((t) => (
            <TurnoRow key={t.id} turno={t} onPress={() => onNavigate(t.id)} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !error && items.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
          <PaginationBtn
            label="Anterior"
            icon={Ico.left()}
            disabled={!canGoPrev || isFetching}
            onClick={onPrev}
          />
          <PaginationBtn
            label="Siguiente"
            icon={Ico.right()}
            iconRight
            disabled={!canGoNext || isFetching}
            onClick={onNext}
          />
        </div>
      )}
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   TURNO ROW CARD
───────────────────────────────────────────── */
const TurnoRow: React.FC<{ turno: TurnoItem; onPress: () => void }> = ({ turno, onPress }) => {
  const cfg = STATUS_CONFIG[turno.status];
  const shipCode = turno.atencion?.recalada?.codigoRecalada ?? `#${turno.atencionId}`;
  const isLive = turno.status === "IN_PROGRESS";

  return (
    <button
      type="button"
      onClick={onPress}
      className="w-full text-left transition-colors active:translate-y-px"
      style={{
        borderRadius: 12,
        background: "var(--color-bg-elevated)",
        border: "1px solid var(--color-border-hairline)",
        borderLeft: `3px solid ${cfg.color}`,
        display: "flex", alignItems: "center", gap: 12,
        padding: "11px 12px",
      }}
    >
      <div
        style={{
          width: 32, height: 32, borderRadius: 10, flexShrink: 0,
          background: cfg.faint, border: `1px solid ${cfg.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: cfg.color,
        }}
      >
        {isLive
          ? <span className="live-pulse-dot" style={{ background: cfg.color, width: 7, height: 7 }} />
          : <span style={{ fontSize: "var(--text-caption)", fontWeight: 700 }}>{cfg.icon}</span>
        }
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span
            className="t-mono"
            style={{
              fontSize: "var(--text-body)",
              fontWeight: 700,
              color: "var(--color-fg-primary)",
              letterSpacing: "var(--tracking-tight)",
            }}
          >
            #{pad(turno.numero)}
          </span>
          <span
            className="truncate"
            style={{
              fontSize: "var(--text-caption)",
              color: "var(--color-fg-muted)",
              fontWeight: 500,
            }}
          >
            · {shipCode}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
          <span style={{ color: "var(--color-fg-muted)" }}>{Ico.clock(11)}</span>
          <span
            style={{
              fontSize: "var(--text-eyebrow)",
              color: "var(--color-fg-muted)",
              fontWeight: 500,
              letterSpacing: "0.02em",
            }}
          >
            {shortTime(turno.fechaInicio)} → {shortTime(turno.fechaFin)}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
        <StatusBadge status={turno.status} small />
        <span style={{ color: "var(--color-fg-disabled)" }}>{Ico.chevron(12)}</span>
      </div>
    </button>
  );
};

/* ─────────────────────────────────────────────
   ATOMS
───────────────────────────────────────────── */
const StatusBadge: React.FC<{ status: TurnoStatus; small?: boolean }> = ({ status, small }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        borderRadius: 9999,
        padding: small ? "2px 7px" : "3px 8px",
        background: cfg.faint,
        border: `1px solid ${cfg.border}`,
        fontSize: "var(--text-eyebrow)",
        fontWeight: 600,
        letterSpacing: "0.02em",
        color: cfg.color,
      }}
    >
      {cfg.label}
    </span>
  );
};

const TimePill: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color }) => (
  <div
    style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      borderRadius: 8, padding: "3px 8px",
      background: "var(--color-bg-subtle)",
      border: "1px solid var(--color-border-hairline)",
    }}
  >
    <span
      style={{
        fontSize: "var(--text-eyebrow)",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "var(--tracking-eyebrow)",
        color: "var(--color-fg-muted)",
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontSize: "var(--text-eyebrow)",
        fontWeight: 600,
        color: color ?? "var(--color-fg-primary)",
      }}
    >
      {value}
    </span>
  </div>
);

const SkeletonRow: React.FC<{ delay: number }> = ({ delay }) => (
  <div
    className="animate-pulse"
    style={{
      height: 56, borderRadius: 12,
      background: "var(--color-bg-subtle)",
      border: "1px solid var(--color-border-hairline)",
      animationDelay: `${delay}ms`,
    }}
  />
);

const EmptyTurnos: React.FC = () => (
  <div style={{ padding: "2rem 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
    <div
      style={{
        width: 48, height: 48, borderRadius: 12,
        background: "var(--color-primary-soft)",
        border: "1px solid var(--color-primary-soft)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "var(--color-primary)",
      }}
    >
      {Ico.ticket(22)}
    </div>
    <p
      style={{
        fontSize: "var(--text-body)",
        fontWeight: 600,
        color: "var(--color-fg-primary)",
        letterSpacing: "var(--tracking-tight)",
      }}
    >
      Sin turnos
    </p>
    <p
      style={{
        fontSize: "var(--text-caption)",
        color: "var(--color-fg-muted)",
        textAlign: "center",
        maxWidth: 240,
        lineHeight: "var(--leading-base)",
      }}
    >
      Cuando existan turnos aparecerán aquí.
    </p>
  </div>
);

const PaginationBtn: React.FC<{ label: string; icon: React.ReactElement; iconRight?: boolean; disabled: boolean; onClick: () => void }> = ({
  label, icon, iconRight, disabled, onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      padding: "9px 14px", borderRadius: 10,
      background: "var(--color-bg-elevated)",
      border: "1px solid var(--color-border-hairline)",
      color: disabled ? "var(--color-fg-disabled)" : "var(--color-fg-primary)",
      fontSize: "var(--text-caption)",
      fontWeight: 600,
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "background 140ms ease, border-color 140ms ease",
    }}
  >
    {!iconRight && icon}
    <span>{label}</span>
    {iconRight && icon}
  </button>
);

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function pad(n: number): string { return String(n).padStart(3, "0"); }

function shortTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-CO", {
    day: "2-digit", month: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

void formatTurnoDate;
void getTurnoTone;
void getTurnoLabel;

export default TurnosListPage;
