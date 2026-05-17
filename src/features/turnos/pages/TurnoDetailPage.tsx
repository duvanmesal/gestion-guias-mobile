import { IonContent, IonPage } from "@ionic/react";
import { useMemo, useState } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { useSessionStore } from "../../../core/auth/sessionStore";
import { useMyAccount } from "../../users/hooks/useMyAccount";
import ErrorState from "../../../ui/components/ErrorState";
import LoadingScreen from "../../../ui/components/LoadingScreen";
import { useTurno } from "../hooks/useTurno";
import {
  useCancelTurno,
  useCheckInTurno,
  useCheckOutTurno,
  useClaimTurno,
  useNoShowTurno,
  useUnassignTurno,
} from "../hooks/useTurnoActions";
import { useTurnoSocket } from "../hooks/useTurnoSocket";
import { formatTurnoDate, getTurnoLabel } from "../lib/turnoStatus";
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
type StatusCfg = { color: string; faint: string; border: string; glow: string; label: string };
const STATUS_CFG: Record<TurnoStatus, StatusCfg> = {
  AVAILABLE:   { color: C.cyan,   faint: C.cyanFaint,   border: C.cyanBorder,   glow: "var(--color-info-glow)",  label: "Disponible" },
  ASSIGNED:    { color: C.violet, faint: C.violetFaint,  border: C.violetBorder, glow: C.violetGlow,            label: "Asignado" },
  IN_PROGRESS: { color: C.amber,  faint: C.amberFaint,   border: C.amberBorder,  glow: C.amberGlow,             label: "En curso" },
  COMPLETED:   { color: C.teal,   faint: C.tealFaint,    border: C.tealBorder,   glow: "var(--color-success-soft)", label: "Completado" },
  CANCELED:    { color: C.danger, faint: C.dangerFaint,  border: C.dangerBorder, glow: "var(--color-danger-glow)",  label: "Cancelado" },
  NO_SHOW:     { color: "var(--color-fg-muted)",faint:"var(--color-glass-soft)",border:"var(--color-glass-medium)",glow:"var(--color-glass-medium)",label:"No se presentó" },
};

