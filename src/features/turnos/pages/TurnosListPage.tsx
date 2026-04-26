import { IonContent, IonPage } from "@ionic/react";
import { useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { useSessionStore } from "../../../core/auth/sessionStore";
import ErrorState from "../../../ui/components/ErrorState";
import { useMyActiveTurno } from "../hooks/useMyActiveTurno";
import { useMyNextTurno } from "../hooks/useMyNextTurno";
import { useMyTurnos } from "../hooks/useMyTurnos";
import { useTurnosList } from "../hooks/useTurnosList";
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
  violet:       "#8B5CF6",
  violetLight:  "#A78BFA",
  violetGlow:   "rgba(139,92,246,0.42)",
  violetFaint:  "rgba(139,92,246,0.11)",
  violetBorder: "rgba(139,92,246,0.28)",
  amber:        "#F59E0B",
  amberGlow:    "rgba(245,158,11,0.38)",
  amberFaint:   "rgba(245,158,11,0.10)",
  amberBorder:  "rgba(245,158,11,0.28)",
  cyan:         "#38BDF8",
  cyanFaint:    "rgba(56,189,248,0.10)",
  cyanBorder:   "rgba(56,189,248,0.26)",
  teal:         "#2DD4BF",
  tealFaint:    "rgba(45,212,191,0.10)",
  tealBorder:   "rgba(45,212,191,0.26)",
  danger:       "#F43F5E",
  dangerFaint:  "rgba(244,63,94,0.10)",
  dangerBorder: "rgba(244,63,94,0.26)",
  fgPrimary:    "var(--color-fg-primary)",
  fgSecondary:  "var(--color-fg-secondary)",
  fgMuted:      "var(--color-fg-muted)",
  bg:           "var(--color-bg-base)",
  surface:      "linear-gradient(150deg, rgba(12,14,42,0.99) 0%, rgba(7,8,22,0.98) 100%)",
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
  NO_SHOW:     { color: "#64748B",faint: "rgba(100,116,139,0.10)", border: "rgba(100,116,139,0.26)", label: "No se presentó", icon: "—" },
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

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [page, setPage] = useState(1);

  const queryParams = useMemo(
    () => ({ status: statusFilter || undefined, page, pageSize: PAGE_SIZE }),
    [page, statusFilter]
  );

  const supervisorQuery = useTurnosList(isSupervisor ? queryParams : {});
  const guiaQuery       = useMyTurnos(queryParams);
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

          {/* ── Hero header ── */}
          <PageHeader
            isSupervisor={isSupervisor}
            total={total}
            activeCount={activeItem ? 1 : 0}
          />

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
   PAGE HEADER
───────────────────────────────────────────── */
const PageHeader: React.FC<{ isSupervisor: boolean; total: number; activeCount: number }> = ({
  isSupervisor, total,
}) => (
  <div
    className="relative overflow-hidden"
    style={{
      background: "linear-gradient(160deg, #0C0820 0%, #080720 60%, #0A0820 100%)",
      borderBottom: "1px solid rgba(139,92,246,0.14)",
    }}
  >
    {/* Orbs */}
    <div style={{ position: "absolute", top: -60, left: -40, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.16) 0%, transparent 65%)", pointerEvents: "none" }} />
    <div style={{ position: "absolute", top: 0, right: -30, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 65%)", pointerEvents: "none" }} />
    {/* Dot grid */}
    <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(139,92,246,0.045) 1px, transparent 1px)", backgroundSize: "22px 22px", pointerEvents: "none" }} />

    <div style={{ position: "relative", maxWidth: 480, margin: "0 auto", padding: "2.5rem 1.25rem 1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Icon box */}
          <div style={{
            width: 48, height: 48, borderRadius: 16,
            background: "linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)",
            boxShadow: `0 6px 22px ${C.violetGlow}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", flexShrink: 0,
          }}>
            {Ico.ticket(22)}
          </div>
          <div>
            <p style={{ fontSize: "0.575rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.24em", color: C.violet }}>
              {isSupervisor ? "Gestión global" : "Mis operaciones"}
            </p>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: C.fgPrimary, letterSpacing: "-0.02em", lineHeight: 1.1, marginTop: 3 }}>
              Turnos
            </h1>
          </div>
        </div>

        {/* Total badge */}
        {total > 0 && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            padding: "8px 14px", borderRadius: 14,
            background: C.violetFaint, border: `1px solid ${C.violetBorder}`,
          }}>
            <span style={{ fontSize: "1.4rem", fontWeight: 900, color: C.violet, letterSpacing: "-0.04em", lineHeight: 1 }}>{total}</span>
            <span style={{ fontSize: "0.52rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.violet, opacity: 0.7, marginTop: 2 }}>total</span>
          </div>
        )}
      </div>
    </div>
  </div>
);

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
      className="w-full text-left transition-all active:scale-[0.98]"
      style={{
        borderRadius: 22,
        background: "linear-gradient(145deg, rgba(22,14,56,0.98) 0%, rgba(10,7,30,0.99) 100%)",
        border: "1px solid rgba(245,158,11,0.22)",
        borderLeft: "3px solid #F59E0B",
        boxShadow: `0 12px 40px ${C.amberGlow}, 0 24px 52px rgba(0,0,0,0.42), inset 0 1px 0 rgba(245,158,11,0.1)`,
        position: "relative", overflow: "hidden",
        display: "block", width: "100%",
      }}
    >
      {/* Ambient orb */}
      <div style={{ position: "absolute", top: -40, right: -20, width: 180, height: 180, borderRadius: "50%", background: `radial-gradient(circle, ${C.amberFaint} 0%, transparent 65%)`, pointerEvents: "none" }} />

      <div style={{ position: "relative", padding: "1.25rem 1.25rem 1rem" }}>
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 14 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 9999, padding: "3px 10px", background: C.amberFaint, border: `1px solid ${C.amberBorder}` }}>
            <span className="live-pulse-dot" style={{ background: C.amber }} />
            <span style={{ fontSize: "0.55rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.14em", color: C.amber }}>En curso</span>
          </span>
          <StatusBadge status={turno.status} />
        </div>

        {/* Big turno number */}
        <p style={{ fontFamily: "monospace", fontSize: "3.2rem", fontWeight: 900, color: C.amber, letterSpacing: "-0.04em", lineHeight: 1, textShadow: `0 0 36px ${C.amberGlow}` }}>
          #{pad(turno.numero)}
        </p>

        {/* Ship info */}
        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: C.amber, opacity: 0.7 }}>{Ico.ship(14)}</span>
          <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: C.fgPrimary }}>{shipCode}</span>
        </div>

        {/* Time range */}
        <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <TimePill label="Inicio" value={shortTime(turno.fechaInicio)} color={C.amber} />
          <TimePill label="Fin"    value={shortTime(turno.fechaFin)}    color={C.fgMuted} />
          {turno.checkInAt && <TimePill label="Check-in" value={shortTime(turno.checkInAt)} color={C.teal} />}
        </div>

        {guiaName && (
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: C.fgMuted }}>{Ico.user(13)}</span>
            <span style={{ fontSize: "0.72rem", color: C.fgSecondary, fontWeight: 500 }}>{guiaName}</span>
          </div>
        )}

        <div style={{ marginTop: 14, height: 1, background: "rgba(245,158,11,0.14)" }} />

        <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: C.amber, letterSpacing: "0.04em" }}>Ver detalle completo</span>
          <span style={{ color: C.amber }}>{Ico.chevron()}</span>
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
      className="w-full text-left transition-all active:scale-[0.98]"
      style={{
        borderRadius: 20,
        background: "linear-gradient(145deg, rgba(14,12,38,0.98) 0%, rgba(8,7,22,0.99) 100%)",
        border: "1px solid rgba(56,189,248,0.18)",
        borderLeft: "3px solid #38BDF8",
        boxShadow: "0 8px 28px rgba(56,189,248,0.12), inset 0 1px 0 rgba(56,189,248,0.06)",
        display: "block", width: "100%",
      }}
    >
      <div style={{ padding: "1rem 1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ color: C.cyan, opacity: 0.8 }}>{Ico.clock(13)}</span>
          <span style={{ fontSize: "0.565rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: C.cyan }}>Próximo turno</span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, justifyContent: "space-between" }}>
          <p style={{ fontFamily: "monospace", fontSize: "1.8rem", fontWeight: 900, color: C.fgPrimary, letterSpacing: "-0.03em", lineHeight: 1 }}>
            #{pad(turno.numero)}
          </p>
          <StatusBadge status={turno.status} />
        </div>
        <p style={{ marginTop: 8, fontSize: "0.8rem", fontWeight: 600, color: C.fgSecondary }}>{shipCode}</p>
        <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <TimePill label="Inicio" value={shortTime(turno.fechaInicio)} color={C.cyan} />
          <TimePill label="Fin"    value={shortTime(turno.fechaFin)}    color={C.fgMuted} />
        </div>
      </div>
    </button>
  );
};

/* ─────────────────────────────────────────────
   FILTER SECTION
───────────────────────────────────────────── */
const FilterSection: React.FC<{ value: StatusFilter; onChange: (v: StatusFilter) => void }> = ({ value, onChange }) => (
  <div style={{
    borderRadius: 18,
    background: C.surface,
    border: "1px solid rgba(255,255,255,0.06)",
    padding: "0.875rem 1rem",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
      <span style={{ color: C.fgMuted }}>{Ico.filter()}</span>
      <span style={{ fontSize: "0.565rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: C.fgMuted }}>Filtrar por estado</span>
    </div>
    <div
      style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 2 }}
    >
      {STATUS_FILTERS.map(({ value: v, label }) => {
        const isActive = value === v;
        const cfg = v ? STATUS_CONFIG[v as TurnoStatus] : null;
        const activeColor = cfg?.color ?? C.violet;
        const activeFaint = cfg?.faint ?? C.violetFaint;
        const activeBorder= cfg?.border ?? C.violetBorder;

        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            style={{
              flexShrink: 0,
              borderRadius: 9999,
              padding: "6px 13px",
              fontSize: "0.72rem",
              fontWeight: isActive ? 700 : 500,
              letterSpacing: isActive ? "0.02em" : "0.01em",
              border: `1px solid ${isActive ? activeBorder : "rgba(255,255,255,0.08)"}`,
              background: isActive ? activeFaint : "rgba(255,255,255,0.03)",
              color: isActive ? activeColor : C.fgSecondary,
              transition: "all 160ms ease",
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
  <div style={{
    borderRadius: 20,
    background: C.surface,
    border: "1px solid rgba(255,255,255,0.06)",
    overflow: "hidden",
  }}>
    {/* Section header */}
    <div style={{ padding: "1rem 1.25rem 0.75rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 3, height: 13, borderRadius: 2, background: C.violet, opacity: 0.9 }} />
        <span style={{ fontSize: "0.575rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: C.violet }}>
          {isSupervisor ? "Agenda de turnos" : "Mis turnos"}
        </span>
        {total > 0 && (
          <span style={{ marginLeft: "auto", fontSize: "0.6875rem", fontWeight: 600, color: C.fgMuted }}>
            Pág. {page} de {totalPages}
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
      className="w-full text-left transition-all active:scale-[0.98]"
      style={{
        borderRadius: 16,
        background: "rgba(255,255,255,0.025)",
        border: `1px solid rgba(255,255,255,0.06)`,
        borderLeft: `3px solid ${cfg.color}`,
        display: "flex", alignItems: "center", gap: 12,
        padding: "11px 12px",
        position: "relative", overflow: "hidden",
      }}
    >
      {/* Status dot column */}
      <div style={{
        width: 36, height: 36, borderRadius: 12, flexShrink: 0,
        background: cfg.faint, border: `1px solid ${cfg.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: cfg.color,
      }}>
        {isLive
          ? <span className="live-pulse-dot" style={{ background: cfg.color, width: 8, height: 8 }} />
          : <span style={{ fontSize: "0.875rem", fontWeight: 800 }}>{cfg.icon}</span>
        }
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontFamily: "monospace", fontSize: "0.9375rem", fontWeight: 900, color: C.fgPrimary, letterSpacing: "-0.02em" }}>
            #{pad(turno.numero)}
          </span>
          <span style={{ fontSize: "0.6875rem", color: C.fgSecondary, fontWeight: 500 }} className="truncate">
            · {shipCode}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
          <span style={{ color: C.fgMuted, opacity: 0.6 }}>{Ico.clock(11)}</span>
          <span style={{ fontSize: "0.65rem", color: C.fgMuted, fontWeight: 500 }}>
            {shortTime(turno.fechaInicio)} → {shortTime(turno.fechaFin)}
          </span>
        </div>
      </div>

      {/* Right side */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, flexShrink: 0 }}>
        <StatusBadge status={turno.status} small />
        <span style={{ color: "rgba(255,255,255,0.2)" }}>{Ico.chevron(12)}</span>
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
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      borderRadius: 9999,
      padding: small ? "2px 7px" : "3px 9px",
      background: cfg.faint, border: `1px solid ${cfg.border}`,
      fontSize: small ? "0.58rem" : "0.625rem",
      fontWeight: 700, color: cfg.color,
    }}>
      {cfg.label}
    </span>
  );
};

