import type { CSSProperties, ReactNode } from "react";
import type { SessionUser } from "../../../core/auth/types";
import type {
  AtencionDisponibleLite,
  DashboardMilestone,
  DashboardOverviewResponse,
  SupervisorOverview,
  TurnoLite,
} from "../types/dashboard.types";
import {
  formatDateTime,
  formatMilestoneKind,
  formatShortDate,
  formatTime,
  formatTurnoStatus,
  getDisplayName,
  getGreetingByHour,
  getRoleLabel,
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

const surfaceRaisedStyle: CSSProperties = {
  background:
    "linear-gradient(145deg, var(--color-bg-elevated) 0%, var(--color-bg-glass) 100%)",
  border: "1px solid var(--color-border-glass)",
  boxShadow:
    "10px 10px 24px rgba(0, 0, 0, 0.32), -6px -6px 18px rgba(255, 255, 255, 0.03)",
};

const surfaceInsetStyle: CSSProperties = {
  background: "var(--color-bg-base)",
  border: "1px solid var(--color-border-glass)",
  boxShadow:
    "inset 2px 2px 5px rgba(0, 0, 0, 0.35), inset -2px -2px 5px rgba(255, 255, 255, 0.03)",
};

const surfaceAccentStyle: CSSProperties = {
  background:
    "linear-gradient(145deg, var(--color-primary-soft) 0%, var(--color-bg-elevated) 100%)",
  border: "1px solid var(--color-border-glow)",
  boxShadow:
    "0 10px 24px var(--color-primary-glow), 10px 10px 24px rgba(0, 0, 0, 0.32), -6px -6px 18px rgba(255, 255, 255, 0.03)",
};

const buttonPrimaryStyle: CSSProperties = {
  background: "var(--color-primary)",
  color: "var(--color-fg-primary)",
  border: "1px solid var(--color-border-glow)",
  boxShadow:
    "0 12px 24px var(--color-primary-glow), 6px 6px 16px rgba(0, 0, 0, 0.28)",
};

const DashboardNeumorphic: React.FC<DashboardNeumorphicProps> = ({
  data,
  user,
  isRefreshing = false,
  errorMessage,
  onRetry,
  onNavigate,
}) => {
  const role = data?.role ?? user?.role ?? "GUIA";
  const isSupervisor = role === "SUPERVISOR" || role === "SUPER_ADMIN";
  const displayName = getDisplayName(user);
  const greeting = getGreetingByHour();
  const roleLabel = getRoleLabel(role);
  const dateLabel =
    data?.dateContext.date ?? formatShortDate(data?.date ?? new Date().toISOString());
  const timezoneLabel = data?.dateContext.timezoneHint ?? "America/Bogota";
  const syncLabel = isRefreshing ? "Actualizando" : "Sincronizado";
  const syncTone = isRefreshing ? "warning" : "success";

  return (
    <div className="min-h-full bg-[var(--color-bg-base)] px-4 pb-6 pt-4">
      <div className="mx-auto flex w-full max-w-md flex-col gap-5">
        <StatusBar />

        <HeroCard
          greeting={greeting}
          displayName={displayName}
          roleLabel={roleLabel}
          summary={
            isSupervisor
              ? "Supervisando ritmo, capacidad y proximas tareas del puerto."
              : "Tu jornada visible en una sola mirada: turno activo, siguiente bloque y oportunidades abiertas."
          }
          dateLabel={dateLabel}
          timezoneLabel={timezoneLabel}
          syncLabel={syncLabel}
          syncTone={syncTone}
        />

        {errorMessage ? (
          <ErrorCard message={errorMessage} onRetry={onRetry} />
        ) : null}

        {isSupervisor ? (
          <SupervisorDashboardContent
            overview={data?.supervisor}
            onNavigate={onNavigate}
          />
        ) : (
          <GuideDashboardContent
            guia={data?.guia}
            onNavigate={onNavigate}
          />
        )}
      </div>
    </div>
  );
};

const StatusBar: React.FC = () => (
  <div className="flex items-center justify-between px-1 pt-1 text-sm">
    <span className="font-semibold text-[var(--color-fg-primary)]">
      {formatTime(new Date().toISOString())}
    </span>
    <div className="flex items-center gap-1.5">
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-fg-secondary)]" />
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-fg-secondary)]" />
      <span className="h-2 w-4.5 rounded-sm bg-[var(--color-fg-primary)]" />
    </div>
  </div>
);

