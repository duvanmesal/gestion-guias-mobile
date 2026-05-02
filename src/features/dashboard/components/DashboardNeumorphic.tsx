import type { SessionUser } from "../../../core/auth/types";
import {
  EmptyStateCard,
  LastUpdatedRow,
  RoleBadge,
  StatusChip,
} from "../../../ui/components";
import type {
  AtencionDisponibleLite,
  DashboardMilestone,
  DashboardOverviewResponse,
  SupervisorOverview,
  TurnoLite,
} from "../types/dashboard.types";
import {
  formatMilestoneKind,
  formatShortDate,
  formatTime,
  formatTurnoStatus,
  getDisplayName,
  getGreetingByHour,
  pluralize,
} from "../utils/dashboardFormatters";

export interface DashboardNeumorphicProps {
  data?: DashboardOverviewResponse | null;
  user?: SessionUser | null;
  isRefreshing?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  onNavigate?: (path: string) => void;
}

/* ══════════════════════════════════════════════
   PALETTE — Abyssal Command
══════════════════════════════════════════════ */
const P = {
  /* Primary — Electric Violet */
  violet:       "var(--color-primary)",
  violetDark:   "var(--color-primary-dark)",
  violetLight:  "var(--color-primary-light)",
  violetGlow:   "var(--color-primary-glow)",
  violetFaint:  "var(--color-primary-soft)",
  violetBorder: "var(--color-border-glow)",
  /* Accent — Amber Gold */
  amber:        "var(--color-accent)",
  amberLight:   "var(--color-accent-hover)",
  amberGlow:    "var(--color-accent-glow)",
  amberFaint:   "var(--color-accent-soft)",
  amberBorder:  "var(--color-accent-border)",
  /* Teal Mint */
  teal:         "var(--color-success)",
  tealFaint:    "var(--color-success-soft)",
  tealBorder:   "var(--color-success-border)",
  /* Cyan Info */
  cyan:         "var(--color-info)",
  cyanFaint:    "var(--color-info-soft)",
  cyanBorder:   "var(--color-info-border)",
  /* Danger */
  danger:       "var(--color-danger)",
  dangerFaint:  "var(--color-danger-soft)",
  /* Surfaces */
  bg:           "var(--color-bg-base)",
  bgSurface:    "var(--color-bg-elevated)",
  /* Text */
  fgPrimary:    "var(--color-fg-primary)",
  fgSecondary:  "var(--color-fg-secondary)",
  fgMuted:      "var(--color-fg-muted)",
};

/* ── Tile tokens ── */
const TILE_COLOR  = { cyan: P.cyan,     amber: P.amber,     teal: P.teal,     violet: P.violet };
const TILE_BG     = { cyan: P.cyanFaint,amber: P.amberFaint,teal: P.tealFaint,violet: P.violetFaint };
const TILE_BORDER = { cyan: P.cyanBorder,amber:P.amberBorder,teal:P.tealBorder,violet:P.violetBorder };
const TILE_ICON_BG = {
  cyan:   "var(--color-info-soft)",
  amber:  "var(--color-accent-soft)",
  teal:   "var(--color-success-soft)",
  violet: "var(--color-primary-soft)",
};

const MILESTONE_COLOR: Record<string, string> = {
  RECALADA_ARRIVAL:   "var(--color-info)",
  ATENCION_START:     "var(--color-primary)",
  ATENCION_END:       "var(--color-accent)",
  RECALADA_DEPARTURE: "var(--color-fg-muted)",
};

/* ── New palette raw values for inline styles ── */
const RAW = {
  primary:     "var(--color-primary)",
  primaryDark: "var(--color-primary-dark)",
  primaryRgba: (a: number) => `var(--color-primary-glow)`,
  accent:      "var(--color-accent)",
  accentRgba:  (a: number) => `var(--color-accent-glow)`,
  info:        "var(--color-info)",
  success:     "var(--color-success)",
};