const TimePill: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color }) => (
  <div style={{
    display: "inline-flex", alignItems: "center", gap: 5,
    borderRadius: 8, padding: "4px 9px",
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
  }}>
    <span style={{ fontSize: "0.52rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: color ?? C.fgMuted }}>{label}</span>
    <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: color ?? C.fgPrimary }}>{value}</span>
  </div>
);

const SkeletonRow: React.FC<{ delay: number }> = ({ delay }) => (
  <div
    className="animate-pulse"
    style={{
      height: 62, borderRadius: 16,
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.05)",
      animationDelay: `${delay}ms`,
    }}
  />
);

const EmptyTurnos: React.FC = () => (
  <div style={{ padding: "2rem 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
    <div style={{ width: 52, height: 52, borderRadius: 16, background: C.violetFaint, border: `1px solid ${C.violetBorder}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.violet }}>
      {Ico.ticket(24)}
    </div>
    <p style={{ fontSize: "0.875rem", fontWeight: 700, color: C.fgPrimary }}>Sin turnos</p>
    <p style={{ fontSize: "0.75rem", color: C.fgMuted, textAlign: "center", maxWidth: 220 }}>
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
      padding: "10px 14px", borderRadius: 14,
      background: disabled ? "rgba(255,255,255,0.02)" : "rgba(139,92,246,0.08)",
      border: `1px solid ${disabled ? "rgba(255,255,255,0.05)" : "rgba(139,92,246,0.22)"}`,
      color: disabled ? "rgba(255,255,255,0.2)" : C.violet,
      fontSize: "0.78rem", fontWeight: 600,
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "all 160ms ease",
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
