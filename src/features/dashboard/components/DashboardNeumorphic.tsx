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
      height: 32,
      background: "var(--color-bg-subtle)",
      borderBottom: "1px solid var(--color-border-hairline)",
    }}
  >
    <div className="animate-spin" style={{ color: "var(--color-primary)" }}>{Ico.refresh()}</div>
    <span
      style={{
        fontSize: "var(--text-eyebrow)",
        fontWeight: 600,
        color: "var(--color-fg-secondary)",
        letterSpacing: "var(--tracking-eyebrow)",
        textTransform: "uppercase",
      }}
    >
      Actualizando datos…
    </span>
  </div>
);

/* ══════════════════════════════════════════════
   HERO SHARED ATOMS — Maritime Premium
   Decoración eliminada: orbs, dot grids y watermarks
   son no-ops. Mantengo los componentes para no romper
   call sites; el hero queda limpio, plano e institucional.
══════════════════════════════════════════════ */
const HeroOrb: React.FC<{ top?: number; left?: number; right?: number; bottom?: number; size: number; color: string }> = () => null;

const HeroDotGrid: React.FC<{ color?: string }> = () => null;

const HeroWatermark: React.FC<{ color?: string }> = () => null;

const LiveBadge: React.FC<{ color: string; label: string; bg: string; border: string }> = ({ color, label, bg, border }) => (
  <span
    className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5"
    style={{ background: bg, border: `1px solid ${border}` }}
  >
    <span className="live-pulse-dot" style={{ background: color }} />
    <span
      style={{
        fontSize: "var(--text-eyebrow)",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "var(--tracking-eyebrow)",
        color,
      }}
    >
      {label}
    </span>
  </span>
);

const HeroAvatar: React.FC<{ name: string; gradient: string; shadow: string; border: string }> = ({ name }) => (
  <div
    style={{
      width: 48,
      height: 48,
      borderRadius: 12,
      flexShrink: 0,
      background: "var(--color-primary)",
      border: "1px solid var(--color-primary-active)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1.125rem",
      fontWeight: 700,
      color: "white",
      letterSpacing: "var(--tracking-tight)",
    }}
  >
    {name.charAt(0).toUpperCase()}
  </div>
);

const HeroStatPill: React.FC<{ value: number; label: string; color: string }> = ({ value, label, color }) => (
  <div
    className="flex flex-col items-center"
    style={{
      flex: 1,
      padding: "10px 0",
      borderRadius: 12,
      background: "var(--color-bg-elevated)",
      border: "1px solid var(--color-border-hairline)",
    }}
  >
    <span
      className="t-mono"
      style={{
        fontSize: "1.375rem",
        fontWeight: 700,
        color,
        lineHeight: 1,
        letterSpacing: "var(--tracking-tight)",
      }}
    >
      {value}
    </span>
    <span
      style={{
        fontSize: "var(--text-eyebrow)",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "var(--tracking-eyebrow)",
        color: "var(--color-fg-muted)",
        marginTop: 4,
      }}
    >
      {label}
    </span>
  </div>
);