/* ─────────────────────────────────────────────
   ICONS
───────────────────────────────────────────── */
const Ico = {
  back:     (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>,
  ship:     (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20a2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1" /><path d="M4 18l-1-5h18l-2 5M12 2v3M8 7h8M6 11V8a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v3" /></svg>,
  user:     (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  clock:    (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  check:    (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  checkOut: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
  zap:      (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
  unassign: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="23" y1="11" x2="17" y2="11" /></svg>,
  noShow:   (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="22" y1="22" x2="14" y2="14" /><line x1="14" y1="22" x2="22" y2="14" /></svg>,
  trash:    (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>,
  warning:  (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  info:     (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
  hash:     (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" /></svg>,
};

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
interface RouteParams { id: string; }

const TurnoDetailPage: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const { id: paramId } = useParams<RouteParams>();
  const user = useSessionStore((s) => s.user);
  const myAccount = useMyAccount();

  const id = paramId || location.pathname.match(/\/turnos\/(\d+)/)?.[1];

  const turnoId = useMemo(() => {
    const n = Number(id);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }, [id]);

  const currentUser = myAccount.data ?? user;
  const isSupervisor = currentUser?.role === "SUPERVISOR" || currentUser?.role === "SUPER_ADMIN";
  const isGuia       = currentUser?.role === "GUIA";
  useTurnoSocket();

  const turnoQuery = useTurno(turnoId);
  const claim    = useClaimTurno();
  const checkIn  = useCheckInTurno();
  const checkOut = useCheckOutTurno();
  const cancel   = useCancelTurno();
  const unassign = useUnassignTurno();
  const noShow   = useNoShowTurno();

  const [actionError,   setActionError]   = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [showCancel,    setShowCancel]    = useState(false);
  const [cancelReason,  setCancelReason]  = useState("");

  const turno = turnoQuery.data;

  /* ── Error / loading states ── */
  if (!turnoId) {
    return (
      <IonPage>
        <IonContent>
          <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 1.25rem", background: C.bg }}>
            <ErrorState title="ID inválido" message="El identificador del turno no es válido." onRetry={() => history.push("/turnos")} retryLabel="Volver" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (turnoQuery.isLoading && !turno) return <LoadingScreen message="Cargando turno..." />;

  if (turnoQuery.error && !turno) {
    return (
      <IonPage>
        <IonContent>
          <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 1.25rem", background: C.bg }}>
            <ErrorState
              title="No pude cargar el turno"
              message={turnoQuery.error instanceof Error ? turnoQuery.error.message : "Ocurrió un problema inesperado."}
              onRetry={() => void turnoQuery.refetch()}
            />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!turno) return null;

  /* ── Permission flags ── */
  const assignmentMode = currentUser?.turnoAssignmentMode ?? "MANUAL_RECLAMO";
  const guiaDisponible = currentUser?.disponibleParaTurnos ?? false;
  const guiaPenalizado = currentUser?.pendingPenalty ?? false;
  const isMine      = isGuia && !!currentUser && turno.guia?.usuario?.id === currentUser.id;
  const canClaim    =
    isGuia &&
    assignmentMode === "MANUAL_RECLAMO" &&
    guiaDisponible &&
    !guiaPenalizado &&
    turno.status === "AVAILABLE" &&
    !turno.guiaId;
  const canCheckIn  = isMine && turno.status === "ASSIGNED";
  const canCheckOut = isMine && turno.status === "IN_PROGRESS";
  const canUnassign = isSupervisor && (turno.status === "ASSIGNED" || turno.status === "IN_PROGRESS");
  const canNoShow   = isSupervisor && (turno.status === "ASSIGNED" || turno.status === "IN_PROGRESS");
  const canCancel   = isSupervisor && !["CANCELED","COMPLETED","NO_SHOW"].includes(turno.status);

  const isBusy = claim.isPending || checkIn.isPending || checkOut.isPending || cancel.isPending || unassign.isPending || noShow.isPending;
  const hasActions = canClaim || canCheckIn || canCheckOut || canUnassign || canNoShow || canCancel;

  const cfg = STATUS_CFG[turno.status];
  const isLive = turno.status === "IN_PROGRESS";

  const guiaName = [turno.guia?.usuario?.nombres, turno.guia?.usuario?.apellidos].filter(Boolean).join(" ")
    || turno.guia?.usuario?.email
    || (turno.guiaId ? "Asignado" : "Sin asignar");

  const shipCode = turno.atencion?.recalada?.codigoRecalada
    ?? (turno.atencion ? `#${turno.atencion.recaladaId}` : "—");

  function runAction<T>(fn: () => Promise<T>, successMsg: string, fallbackErr: string) {
    setActionError(null);
    setActionSuccess(null);
    return fn()
      .then(() => setActionSuccess(successMsg))
      .catch((err: unknown) => setActionError(err instanceof Error ? err.message : fallbackErr));
  }

  async function handleCancel() {
    if (cancelReason.trim().length < 3) {
      setActionError("Debes indicar un motivo (mín. 3 caracteres).");
      return;
    }
    await runAction(
      () => cancel.mutateAsync({ id: turnoId!, cancelReason: cancelReason.trim() }),
      "Turno cancelado correctamente.",
      "No pude cancelar el turno"
    );
    setShowCancel(false);
    setCancelReason("");
  }

  return (
    <IonPage>
      <IonContent scrollY={true}>
        <div style={{ minHeight: "100vh", background: C.bg, paddingBottom: "1.5rem" }}>

          {/* ── Hero ── */}
          <TurnoHero
            turno={turno}
            cfg={cfg}
            isLive={isLive}
            shipCode={shipCode}
            onBack={() => history.goBack()}
          />

          <div style={{ maxWidth: 480, margin: "0 auto", padding: "1.25rem 1.25rem 0" }}>

            {/* ── Alert banners ── */}
            {actionError && (
              <div className="animate-fade-up" style={{
                marginBottom: "1rem",
                borderRadius: 14, padding: "12px 14px",
                background: C.dangerFaint, border: `1px solid ${C.dangerBorder}`,
                display: "flex", alignItems: "flex-start", gap: 8,
              }}>
                <span style={{ color: C.danger, flexShrink: 0, marginTop: 1 }}>{Ico.warning()}</span>
                <span style={{ fontSize: "0.8125rem", color: C.danger, fontWeight: 500 }}>{actionError}</span>
              </div>
            )}
            {actionSuccess && (
              <div className="animate-fade-up" style={{
                marginBottom: "1rem",
                borderRadius: 14, padding: "12px 14px",
                background: C.tealFaint, border: `1px solid ${C.tealBorder}`,
                display: "flex", alignItems: "flex-start", gap: 8,
              }}>
                <span style={{ color: C.teal, flexShrink: 0, marginTop: 1 }}>{Ico.check()}</span>
                <span style={{ fontSize: "0.8125rem", color: C.teal, fontWeight: 500 }}>{actionSuccess}</span>
              </div>
            )}

            {/* ── Timeline card ── */}
            <div className="animate-fade-up" style={{ animationDelay: "40ms", animationFillMode: "backwards" }}>
              <TimelineCard turno={turno} />
            </div>

            {/* ── Info card ── */}
            <div className="animate-fade-up" style={{ animationDelay: "100ms", animationFillMode: "backwards", marginTop: "1rem" }}>
              <InfoCard turno={turno} guiaName={guiaName} shipCode={shipCode} />
            </div>

            {/* ── Observations / cancel reason ── */}
            {(turno.observaciones || turno.cancelReason) && (
              <div className="animate-fade-up" style={{ animationDelay: "160ms", animationFillMode: "backwards", marginTop: "1rem" }}>
                <NotesCard turno={turno} />
              </div>
            )}

            {/* ── Cancel form inline ── */}
            {showCancel && (
              <div className="animate-fade-up" style={{ animationDelay: "0ms", animationFillMode: "backwards", marginTop: "1rem" }}>
                <CancelForm
                  value={cancelReason}
                  onChange={setCancelReason}
                  isLoading={cancel.isPending}
                  onConfirm={() => void handleCancel()}
                  onCancel={() => { setShowCancel(false); setCancelReason(""); setActionError(null); }}
                />
              </div>
            )}

            {/* ── Acciones inline ── */}
            {!showCancel && hasActions && (
              <div className="animate-fade-up" style={{ marginTop: "1rem" }}>
                <ActionBar
                  canClaim={canClaim}
                  canCheckIn={canCheckIn}
                  canCheckOut={canCheckOut}
                  canUnassign={canUnassign}
                  canNoShow={canNoShow}
                  canCancel={canCancel}
                  isBusy={isBusy}
                  isPendingClaim={claim.isPending}
                  isPendingCheckIn={checkIn.isPending}
                  isPendingCheckOut={checkOut.isPending}
                  isPendingUnassign={unassign.isPending}
                  isPendingNoShow={noShow.isPending}
                  onClaim={() => void runAction(() => claim.mutateAsync(turnoId!), "Turno tomado correctamente.", "No pude tomar el turno")}
                  onCheckIn={() => void runAction(() => checkIn.mutateAsync(turnoId!), "Check-in registrado.", "No pude hacer check-in")}
                  onCheckOut={() => void runAction(() => checkOut.mutateAsync(turnoId!), "Check-out registrado.", "No pude hacer check-out")}
                  onUnassign={() => void runAction(() => unassign.mutateAsync({ id: turnoId! }), "Turno desasignado.", "No pude desasignar el turno")}
                  onNoShow={() => void runAction(() => noShow.mutateAsync({ id: turnoId! }), "Marcado como no-show.", "No pude marcar no-show")}
                  onCancelOpen={() => setShowCancel(true)}
                />
              </div>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

/* ─────────────────────────────────────────────
   TURNO HERO
───────────────────────────────────────────── */
const TurnoHero: React.FC<{
  turno: TurnoItem; cfg: StatusCfg; isLive: boolean; shipCode: string; onBack: () => void;
}> = ({ turno, cfg, isLive, shipCode, onBack }) => (
  <div style={{
    background: "var(--color-bg-elevated)",
    borderBottom: "1px solid var(--color-glass-medium)",
  }}>
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "1.5rem 1.25rem" }}>

      {/* Back button + breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.25rem" }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 34, height: 34, borderRadius: 11,
            background: "var(--color-glass-subtle)", border: "1px solid var(--color-glass-medium)",
            color: "var(--color-fg-primary)", cursor: "pointer",
            flexShrink: 0,
          }}
        >
          {Ico.back()}
        </button>
        <span style={{ fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: C.fgMuted }}>Turnos</span>
      </div>

      {/* Status badge row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          borderRadius: 9999, padding: "4px 11px",
          background: cfg.faint, border: `1px solid ${cfg.border}`,
        }}>
          {isLive && <span className="live-pulse-dot" style={{ background: cfg.color }} />}
          <span style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: cfg.color }}>
            {cfg.label}
          </span>
        </span>
      </div>

      {/* Turno number */}
      <p style={{
        fontFamily: "monospace",
        fontSize: "clamp(2.8rem, 12vw, 4rem)",
        fontWeight: 900,
        letterSpacing: "-0.05em",
        lineHeight: 1,
        color: cfg.color,
      }}>
        #{pad(turno.numero)}
      </p>

      {/* Ship + atencion */}
      <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: cfg.color, opacity: 0.7 }}>{Ico.ship()}</span>
        <div>
          <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--color-fg-primary)" }}>{shipCode}</p>
          <p style={{ fontSize: "0.6875rem", color: "var(--color-fg-muted)", marginTop: 2 }}>Atención #{turno.atencionId}</p>
        </div>
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   TIMELINE CARD
───────────────────────────────────────────── */
const TimelineCard: React.FC<{ turno: TurnoItem }> = ({ turno }) => {
  const steps: { label: string; time: string | null | undefined; color: string; done: boolean }[] = [
    { label: "Inicio",    time: turno.fechaInicio,  color: C.violet, done: true },
    { label: "Check-in",  time: turno.checkInAt,    color: C.amber,  done: !!turno.checkInAt },
    { label: "Check-out", time: turno.checkOutAt,   color: C.teal,   done: !!turno.checkOutAt },
    { label: "Fin",       time: turno.fechaFin,     color: C.cyan,   done: turno.status === "COMPLETED" },
  ];

  return (
    <div style={{
      borderRadius: 20,
      background: C.surface,
      border: "1px solid var(--color-glass-medium)",
      padding: "1.125rem 1.25rem",
    }}>
      <SectionLabel title="Cronología" color={C.violet} />

      <div style={{ marginTop: "1rem", position: "relative" }}>
        {/* Connector line */}
        <div style={{
          position: "absolute", left: 15, top: 16, bottom: 16,
          width: 2, background: "var(--color-glass-medium)", borderRadius: 1,
        }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {steps.map((step, i) => (
            <div key={step.label} style={{ display: "flex", alignItems: "flex-start", gap: 14, position: "relative", paddingBottom: i < steps.length - 1 ? 16 : 0 }}>
              {/* Dot */}
              <div style={{
                width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                background: step.done ? `${step.color}1A` : "var(--color-glass-soft)",
                border: `2px solid ${step.done ? step.color : "var(--color-glass-medium)"}`,
                boxShadow: step.done ? `0 0 12px ${step.color}55` : "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative", zIndex: 1,
              }}>
                {step.done
                  ? <span style={{ color: step.color }}>{Ico.check(12)}</span>
                  : <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-fg-disabled)" }} />
                }
              </div>

              {/* Label + time */}
              <div style={{ paddingTop: 5, flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: step.done ? "var(--color-fg-primary)" : "var(--color-fg-muted)" }}>
                  {step.label}
                </p>
                <p style={{ fontSize: "0.72rem", color: step.done ? step.color : "var(--color-fg-muted)", marginTop: 2, fontWeight: step.done ? 600 : 400 }}>
                  {step.time ? shortDt(step.time) : "Pendiente"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   INFO CARD
───────────────────────────────────────────── */
const InfoCard: React.FC<{ turno: TurnoItem; guiaName: string; shipCode: string }> = ({ turno, guiaName, shipCode }) => {
  const rows: { icon: React.ReactElement; label: string; value: string; color?: string }[] = [
    { icon: Ico.hash(),  label: "Número",    value: `#${turno.numero}`,         color: C.violet },
    { icon: Ico.ship(),  label: "Recalada",  value: shipCode },
    { icon: Ico.user(),  label: "Guía",      value: guiaName },
    { icon: Ico.clock(), label: "Inicio",    value: shortDt(turno.fechaInicio) },
    { icon: Ico.clock(), label: "Fin",       value: shortDt(turno.fechaFin) },
  ];

  return (
    <div style={{
      borderRadius: 20,
      background: C.surface,
      border: "1px solid var(--color-glass-medium)",
      padding: "1.125rem 1.25rem",
    }}>
      <SectionLabel title="Detalle del turno" color={C.amber} />

      <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: 2 }}>
        {rows.map((row) => (
          <div key={row.label} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", borderRadius: 12,
            background: "var(--color-glass-subtle)",
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9, flexShrink: 0,
              background: "var(--color-primary-glow)", border: "1px solid var(--color-primary-glow)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: C.violet,
            }}>
              {row.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: C.fgMuted }}>{row.label}</p>
              <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: row.color ?? C.fgPrimary, marginTop: 1 }} className="truncate">{row.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   NOTES CARD
───────────────────────────────────────────── */
const NotesCard: React.FC<{ turno: TurnoItem }> = ({ turno }) => (
  <div style={{
    borderRadius: 20,
    background: C.surface,
    border: "1px solid var(--color-glass-medium)",
    padding: "1.125rem 1.25rem",
  }}>
    <SectionLabel title="Notas" color={C.cyan} />

    <div style={{ marginTop: "0.875rem", display: "flex", flexDirection: "column", gap: 8 }}>
      {turno.observaciones && (
        <div style={{
          borderRadius: 12, padding: "10px 12px",
          background: C.cyanFaint, border: `1px solid ${C.cyanBorder}`,
        }}>
          <p style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.cyan, marginBottom: 5 }}>Observaciones</p>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-fg-secondary)", lineHeight: 1.55 }}>{turno.observaciones}</p>
        </div>
      )}
      {turno.cancelReason && (
        <div style={{
          borderRadius: 12, padding: "10px 12px",
          background: C.dangerFaint, border: `1px solid ${C.dangerBorder}`,
        }}>
          <p style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: C.danger, marginBottom: 5 }}>Motivo de cancelación</p>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-fg-secondary)", lineHeight: 1.55 }}>{turno.cancelReason}</p>
        </div>
      )}
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   CANCEL FORM
───────────────────────────────────────────── */
const CancelForm: React.FC<{
  value: string; onChange: (v: string) => void;
  isLoading: boolean; onConfirm: () => void; onCancel: () => void;
}> = ({ value, onChange, isLoading, onConfirm, onCancel }) => (
  <div style={{
    borderRadius: 20,
    background: "var(--color-bg-elevated)",
    border: `1px solid ${C.dangerBorder}`,
    borderTop: `2px solid ${C.danger}`,
    padding: "1.25rem",
    boxShadow: `0 12px 32px var(--color-danger-soft)`,
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }}>
      <span style={{ color: C.danger }}>{Ico.trash()}</span>
      <p style={{ fontSize: "0.875rem", fontWeight: 800, color: C.danger }}>Cancelar turno</p>
    </div>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      placeholder="Motivo de cancelación (mínimo 3 caracteres)…"
      maxLength={500}
      style={{
        width: "100%", resize: "none",
        borderRadius: 14, padding: "12px 14px",
        background: "var(--color-glass-soft)",
        border: `1px solid ${C.dangerBorder}`,
        color: "var(--color-fg-primary)",
        fontSize: "0.875rem", lineHeight: 1.55,
        outline: "none",
        boxSizing: "border-box",
      }}
    />
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
      <ActionBtn
        label="Confirmar"
        color={C.danger}
        bg={C.dangerFaint}
        border={C.dangerBorder}
        glow="var(--color-danger-glow)"
        isLoading={isLoading}
        onClick={onConfirm}
        icon={Ico.trash()}
      />
      <ActionBtn
        label="Volver"
        color="var(--color-fg-secondary)"
        bg="var(--color-glass-soft)"
        border="var(--color-glass-medium)"
        glow="transparent"
        disabled={isLoading}
        onClick={onCancel}
      />
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   ACTION BAR (STICKY)
───────────────────────────────────────────── */
const ActionBar: React.FC<{
  canClaim: boolean; canCheckIn: boolean; canCheckOut: boolean;
  canUnassign: boolean; canNoShow: boolean; canCancel: boolean;
  isBusy: boolean;
  isPendingClaim: boolean; isPendingCheckIn: boolean; isPendingCheckOut: boolean;
  isPendingUnassign: boolean; isPendingNoShow: boolean;
  onClaim: () => void; onCheckIn: () => void; onCheckOut: () => void;
  onUnassign: () => void; onNoShow: () => void; onCancelOpen: () => void;
}> = (p) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {p.canClaim && (
        <ActionBtn
          label="Tomar turno"
          color="white"
          bg="var(--color-primary)"
          border="var(--color-primary)"
          glow={C.violetGlow}
          isLoading={p.isPendingClaim}
          disabled={p.isBusy}
          onClick={p.onClaim}
          icon={Ico.zap()}
          solid
        />
      )}
      {p.canCheckIn && (
        <ActionBtn
          label="Registrar Check-in"
          color="white"
          bg="var(--color-accent)"
          border="var(--color-accent)"
          glow={C.amberGlow}
          isLoading={p.isPendingCheckIn}
          disabled={p.isBusy}
          onClick={p.onCheckIn}
          icon={Ico.check()}
          solid
        />
      )}
      {p.canCheckOut && (
        <ActionBtn
          label="Registrar Check-out"
          color="white"
          bg="var(--color-success)"
          border="var(--color-success)"
          glow="var(--color-success-soft)"
          isLoading={p.isPendingCheckOut}
          disabled={p.isBusy}
          onClick={p.onCheckOut}
          icon={Ico.checkOut()}
          solid
        />
      )}
      {(p.canUnassign || p.canNoShow || p.canCancel) && (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${[p.canUnassign, p.canNoShow, p.canCancel].filter(Boolean).length}, 1fr)`, gap: 8 }}>
          {p.canUnassign && (
            <ActionBtn
              label="Desasignar"
              color={C.fgSecondary}
              bg="var(--color-glass-soft)"
              border="var(--color-glass-medium)"
              glow="transparent"
              isLoading={p.isPendingUnassign}
              disabled={p.isBusy}
              onClick={p.onUnassign}
              icon={Ico.unassign()}
            />
          )}
          {p.canNoShow && (
            <ActionBtn
              label="No-show"
              color={C.fgSecondary}
              bg="var(--color-glass-soft)"
              border="var(--color-glass-medium)"
              glow="transparent"
              isLoading={p.isPendingNoShow}
              disabled={p.isBusy}
              onClick={p.onNoShow}
              icon={Ico.noShow()}
            />
          )}
          {p.canCancel && (
            <ActionBtn
              label="Cancelar"
              color={C.danger}
              bg={C.dangerFaint}
              border={C.dangerBorder}
              glow="transparent"
              disabled={p.isBusy}
              onClick={p.onCancelOpen}
              icon={Ico.trash()}
            />
          )}
        </div>
      )}
  </div>
);

/* ─────────────────────────────────────────────
   ATOMS
───────────────────────────────────────────── */
const SectionLabel: React.FC<{ title: string; color: string }> = ({ title, color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <div style={{ width: 3, height: 13, borderRadius: 2, background: color, opacity: 0.9 }} />
    <span style={{ fontSize: "0.565rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color }}>{title}</span>
    <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${color}30, transparent)` }} />
  </div>
);

const ActionBtn: React.FC<{
  label: string;
  color: string;
  bg: string;
  border: string;
  glow: string;
  isLoading?: boolean;
  disabled?: boolean;
  onClick: () => void;
  icon?: React.ReactElement;
  solid?: boolean;
}> = ({ label, color, bg, border, glow, isLoading, disabled, onClick, icon, solid }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled || isLoading}
    className="transition-all active:scale-[0.97]"
    style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      padding: solid ? "15px 20px" : "12px 16px",
      borderRadius: solid ? 18 : 14,
      background: (disabled || isLoading) && !solid ? "var(--color-glass-subtle)" : bg,
      border: `1px solid ${(disabled || isLoading) ? "var(--color-glass-medium)" : border}`,
      boxShadow: "none",
      color: (disabled || isLoading) && !solid ? "var(--color-fg-disabled)" : color,
      fontSize: "0.875rem", fontWeight: 700,
      cursor: (disabled || isLoading) ? "not-allowed" : "pointer",
      width: "100%",
    }}
  >
    {isLoading
      ? <span className="loading-spinner" style={{ borderTopColor: color }} />
      : icon && <span style={{ opacity: 0.9, display: "flex", flexShrink: 0 }}>{icon}</span>
    }
    <span>{isLoading ? "Procesando…" : label}</span>
  </button>
);

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function pad(n: number): string { return String(n).padStart(3, "0"); }

function shortDt(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-CO", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

void formatTurnoDate;
void getTurnoLabel;

export default TurnoDetailPage;
