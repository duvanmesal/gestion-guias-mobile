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

const PANEL_STYLE = {
  background: "var(--color-bg-elevated)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "24px",
  boxShadow: "12px 12px 28px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.03)",
} as const;

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
  const dateLabel =
    data?.dateContext.date ??
    formatShortDate(data?.date ?? new Date().toISOString());
  const lastUpdatedAt = data?.generatedAt ?? data?.serverTime ?? null;

  return (
    <div className="min-h-full bg-[var(--color-bg-base)] px-6 pb-8 pt-6">
      <div className="mx-auto flex w-full max-w-[400px] flex-col gap-5">
        {isSupervisor ? (
          <SupervisorHero
            dateLabel={dateLabel}
            displayName={displayName}
            isRefreshing={isRefreshing}
            lastUpdatedAt={lastUpdatedAt}
            role={role}
            summary="Resumen operativo del dia para recaladas, atenciones, turnos y capacidad del equipo."
          />
        ) : (
          <GuideHero
            availableCount={data?.guia?.atencionesDisponibles.length ?? 0}
            dateLabel={dateLabel}
            displayName={displayName}
            greeting={greeting}
            role={role}
            turno={data?.guia?.activeTurno ?? data?.guia?.nextTurno ?? null}
          />
        )}

        {errorMessage ? (
          <PanelCard>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-sm font-bold text-[var(--color-fg-primary)]">
                  No pude cargar el dashboard
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-fg-secondary)]">
                  {errorMessage}
                </p>
              </div>
              {onRetry ? (
                <PrimaryAction onClick={onRetry}>Reintentar</PrimaryAction>
              ) : null}
            </div>
          </PanelCard>
        ) : null}

        {isSupervisor ? (
          <SupervisorContent
            lastUpdatedAt={lastUpdatedAt}
            onNavigate={onNavigate}
            overview={data?.supervisor}
          />
        ) : (
          <GuideContent
            guia={data?.guia}
            lastUpdatedAt={lastUpdatedAt}
            onNavigate={onNavigate}
          />
        )}
      </div>
    </div>
  );
};

const PanelCard: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <section className={`p-[18px] ${className}`.trim()} style={PANEL_STYLE}>
    {children}
  </section>
);

const MetaPill: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <div
    className="inline-flex items-center gap-2 rounded-full px-3 py-1.5"
    style={{
      background: "rgba(34,139,84,0.12)",
      border: "1px solid rgba(34,139,84,0.3)",
    }}
  >
    {children}
  </div>
);

const InfoPill: React.FC<{
  label: string;
  value?: string;
}> = ({ label, value }) => (
  <div
    className="inline-flex items-center gap-2 rounded-full px-3 py-2"
    style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.06)",
    }}
  >
    <span className="text-[11px] font-semibold text-[var(--color-fg-muted)]">
      {label}
    </span>
    {value ? (
      <span className="text-[11px] font-bold text-[var(--color-fg-primary)]">
        {value}
      </span>
    ) : null}
  </div>
);

const GuideHero: React.FC<{
  availableCount: number;
  dateLabel: string;
  displayName: string;
  greeting: string;
  role: SessionUser["role"];
  turno: TurnoLite | null;
}> = ({ availableCount, dateLabel, displayName, greeting, role, turno }) => (
  <PanelCard>
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-[var(--color-fg-secondary)]">
          {greeting}
        </p>
        <h1 className="mt-1 break-words text-[1.45rem] font-bold leading-tight text-[var(--color-fg-primary)]">
          Hola, {displayName}
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--color-fg-secondary)]">
          {turno
            ? "Guia activa • turno en curso"
            : "Guia activa • esperando siguiente bloque operativo"}
        </p>
      </div>
      <div className="shrink-0">
        <RoleBadge role={role} />
      </div>
    </div>

    <div className="mt-4 flex flex-wrap gap-2">
      <InfoPill label="Fecha" value={dateLabel} />
      <InfoPill
        label="Disponibles"
        value={String(availableCount)}
      />
    </div>
  </PanelCard>
);