interface HeroCardProps {
  greeting: string;
  displayName: string;
  roleLabel: string;
  summary: string;
  dateLabel: string;
  timezoneLabel: string;
  syncLabel: string;
  syncTone: "success" | "warning";
}

const HeroCard: React.FC<HeroCardProps> = ({
  greeting,
  displayName,
  roleLabel,
  summary,
  dateLabel,
  timezoneLabel,
  syncLabel,
  syncTone,
}) => (
  <Card style={surfaceRaisedStyle} className="gap-4 p-4">
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-[var(--color-primary)]">
        {greeting}
      </p>
      <div>
        <h1 className="text-[1.75rem] font-bold leading-none tracking-[-0.02em] text-[var(--color-fg-primary)]">
          {displayName}
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--color-fg-secondary)]">
          {summary}
        </p>
      </div>
    </div>

    <div className="flex items-center justify-between gap-3">
      <Pill label="Rol activo" value={roleLabel} tone="neutral" />
      <StatusPill label={syncLabel} tone={syncTone} />
    </div>

    <div className="grid grid-cols-3 gap-2.5">
      <MetaCard label="Fecha" value={dateLabel} />
      <MetaCard label="Zona" value={timezoneLabel} mono />
      <MetaCard label="Estado" value={syncLabel} accent={syncTone === "warning"} />
    </div>
  </Card>
);

const SupervisorDashboardContent: React.FC<{
  overview?: SupervisorOverview;
  onNavigate?: (path: string) => void;
}> = ({ overview, onNavigate }) => {
  const counts = overview?.counts;
  const guides = overview?.guides;
  const available = counts?.turnosAvailable ?? 0;
  const canceled = counts?.turnosCanceled ?? 0;
  const assigned = counts?.turnosAssigned ?? 0;
  const done = counts?.turnosDone ?? 0;
  const statusLabel = available > 0 || canceled > 0 ? "Atencion" : "Estable";

  return (
    <>
      <Card style={surfaceRaisedStyle} className="gap-3.5 p-4">
        <SectionHeading title="Resumen operativo" />
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Recaladas" value={counts?.recaladas ?? 0} />
          <StatCard label="Atenciones" value={counts?.atenciones ?? 0} />
          <StatCard label="Turnos" value={counts?.turnos ?? 0} />
          <StatCard
            label="En curso"
            value={counts?.turnosInProgress ?? 0}
            accent
          />
        </div>
        <div className="grid grid-cols-4 gap-2.5">
          <MiniStatCard label="Asignados" value={assigned} />
          <MiniStatCard label="Sin asignar" value={available} tone="accent" />
          <MiniStatCard label="Finalizados" value={done} />
          <MiniStatCard label="Cancelados" value={canceled} tone="danger" />
        </div>
      </Card>

      <Card style={surfaceRaisedStyle} className="gap-3.5 p-4">
        <SectionHeading title="Alertas operativas" />
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-[var(--color-fg-muted)]">
            Pulso del dia
          </span>
          <StatusPill
            label={statusLabel}
            tone={statusLabel === "Estable" ? "success" : "warning"}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <AlertMetricCard
            label="Turnos sin asignar"
            value={available}
            tone="accent"
          />
          <AlertMetricCard
            label="Turnos cancelados"
            value={canceled}
            tone="danger"
          />
        </div>
        <ActionRow
          label="Abrir turnero para reasignar pendientes"
          actionLabel="Ir"
          onClick={() => onNavigate?.("/turnos")}
        />
      </Card>

      <Card style={surfaceRaisedStyle} className="gap-3.5 p-4">
        <SectionHeading title="Capacidad de guias" />
        <div className="grid grid-cols-3 gap-3">
          <GuideCapacityCard label="Activos" value={guides?.activos ?? 0} />
          <GuideCapacityCard label="Asignados" value={guides?.asignados ?? 0} />
          <GuideCapacityCard
            label="Libres"
            value={guides?.libres ?? 0}
            accent
          />
        </div>
        <ActionRow
          label="Cobertura actual de guias para el bloque operativo"
          actionLabel={getCoverageLabel(guides)}
          tone="accent"
        />
      </Card>

      <Card style={surfaceRaisedStyle} className="gap-3 p-4">
        <SectionHeading title="Proximas tareas" />
        {overview?.upcoming?.length ? (
          overview.upcoming.slice(0, 4).map((item) => (
            <MilestoneRow key={getMilestoneKey(item)} item={item} />
          ))
        ) : (
          <EmptyStateCard
            title="Sin hitos proximos"
            description="La agenda operativa inmediata no tiene eventos pendientes."
          />
        )}
      </Card>
    </>
  );
};

