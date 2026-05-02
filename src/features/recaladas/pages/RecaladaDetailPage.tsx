import { IonContent, IonPage } from "@ionic/react";
import { useMemo, useState } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { useSessionStore } from "../../../core/auth/sessionStore";
import ErrorState from "../../../ui/components/ErrorState";
import LoadingScreen from "../../../ui/components/LoadingScreen";
import { useArriveRecalada } from "../hooks/useArriveRecalada";
import { useCancelRecalada } from "../hooks/useCancelRecalada";
import { useDeleteRecalada } from "../hooks/useDeleteRecalada";
import { useDepartRecalada } from "../hooks/useDepartRecalada";
import { useRecalada } from "../hooks/useRecalada";
import { useRecaladaAtenciones } from "../hooks/useRecaladaAtenciones";
import type { RecaladaAtencionItem, RecaladaItem, RecaladaOperationalStatus } from "../types/recaladas.types";

/* ─────────────────────────────────────────────
   PALETTE
───────────────────────────────────────────── */
const C = {
  cyan:         "var(--color-info)",
  cyanFaint:    "rgba(56,189,248,0.10)",
  cyanBorder:   "rgba(56,189,248,0.26)",
  cyanGlow:     "rgba(56,189,248,0.42)",
  amber:        "var(--color-accent)",
  amberFaint:   "var(--color-accent-glow)",
  amberBorder:  "var(--color-accent-glow)",
  amberGlow:    "var(--color-accent-glow)",
  teal:         "var(--color-success)",
  tealFaint:    "var(--color-success-soft)",
  tealBorder:   "var(--color-success-soft)",
  tealGlow:     "var(--color-success-soft)",
  danger:       "var(--color-danger)",
  dangerFaint:  "var(--color-danger-soft)",
  dangerBorder: "rgba(244,63,94,0.26)",
  dangerGlow:   "rgba(244,63,94,0.32)",
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

type StatusCfg = { color: string; faint: string; border: string; glow: string; label: string };
const STATUS_CFG: Record<RecaladaOperationalStatus, StatusCfg> = {
  SCHEDULED: { color: C.cyan,   faint: C.cyanFaint,   border: C.cyanBorder,   glow: C.cyanGlow,   label: "Programada" },
  ARRIVED:   { color: C.amber,  faint: C.amberFaint,  border: C.amberBorder,  glow: C.amberGlow,  label: "Llegada" },
  DEPARTED:  { color: C.teal,   faint: C.tealFaint,   border: C.tealBorder,   glow: C.tealGlow,   label: "Partida" },
  CANCELED:  { color: C.danger, faint: C.dangerFaint, border: C.dangerBorder, glow: C.dangerGlow, label: "Cancelada" },
};

/* ─────────────────────────────────────────────
   ICONS
───────────────────────────────────────────── */
const Ico = {
  back:    (s = 15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>,
  ship:    (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20a2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1" /><path d="M4 18l-1-5h18l-2 5M12 2v3M8 7h8M6 11V8a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v3" /></svg>,
  anchor:  (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="3" /><line x1="12" y1="8" x2="12" y2="22" /><path d="M5 15H2a10 10 0 0 0 20 0h-3" /></svg>,
  globe:   (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>,
  clock:   (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  user:    (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  hash:    (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" /></svg>,
  terminal:(s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></svg>,
  users:   (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  check:   (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  arrive:  (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>,
  depart:  (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>,
  edit:    (s = 15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
  trash:   (s = 15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>,
  cancel:  (s = 15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>,
  plus:    (s = 15) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  chevron: (s = 13) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>,
  warning: (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
};

interface RouteParams { id: string; }

const RecaladaDetailPage: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const { id: paramId } = useParams<RouteParams>();
  const user = useSessionStore((s) => s.user);

  // useParams() can be stale in Ionic's IonRouterOutlet — fall back to pathname parsing
  const id = paramId || location.pathname.match(/\/recaladas\/(\d+)/)?.[1];

  // null = present but not a valid number; undefined = not on a matching route yet
  const recaladaId = useMemo(() => {
    if (!id) return undefined;
    const n = Number(id);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [id]);

  const isSupervisor = user?.role === "SUPERVISOR" || user?.role === "SUPER_ADMIN";
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const recaladaQuery   = useRecalada(recaladaId ?? undefined);
  const atencionesQuery = useRecaladaAtenciones(recaladaId ?? undefined);
  const arrive          = useArriveRecalada();
  const depart          = useDepartRecalada();
  const cancel          = useCancelRecalada();
  const deleteRec       = useDeleteRecalada();

  const [actionError,   setActionError]   = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [showCancel,    setShowCancel]    = useState(false);
  const [cancelReason,  setCancelReason]  = useState("");

  const recalada = recaladaQuery.data;

  /* ── Guards ── */
  if (recaladaId === null) return <CenteredError title="ID inválido" message="Identificador no válido." onRetry={() => history.push("/recaladas")} retryLabel="Volver" />;
  if (recaladaId === undefined) return null;
  if (recaladaQuery.isLoading && !recalada) return <LoadingScreen message="Cargando recalada…" />;
  if (recaladaQuery.error && !recalada) return <CenteredError title="Error" message={recaladaQuery.error instanceof Error ? recaladaQuery.error.message : "Problema inesperado."} onRetry={() => void recaladaQuery.refetch()} />;
  if (!recalada) return null;

  const opStatus = recalada.operationalStatus;
  const cfg      = STATUS_CFG[opStatus];
  const isLive   = opStatus === "ARRIVED";

  const canEdit    = isSupervisor && (opStatus === "SCHEDULED" || opStatus === "ARRIVED");
  const canArrive  = isSupervisor && opStatus === "SCHEDULED";
  const canDepart  = isSupervisor && opStatus === "ARRIVED";
  const canCancel  = isSupervisor && opStatus !== "DEPARTED" && opStatus !== "CANCELED" && (opStatus === "SCHEDULED" || isSuperAdmin);
  const canDelete  = isSupervisor && opStatus === "SCHEDULED";
  const isBusy     = arrive.isPending || depart.isPending || cancel.isPending || deleteRec.isPending;
  const hasActions = canArrive || canDepart || canEdit || canCancel || canDelete;

  const supervisorName = [recalada.supervisor?.usuario?.nombres, recalada.supervisor?.usuario?.apellidos].filter(Boolean).join(" ") || recalada.supervisor?.usuario?.email || "—";
  const atenciones     = atencionesQuery.data ?? [];
  const canAddAtencion = isSupervisor && opStatus !== "CANCELED" && opStatus !== "DEPARTED";

  async function runAction<T>(fn: () => Promise<T>, successMsg: string, fallback: string) {
    setActionError(null); setActionSuccess(null);
    try { await fn(); setActionSuccess(successMsg); }
    catch (err) { setActionError(err instanceof Error ? err.message : fallback); }
  }

  async function handleArrive() {
    if (!confirm(`¿Confirmas la llegada de ${recalada!.buque.nombre}?`)) return;
    await runAction(() => arrive.mutateAsync({ id: recaladaId! }), "Llegada registrada.", "No pude registrar la llegada");
  }

  async function handleDepart() {
    if (!confirm(`¿Confirmas la salida de ${recalada!.buque.nombre}?`)) return;
    await runAction(() => depart.mutateAsync({ id: recaladaId! }), "Salida registrada.", "No pude registrar la salida");
  }

  async function handleCancel() {
    await runAction(
      () => cancel.mutateAsync({ id: recaladaId!, reason: cancelReason.trim() || undefined }),
      "Recalada cancelada.", "No pude cancelar la recalada"
    );
    setShowCancel(false); setCancelReason("");
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminar permanentemente ${recalada!.codigoRecalada}? Esta acción no se puede deshacer.`)) return;
    await runAction(async () => { await deleteRec.mutateAsync(recaladaId!); history.replace("/recaladas"); }, "Eliminada.", "No pude eliminar la recalada");
  }

  return (
    <IonPage>
      <IonContent scrollY={true}>
        <div style={{ minHeight: "100vh", background: C.bg, paddingBottom: "1.5rem" }}>

          {/* ── Hero ── */}
          <div className="relative overflow-hidden" style={{
            background: "var(--gradient-hero-main) 100%)",
            borderBottom: `1px solid ${cfg.border}`,
          }}>
            <div style={{ position: "absolute", top: -80, left: -60, width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, ${cfg.faint} 0%, transparent 65%)`, filter: "blur(14px)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -40, right: -30, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, var(--color-primary-glow) 0%, transparent 65%)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(56,189,248,0.04) 1px, transparent 1px)", backgroundSize: "22px 22px", pointerEvents: "none" }} />

            <div style={{ position: "relative", maxWidth: 480, margin: "0 auto", padding: "1.5rem 1.25rem 1.5rem" }}>
              {/* Back */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.25rem" }}>
                <button type="button" onClick={() => history.goBack()} style={{ width: 34, height: 34, borderRadius: 11, background: "var(--color-glass-medium)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  {Ico.back()}
                </button>
                <span style={{ fontSize: "0.555rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.22em", color: "rgba(255,255,255,0.32)" }}>Recaladas</span>
              </div>

              {/* Status badge */}
              <div style={{ marginBottom: "0.875rem" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 9999, padding: "4px 11px", background: cfg.faint, border: `1px solid ${cfg.border}` }}>
                  {isLive && <span className="live-pulse-dot" style={{ background: cfg.color }} />}
                  <span style={{ fontSize: "0.575rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.14em", color: cfg.color }}>{cfg.label}</span>
                </span>
              </div>

              {/* Ship name — hero element */}
              <h1 style={{ fontSize: "clamp(1.6rem, 7vw, 2.4rem)", fontWeight: 900, color: C.fg, letterSpacing: "-0.025em", lineHeight: 1.05 }}>
                {recalada.buque.nombre}
              </h1>

              {/* Code + country */}
              <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, borderRadius: 9, padding: "5px 10px", background: "var(--color-glass-soft)", border: "1px solid var(--color-glass-medium)" }}>
                  <span style={{ color: cfg.color }}>{Ico.hash()}</span>
                  <span style={{ fontFamily: "monospace", fontSize: "0.78rem", fontWeight: 700, color: cfg.color }}>{recalada.codigoRecalada}</span>
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, borderRadius: 9, padding: "5px 10px", background: "var(--color-glass-soft)", border: "1px solid var(--color-glass-medium)" }}>
                  <span style={{ color: C.fgMuted }}>{Ico.globe()}</span>
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, color: C.fgSec }}>{recalada.paisOrigen.codigo} · {recalada.paisOrigen.nombre}</span>
                </span>
              </div>

              <div style={{ marginTop: "1.25rem", height: 1, background: `linear-gradient(90deg, ${cfg.border}, transparent 70%)` }} />
            </div>
          </div>

          <div style={{ maxWidth: 480, margin: "0 auto", padding: "1.25rem 1.25rem 0" }}>

            {/* ── Alert banners ── */}
            {actionError && (
              <div className="animate-fade-up" style={{ marginBottom: "1rem", borderRadius: 14, padding: "12px 14px", background: C.dangerFaint, border: `1px solid ${C.dangerBorder}`, display: "flex", gap: 8 }}>
                <span style={{ color: C.danger, flexShrink: 0 }}>{Ico.warning()}</span>
                <span style={{ fontSize: "0.8125rem", color: C.danger, fontWeight: 500 }}>{actionError}</span>
              </div>
            )}
            {actionSuccess && (
              <div className="animate-fade-up" style={{ marginBottom: "1rem", borderRadius: 14, padding: "12px 14px", background: C.tealFaint, border: `1px solid ${C.tealBorder}`, display: "flex", gap: 8 }}>
                <span style={{ color: C.teal, flexShrink: 0 }}>{Ico.check()}</span>
                <span style={{ fontSize: "0.8125rem", color: C.teal, fontWeight: 500 }}>{actionSuccess}</span>
              </div>
            )}

            {/* ── Timeline ── */}
            <div className="animate-fade-up" style={{ animationDelay: "40ms", animationFillMode: "backwards" }}>
              <OperationalTimeline recalada={recalada} />
            </div>

            {/* ── Info ── */}
            <div className="animate-fade-up" style={{ animationDelay: "100ms", animationFillMode: "backwards", marginTop: "1rem" }}>
              <InfoCard recalada={recalada} supervisorName={supervisorName} />
            </div>

            {/* ── Cancel reason ── */}
            {recalada.cancelReason && (
              <div className="animate-fade-up" style={{ animationDelay: "140ms", animationFillMode: "backwards", marginTop: "1rem" }}>
                <div style={{ borderRadius: 16, padding: "12px 14px", background: C.dangerFaint, border: `1px solid ${C.dangerBorder}` }}>
                  <p style={{ fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: C.danger, marginBottom: 5 }}>Motivo de cancelación</p>
                  <p style={{ fontSize: "0.8125rem", color: C.fgSec, lineHeight: 1.55 }}>{recalada.cancelReason}</p>
                </div>
              </div>
            )}

            {/* ── Observations ── */}
            {recalada.observaciones && (
              <div className="animate-fade-up" style={{ animationDelay: "160ms", animationFillMode: "backwards", marginTop: "1rem" }}>
                <div style={{ borderRadius: 16, padding: "12px 14px", background: C.violetFaint, border: `1px solid ${C.violetBorder}` }}>
                  <p style={{ fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: C.violet, marginBottom: 5 }}>Observaciones</p>
                  <p style={{ fontSize: "0.8125rem", color: C.fgSec, lineHeight: 1.55 }}>{recalada.observaciones}</p>
                </div>
              </div>
            )}

            {/* ── Atenciones ── */}
            <div className="animate-fade-up" style={{ animationDelay: "200ms", animationFillMode: "backwards", marginTop: "1rem" }}>
              <AtencionesCard
                atenciones={atenciones}
                isLoading={atencionesQuery.isLoading}
                canAdd={canAddAtencion}
                recaladaId={recaladaId!}
                onNavigate={(path) => history.push(path)}
              />
            </div>

            {/* ── Cancel form ── */}
            {showCancel && (
              <div className="animate-fade-up" style={{ marginTop: "1rem" }}>
                <div style={{ borderRadius: 20, background: "var(--color-bg-elevated)", border: `1px solid ${C.dangerBorder}`, borderTop: `2px solid ${C.danger}`, padding: "1.25rem", boxShadow: `0 12px 32px rgba(244,63,94,0.14)` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.875rem" }}>
                    <span style={{ color: C.danger }}>{Ico.cancel()}</span>
                    <p style={{ fontSize: "0.875rem", fontWeight: 800, color: C.danger }}>Cancelar recalada</p>
                  </div>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    rows={3} maxLength={500}
                    placeholder="Motivo de cancelación (opcional)…"
                    style={{ width: "100%", resize: "none", borderRadius: 13, padding: "11px 13px", background: "var(--color-glass-soft)", border: `1px solid ${C.dangerBorder}`, color: C.fg, fontSize: "0.875rem", lineHeight: 1.55, outline: "none", boxSizing: "border-box" }}
                  />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
                    <ActionBtn label="Confirmar" color={C.danger} bg={C.dangerFaint} border={C.dangerBorder} glow="transparent" isLoading={cancel.isPending} onClick={() => void handleCancel()} />
                    <ActionBtn label="Volver" color={C.fgSec} bg="var(--color-glass-soft)" border="rgba(255,255,255,0.1)" glow="transparent" disabled={cancel.isPending} onClick={() => { setShowCancel(false); setCancelReason(""); setActionError(null); }} />
                  </div>
                </div>
              </div>
            )}

            {/* ── Acciones inline ── */}
            {!showCancel && hasActions && (
              <div className="animate-fade-up" style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: 9 }}>
                {canArrive && (
                  <ActionBtn label="Marcar llegada" color="white" bg="linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent) 55%, var(--color-accent) 100%)" border="rgba(255,255,255,0.12)" glow={C.amberGlow} isLoading={arrive.isPending} disabled={isBusy} onClick={() => void handleArrive()} icon={Ico.arrive()} solid />
                )}
                {canDepart && (
                  <ActionBtn label="Marcar salida" color="white" bg="linear-gradient(135deg, var(--color-success) 0%, var(--color-success) 55%, var(--color-success) 100%)" border="rgba(255,255,255,0.12)" glow={C.tealGlow} isLoading={depart.isPending} disabled={isBusy} onClick={() => void handleDepart()} icon={Ico.depart()} solid />
                )}
                {(canEdit || canCancel || canDelete) && (
                  <div style={{ display: "grid", gridTemplateColumns: `repeat(${[canEdit, canCancel, canDelete].filter(Boolean).length}, 1fr)`, gap: 9 }}>
                    {canEdit && (
                      <ActionBtn label="Editar" color={C.violet} bg={C.violetFaint} border={C.violetBorder} glow="transparent" disabled={isBusy} onClick={() => history.push(`/recaladas/${recaladaId}/editar`)} icon={Ico.edit()} />
                    )}
                    {canCancel && (
                      <ActionBtn label="Cancelar" color={C.danger} bg={C.dangerFaint} border={C.dangerBorder} glow="transparent" disabled={isBusy} onClick={() => setShowCancel(true)} icon={Ico.cancel()} />
                    )}
                    {canDelete && (
                      <ActionBtn label="Eliminar" color={C.fgSec} bg="var(--color-glass-soft)" border="rgba(255,255,255,0.1)" glow="transparent" isLoading={deleteRec.isPending} disabled={isBusy} onClick={() => void handleDelete()} icon={Ico.trash()} />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

/* ─────────────────────────────────────────────
   OPERATIONAL TIMELINE
───────────────────────────────────────────── */
const OperationalTimeline: React.FC<{ recalada: RecaladaItem }> = ({ recalada }) => {
  const op = recalada.operationalStatus;
  const isCanceled = op === "CANCELED";

  const steps = [
    { label: "Programada",  time: recalada.fechaLlegada, color: C.cyan,  done: true,                                   sub: "Fecha estimada llegada" },
    { label: "Llegada",     time: recalada.arrivedAt,    color: C.amber, done: !!recalada.arrivedAt && !isCanceled,    sub: "Arribo confirmado" },
    { label: "Partida",     time: recalada.departedAt,   color: C.teal,  done: !!recalada.departedAt && !isCanceled,   sub: "Salida confirmada" },
  ];

  return (
    <div style={{ borderRadius: 20, background: C.surface, border: "1px solid var(--color-glass-medium)", padding: "1.125rem 1.25rem" }}>
      <SectionLabel title="Estado operativo" color={C.cyan} />

      {isCanceled && (
        <div style={{ marginTop: 10, borderRadius: 12, padding: "9px 12px", background: C.dangerFaint, border: `1px solid ${C.dangerBorder}`, fontSize: "0.75rem", color: C.danger, fontWeight: 600 }}>
          Esta recalada fue cancelada {recalada.canceledAt ? `el ${shortDt(recalada.canceledAt)}` : ""}
        </div>
      )}

      <div style={{ marginTop: "1rem", position: "relative" }}>
        <div style={{ position: "absolute", left: 14, top: 16, bottom: 16, width: 2, background: "var(--color-glass-soft)", borderRadius: 1 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {steps.map((step, i) => (
            <div key={step.label} style={{ display: "flex", alignItems: "flex-start", gap: 14, paddingBottom: i < steps.length - 1 ? 18 : 0 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                background: step.done ? `${step.color}1A` : "var(--color-glass-soft)",
                border: `2px solid ${step.done ? step.color : "rgba(255,255,255,0.1)"}`,
                boxShadow: step.done ? `0 0 14px ${step.color}55` : "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative", zIndex: 1,
              }}>
                {step.done
                  ? <span style={{ color: step.color }}>{Ico.check(11)}</span>
                  : <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.15)" }} />
                }
              </div>
              <div style={{ paddingTop: 4 }}>
                <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: step.done ? C.fg : C.fgMuted }}>{step.label}</p>
                <p style={{ fontSize: "0.68rem", color: step.done ? step.color : C.fgMuted, marginTop: 1, fontWeight: step.done ? 600 : 400 }}>
                  {step.time ? shortDt(step.time) : step.sub}
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
const InfoCard: React.FC<{ recalada: RecaladaItem; supervisorName: string }> = ({ recalada, supervisorName }) => {
  const rows = [
    { icon: Ico.hash(),      label: "Código",         value: recalada.codigoRecalada,             mono: true },
    { icon: Ico.terminal(),  label: "Terminal",        value: recalada.terminal ?? "—" },
    { icon: Ico.anchor(),    label: "Muelle",          value: recalada.muelle ?? "—" },
    { icon: Ico.users(),     label: "Pasajeros est.",  value: recalada.pasajerosEstimados != null ? String(recalada.pasajerosEstimados) : "—" },
    { icon: Ico.users(),     label: "Tripulación est.",value: recalada.tripulacionEstimada != null ? String(recalada.tripulacionEstimada) : "—" },
    { icon: Ico.user(),      label: "Supervisor",      value: supervisorName },
    { icon: Ico.hash(),      label: "Fuente",          value: recalada.fuente },
    { icon: Ico.clock(),     label: "Salida prog.",    value: shortDt(recalada.fechaSalida) },
  ];

  return (
    <div style={{ borderRadius: 20, background: C.surface, border: "1px solid var(--color-glass-medium)", padding: "1.125rem 1.25rem" }}>
      <SectionLabel title="Detalle operativo" color={C.amber} />
      <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {rows.map((row) => (
          <div key={row.label} style={{ borderRadius: 12, padding: "10px 11px", background: "rgba(255,255,255,0.025)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
              <span style={{ color: C.amber, opacity: 0.7 }}>{row.icon}</span>
              <p style={{ fontSize: "0.565rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: C.fgMuted }}>{row.label}</p>
            </div>
            <p className="truncate" style={{ fontSize: "0.8rem", fontWeight: 600, color: C.fg, fontFamily: row.mono ? "monospace" : undefined }}>{row.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   ATENCIONES CARD
───────────────────────────────────────────── */
const AtencionesCard: React.FC<{
  atenciones: RecaladaAtencionItem[];
  isLoading: boolean;
  canAdd: boolean;
  recaladaId: number;
  onNavigate: (path: string) => void;
}> = ({ atenciones, isLoading, canAdd, recaladaId, onNavigate }) => (
  <div style={{ borderRadius: 20, background: C.surface, border: "1px solid var(--color-glass-medium)", padding: "1.125rem 1.25rem" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: "0.875rem" }}>
      <SectionLabel title={`Atenciones (${atenciones.length})`} color={C.violet} />
      {canAdd && (
        <button
          type="button"
          onClick={() => onNavigate(`/atenciones/nueva?recaladaId=${recaladaId}`)}
          style={{
            display: "flex", alignItems: "center", gap: 4,
            borderRadius: 10, padding: "5px 10px",
            background: C.violetFaint, border: `1px solid ${C.violetBorder}`,
            color: C.violet, fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", flexShrink: 0,
          }}
        >
          {Ico.plus(12)} Nueva
        </button>
      )}
    </div>

    {isLoading ? (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[0, 1].map((i) => <div key={i} className="animate-pulse" style={{ height: 64, borderRadius: 14, background: "var(--color-glass-subtle)" }} />)}
      </div>
    ) : atenciones.length === 0 ? (
      <div style={{ padding: "1.5rem 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: C.violetFaint, border: `1px solid ${C.violetBorder}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.violet }}>
          {Ico.ship(20)}
        </div>
        <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: C.fg }}>Sin atenciones</p>
        <p style={{ fontSize: "0.72rem", color: C.fgMuted, textAlign: "center" }}>No hay atenciones asociadas aún.</p>
        {canAdd && (
          <button type="button" onClick={() => onNavigate(`/atenciones/nueva?recaladaId=${recaladaId}`)}
            style={{ marginTop: 4, borderRadius: 12, padding: "9px 18px", background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary) 100%)", border: "1px solid rgba(255,255,255,0.12)", color: "white", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", boxShadow: `0 6px 18px ${C.violetGlow}` }}>
            Crear atención
          </button>
        )}
      </div>
    ) : (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {atenciones.map((at) => {
          const ocupados = at.turnos.filter((t) => t.status !== "AVAILABLE" && t.status !== "CANCELED").length;
          const pct      = at.turnosTotal > 0 ? Math.round((ocupados / at.turnosTotal) * 100) : 0;
          const atOpCfg  = at.operationalStatus === "CANCELED" ? { color: C.danger, faint: C.dangerFaint, border: C.dangerBorder }
                         : at.operationalStatus === "COMPLETED" ? { color: C.teal, faint: C.tealFaint, border: C.tealBorder }
                         : { color: C.violet, faint: C.violetFaint, border: C.violetBorder };
          return (
            <button key={at.id} type="button" onClick={() => onNavigate(`/atenciones/${at.id}`)}
              className="w-full text-left transition-all active:scale-[0.98]"
              style={{ borderRadius: 15, padding: "11px 13px", background: "rgba(255,255,255,0.025)", border: `1px solid var(--color-glass-medium)`, borderLeft: `3px solid ${atOpCfg.color}`, display: "block" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: C.fg }}>Atención #{at.id}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  <span style={{ display: "inline-flex", borderRadius: 9999, padding: "2px 8px", background: atOpCfg.faint, border: `1px solid ${atOpCfg.border}`, fontSize: "0.565rem", fontWeight: 700, color: atOpCfg.color }}>{at.operationalStatus}</span>
                  <span style={{ color: "rgba(255,255,255,0.2)" }}>{Ico.chevron()}</span>
                </div>
              </div>
              <p style={{ fontSize: "0.65rem", color: C.fgMuted, marginBottom: 8 }}>{shortDt(at.fechaInicio)} → {shortDt(at.fechaFin)}</p>
              {/* Progress bar */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, height: 4, borderRadius: 3, background: "var(--color-glass-medium)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${atOpCfg.color}80, ${atOpCfg.color})`, borderRadius: 3, transition: "width 0.5s ease" }} />
                </div>
                <span style={{ fontSize: "0.625rem", fontWeight: 700, color: atOpCfg.color, flexShrink: 0 }}>{ocupados}/{at.turnosTotal}</span>
              </div>
            </button>
          );
        })}
      </div>
    )}
  </div>
);

/* ─────────────────────────────────────────────
   ATOMS
───────────────────────────────────────────── */
const SectionLabel: React.FC<{ title: string; color: string }> = ({ title, color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <div style={{ width: 3, height: 13, borderRadius: 2, background: color, opacity: 0.9, flexShrink: 0 }} />
    <span style={{ fontSize: "0.555rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color }}>{title}</span>
    <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${color}30, transparent)` }} />
  </div>
);

const ActionBtn: React.FC<{
  label: string; color: string; bg: string; border: string; glow: string;
  isLoading?: boolean; disabled?: boolean; onClick: () => void;
  icon?: React.ReactElement; solid?: boolean;
}> = ({ label, color, bg, border, glow, isLoading, disabled, onClick, icon, solid }) => (
  <button
    type="button" onClick={onClick}
    disabled={disabled || isLoading}
    className="transition-all active:scale-[0.97]"
    style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
      padding: solid ? "15px 20px" : "11px 14px",
      borderRadius: solid ? 18 : 13,
      background: (disabled || isLoading) && !solid ? "var(--color-glass-subtle)" : bg,
      border: `1px solid ${(disabled || isLoading) ? "var(--color-glass-medium)" : border}`,
      boxShadow: (disabled || isLoading) || !solid ? "none" : `0 8px 24px ${glow}, inset 0 1px 0 rgba(255,255,255,0.18)`,
      color: (disabled || isLoading) && !solid ? "rgba(255,255,255,0.25)" : color,
      fontSize: "0.875rem", fontWeight: 700,
      cursor: (disabled || isLoading) ? "not-allowed" : "pointer",
      width: "100%",
    }}
  >
    {isLoading
      ? <span className="loading-spinner" style={{ borderTopColor: color }} />
      : icon && <span style={{ display: "flex", flexShrink: 0 }}>{icon}</span>
    }
    <span>{isLoading ? "Procesando…" : label}</span>
  </button>
);

const CenteredError: React.FC<{ title: string; message: string; onRetry: () => void; retryLabel?: string }> = (p) => (
  <IonPage><IonContent><div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 1.25rem", background: "var(--color-bg-base)" }}><ErrorState {...p} /></div></IonContent></IonPage>
);

function shortDt(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default RecaladaDetailPage;