const SupervisorHero: React.FC<{
  dateLabel: string;
  displayName: string;
  isRefreshing: boolean;
  lastUpdatedAt: string | null;
  role: SessionUser["role"];
  summary: string;
}> = ({ dateLabel, displayName, isRefreshing, lastUpdatedAt, role, summary }) => (
  <PanelCard>
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-[var(--color-fg-secondary)]">
          Centro operativo
        </p>
        <h1 className="mt-1 break-words text-[1.45rem] font-bold leading-tight text-[var(--color-fg-primary)]">
          {displayName}
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--color-fg-secondary)]">
          {summary}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <RoleBadge role={role} />
        <StatusChip tone={isRefreshing ? "warning" : "success"}>
          {isRefreshing ? "Actualizando" : "Sincronizado"}
        </StatusChip>
      </div>
    </div>

    <div className="mt-4 flex flex-wrap gap-2">
      <InfoPill label="Fecha" value={dateLabel} />
      <InfoPill label="Servidor" value={formatTime(lastUpdatedAt)} />
    </div>
  </PanelCard>
);

const GuideContent: React.FC<{
  guia?: DashboardOverviewResponse["guia"];
  lastUpdatedAt: string | null;
  onNavigate?: (path: string) => void;
}> = ({ guia, lastUpdatedAt, onNavigate }) => (
  <>
    <GuideFocusCard onNavigate={onNavigate} turno={guia?.activeTurno ?? null} />
    <GuideNextTurnoCard turno={guia?.nextTurno ?? null} />
    <GuideAtencionesCard
      items={guia?.atencionesDisponibles ?? []}
      lastUpdatedAt={lastUpdatedAt}
      onNavigate={onNavigate}
    />
  </>
);

const GuideFocusCard: React.FC<{
  onNavigate?: (path: string) => void;
  turno: TurnoLite | null;
}> = ({ onNavigate, turno }) => {
  if (!turno) {
    return (
      <PanelCard>
        <SectionHeader
          description="Tu foco principal aparecera aqui cuando exista un turno activo."
          title="CurrentShiftFocusCard"
        />
        <EmptyStateCard
          description="Aun no hay un turno en curso para esta jornada."
          title="Sin turno activo"
        />
      </PanelCard>
    );
  }

  return (
    <PanelCard>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-[var(--color-fg-primary)]">
          Turno en curso
        </p>
        <StatusChip tone={getTurnoTone(turno.status)}>
          {formatTurnoStatus(turno.status)}
        </StatusChip>
      </div>

      <h2 className="mt-4 break-words text-[1.9rem] font-bold leading-tight text-[var(--color-fg-primary)]">
        Turno #{formatTurnoNumber(turno.numero)}
      </h2>
      <p className="mt-1 break-words text-[13px] font-semibold text-[var(--color-fg-secondary)]">
        {turno.atencion.recalada.buque.nombre} • {turno.atencion.recalada.codigoRecalada}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <InfoPill label="Inicio" value={formatTime(turno.atencion.fechaInicio)} />
        <InfoPill
          label="Check-in"
          value={turno.checkInAt ? formatTime(turno.checkInAt) : "Pend."}
        />
      </div>

      <p className="mt-4 text-sm leading-6 text-[var(--color-fg-secondary)]">
        Check-in {formatTime(turno.atencion.fechaInicio)} • Buque{" "}
        {turno.atencion.recalada.buque.nombre}
      </p>

      <div className="mt-4">
        <PrimaryAction onClick={() => onNavigate?.("/turnos")}>
          Registrar check-in
        </PrimaryAction>
      </div>
    </PanelCard>
  );
};

const GuideNextTurnoCard: React.FC<{
  turno: TurnoLite | null;
}> = ({ turno }) => (
  <PanelCard>
    <SectionHeader
      description="Primary guia card for activeTurno or nextTurno with direct temporal focus."
      title="Próximo turno"
    />
    {turno ? (
      <div className="mt-3 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-bold text-[var(--color-fg-primary)]">
            Turno #{formatTurnoNumber(turno.numero)}
          </span>
          <StatusChip tone={getTurnoTone(turno.status)}>
            {formatTurnoStatus(turno.status)}
          </StatusChip>
        </div>
        <p className="text-sm font-semibold text-[var(--color-fg-secondary)]">
          {turno.atencion.recalada.buque.nombre} •{" "}
          {turno.atencion.recalada.codigoRecalada}
        </p>
        <div className="flex flex-wrap gap-2">
          <InfoPill label="Inicio" value={formatTime(turno.atencion.fechaInicio)} />
          <InfoPill label="Fin" value={formatTime(turno.atencion.fechaFin)} />
        </div>
      </div>
    ) : (
      <EmptyStateCard
        description="Aun no tienes un siguiente turno asignado."
        title="Sin próximo turno"
      />
    )}
  </PanelCard>
);