const GuideDashboardContent: React.FC<{
  guia?: DashboardOverviewResponse["guia"];
  onNavigate?: (path: string) => void;
}> = ({ guia, onNavigate }) => (
  <>
    <GuideActiveTurnoCard
      turno={guia?.activeTurno ?? null}
      onNavigate={onNavigate}
    />

    <Card style={surfaceRaisedStyle} className="gap-3.5 p-4">
      <SectionHeading title="Proximo turno" />
      {guia?.nextTurno ? (
        <>
          <div className="flex items-center justify-between gap-3">
            <StatusPill
              label={formatTurnoStatus(guia.nextTurno.status)}
              tone={getTurnoTone(guia.nextTurno.status)}
            />
            <span className="font-mono text-sm font-bold text-[var(--color-fg-secondary)]">
              #{formatTurnoNumber(guia.nextTurno.numero)}
            </span>
          </div>
          <TimelineRow turno={guia.nextTurno} />
        </>
      ) : (
        <EmptyStateCard
          title="Sin proximo turno"
          description="Aun no hay un siguiente bloque asignado para tu jornada."
        />
      )}
    </Card>

    <Card style={surfaceRaisedStyle} className="gap-3 p-4">
      <SectionHeading title="Atenciones disponibles" />
      {guia?.atencionesDisponibles?.length ? (
        <>
          {guia.atencionesDisponibles.slice(0, 3).map((item) => (
            <AvailableAtencionRow
              key={item.id}
              item={item}
              onOpen={() => onNavigate?.("/atenciones")}
            />
          ))}
          <div className="grid grid-cols-2 gap-3">
            <MetaCard
              label="Inicio sugerido"
              value={formatDateTime(guia.atencionesDisponibles[0]?.fechaInicio)}
              mono
            />
            <MetaCard
              label="Fin estimado"
              value={formatDateTime(guia.atencionesDisponibles[0]?.fechaFin)}
              mono
            />
          </div>
        </>
      ) : (
        <EmptyStateCard
          title="Sin atenciones libres"
          description="Cuando existan oportunidades abiertas apareceran en este bloque."
        />
      )}
    </Card>
  </>
);

const GuideActiveTurnoCard: React.FC<{
  turno: TurnoLite | null;
  onNavigate?: (path: string) => void;
}> = ({ turno, onNavigate }) => {
  if (!turno) {
    return (
      <Card style={surfaceRaisedStyle} className="gap-3.5 p-4">
        <SectionHeading title="Turno en curso" />
        <EmptyStateCard
          title="Sin turno activo"
          description="Tu tablero esta listo para cuando comience una operacion en curso."
        />
      </Card>
    );
  }

  return (
    <Card style={surfaceAccentStyle} className="gap-3.5 p-4">
      <SectionHeading title="Turno en curso" />
      <div className="flex items-center justify-between gap-3">
        <StatusPill
          label={formatTurnoStatus(turno.status)}
          tone={getTurnoTone(turno.status)}
        />
        <span className="font-mono text-base font-bold text-[var(--color-fg-secondary)]">
          #{formatTurnoNumber(turno.numero)}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-[-0.02em] text-[var(--color-fg-primary)]">
          {turno.atencion.recalada.buque.nombre}
        </h2>
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-fg-secondary)]">
          {turno.atencion.recalada.codigoRecalada}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <MetaCard label="Inicio" value={formatTime(turno.atencion.fechaInicio)} mono />
        <MetaCard label="Fin" value={formatTime(turno.atencion.fechaFin)} mono />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <MetaCard
          label="Check-in"
          value={turno.checkInAt ? formatTime(turno.checkInAt) : "Pendiente"}
          mono
        />
        <MetaCard
          label="Check-out"
          value={turno.checkOutAt ? formatTime(turno.checkOutAt) : "Pendiente"}
          accent={!turno.checkOutAt}
          mono
        />
      </div>

      <button
        type="button"
        onClick={() => onNavigate?.("/turnos")}
        className="flex w-full items-center justify-between rounded-[18px] px-4 py-3 text-sm font-semibold transition-transform active:scale-[0.99]"
        style={buttonPrimaryStyle}
      >
        <span>Abrir mis turnos</span>
        <span className="text-xs font-semibold text-[var(--color-fg-secondary)]">
          Ver detalle
        </span>
      </button>
    </Card>
  );
};