const HeroQuickBtn: React.FC<{ icon: React.ReactElement; label: string; color: string; border: string; bg: string; onClick?: () => void }> = ({
  icon, label, color, onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className="flex shrink-0 items-center justify-center gap-2 transition-colors active:translate-y-px"
    style={{
      padding: "10px 14px",
      borderRadius: 10,
      background: "var(--color-bg-elevated)",
      border: "1px solid var(--color-border-hairline)",
      color: "var(--color-fg-primary)",
      minWidth: 108,
    }}
  >
    <span style={{ display: "flex", color }}>{icon}</span>
    <span
      style={{
        fontSize: "var(--text-caption)",
        fontWeight: 600,
        letterSpacing: "var(--tracking-base)",
      }}
    >
      {label}
    </span>
    <span style={{ display: "flex", color: "var(--color-fg-muted)" }}>
      {Ico.arrowRight(11)}
    </span>
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
  <div className="relative" style={{
    background: "var(--color-bg-elevated)",
    borderBottom: "1px solid var(--color-border-hairline)",
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
          <span
            style={{
              fontSize: "var(--text-eyebrow)",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "var(--tracking-eyebrow)",
              color: "var(--color-fg-muted)",
            }}
          >
            {greeting}
          </span>
          {turno && <LiveBadge color={P.violet} label="En turno" bg="var(--color-primary-soft)" border="var(--color-primary-soft)" />}
        </div>
        <RoleBadge role={role} />
      </div>

      {/* Avatar + name */}
      <div className="flex items-center gap-3.5">
        <HeroAvatar
          name={displayName}
          gradient=""
          shadow=""
          border=""
        />
        <div className="min-w-0 flex-1">
          <h1
            className="truncate"
            style={{
              fontSize: "var(--text-display)",
              fontWeight: 700,
              color: "var(--color-fg-primary)",
              letterSpacing: "var(--tracking-tight)",
              lineHeight: "var(--leading-tight)",
            }}
          >
            {displayName}
          </h1>
          <p
            style={{
              marginTop: 4,
              fontSize: "var(--text-caption)",
              color: "var(--color-fg-muted)",
            }}
          >
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
      <div className="flex gap-2 mt-4">
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
  <div className="relative" style={{
    background: "var(--color-bg-elevated)",
    borderBottom: "1px solid var(--color-border-hairline)",
  }}>
    <HeroOrb top={-80} left={-60} size={300} color={RAW.accentRgba(0.09)} />
    <HeroOrb top={-20} right={-30} size={200} color={RAW.primaryRgba(0.08)} />
    <HeroDotGrid color={RAW.accentRgba(0.03)} />
    <HeroWatermark color={P.amber} />

    <div className="relative mx-auto max-w-[440px] px-5 pt-10 pb-6">

      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <span
            style={{
              fontSize: "var(--text-eyebrow)",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "var(--tracking-eyebrow)",
              color: "var(--color-fg-muted)",
            }}
          >
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
      <div className="flex items-center gap-3.5">
        <HeroAvatar
          name={displayName}
          gradient=""
          shadow=""
          border=""
        />
        <div className="min-w-0 flex-1">
          <h1
            className="truncate"
            style={{
              fontSize: "var(--text-display)",
              fontWeight: 700,
              color: "var(--color-fg-primary)",
              letterSpacing: "var(--tracking-tight)",
              lineHeight: "var(--leading-tight)",
            }}
          >
            {displayName}
          </h1>
          <p
            style={{
              marginTop: 4,
              fontSize: "var(--text-caption)",
              color: "var(--color-fg-muted)",
            }}
          >
            {summary}
          </p>
        </div>
      </div>

      {/* Info pills */}
      <div className="flex flex-wrap gap-2 mt-4">
        <InfoPill label="Fecha" value={dateLabel} />
        <InfoPill label="Servidor" value={formatTime(lastUpdatedAt)} />
      </div>

      {/* Mini stat strip */}
      {counts && (
        <div className="grid grid-cols-4 gap-2 mt-4">
          <HeroStatPill value={counts.recaladas}             label="Recaladas"  color="var(--color-fg-primary)" />
          <HeroStatPill value={counts.atenciones}            label="Atenciones" color="var(--color-fg-primary)" />
          <HeroStatPill value={counts.turnos}                label="Turnos"     color="var(--color-fg-primary)" />
          <HeroStatPill value={counts.turnosInProgress ?? 0} label="En curso"   color="var(--color-primary)" />
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
      <GuideAvailabilityCard guia={guia} onNavigate={onNavigate} />
    </FadeCard>
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

const GuideAvailabilityCard: React.FC<{
  guia?: DashboardOverviewResponse["guia"];
  onNavigate?: (path: string) => void;
}> = ({ guia, onNavigate }) => {
  const mode = guia?.assignmentMode ?? "MANUAL_RECLAMO";
  const availability = guia?.disponibilidad;
  const penalized = availability?.pendingPenalty ?? false;
  const available = availability?.disponibleParaTurnos ?? false;
  const toneColor = penalized ? P.danger : available ? P.teal : P.fgMuted;

  return (
    <Card className="p-5">
      <SectionDivider title="Disponibilidad" color={toneColor} />
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold" style={{ color: P.fgPrimary }}>
            {penalized ? "Penalización pendiente" : available ? "Disponible para turnos" : "No disponible"}
          </p>
          <p className="mt-1 text-xs leading-5" style={{ color: P.fgMuted }}>
            {mode === "FIFO_GLOBAL"
              ? "FIFO automático activo. La asignación sale del orden global."
              : "Reclamo manual activo. Marca disponibilidad para tomar cupos."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate?.("/profile")}
          className="shrink-0 rounded-xl px-3 py-2 text-xs font-bold"
          style={{
            background: "var(--color-bg-subtle)",
            border: "1px solid var(--color-border-hairline)",
            color: P.fgPrimary,
          }}
        >
          Mi cuenta
        </button>
      </div>
    </Card>
  );
};

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
    <div
      className="relative"
      style={{
        borderRadius: 16,
        background: "var(--color-bg-elevated)",
        border: "1px solid var(--color-border-hairline)",
        borderLeft: "3px solid var(--color-primary)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <LiveBadge color={P.violet} label="Turno activo" bg="var(--color-primary-soft)" border="var(--color-primary-soft)" />
          <StatusChip tone={getTurnoTone(turno.status)}>{formatTurnoStatus(turno.status)}</StatusChip>
        </div>

        <p
          className="t-mono leading-none mt-4"
          style={{
            fontSize: "2.75rem",
            fontWeight: 700,
            color: "var(--color-primary)",
            letterSpacing: "var(--tracking-tight)",
          }}
        >
          #{formatTurnoNumber(turno.numero)}
        </p>

        <p
          style={{
            fontSize: "var(--text-subhead)",
            fontWeight: 600,
            letterSpacing: "var(--tracking-tight)",
            color: "var(--color-fg-primary)",
            marginTop: 10,
          }}
        >
          {turno.atencion.recalada.buque.nombre}
        </p>
        <p
          style={{
            fontSize: "var(--text-caption)",
            color: "var(--color-fg-muted)",
            marginTop: 2,
          }}
        >
          {turno.atencion.recalada.codigoRecalada}
        </p>

        <div className="flex flex-wrap gap-2 mt-4">
          <InfoPill label="Inicio"   value={formatTime(turno.atencion.fechaInicio)} />
          <InfoPill label="Check-in" value={turno.checkInAt ? formatTime(turno.checkInAt) : "Pendiente"} accent={P.amber} />
        </div>

        <div style={{ height: 1, background: "var(--color-border-hairline)", margin: "18px 0" }} />

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
  const overdueRecaladas =
    counts.overdueRecaladas ??
    overview.alerts?.find((a) => a.code === "OVERDUE_RECALADAS")?.count ??
    0;

  return (
    <>
      {overdueRecaladas > 0 && (
        <FadeCard delay={0}>
          <button
            type="button"
            onClick={() => onNavigate?.("/recaladas?overdueDeparture=true")}
            className="w-full text-left active:scale-[0.99] transition-transform"
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 18,
              padding: "15px 16px 14px",
              background:
                "linear-gradient(135deg, var(--color-danger-soft) 0%, var(--color-bg-elevated) 65%, var(--color-danger-soft) 100%)",
              border: "1px solid var(--color-danger-border)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: P.danger }} />
            <div
              aria-hidden
              style={{
                position: "absolute",
                right: -32,
                top: -32,
                width: 110,
                height: 110,
                borderRadius: "50%",
                background: "var(--color-danger-soft)",
                opacity: 0.55,
                filter: "blur(28px)",
                pointerEvents: "none",
              }}
            />

            <div style={{ position: "relative", display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div
                style={{
                  position: "relative",
                  width: 40,
                  height: 40,
                  borderRadius: 13,
                  background: "var(--color-danger-soft)",
                  border: "1px solid var(--color-danger-border)",
                  color: P.danger,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span className="live-pulse-dot" style={{ position: "absolute", top: 4, right: 4, width: 6, height: 6, background: P.danger }} />
                {Ico.warning()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span
                    style={{
                      fontSize: "0.6rem",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.14em",
                      color: P.danger,
                    }}
                  >
                    Atención operativa
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      borderRadius: 9999,
                      padding: "2px 7px",
                      background: "var(--color-danger-soft)",
                      border: "1px solid var(--color-danger-border)",
                      color: P.danger,
                      fontSize: "0.6rem",
                      fontWeight: 700,
                    }}
                  >
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: P.danger }} />
                    ARRIVED
                  </span>
                </div>
                <p style={{ margin: "6px 0 0", fontSize: "0.92rem", fontWeight: 800, color: P.fgPrimary, letterSpacing: "-0.01em" }}>
                  Recaladas pendientes de zarpe
                </p>
                <p
                  style={{
                    margin: "3px 0 0",
                    fontSize: "0.745rem",
                    color: P.fgSecondary,
                    lineHeight: 1.4,
                  }}
                >
                  {overdueRecaladas === 1
                    ? "1 buque arribado ya superó su salida programada."
                    : `${overdueRecaladas} buques arribados ya superaron su salida programada.`}{" "}
                  Abre la lista filtrada para cerrarlos.
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flexShrink: 0 }}>
                <span
                  className="t-mono"
                  style={{
                    minWidth: 36,
                    borderRadius: 11,
                    padding: "7px 9px",
                    background: P.danger,
                    color: "white",
                    fontSize: "1.05rem",
                    fontWeight: 900,
                    lineHeight: 1,
                    textAlign: "center",
                    boxShadow: "0 6px 14px -6px var(--color-danger-soft)",
                  }}
                >
                  {overdueRecaladas}
                </span>
                <span
                  style={{
                    fontSize: "0.54rem",
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: P.danger,
                  }}
                >
                  vencidas
                </span>
              </div>
            </div>

            <div
              style={{
                position: "relative",
                marginTop: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                paddingTop: 10,
                borderTop: "1px dashed var(--color-danger-border)",
              }}
            >
              <span style={{ fontSize: "0.66rem", fontWeight: 600, color: P.fgMuted }}>
                Toca para revisar el listado filtrado
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: P.danger, fontSize: "0.72rem", fontWeight: 800 }}>
                Revisar
                {Ico.arrowRight(12)}
              </span>
            </div>
          </button>
        </FadeCard>
      )}

      <FadeCard delay={overdueRecaladas > 0 ? 60 : 0}>
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
      background: "var(--color-bg-elevated)",
      border: "1px solid var(--color-border-hairline)",
      borderRadius: 16,
      boxShadow: "var(--shadow-card)",
      ...style,
    }}
  >
    {children}
  </div>
);

const SectionDivider: React.FC<{ title: string; color?: string }> = ({ title, color = "var(--color-fg-secondary)" }) => (
  <div className="flex items-center gap-2">
    <p
      style={{
        fontSize: "var(--text-eyebrow)",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "var(--tracking-eyebrow)",
        color,
        flexShrink: 0,
      }}
    >
      {title}
    </p>
    <div style={{ flex: 1, height: 1, background: "var(--color-border-hairline)" }} />
  </div>
);

const InfoPill: React.FC<{ label: string; value?: string; accent?: string }> = ({ label, value, accent }) => (
  <div
    className="inline-flex items-center gap-1.5 rounded-[8px] px-2.5 py-1"
    style={{
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
    {value && (
      <span
        style={{
          fontSize: "var(--text-caption)",
          fontWeight: 600,
          color: accent ?? "var(--color-fg-primary)",
        }}
      >
        {value}
      </span>
    )}
  </div>
);

const CountTile: React.FC<{
  tone: "cyan" | "amber" | "teal" | "violet";
  label: string; helper: string; value: number;
}> = ({ tone, label, helper, value }) => {
  const color  = TILE_COLOR[tone];
  const iconBg = TILE_ICON_BG[tone];

  return (
    <div
      style={{
        borderRadius: 14,
        padding: "14px 14px",
        background: "var(--color-bg-elevated)",
        border: "1px solid var(--color-border-hairline)",
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: iconBg,
          color,
        }}
      >
        {TILE_ICONS_SM[tone]}
      </div>
      <p
        className="t-mono leading-none"
        style={{
          fontSize: "1.875rem",
          fontWeight: 700,
          color: "var(--color-fg-primary)",
          letterSpacing: "var(--tracking-tight)",
        }}
      >
        {value}
      </p>
      <p
        style={{
          fontSize: "var(--text-caption)",
          fontWeight: 600,
          color: "var(--color-fg-primary)",
          marginTop: 8,
          letterSpacing: "var(--tracking-tight)",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: "var(--text-eyebrow)",
          color: "var(--color-fg-muted)",
          marginTop: 1,
          fontWeight: 500,
        }}
      >
        {helper}
      </p>
    </div>
  );
};

const TeamCapacity: React.FC<{ guides?: SupervisorOverview["guides"] }> = ({ guides }) => {
  const activos   = guides?.activos   ?? 0;
  const asignados = guides?.asignados ?? 0;
  const disponibles = guides?.disponibles ?? guides?.libres ?? 0;
  const penalizados = guides?.penalizados ?? 0;
  const total     = activos || 1;

  return (
    <div className="mt-4 flex flex-col gap-4">
      <CapacityRow label="Activos"     value={activos}   total={total} pct={100}                       color={P.cyan} />
      <CapacityRow label="Asignados"   value={asignados} total={total} pct={(asignados / total) * 100} color={P.amber} />
      <CapacityRow label="Disponibles" value={disponibles} total={total} pct={(disponibles / total) * 100} color={P.teal} />
      {penalizados > 0 && (
        <CapacityRow label="Penalizados" value={penalizados} total={total} pct={(penalizados / total) * 100} color={P.danger} />
      )}
    </div>
  );
};

const CapacityRow: React.FC<{ label: string; value: number; total: number; pct: number; color: string }> = ({ label, value, total, pct, color }) => {
  const pctDisplay = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span
          style={{
            fontSize: "var(--text-caption)",
            fontWeight: 600,
            color: "var(--color-fg-secondary)",
          }}
        >
          {label}
        </span>
        <div className="flex items-center gap-2">
          <span
            style={{
              fontSize: "var(--text-eyebrow)",
              color: "var(--color-fg-muted)",
              fontWeight: 600,
            }}
          >
            {pctDisplay}%
          </span>
          <span
            className="t-mono"
            style={{
              fontSize: "var(--text-caption)",
              fontWeight: 700,
              color: "var(--color-fg-primary)",
            }}
          >
            {value}
          </span>
        </div>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: "var(--color-bg-subtle)", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${Math.min(100, pct)}%`,
            background: color,
            borderRadius: 2,
            transition: "width 360ms ease",
          }}
        />
      </div>
    </div>
  );
};

const MilestoneTimeline: React.FC<{ items: DashboardMilestone[] }> = ({ items }) => (
  <div style={{ position: "relative", paddingLeft: 22 }}>
    {items.length > 1 && (
      <div
        style={{
          position: "absolute",
          left: 9,
          top: 12,
          bottom: 12,
          width: 1,
          background: "var(--color-border-hairline)",
        }}
      />
    )}
    <div className="flex flex-col gap-3.5">
      {items.map((item) => {
        const color = MILESTONE_COLOR[item.kind] ?? "var(--color-fg-muted)";
        return (
          <div key={getMilestoneKey(item)} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                flexShrink: 0,
                marginTop: 1,
                marginLeft: -22,
                background: "var(--color-bg-elevated)",
                border: `1.5px solid ${color}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color,
              }}
            >
              {getMilestoneIcon(item.kind)}
            </div>
            <div style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
              <p
                className="truncate"
                style={{
                  fontSize: "var(--text-caption)",
                  fontWeight: 600,
                  color: "var(--color-fg-primary)",
                }}
              >
                {item.title}
              </p>
              <p
                style={{
                  fontSize: "var(--text-eyebrow)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "var(--tracking-eyebrow)",
                  color: "var(--color-fg-muted)",
                  marginTop: 2,
                }}
              >
                {formatMilestoneKind(item.kind)}
              </p>
            </div>
            <p
              className="t-mono flex-shrink-0"
              style={{
                fontSize: "var(--text-caption)",
                fontWeight: 600,
                color: "var(--color-fg-primary)",
                paddingTop: 1,
              }}
            >
              {formatTime(item.at)}
            </p>
          </div>
        );
      })}
    </div>
  </div>
);