const GuideAtencionesCard: React.FC<{
  items: AtencionDisponibleLite[];
  lastUpdatedAt: string | null;
  onNavigate?: (path: string) => void;
}> = ({ items, lastUpdatedAt, onNavigate }) => (
  <PanelCard>
    <SectionHeader
      description="Atenciones disponibles para la jornada actual."
      title="AvailableAtencionesListCard"
    />

    <div className="mt-3 flex flex-col gap-3">
      {items.length ? (
        items.slice(0, 3).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate?.("/atenciones")}
            className="flex w-full items-center justify-between gap-3 rounded-[18px] px-4 py-3 text-left"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--color-fg-primary)]">
                {item.recalada.buque.nombre}
              </p>
              <p className="mt-1 truncate text-xs font-medium text-[var(--color-fg-secondary)]">
                {item.recalada.codigoRecalada}
              </p>
            </div>
            <MetaPill>
              <span className="text-[11px] font-bold text-[var(--color-primary)]">
                {item.availableTurnos}
              </span>
              <span className="text-[11px] font-semibold text-[var(--color-fg-secondary)]">
                cupos
              </span>
            </MetaPill>
          </button>
        ))
      ) : (
        <EmptyStateCard
          description="Cuando existan atenciones abiertas aparecerán en este bloque."
          title="Sin atenciones disponibles"
        />
      )}
    </div>

    <div className="mt-4">
      <FooterUpdated lastUpdatedAt={lastUpdatedAt} />
    </div>
  </PanelCard>
);

const SupervisorContent: React.FC<{
  lastUpdatedAt: string | null;
  onNavigate?: (path: string) => void;
  overview?: SupervisorOverview;
}> = ({ lastUpdatedAt, onNavigate, overview }) => {
  if (!overview) {
    return (
      <PanelCard>
        <SectionHeader
          description="Cuando el payload supervisor esté disponible aparecerán sus bloques aquí."
          title="Dashboard supervisor"
        />
        <EmptyStateCard
          description="No hay información operativa para este rol en este momento."
          title="Sin datos de supervisión"
        />
      </PanelCard>
    );
  }

  const counts = overview.counts;

  return (
    <>
      <PanelCard>
        <SectionHeader
          description="Supervisor counts grid grounded in recaladas, atenciones, turnos and en-curso totals."
          title="OperationalCountsGrid"
        />
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <CountTile helper="Operacion del dia" label="Recaladas" value={counts.recaladas} />
          <CountTile helper="Inicio y fin hoy" label="Atenciones" value={counts.atenciones} />
          <CountTile helper="Cobertura operativa" label="Turnos" value={counts.turnos} />
          <CountTile
            accent
            helper="Turnos activos"
            label="En curso"
            value={counts.turnosInProgress ?? 0}
          />
        </div>
      </PanelCard>

      <PanelCard>
        <SectionHeader
          description="Capacidad actual de guías según el payload de supervisor.guides."
          title="GuideAvailabilityCard"
        />
        <div className="mt-3 grid grid-cols-3 gap-2.5">
          <MiniStat label="Activos" value={overview.guides?.activos ?? 0} />
          <MiniStat label="Asignados" value={overview.guides?.asignados ?? 0} />
          <MiniStat accent label="Libres" value={overview.guides?.libres ?? 0} />
        </div>
      </PanelCard>

      <PanelCard>
        <SectionHeader
          description="Hitos inmediatos basados en supervisor.upcoming."
          title="UpcomingMilestoneRow"
        />
        <div className="mt-3 flex flex-col gap-3">
          {overview.upcoming.length ? (
            overview.upcoming.slice(0, 3).map((item) => (
              <MilestoneRow key={getMilestoneKey(item)} item={item} />
            ))
          ) : (
            <EmptyStateCard
              description="La agenda inmediata no tiene hitos pendientes."
              title="Sin próximos hitos"
            />
          )}
        </div>
        <div className="mt-4 flex gap-3">
          <PrimaryAction onClick={() => onNavigate?.("/turnos")}>
            Abrir turnero
          </PrimaryAction>
          <GhostAction onClick={() => onNavigate?.("/recaladas")}>
            Ver recaladas
          </GhostAction>
        </div>
        <div className="mt-4">
          <FooterUpdated lastUpdatedAt={lastUpdatedAt} />
        </div>
      </PanelCard>
    </>
  );
};