const ErrorCard: React.FC<{
  message: string;
  onRetry?: () => void;
}> = ({ message, onRetry }) => (
  <Card style={surfaceRaisedStyle} className="gap-3 p-4">
    <div>
      <p className="text-sm font-semibold text-[var(--color-danger)]">
        No pude cargar el dashboard
      </p>
      <p className="mt-1 text-sm leading-6 text-[var(--color-fg-secondary)]">
        {message}
      </p>
    </div>
    {onRetry ? (
      <button
        type="button"
        onClick={onRetry}
        className="w-full rounded-[18px] px-4 py-3 text-sm font-semibold text-[var(--color-fg-primary)] transition-transform active:scale-[0.99]"
        style={surfaceInsetStyle}
      >
        Reintentar
      </button>
    ) : null}
  </Card>
);

const Card: React.FC<{
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}> = ({ children, className = "", style }) => (
  <div className={`flex flex-col rounded-3xl ${className}`} style={style}>
    {children}
  </div>
);

const SectionHeading: React.FC<{ title: string }> = ({ title }) => (
  <h2 className="text-base font-semibold text-[var(--color-fg-primary)]">
    {title}
  </h2>
);

const Pill: React.FC<{
  label: string;
  value: string;
  tone?: "neutral" | "success" | "warning";
}> = ({ label, value, tone = "neutral" }) => (
  <div
    className="flex min-w-0 flex-col rounded-full px-3 py-2"
    style={surfaceInsetStyle}
  >
    <span className="text-[0.6875rem] font-medium text-[var(--color-fg-muted)]">
      {label}
    </span>
    <span
      className={`truncate text-xs font-semibold ${
        tone === "success"
          ? "text-[var(--color-primary)]"
          : tone === "warning"
            ? "text-[var(--color-accent)]"
            : "text-[var(--color-fg-primary)]"
      }`}
    >
      {value}
    </span>
  </div>
);

const StatusPill: React.FC<{
  label: string;
  tone: "success" | "warning" | "info" | "danger";
}> = ({ label, tone }) => {
  const toneClass =
    tone === "success"
      ? "status-chip-success"
      : tone === "warning"
        ? "status-chip-warning"
        : tone === "danger"
          ? "border border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]"
          : "status-chip-info";

  return (
    <span className={`status-chip ${toneClass}`}>
      {tone === "success" ? (
        <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
      ) : null}
      {label}
    </span>
  );
};

const MetaCard: React.FC<{
  label: string;
  value: string;
  accent?: boolean;
  mono?: boolean;
}> = ({ label, value, accent = false, mono = false }) => (
  <div className="rounded-[18px] px-3 py-2.5" style={surfaceInsetStyle}>
    <p className="text-[0.625rem] font-medium uppercase tracking-[0.08em] text-[var(--color-fg-muted)]">
      {label}
    </p>
    <p
      className={`mt-1 text-xs font-semibold ${
        mono ? "font-mono" : ""
      } ${accent ? "text-[var(--color-accent)]" : "text-[var(--color-fg-secondary)]"}`}
    >
      {value}
    </p>
  </div>
);