/* ══════════════════════════════════════════════
   ICONS
══════════════════════════════════════════════ */
const Ico = {
  ship:      (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20a2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1" /><path d="M4 18l-1-5h18l-2 5M12 2v3M8 7h8M6 11V8a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v3" /></svg>,
  list:      (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M12 11h4M12 16h4M8 11h.01M8 16h.01" /></svg>,
  users:     (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  activity:  (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
  arrowRight:(s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
  clock:     (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  ticket:    (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" /></svg>,
  anchor:    (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="3" /><line x1="12" y1="8" x2="12" y2="22" /><path d="M5 15H2a10 10 0 0 0 20 0h-3" /></svg>,
  play:      (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3" /></svg>,
  stop:      (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>,
  refresh:   (s = 14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg>,
  warning:   (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  zap:       (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
};

const IcoLg = {
  ship:     () => <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20a2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1" /><path d="M4 18l-1-5h18l-2 5M12 2v3M8 7h8M6 11V8a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v3" /></svg>,
  list:     () => <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M12 11h4M12 16h4M8 11h.01M8 16h.01" /></svg>,
  users:    () => <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  activity: () => <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
};

const TILE_ICONS_SM: Record<string, React.ReactElement> = {
  cyan:   <>{Ico.ship()}</>,
  amber:  <>{Ico.list()}</>,
  teal:   <>{Ico.users()}</>,
  violet: <>{Ico.activity()}</>,
};
const TILE_ICONS_LG: Record<string, React.ReactElement> = {
  cyan: <IcoLg.ship />, amber: <IcoLg.list />, teal: <IcoLg.users />, violet: <IcoLg.activity />,
};

function getMilestoneIcon(kind: string): React.ReactElement {
  const s = 10;
  switch (kind) {
    case "RECALADA_ARRIVAL":   return <>{Ico.anchor(s)}</>;
    case "ATENCION_START":     return <>{Ico.play(s)}</>;
    case "ATENCION_END":       return <>{Ico.stop(s)}</>;
    case "RECALADA_DEPARTURE": return <>{Ico.ship(s)}</>;
    default:                   return <>{Ico.clock(s)}</>;
  }
}

/* ══════════════════════════════════════════════
   ROOT
══════════════════════════════════════════════ */
const DashboardNeumorphic: React.FC<DashboardNeumorphicProps> = ({
  data, user, isRefreshing = false, errorMessage, onRetry, onNavigate,
}) => {
  const role         = data?.role ?? user?.role ?? "GUIA";
  const isSupervisor = role === "SUPERVISOR" || role === "SUPER_ADMIN";
  const displayName  = getDisplayName(user);
  const greeting     = getGreetingByHour();
  const dateLabel    = data?.dateContext.date ?? formatShortDate(data?.date ?? new Date().toISOString());
  const lastUpdatedAt= data?.generatedAt ?? data?.serverTime ?? null;
  const counts       = data?.supervisor?.counts;

  return (
    <div className="min-h-full" style={{ background: P.bg }}>
      {isRefreshing && <SyncBanner />}

      {isSupervisor ? (
        <SupervisorHero
          counts={counts}
          dateLabel={dateLabel}
          displayName={displayName}
          isRefreshing={isRefreshing}
          lastUpdatedAt={lastUpdatedAt}
          onNavigate={onNavigate}
          role={role}
          summary="Centro de comando operativo"
        />
      ) : (
        <GuideHero
          availableCount={data?.guia?.atencionesDisponibles.length ?? 0}
          dateLabel={dateLabel}
          displayName={displayName}
          greeting={greeting}
          onNavigate={onNavigate}
          role={role}
          turno={data?.guia?.activeTurno ?? data?.guia?.nextTurno ?? null}
        />
      )}

      <div className="mx-auto w-full max-w-[440px] px-4 pb-12 pt-5 flex flex-col gap-4">
        {errorMessage && (
          <FadeCard delay={0}>
            <Card className="p-5">
              <div className="flex items-start gap-3">
                <div style={{ color: P.danger, marginTop: 1, flexShrink: 0 }}>{Ico.warning()}</div>
                <div className="min-w-0">
                  <p className="text-sm font-bold" style={{ color: P.fgPrimary }}>No pude cargar el dashboard</p>
                  <p className="mt-1 text-xs" style={{ color: P.fgSecondary }}>{errorMessage}</p>
                </div>
              </div>
              {onRetry && <div className="mt-4"><VioletBtn onClick={onRetry}>Reintentar</VioletBtn></div>}
            </Card>
          </FadeCard>
        )}

        {isSupervisor ? (
          <SupervisorContent lastUpdatedAt={lastUpdatedAt} onNavigate={onNavigate} overview={data?.supervisor} />
        ) : (
          <GuideContent guia={data?.guia} lastUpdatedAt={lastUpdatedAt} onNavigate={onNavigate} />
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   SYNC BANNER
══════════════════════════════════════════════ */
const SyncBanner: React.FC = () => (
  <div
    className="flex items-center justify-center gap-2 animate-fade-in"
    style={{
      height: 36,
      background: `linear-gradient(90deg, ${RAW.primaryRgba(0.08)}, ${RAW.accentRgba(0.06)}, ${RAW.primaryRgba(0.08)})`,
      borderBottom: `1px solid ${RAW.primaryRgba(0.20)}`,
    }}
  >
    <div className="animate-spin" style={{ color: P.violet }}>{Ico.refresh()}</div>
    <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: P.violet, letterSpacing: "0.08em" }}>
      Actualizando datos…
    </span>
  </div>
);

/* ══════════════════════════════════════════════
   HERO SHARED ATOMS
══════════════════════════════════════════════ */
const HeroOrb: React.FC<{ top?: number; left?: number; right?: number; bottom?: number; size: number; color: string }> = ({
  top, left, right, bottom, size, color,
}) => (
  <div style={{
    position: "absolute", top, left, right, bottom,
    width: size, height: size,
    background: `radial-gradient(circle, ${color} 0%, transparent 65%)`,
    pointerEvents: "none",
  }} />
);

const HeroDotGrid: React.FC<{ color?: string }> = ({ color = "var(--color-primary-glow)" }) => (
  <div style={{
    position: "absolute", inset: 0,
    backgroundImage: `radial-gradient(circle, ${color} 1px, transparent 1px)`,
    backgroundSize: "22px 22px",
    pointerEvents: "none",
  }} />
);

const HeroWatermark: React.FC<{ color?: string }> = ({ color = "var(--color-primary)" }) => (
  <div style={{ position: "absolute", right: -10, bottom: -16, opacity: 0.05, color, pointerEvents: "none" }}>
    <svg width="160" height="160" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="3" /><line x1="12" y1="8" x2="12" y2="22" /><path d="M5 15H2a10 10 0 0 0 20 0h-3" />
    </svg>
  </div>
);

const LiveBadge: React.FC<{ color: string; label: string; bg: string; border: string }> = ({ color, label, bg, border }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5" style={{ background: bg, border: `1px solid ${border}` }}>
    <span className="live-pulse-dot" style={{ background: color }} />
    <span style={{ fontSize: "0.55rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.14em", color }}>{label}</span>
  </span>
);

const HeroAvatar: React.FC<{ name: string; gradient: string; shadow: string; border: string }> = ({ name, gradient, shadow, border }) => (
  <div style={{
    width: 56, height: 56, borderRadius: 20, flexShrink: 0,
    background: gradient,
    boxShadow: shadow,
    border: `2px solid ${border}`,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "1.35rem", fontWeight: 800, color: "white", letterSpacing: "-0.01em",
  }}>
    {name.charAt(0).toUpperCase()}
  </div>
);

const HeroStatPill: React.FC<{ value: number; label: string; color: string }> = ({ value, label, color }) => (
  <div className="flex flex-col items-center" style={{
    flex: 1, padding: "9px 0", borderRadius: 14,
    background: `${color}10`, border: `1px solid ${color}28`,
  }}>
    <span className="font-mono" style={{ fontSize: "1.4rem", fontWeight: 900, color, lineHeight: 1, letterSpacing: "-0.04em" }}>{value}</span>
    <span style={{ fontSize: "0.54rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color, marginTop: 3, opacity: 0.75 }}>{label}</span>
  </div>
);

const HeroQuickBtn: React.FC<{ icon: React.ReactElement; label: string; color: string; border: string; bg: string; onClick?: () => void }> = ({
  icon, label, color, border, bg, onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className="flex shrink-0 items-center justify-center gap-2 transition-all active:scale-[0.95]"
    style={{ padding: "10px 14px", borderRadius: 16, background: bg, border: `1px solid ${border}`, color, minWidth: 108 }}
  >
    <span style={{ display: "flex", opacity: 0.9 }}>{icon}</span>
    <span style={{ fontSize: "0.73rem", fontWeight: 700, letterSpacing: "0.01em" }}>{label}</span>
    <span style={{ display: "flex", opacity: 0.45 }}>{Ico.arrowRight(11)}</span>
  </button>
);

/* ══════════════════════════════════════════════
   GUIDE HERO
══════════════════════════════════════════════ */
const GuideHero: React.FC<{
  availableCount: number; dateLabel: string; displayName: string;
  greeting: string; onNavigate?: (path: string) => void;
  role: SessionUser["role"]; turno: TurnoLite | null;
}> = ({ availableCount, dateLabel, displayName, greeting, onNavigate, role, turno }) => (
  <div className="relative overflow-hidden" style={{
    background: "var(--gradient-hero-main) 0%, var(--color-bg-base) 55%, var(--color-bg-base) 100%)",
    borderBottom: `1px solid ${RAW.primaryRgba(0.14)}`,
  }}>
    {/* Aurora background layers */}
    <HeroOrb top={-90} left={-70} size={320} color={RAW.primaryRgba(0.13)} />
    <HeroOrb top={-30} right={-40} size={200} color={RAW.accentRgba(0.07)} />
    <HeroDotGrid />
    <HeroWatermark />

    <div className="relative mx-auto max-w-[440px] px-5 pt-10 pb-6">

      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <span style={{ fontSize: "0.57rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.24em", color: P.violet }}>
            {greeting}
          </span>
          {turno && <LiveBadge color={P.violet} label="En turno" bg={RAW.primaryRgba(0.10)} border={RAW.primaryRgba(0.28)} />}
        </div>
        <RoleBadge role={role} />
      </div>

      {/* Avatar + name */}
      <div className="flex items-center gap-4">
        <HeroAvatar
          name={displayName}
          gradient={`linear-gradient(135deg, ${RAW.primary} 0%, ${RAW.primaryDark} 100%)`}
          shadow={`0 6px 22px ${RAW.primaryRgba(0.40)}, 0 2px 6px rgba(0,0,0,0.05)`}
          border={RAW.primaryRgba(0.30)}
        />
        <div className="min-w-0 flex-1">
          <h1 className="font-extrabold leading-tight truncate" style={{ fontSize: "1.55rem", color: P.fgPrimary, letterSpacing: "-0.02em" }}>
            {displayName}
          </h1>
          <p style={{ marginTop: 4, fontSize: "0.72rem", color: P.fgSecondary }}>
            {turno ? "Guía activa · turno en curso" : "Guía activa · sin turno activo"}
          </p>
        </div>
      </div>

      {/* Info pills */}
      <div className="flex flex-wrap gap-2 mt-4">
        <InfoPill label="Fecha" value={dateLabel} />
        <InfoPill label="Disponibles" value={String(availableCount)} accent={P.amber} />
      </div>

      {/* Quick nav */}
      <div className="flex gap-2.5 mt-4">
        <HeroQuickBtn
          icon={<>{Ico.ticket()}</>}
          label="Mis turnos"
          color={P.violet} border={P.violetBorder} bg={P.violetFaint}
          onClick={() => onNavigate?.("/turnos")}
        />
        <HeroQuickBtn
          icon={<>{Ico.list()}</>}
          label="Atenciones"
          color={P.amber} border={P.amberBorder} bg={P.amberFaint}
          onClick={() => onNavigate?.("/atenciones")}
        />
      </div>

      <div className="mt-5 h-px" style={{ background: `linear-gradient(90deg, ${RAW.primaryRgba(0.28)}, transparent 70%)` }} />
    </div>
  </div>
);

/* ══════════════════════════════════════════════
   SUPERVISOR HERO
══════════════════════════════════════════════ */
const SupervisorHero: React.FC<{
  counts?: { recaladas: number; atenciones: number; turnos: number; turnosInProgress?: number | null };
  dateLabel: string; displayName: string; isRefreshing: boolean;
  lastUpdatedAt: string | null; onNavigate?: (path: string) => void;
  role: SessionUser["role"]; summary: string;
}> = ({ counts, dateLabel, displayName, isRefreshing, lastUpdatedAt, onNavigate, role, summary }) => (
  <div className="relative overflow-hidden" style={{
    background: "var(--gradient-hero-main) 0%, var(--color-bg-base) 55%, var(--color-bg-elevated) 100%)",
    borderBottom: `1px solid ${RAW.accentRgba(0.12)}`,
  }}>
    <HeroOrb top={-80} left={-60} size={300} color={RAW.accentRgba(0.09)} />
    <HeroOrb top={-20} right={-30} size={200} color={RAW.primaryRgba(0.08)} />
    <HeroDotGrid color={RAW.accentRgba(0.03)} />
    <HeroWatermark color={P.amber} />

    <div className="relative mx-auto max-w-[440px] px-5 pt-10 pb-6">

      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: RAW.accent, boxShadow: `0 0 10px ${RAW.accentRgba(0.4)}`, display: "inline-block" }} />
          <span style={{ fontSize: "0.57rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.24em", color: P.amber }}>
            Centro operativo
          </span>
        </div>
        <div className="flex items-center gap-2">
          <StatusChip tone={isRefreshing ? "warning" : "success"}>
            {isRefreshing ? "Actualizando" : "Sincronizado"}
          </StatusChip>
          <RoleBadge role={role} />
        </div>
      </div>

      {/* Avatar + name */}
      <div className="flex items-center gap-4">
        <HeroAvatar
          name={displayName}
          gradient={`linear-gradient(135deg, ${RAW.accent} 0%, var(--color-accent-active) 100%)`}
          shadow={`0 6px 22px ${RAW.accentRgba(0.40)}, 0 2px 6px rgba(0,0,0,0.05)`}
          border={RAW.accentRgba(0.32)}
        />
        <div className="min-w-0 flex-1">
          <h1 className="font-extrabold leading-tight truncate" style={{ fontSize: "1.55rem", color: P.fgPrimary, letterSpacing: "-0.02em" }}>
            {displayName}
          </h1>
          <p style={{ marginTop: 4, fontSize: "0.72rem", color: P.fgSecondary }}>{summary}</p>
        </div>
      </div>

      {/* Info pills */}
      <div className="flex flex-wrap gap-2 mt-4">
        <InfoPill label="Fecha" value={dateLabel} />
        <InfoPill label="Servidor" value={formatTime(lastUpdatedAt)} />
      </div>

      {/* Mini stat strip */}
      {counts && (
        <div className="flex gap-2 mt-4">
          <HeroStatPill value={counts.recaladas}             label="Recaladas"  color={RAW.info} />
          <HeroStatPill value={counts.atenciones}            label="Atenciones" color={RAW.accent} />
          <HeroStatPill value={counts.turnos}                label="Turnos"     color={RAW.success} />
          <HeroStatPill value={counts.turnosInProgress ?? 0} label="En curso"   color={RAW.primary} />
        </div>
      )}

      {/* Quick nav */}
      <div className="flex gap-2 mt-4" style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", scrollbarWidth: "none", msOverflowStyle: "none" }}>
        <HeroQuickBtn
          icon={<>{Ico.ticket()}</>}
          label="Turnero"
          color={P.violet} border={P.violetBorder} bg={P.violetFaint}
          onClick={() => onNavigate?.("/turnos")}
        />
        <HeroQuickBtn
          icon={<>{Ico.ship()}</>}
          label="Recaladas"
          color={P.cyan} border={P.cyanBorder} bg={P.cyanFaint}
          onClick={() => onNavigate?.("/recaladas")}
        />
        <HeroQuickBtn
          icon={<>{Ico.list()}</>}
          label="Atenciones"
          color={P.amber} border={P.amberBorder} bg={P.amberFaint}
          onClick={() => onNavigate?.("/atenciones")}
        />
      </div>

      <div className="mt-5 h-px" style={{ background: `linear-gradient(90deg, ${RAW.accentRgba(0.28)}, transparent 70%)` }} />
    </div>
  </div>
);

/* ══════════════════════════════════════════════
   GUIDE CONTENT
══════════════════════════════════════════════ */
const GuideContent: React.FC<{
  guia?: DashboardOverviewResponse["guia"];
  lastUpdatedAt: string | null;
  onNavigate?: (path: string) => void;
}> = ({ guia, lastUpdatedAt, onNavigate }) => (
  <>
    <FadeCard delay={0}>
      <GuideFocusCard onNavigate={onNavigate} turno={guia?.activeTurno ?? null} />
    </FadeCard>
    <FadeCard delay={80}>
      <GuideNextTurnoCard turno={guia?.nextTurno ?? null} />
    </FadeCard>
    <FadeCard delay={160}>
      <GuideAtencionesCard items={guia?.atencionesDisponibles ?? []} lastUpdatedAt={lastUpdatedAt} onNavigate={onNavigate} />
    </FadeCard>
  </>
);

const GuideFocusCard: React.FC<{ onNavigate?: (path: string) => void; turno: TurnoLite | null }> = ({ onNavigate, turno }) => {
  if (!turno) {
    return (
      <Card className="p-5">
        <SectionDivider title="Turno activo" color={P.violet} />
        <div className="mt-3">
          <EmptyStateCard
            icon={<>{Ico.ticket(24)}</>}
            description="Aún no hay un turno en curso para esta jornada."
            title="Sin turno activo"
          />
        </div>
      </Card>
    );
  }

  return (
    <div className="relative overflow-hidden" style={{
      borderRadius: 22,
      background: "var(--color-bg-elevated)",
      border: `1px solid ${RAW.primaryRgba(0.20)}`,
      borderLeft: `3px solid ${RAW.primary}`,
      boxShadow: `0 12px 40px ${RAW.primaryRgba(0.12)}, 0 24px 56px rgba(0,0,0,0.05), inset 0 1px 0 ${RAW.primaryRgba(0.08)}`,
    }}>
      <HeroOrb top={-50} right={-30} size={200} color={RAW.primaryRgba(0.09)} />

      <div className="relative p-5">
        <div className="flex items-center justify-between gap-3">
          <LiveBadge color={P.violet} label="Turno activo" bg={RAW.primaryRgba(0.11)} border={RAW.primaryRgba(0.24)} />
          <StatusChip tone={getTurnoTone(turno.status)}>{formatTurnoStatus(turno.status)}</StatusChip>
        </div>

        <p className="font-mono leading-none tracking-tight mt-5" style={{
          fontSize: "3.5rem", fontWeight: 900, color: P.violet,
          letterSpacing: "-0.04em",
          textShadow: `0 0 36px ${RAW.primaryRgba(0.35)}`,
        }}>
          #{formatTurnoNumber(turno.numero)}
        </p>

        <p style={{ fontSize: "1rem", fontWeight: 700, color: P.fgPrimary, marginTop: 10 }}>
          {turno.atencion.recalada.buque.nombre}
        </p>
        <p style={{ fontSize: "0.73rem", color: P.fgSecondary, marginTop: 3 }}>
          {turno.atencion.recalada.codigoRecalada}
        </p>

        <div className="flex flex-wrap gap-2 mt-4">
          <InfoPill label="Inicio"   value={formatTime(turno.atencion.fechaInicio)} />
          <InfoPill label="Check-in" value={turno.checkInAt ? formatTime(turno.checkInAt) : "Pendiente"} accent={P.amber} />
        </div>

        <div style={{ height: 1, background: RAW.primaryRgba(0.14), margin: "18px 0" }} />

        <VioletBtn onClick={() => onNavigate?.("/turnos")} icon={<>{Ico.arrowRight()}</>}>
          Registrar check-in
        </VioletBtn>
      </div>
    </div>
  );
};

const GuideNextTurnoCard: React.FC<{ turno: TurnoLite | null }> = ({ turno }) => (
  <Card className="p-5">
    <SectionDivider title="Próximo turno" color={P.cyan} />
    {turno ? (
      <div className="mt-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono leading-none" style={{ fontSize: "1.6rem", fontWeight: 900, color: P.fgPrimary, letterSpacing: "-0.03em" }}>
            #{formatTurnoNumber(turno.numero)}
          </p>
          <StatusChip tone={getTurnoTone(turno.status)}>{formatTurnoStatus(turno.status)}</StatusChip>
        </div>
        <p style={{ fontSize: "0.875rem", fontWeight: 700, color: P.fgPrimary }}>
          {turno.atencion.recalada.buque.nombre}
        </p>
        <p style={{ fontSize: "0.73rem", color: P.fgSecondary, marginTop: -6 }}>
          {turno.atencion.recalada.codigoRecalada}
        </p>
        <div className="flex flex-wrap gap-2">
          <InfoPill label="Inicio" value={formatTime(turno.atencion.fechaInicio)} accent={P.cyan} />
          <InfoPill label="Fin"    value={formatTime(turno.atencion.fechaFin)} />
        </div>
      </div>
    ) : (
      <div className="mt-3">
        <EmptyStateCard
          icon={<>{Ico.clock(24)}</>}
          description="Aún no tienes un siguiente turno asignado."
          title="Sin próximo turno"
        />
      </div>
    )}
  </Card>
);

const GuideAtencionesCard: React.FC<{
  items: AtencionDisponibleLite[]; lastUpdatedAt: string | null; onNavigate?: (path: string) => void;
}> = ({ items, lastUpdatedAt, onNavigate }) => (
  <Card className="p-5">
    <SectionDivider title="Atenciones disponibles" color={P.amber} />

    <div className="mt-4 flex flex-col gap-2.5">
      {items.length ? (
        items.slice(0, 3).map((item) => (
          <button
            key={item.id} type="button"
            onClick={() => onNavigate?.("/atenciones")}
            className="flex w-full items-center gap-3 text-left transition-all active:scale-[0.98]"
            style={{ borderRadius: 16, padding: "11px 13px", background: "var(--color-glass-subtle)", border: "1px solid var(--color-glass-medium)" }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 14, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: P.amberFaint, border: `1px solid ${P.amberBorder}`, color: P.amber }}>
              {Ico.ship()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold" style={{ fontSize: "0.8125rem", color: P.fgPrimary }}>{item.recalada.buque.nombre}</p>
              <p className="truncate" style={{ fontSize: "0.68rem", color: P.fgSecondary, marginTop: 2 }}>{item.recalada.codigoRecalada}</p>
            </div>
            <div className="inline-flex items-center gap-1 rounded-full px-2.5 py-1" style={{ background: P.amberFaint, border: `1px solid ${P.amberBorder}`, flexShrink: 0 }}>
              <span className="font-bold" style={{ fontSize: "0.8125rem", color: P.amber }}>{item.availableTurnos}</span>
              <span style={{ fontSize: "0.58rem", fontWeight: 600, color: P.fgSecondary }}>cupos</span>
            </div>
          </button>
        ))
      ) : (
        <EmptyStateCard
          icon={<>{Ico.ship(24)}</>}
          description="Cuando existan atenciones abiertas aparecerán aquí."
          title="Sin atenciones disponibles"
        />
      )}
    </div>

    <div className="mt-4"><FooterUpdated lastUpdatedAt={lastUpdatedAt} /></div>
  </Card>
);

/* ══════════════════════════════════════════════
   SUPERVISOR CONTENT
══════════════════════════════════════════════ */
const SupervisorContent: React.FC<{
  lastUpdatedAt: string | null; onNavigate?: (path: string) => void; overview?: SupervisorOverview;
}> = ({ lastUpdatedAt, onNavigate, overview }) => {
  if (!overview) {
    return (
      <FadeCard delay={0}>
        <Card className="p-5">
          <SectionDivider title="Dashboard supervisor" color={P.amber} />
          <div className="mt-3">
            <EmptyStateCard description="No hay información operativa para este rol en este momento." title="Sin datos de supervisión" />
          </div>
        </Card>
      </FadeCard>
    );
  }

  const { counts } = overview;

  return (
    <>
      <FadeCard delay={0}>
        <Card className="p-5">
          <SectionDivider title="Operaciones del día" color={P.amber} />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <CountTile tone="cyan"   label="Recaladas"  helper="Operación del día"   value={counts.recaladas} />
            <CountTile tone="amber"  label="Atenciones" helper="Inicio y fin hoy"    value={counts.atenciones} />
            <CountTile tone="teal"   label="Turnos"     helper="Cobertura operativa" value={counts.turnos} />
            <CountTile tone="violet" label="En curso"   helper="Turnos activos"      value={counts.turnosInProgress ?? 0} />
          </div>
        </Card>
      </FadeCard>

      <FadeCard delay={80}>
        <Card className="p-5">
          <SectionDivider title="Capacidad del equipo" color={P.teal} />
          <TeamCapacity guides={overview.guides} />
        </Card>
      </FadeCard>

      <FadeCard delay={160}>
        <Card className="p-5">
          <SectionDivider title="Próximos hitos" color={P.violet} />
          <div className="mt-4">
            {overview.upcoming.length ? (
              <MilestoneTimeline items={overview.upcoming.slice(0, 5)} />
            ) : (
              <EmptyStateCard
                icon={<>{Ico.clock(24)}</>}
                description="La agenda inmediata no tiene hitos pendientes."
                title="Sin próximos hitos"
              />
            )}
          </div>

          <div className="mt-5 flex flex-col gap-2.5">
            <VioletBtn onClick={() => onNavigate?.("/turnos")} icon={<>{Ico.ticket()}</>}>
              Abrir turnero
            </VioletBtn>
            <AmberBtn onClick={() => onNavigate?.("/recaladas")} icon={<>{Ico.ship()}</>}>
              Recaladas
            </AmberBtn>
          </div>

          <div className="mt-4"><FooterUpdated lastUpdatedAt={lastUpdatedAt} /></div>
        </Card>
      </FadeCard>
    </>
  );
};

/* ══════════════════════════════════════════════
   ATOMS
══════════════════════════════════════════════ */
const FadeCard: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => (
  <div className="animate-fade-up" style={{ animationDelay: `${delay}ms`, animationFillMode: "backwards" }}>
    {children}
  </div>
);

const Card: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({ children, className = "", style }) => (
  <div
    className={className}
    style={{
      background: P.bgSurface,
      border: "1px solid var(--color-glass-medium)",
      borderTop: "1px solid var(--color-glass-medium)",
      borderRadius: 22,
      boxShadow: "0 24px 56px rgba(0,0,0,0.05), inset 0 1px 0 var(--color-glass-soft)",
      ...style,
    }}
  >
    {children}
  </div>
);

const SectionDivider: React.FC<{ title: string; color?: string }> = ({ title, color = P.violet }) => (
  <div className="flex items-center gap-2.5">
    <div style={{ width: 3, height: 14, borderRadius: 2, background: color, flexShrink: 0, opacity: 0.9 }} />
    <p style={{ fontSize: "0.595rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color, flexShrink: 0 }}>
      {title}
    </p>
    <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${color}35, transparent)` }} />
  </div>
);

const InfoPill: React.FC<{ label: string; value?: string; accent?: string }> = ({ label, value, accent }) => (
  <div
    className="inline-flex items-center gap-1.5 rounded-[10px] px-3 py-1.5"
    style={{
      background: accent ? `${accent}10` : "var(--color-glass-soft)",
      border: `1px solid ${accent ? `${accent}28` : "var(--color-glass-medium)"}`,
    }}
  >
    <span style={{ fontSize: "0.54rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: accent ?? P.fgMuted }}>{label}</span>
    {value && <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: accent ?? P.fgPrimary }}>{value}</span>}
  </div>
);

const CountTile: React.FC<{
  tone: "cyan" | "amber" | "teal" | "violet";
  label: string; helper: string; value: number;
}> = ({ tone, label, helper, value }) => {
  const color  = TILE_COLOR[tone];
  const bg     = TILE_BG[tone];
  const border = TILE_BORDER[tone];
  const iconBg = TILE_ICON_BG[tone];

  return (
    <div className="relative overflow-hidden" style={{ borderRadius: 18, padding: "16px 14px", background: bg, border: `1px solid ${border}`, boxShadow: `0 4px 24px ${color}14` }}>
      <div style={{ position: "absolute", right: -10, bottom: -12, opacity: 0.07, color, pointerEvents: "none" }}>
        {TILE_ICONS_LG[tone]}
      </div>
      <div style={{ width: 32, height: 32, borderRadius: 10, marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", background: iconBg, color, border: `1px solid ${border}` }}>
        {TILE_ICONS_SM[tone]}
      </div>
      <p className="font-mono leading-none" style={{ fontSize: "2.6rem", fontWeight: 900, color, letterSpacing: "-0.04em", textShadow: `0 0 22px ${color}45` }}>{value}</p>
      <p style={{ fontSize: "0.75rem", fontWeight: 700, color: P.fgPrimary, marginTop: 7 }}>{label}</p>
      <p style={{ fontSize: "0.58rem", color: P.fgMuted, marginTop: 2, fontWeight: 600, letterSpacing: "0.02em" }}>{helper}</p>
    </div>
  );
};

const TeamCapacity: React.FC<{ guides?: SupervisorOverview["guides"] }> = ({ guides }) => {
  const activos   = guides?.activos   ?? 0;
  const asignados = guides?.asignados ?? 0;
  const libres    = guides?.libres    ?? 0;
  const total     = activos || 1;

  return (
    <div className="mt-4 flex flex-col gap-4">
      <CapacityRow label="Activos"     value={activos}   total={total} pct={100}                       color={P.cyan} />
      <CapacityRow label="Asignados"   value={asignados} total={total} pct={(asignados / total) * 100} color={P.amber} />
      <CapacityRow label="Disponibles" value={libres}    total={total} pct={(libres / total) * 100}    color={P.teal} />
    </div>
  );
};

const CapacityRow: React.FC<{ label: string; value: number; total: number; pct: number; color: string }> = ({ label, value, total, pct, color }) => {
  const pctDisplay = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: P.fgSecondary }}>{label}</span>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: "0.6rem", color: P.fgMuted, fontWeight: 600 }}>{pctDisplay}%</span>
          <span className="font-mono" style={{ fontSize: "0.8125rem", fontWeight: 800, color: P.fgPrimary }}>{value}</span>
        </div>
      </div>
      <div style={{ height: 5, borderRadius: 4, background: "var(--color-glass-medium)", overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${Math.min(100, pct)}%`,
          background: `linear-gradient(90deg, ${color}70, ${color})`,
          borderRadius: 4,
          transition: "width 0.7s cubic-bezier(0.34,1.56,0.64,1)",
        }} />
      </div>
    </div>
  );
};

const MilestoneTimeline: React.FC<{ items: DashboardMilestone[] }> = ({ items }) => (
  <div style={{ position: "relative", paddingLeft: 24 }}>
    {items.length > 1 && (
      <div style={{ position: "absolute", left: 5, top: 10, bottom: 10, width: 2, background: `linear-gradient(180deg, ${RAW.primaryRgba(0.28)}, ${RAW.primaryRgba(0.03)})`, borderRadius: 1 }} />
    )}
    <div className="flex flex-col gap-4">
      {items.map((item) => {
        const color = MILESTONE_COLOR[item.kind] ?? "var(--color-fg-muted)";
        return (
          <div key={getMilestoneKey(item)} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
              marginTop: 0, marginLeft: -24,
              background: `${color}1A`,
              border: `1.5px solid ${color}60`,
              boxShadow: `0 0 10px ${color}55`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color,
            }}>
              {getMilestoneIcon(item.kind)}
            </div>
            <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
              <p className="truncate font-semibold" style={{ fontSize: "0.8125rem", color: P.fgPrimary }}>{item.title}</p>
              <p style={{ fontSize: "0.54rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color, marginTop: 3 }}>{formatMilestoneKind(item.kind)}</p>
            </div>
            <p className="font-mono flex-shrink-0" style={{ fontSize: "0.8125rem", fontWeight: 700, color: P.fgPrimary, paddingTop: 2 }}>
              {formatTime(item.at)}
            </p>
          </div>
        );
      })}
    </div>
  </div>
);

const FooterUpdated: React.FC<{ lastUpdatedAt: string | null }> = ({ lastUpdatedAt }) => (
  <div className="rounded-[12px] px-3 py-2.5" style={{ background: "var(--color-glass-subtle)", border: "1px solid var(--color-glass-soft)" }}>
    <LastUpdatedRow label="Última actualización" statusLabel={formatTime(lastUpdatedAt)} statusTone="info" />
  </div>
);

/* ══════════════════════════════════════════════
   BUTTONS
══════════════════════════════════════════════ */
const VioletBtn: React.FC<{ children: React.ReactNode; onClick?: () => void; icon?: React.ReactElement }> = ({ children, onClick, icon }) => (
  <button
    type="button" onClick={onClick}
    className="w-full flex items-center justify-center gap-2.5 transition-all active:scale-[0.97]"
    style={{
      padding: "15px 20px", borderRadius: 18,
      background: `linear-gradient(135deg, ${RAW.primaryDark} 0%, ${RAW.primary} 55%, var(--color-primary-dark) 100%)`,
      boxShadow: `0 8px 28px ${RAW.primaryRgba(0.42)}, 0 2px 8px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.18)`,
      border: "1px solid rgba(255,255,255,0.12)",
      color: "white", fontSize: "0.9rem", fontWeight: 800, letterSpacing: "0.015em",
    }}
  >
    {icon && <span style={{ opacity: 0.9, display: "flex" }}>{icon}</span>}
    <span>{children}</span>
  </button>
);

const AmberBtn: React.FC<{ children: React.ReactNode; onClick?: () => void; icon?: React.ReactElement }> = ({ children, onClick, icon }) => (
  <button
    type="button" onClick={onClick}
    className="w-full flex items-center justify-center gap-2.5 transition-all active:scale-[0.97]"
    style={{
      padding: "14px 20px", borderRadius: 18,
      background: `linear-gradient(135deg, ${RAW.accentRgba(0.12)} 0%, ${RAW.accentRgba(0.06)} 100%)`,
      boxShadow: `0 4px 18px ${RAW.accentRgba(0.18)}, 0 2px 6px rgba(0,0,0,0.25), inset 0 1px 0 ${RAW.accentRgba(0.12)}`,
      border: `1px solid ${P.amberBorder}`,
      color: P.amber, fontSize: "0.9rem", fontWeight: 700, letterSpacing: "0.015em",
    }}
  >
    {icon && <span style={{ opacity: 0.85, display: "flex" }}>{icon}</span>}
    <span>{children}</span>
  </button>
);

/* ══════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════ */
function formatTurnoNumber(value: number): string { return String(value).padStart(3, "0"); }

function getTurnoTone(status?: string | null): "success" | "warning" | "info" | "danger" {
  switch (status) {
    case "IN_PROGRESS": case "COMPLETED": return "success";
    case "AVAILABLE": return "warning";
    case "CANCELED": case "NO_SHOW": return "danger";
    default: return "info";
  }
}

function getMilestoneKey(item: DashboardMilestone): string {
  return [item.kind, item.at, item.title, item.ref.recaladaId, item.ref.atencionId].filter(Boolean).join("-");
}

void pluralize;

export default DashboardNeumorphic;