const SectionHeader: React.FC<{
  description: string;
  title: string;
}> = ({ description, title }) => (
  <div>
    <p className="text-sm font-bold text-[var(--color-fg-primary)]">{title}</p>
    <p className="mt-2 text-sm leading-6 text-[var(--color-fg-secondary)]">
      {description}
    </p>
  </div>
);

const CountTile: React.FC<{
  accent?: boolean;
  helper: string;
  label: string;
  value: number;
}> = ({ accent = false, helper, label, value }) => (
  <div
    className="rounded-[20px] px-4 py-4"
    style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)",
    }}
  >
    <p className="text-[11px] font-semibold text-[var(--color-fg-muted)]">
      {label}
    </p>
    <p
      className={`mt-3 font-mono text-[1.9rem] font-bold leading-none ${
        accent ? "text-[var(--color-success)]" : "text-[var(--color-fg-primary)]"
      }`}
    >
      {value}
    </p>
    <p className="mt-3 text-[11px] font-medium text-[var(--color-fg-secondary)]">
      {helper}
    </p>
  </div>
);

const MiniStat: React.FC<{
  accent?: boolean;
  label: string;
  value: number;
}> = ({ accent = false, label, value }) => (
  <div
    className="rounded-[18px] px-3 py-3"
    style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)",
    }}
  >
    <p className="text-[11px] font-semibold text-[var(--color-fg-muted)]">
      {label}
    </p>
    <p
      className={`mt-2 font-mono text-xl font-bold ${
        accent ? "text-[var(--color-success)]" : "text-[var(--color-fg-primary)]"
      }`}
    >
      {value}
    </p>
  </div>
);

const MilestoneRow: React.FC<{ item: DashboardMilestone }> = ({ item }) => (
  <div
    className="flex items-start justify-between gap-3 rounded-[18px] px-4 py-3"
    style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)",
    }}
  >
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold text-[var(--color-fg-primary)]">
        {item.title}
      </p>
      <p className={`mt-1 text-[11px] font-semibold ${getMilestoneToneClass(item.kind)}`}>
        {formatMilestoneKind(item.kind)}
      </p>
    </div>
    <div className="text-right">
      <p className="font-mono text-sm font-bold text-[var(--color-fg-primary)]">
        {formatTime(item.at)}
      </p>
      <p className="mt-1 text-[11px] font-medium text-[var(--color-fg-secondary)]">
        Hoy
      </p>
    </div>
  </div>
);

const FooterUpdated: React.FC<{
  lastUpdatedAt: string | null;
}> = ({ lastUpdatedAt }) => (
  <div
    className="rounded-[16px] px-3 py-3"
    style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)",
    }}
  >
    <LastUpdatedRow
      label="GET /dashboard/overview"
      statusLabel={formatTime(lastUpdatedAt)}
      statusTone="info"
    />
  </div>
);

const PrimaryAction: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
}> = ({ children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full rounded-[18px] px-4 py-3 text-sm font-semibold text-white transition-transform active:scale-[0.99]"
    style={{
      background: "linear-gradient(135deg, #228B54 0%, #1A6E43 100%)",
      boxShadow: "0 12px 24px rgba(34,139,84,0.24)",
    }}
  >
    {children}
  </button>
);

const GhostAction: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
}> = ({ children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full rounded-[18px] px-4 py-3 text-sm font-semibold text-[var(--color-fg-primary)] transition-transform active:scale-[0.99]"
    style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
    }}
  >
    {children}
  </button>
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

export default DashboardNeumorphic;