const StatCard: React.FC<{
  label: string;
  value: number;
  accent?: boolean;
}> = ({ label, value, accent = false }) => (
  <div
    className="rounded-[18px] p-3.5"
    style={accent ? surfaceAccentStyle : surfaceInsetStyle}
  >
    <p className="text-[0.6875rem] font-medium text-[var(--color-fg-muted)]">
      {label}
    </p>
    <p
      className={`mt-2 text-[1.625rem] font-bold leading-none tracking-[-0.02em] ${
        accent ? "text-[var(--color-primary)]" : "text-[var(--color-fg-primary)]"
      }`}
    >
      {value}
    </p>
  </div>
);

const MiniStatCard: React.FC<{
  label: string;
  value: number;
  tone?: "default" | "accent" | "danger";
}> = ({ label, value, tone = "default" }) => (
  <div className="rounded-[18px] px-3 py-2.5" style={surfaceInsetStyle}>
    <p className="text-[0.625rem] font-medium text-[var(--color-fg-muted)]">
      {label}
    </p>
    <p
      className={`mt-1 text-sm font-semibold ${
        tone === "accent"
          ? "text-[var(--color-accent)]"
          : tone === "danger"
            ? "text-[var(--color-danger)]"
            : "text-[var(--color-fg-primary)]"
      }`}
    >
      {value}
    </p>
  </div>
);

const AlertMetricCard: React.FC<{
  label: string;
  value: number;
  tone: "accent" | "danger";
}> = ({ label, value, tone }) => (
  <div className="rounded-[18px] p-3.5" style={surfaceInsetStyle}>
    <p className="text-[0.6875rem] font-medium text-[var(--color-fg-muted)]">
      {label}
    </p>
    <p
      className={`mt-2 text-2xl font-bold leading-none ${
        tone === "accent"
          ? "text-[var(--color-accent)]"
          : "text-[var(--color-danger)]"
      }`}
    >
      {value}
    </p>
  </div>
);

const ActionRow: React.FC<{
  label: string;
  actionLabel: string;
  onClick?: () => void;
  tone?: "default" | "accent";
}> = ({ label, actionLabel, onClick, tone = "default" }) => {
  const clickable = typeof onClick === "function";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      className="flex items-center justify-between rounded-[18px] px-3.5 py-3 text-left transition-transform active:scale-[0.99] disabled:cursor-default"
      style={surfaceInsetStyle}
    >
      <span className="text-xs font-medium text-[var(--color-fg-secondary)]">
        {label}
      </span>
      <span
        className={`ml-3 shrink-0 text-xs font-bold ${
          tone === "accent"
            ? "text-[var(--color-accent)]"
            : "text-[var(--color-primary)]"
        }`}
      >
        {actionLabel}
      </span>
    </button>
  );
};

const GuideCapacityCard: React.FC<{
  label: string;
  value: number;
  accent?: boolean;
}> = ({ label, value, accent = false }) => (
  <div className="rounded-[18px] p-3.5" style={surfaceInsetStyle}>
    <p className="text-[0.6875rem] font-medium text-[var(--color-fg-muted)]">
      {label}
    </p>
    <p
      className={`mt-2 text-2xl font-bold leading-none ${
        accent ? "text-[var(--color-primary)]" : "text-[var(--color-fg-primary)]"
      }`}
    >
      {value}
    </p>
  </div>
);

const MilestoneRow: React.FC<{ item: DashboardMilestone }> = ({ item }) => (
  <div
    className="flex items-center justify-between gap-3 rounded-[18px] px-3 py-3"
    style={surfaceInsetStyle}
  >
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold text-[var(--color-fg-primary)]">
        {item.title}
      </p>
      <p
        className={`mt-0.5 text-xs font-medium ${getMilestoneToneClass(
          item.kind
        )}`}
      >
        {formatMilestoneKind(item.kind)}
      </p>
    </div>
    <div className="shrink-0 text-right">
      <p className="font-mono text-sm font-bold text-[var(--color-fg-secondary)]">
        {formatTime(item.at)}
      </p>
      <p className="mt-0.5 text-xs text-[var(--color-fg-muted)]">
        {formatShortDate(item.at)}
      </p>
    </div>
  </div>
);