const FooterUpdated: React.FC<{ lastUpdatedAt: string | null }> = ({ lastUpdatedAt }) => (
  <div
    className="rounded-[10px] px-3 py-2"
    style={{
      background: "var(--color-bg-subtle)",
      border: "1px solid var(--color-border-hairline)",
    }}
  >
    <LastUpdatedRow label="Última actualización" statusLabel={formatTime(lastUpdatedAt)} statusTone="info" />
  </div>
);

/* ══════════════════════════════════════════════
   BUTTONS — Maritime Premium (solid, no glow)
══════════════════════════════════════════════ */
const VioletBtn: React.FC<{ children: React.ReactNode; onClick?: () => void; icon?: React.ReactElement }> = ({ children, onClick, icon }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full flex items-center justify-center gap-2 transition-colors active:translate-y-px"
    style={{
      padding: "11px 18px",
      borderRadius: 12,
      background: "var(--color-primary)",
      border: "1px solid var(--color-primary)",
      color: "white",
      fontSize: "var(--text-body)",
      fontWeight: 600,
      letterSpacing: "var(--tracking-base)",
    }}
  >
    {icon && <span style={{ display: "flex" }}>{icon}</span>}
    <span>{children}</span>
  </button>
);

const AmberBtn: React.FC<{ children: React.ReactNode; onClick?: () => void; icon?: React.ReactElement }> = ({ children, onClick, icon }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full flex items-center justify-center gap-2 transition-colors active:translate-y-px"
    style={{
      padding: "11px 18px",
      borderRadius: 12,
      background: "var(--color-bg-elevated)",
      border: "1px solid var(--color-border-hairline)",
      color: "var(--color-fg-primary)",
      fontSize: "var(--text-body)",
      fontWeight: 600,
      letterSpacing: "var(--tracking-base)",
    }}
  >
    {icon && <span style={{ display: "flex", color: "var(--color-fg-muted)" }}>{icon}</span>}
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