const TimelineRow: React.FC<{ turno: TurnoLite }> = ({ turno }) => (
  <div
    className="flex items-center justify-between gap-3 rounded-[18px] px-3.5 py-3.5"
    style={surfaceInsetStyle}
  >
    <div className="min-w-0">
      <p className="truncate text-[0.9375rem] font-semibold text-[var(--color-fg-primary)]">
        {turno.atencion.recalada.buque.nombre}
      </p>
      <p className="mt-0.5 font-mono text-[0.6875rem] font-medium text-[var(--color-fg-secondary)]">
        {turno.atencion.recalada.codigoRecalada}
      </p>
    </div>
    <div className="shrink-0 text-right">
      <p className="font-mono text-sm font-bold text-[var(--color-fg-secondary)]">
        {formatTime(turno.atencion.fechaInicio)}
      </p>
      <p className="mt-0.5 text-xs text-[var(--color-fg-muted)]">
        hasta {formatTime(turno.atencion.fechaFin)}
      </p>
    </div>
  </div>
);

const AvailableAtencionRow: React.FC<{
  item: AtencionDisponibleLite;
  onOpen?: () => void;
}> = ({ item, onOpen }) => {
  const tone =
    item.availableTurnos >= 3
      ? "success"
      : item.availableTurnos >= 2
        ? "warning"
        : "info";

  return (
    <div
      className="flex items-center justify-between gap-3 rounded-[18px] px-3 py-3"
      style={surfaceInsetStyle}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-[var(--color-fg-primary)]">
          {item.recalada.buque.nombre}
        </p>
        <p className="mt-0.5 font-mono text-[0.6875rem] font-medium text-[var(--color-fg-secondary)]">
          {item.recalada.codigoRecalada}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <StatusPill
          label={pluralize(
            item.availableTurnos,
            "cupo",
            "cupos"
          )}
          tone={tone}
        />
        <button
          type="button"
          onClick={onOpen}
          className="text-xs font-bold text-[var(--color-primary)]"
        >
          Ver
        </button>
      </div>
    </div>
  );
};

const EmptyStateCard: React.FC<{
  title: string;
  description: string;
}> = ({ title, description }) => (
  <div className="rounded-[18px] p-4 text-center" style={surfaceInsetStyle}>
    <p className="text-sm font-semibold text-[var(--color-fg-primary)]">
      {title}
    </p>
    <p className="mt-1 text-sm leading-6 text-[var(--color-fg-muted)]">
      {description}
    </p>
  </div>
);

function formatTurnoNumber(value: number): string {
  return String(value).padStart(3, "0");
}

function getTurnoTone(
  status?: string | null
): "success" | "warning" | "info" | "danger" {
  switch (status) {
    case "IN_PROGRESS":
    case "COMPLETED":
      return "success";
    case "AVAILABLE":
      return "warning";
    case "CANCELED":
    case "NO_SHOW":
      return "danger";
    case "ASSIGNED":
    default:
      return "info";
  }
}

function getMilestoneToneClass(kind: DashboardMilestone["kind"]): string {
  switch (kind) {
    case "RECALADA_ARRIVAL":
      return "text-[var(--color-info)]";
    case "ATENCION_START":
      return "text-[var(--color-primary)]";
    case "ATENCION_END":
      return "text-[var(--color-accent)]";
    case "RECALADA_DEPARTURE":
    default:
      return "text-[var(--color-fg-secondary)]";
  }
}

function getMilestoneKey(item: DashboardMilestone): string {
  return [item.kind, item.at, item.title, item.ref.recaladaId, item.ref.atencionId]
    .filter(Boolean)
    .join("-");
}

function getCoverageLabel(
  guides?: SupervisorOverview["guides"]
): string {
  const activos = guides?.activos ?? 0;
  const asignados = guides?.asignados ?? 0;

  if (activos <= 0) return "0%";

  return `${Math.round((asignados / activos) * 100)}%`;
}

export default DashboardNeumorphic;
