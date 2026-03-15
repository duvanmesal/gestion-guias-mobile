import { IonContent, IonPage } from "@ionic/react";
import { useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { logoutCurrentSession } from "../../../core/auth/sessionLifecycle";
import { useSessionStore } from "../../../core/auth/sessionStore";
import LoadingScreen from "../../../ui/components/LoadingScreen";
import { useDashboardOverview } from "../hooks/useDashboardOverview";
import type {
  AtencionDisponibleLite,
  DashboardMilestone,
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

interface QuickAction {
  key: string;
  label: string;
  helper: string;
  onClick: () => void;
  icon:
    | "profile"
    | "refresh"
    | "logout"
    | "turnos"
    | "recaladas"
    | "atenciones"
    | "edit";
}

const HomePage: React.FC = () => {
  const history = useHistory();
  const user = useSessionStore((s) => s.user);
  const { data, isLoading, isFetching, error, refetch } =
    useDashboardOverview();
  const [loggingOut, setLoggingOut] = useState(false);

  const role = data?.role ?? user?.role ?? "GUIA";
  const displayName = getDisplayName(user);
  const greeting = getGreetingByHour();
  const roleLabel = getRoleLabel(role);
  const isSupervisor = role === "SUPERVISOR" || role === "SUPER_ADMIN";

  const quickActions = useMemo<QuickAction[]>(() => {
    const common: QuickAction[] = [
      {
        key: "profile",
        label: "Mi cuenta",
        helper: "Ver perfil",
        onClick: () => history.push("/profile"),
        icon: "profile",
      },
      {
        key: "edit-profile",
        label: "Editar perfil",
        helper: "Actualizar datos",
        onClick: () => history.push("/profile/edit"),
        icon: "edit",
      },
      {
        key: "refresh",
        label: isFetching ? "Actualizando" : "Actualizar",
        helper: "Refrescar resumen",
        onClick: () => {
          void refetch();
        },
        icon: "refresh",
      },
      {
        key: "logout",
        label: loggingOut ? "Cerrando" : "Salir",
        helper: "Cerrar sesión",
        onClick: async () => {
          try {
            setLoggingOut(true);
            await logoutCurrentSession();
          } finally {
            setLoggingOut(false);
          }
        },
        icon: "logout",
      },
    ];

    if (isSupervisor) {
      return [
        {
          key: "turnos",
          label: "Turnero",
          helper: "Vista operativa",
          onClick: () => history.push("/turnos"),
          icon: "turnos",
        },
        {
          key: "recaladas",
          label: "Recaladas",
          helper: "Agenda madre",
          onClick: () => history.push("/recaladas"),
          icon: "recaladas",
        },
        ...common,
      ];
    }

    return [
      {
        key: "turnos",
        label: "Mis turnos",
        helper: "Agenda personal",
        onClick: () => history.push("/turnos"),
        icon: "turnos",
      },
      {
        key: "atenciones",
        label: "Atenciones",
        helper: "Oportunidades abiertas",
        onClick: () => history.push("/atenciones"),
        icon: "atenciones",
      },
      ...common,
    ];
  }, [history, isFetching, isSupervisor, loggingOut, refetch]);

  if (isLoading && !data) {
    return <LoadingScreen message="Cargando tu centro de operaciones..." />;
  }

  return (
    <IonPage>
      <IonContent scrollY={true}>
        <div className="relative min-h-screen overflow-hidden bg-[#0F1419]">
          <BackgroundOrbs />

          <div className="relative z-10 px-5 pb-14 pt-8">
            <header
              className="rounded-[28px] border px-5 py-5"
              style={{
                background:
                  "linear-gradient(180deg, rgba(19, 28, 38, 0.9) 0%, rgba(15, 20, 25, 0.96) 100%)",
                borderColor: "rgba(255,255,255,0.08)",
                boxShadow: "0 24px 80px rgba(0,0,0,0.28)",
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: "#BF9B30" }}
                  >
                    {greeting}
                  </p>

                  <h1
                    className="mt-1 text-[28px] font-bold leading-tight"
                    style={{ color: "#F5F7FA" }}
                  >
                    {displayName}
                  </h1>

                  <p
                    className="mt-2 text-sm leading-6"
                    style={{ color: "#AAB4BE" }}
                  >
                    {isSupervisor
                      ? "Hoy mandas sobre el tablero operativo: vigilancia, asignación y ritmo del puerto."
                      : "Tu jornada ya tiene brújula: próximos turnos, oportunidades y estado semanal en un solo vistazo."}
                  </p>
                </div>

                <div
                  className="shrink-0 rounded-2xl border px-3 py-2 text-right"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderColor: "rgba(255,255,255,0.08)",
                  }}
                >
                  <p
                    className="text-[11px] uppercase tracking-[0.18em]"
                    style={{ color: "#8A939D" }}
                  >
                    Rol activo
                  </p>
                  <p
                    className="mt-1 text-sm font-semibold"
                    style={{ color: "#F5F7FA" }}
                  >
                    {roleLabel}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <MetaPill
                  label="Fecha"
                  value={
                    data?.dateContext.date ??
                    formatShortDate(new Date().toISOString())
                  }
                />
                <MetaPill
                  label="Zona"
                  value={data?.dateContext.timezoneHint ?? "UTC-05:00"}
                />
                <MetaPill
                  label="Estado"
                  value={isFetching ? "Actualizando" : "Sincronizado"}
                  accent={isFetching ? "#BF9B30" : "#34D399"}
                />
              </div>
            </header>

            <section className="mt-6">
              <SectionTitle
                title="Accesos rápidos"
                subtitle="Botones cortos, pasos largos."
              />
              <div className="mt-3 grid grid-cols-2 gap-3">
                {quickActions.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={item.onClick}
                    disabled={
                      item.key === "refresh"
                        ? isFetching
                        : loggingOut && item.key === "logout"
                    }
                    className="rounded-[24px] border p-4 text-left transition active:scale-[0.98]"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      borderColor: "rgba(255,255,255,0.08)",
                    }}
                  >
                    <div
                      className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl"
                      style={{ background: getQuickActionBg(item.icon) }}
                    >
                      <ActionIcon icon={item.icon} />
                    </div>

                    <p
                      className="text-sm font-semibold"
                      style={{ color: "#F5F7FA" }}
                    >
                      {item.label}
                    </p>

                    <p
                      className="mt-1 text-xs leading-5"
                      style={{ color: "#8A939D" }}
                    >
                      {item.helper}
                    </p>
                  </button>
                ))}
              </div>
            </section>

            {error && (
              <section className="mt-6">
                <div
                  className="rounded-[24px] border px-4 py-4"
                  style={{
                    background: "rgba(127,29,29,0.2)",
                    borderColor: "rgba(248,113,113,0.35)",
                  }}
                >
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "#FCA5A5" }}
                  >
                    No pude cargar el dashboard
                  </p>

                  <p className="mt-1 text-sm" style={{ color: "#FECACA" }}>
                    {error instanceof Error
                      ? error.message
                      : "Intenta nuevamente."}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      void refetch();
                    }}
                    className="mt-3 rounded-2xl px-4 py-2 text-sm font-semibold"
                    style={{ background: "#7F1D1D", color: "#FFF1F2" }}
                  >
                    Reintentar
                  </button>
                </div>
              </section>
            )}

            {isSupervisor ? (
              <SupervisorDashboard
                overview={data?.supervisor}
                onOpenModule={(path) => history.push(path)}
              />
            ) : (
              <GuideDashboard
                activeTurno={data?.guia?.activeTurno ?? null}
                nextTurno={data?.guia?.nextTurno ?? null}
                atencionesDisponibles={data?.guia?.atencionesDisponibles ?? []}
                onOpenModule={(path) => history.push(path)}
              />
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

const SupervisorDashboard: React.FC<{
  overview?: SupervisorOverview;
  onOpenModule: (path: string) => void;
}> = ({ overview, onOpenModule }) => {
  const counts = overview?.counts;
  const guides = overview?.guides;
  const upcoming = overview?.upcoming ?? [];
  const available = counts?.turnosAvailable ?? 0;
  const canceled = counts?.turnosCanceled ?? 0;

  return (
    <>
      <section className="mt-6">
        <SectionTitle
          title="Resumen de estado"
          subtitle="El pulso de la operación de hoy."
        />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <StatCard
            label="Recaladas"
            value={counts?.recaladas ?? 0}
            tone="green"
          />
          <StatCard
            label="Atenciones"
            value={counts?.atenciones ?? 0}
            tone="gold"
          />
          <StatCard
            label="Turnos"
            value={counts?.turnos ?? 0}
            tone="blue"
          />
          <StatCard
            label="En curso"
            value={counts?.turnosInProgress ?? 0}
            tone="purple"
          />
        </div>
      </section>

      <section className="mt-6 grid gap-4">
        <CardBox>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p
                className="text-base font-semibold"
                style={{ color: "#F5F7FA" }}
              >
                Alertas operativas
              </p>
              <p className="mt-1 text-sm" style={{ color: "#8A939D" }}>
                Semáforos para actuar sin esperar incendios.
              </p>
            </div>

            <StatusBadge
              label={available > 0 || canceled > 0 ? "Atención" : "Estable"}
              tone={available > 0 || canceled > 0 ? "warning" : "success"}
            />
          </div>

          <div className="mt-4 space-y-3">
            <AlertRow
              label={pluralize(
                available,
                "turno sin asignar",
                "turnos sin asignar"
              )}
              helper="Conviene revisar el turnero"
              tone={available > 0 ? "warning" : "neutral"}
            />
            <AlertRow
              label={pluralize(
                canceled,
                "turno cancelado",
                "turnos cancelados"
              )}
              helper="Puede requerir reasignación"
              tone={canceled > 0 ? "danger" : "neutral"}
            />
          </div>

          <button
            type="button"
            onClick={() => onOpenModule("/turnos")}
            className="mt-4 rounded-2xl px-4 py-3 text-sm font-semibold"
            style={{ background: "#BF9B30", color: "#111827" }}
          >
            Ir al turnero
          </button>
        </CardBox>

        <CardBox>
          <p
            className="text-base font-semibold"
            style={{ color: "#F5F7FA" }}
          >
            Guías hoy
          </p>
          <p className="mt-1 text-sm" style={{ color: "#8A939D" }}>
            Capacidad humana disponible para mover la jornada.
          </p>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <MiniMetric label="Activos" value={guides?.activos ?? 0} />
            <MiniMetric label="Asignados" value={guides?.asignados ?? 0} />
            <MiniMetric label="Libres" value={guides?.libres ?? 0} />
          </div>
        </CardBox>
      </section>

      <section className="mt-6">
        <SectionTitle
          title="Próximas tareas"
          subtitle="Lo que viene rodando en las próximas horas."
        />
        <div className="mt-3 space-y-3">
          {upcoming.length > 0 ? (
            upcoming
              .slice(0, 5)
              .map((item) => (
                <MilestoneRow
                  key={`${item.kind}-${item.at}-${item.title}`}
                  item={item}
                />
              ))
          ) : (
            <EmptyCard
              title="Sin hitos próximos"
              subtitle="Por ahora el tablero está tranquilo."
            />
          )}
        </div>
      </section>
    </>
  );
};

const GuideDashboard: React.FC<{
  activeTurno: TurnoLite | null;
  nextTurno: TurnoLite | null;
  atencionesDisponibles: AtencionDisponibleLite[];
  onOpenModule: (path: string) => void;
}> = ({ activeTurno, nextTurno, atencionesDisponibles, onOpenModule }) => {
  return (
    <>
      <section className="mt-6 grid gap-4">
        {activeTurno ? (
          <CardBox>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <StatusDot color="#34D399" />
                  <p
                    className="text-base font-semibold"
                    style={{ color: "#F5F7FA" }}
                  >
                    Turno en curso
                  </p>
                </div>
                <p className="mt-1 text-sm" style={{ color: "#8A939D" }}>
                  Ya tienes la brújula prendida. Sigue el ritmo.
                </p>
              </div>

              <StatusBadge
                label={formatTurnoStatus(activeTurno.status)}
                tone="success"
              />
            </div>

            <TurnoSummary turno={activeTurno} />

            <button
              type="button"
              onClick={() => onOpenModule("/turnos")}
              className="mt-4 rounded-2xl px-4 py-3 text-sm font-semibold"
              style={{ background: "#228B54", color: "#F5F7FA" }}
            >
              Abrir mis turnos
            </button>
          </CardBox>
        ) : (
          <EmptyCard
            title="Sin turno activo"
            subtitle="Todavía no hay nada en marcha, pero tu tablero ya está listo para reaccionar."
          />
        )}

        <CardBox>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p
                className="text-base font-semibold"
                style={{ color: "#F5F7FA" }}
              >
                Próximo turno
              </p>
              <p className="mt-1 text-sm" style={{ color: "#8A939D" }}>
                Tu siguiente parada en la ruta del día.
              </p>
            </div>

            <StatusBadge
              label={nextTurno ? formatTurnoStatus(nextTurno.status) : "Pendiente"}
              tone="info"
            />
          </div>

          {nextTurno ? (
            <TurnoSummary turno={nextTurno} compact />
          ) : (
            <p className="mt-4 text-sm leading-6" style={{ color: "#AAB4BE" }}>
              Aún no hay un siguiente turno asignado. Revisa las atenciones
              disponibles para tomar una oportunidad.
            </p>
          )}
        </CardBox>
      </section>

      <section className="mt-6">
        <SectionTitle
          title="Atenciones disponibles"
          subtitle="Espacios abiertos para moverte rápido."
        />
        <div className="mt-3 space-y-3">
          {atencionesDisponibles.length > 0 ? (
            atencionesDisponibles.slice(0, 4).map((item) => (
              <AvailableAtencionRow
                key={item.id}
                item={item}
                onOpen={() => onOpenModule("/atenciones")}
              />
            ))
          ) : (
            <EmptyCard
              title="Sin atenciones libres"
              subtitle="Por ahora no hay cupos abiertos. El tablero te avisará cuando aparezcan."
            />
          )}
        </div>
      </section>
    </>
  );
};

const TurnoSummary: React.FC<{ turno: TurnoLite; compact?: boolean }> = ({
  turno,
  compact = false,
}) => {
  return (
    <div className="mt-4 space-y-3">
      <div
        className="rounded-2xl border px-4 py-4"
        style={{
          background: "rgba(255,255,255,0.04)",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p
              className="text-sm font-semibold"
              style={{ color: "#F5F7FA" }}
            >
              #{turno.numero} · {turno.atencion.recalada.buque.nombre}
            </p>
            <p className="mt-1 text-xs" style={{ color: "#8A939D" }}>
              {turno.atencion.recalada.codigoRecalada}
            </p>
          </div>

          <div className="text-right">
            <p
              className="text-sm font-semibold"
              style={{ color: "#E5E7EB" }}
            >
              {formatTime(turno.atencion.fechaInicio)}
            </p>
            <p className="text-xs" style={{ color: "#8A939D" }}>
              hasta {formatTime(turno.atencion.fechaFin)}
            </p>
          </div>
        </div>
      </div>

      {!compact && (
        <div className="grid grid-cols-2 gap-3">
          <MiniInfo
            label="Inicio"
            value={formatDateTime(turno.atencion.fechaInicio)}
          />
          <MiniInfo
            label="Fin"
            value={formatDateTime(turno.atencion.fechaFin)}
          />
        </div>
      )}
    </div>
  );
};

const AvailableAtencionRow: React.FC<{
  item: AtencionDisponibleLite;
  onOpen: () => void;
}> = ({ item, onOpen }) => {
  return (
    <CardBox>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className="text-sm font-semibold"
            style={{ color: "#F5F7FA" }}
          >
            {item.recalada.buque.nombre}
          </p>
          <p className="mt-1 text-xs" style={{ color: "#8A939D" }}>
            {item.recalada.codigoRecalada}
          </p>
        </div>

        <StatusBadge
          label={pluralize(item.availableTurnos, "cupo", "cupos")}
          tone={item.availableTurnos > 0 ? "success" : "neutral"}
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <MiniInfo label="Inicio" value={formatDateTime(item.fechaInicio)} />
        <MiniInfo label="Fin" value={formatDateTime(item.fechaFin)} />
      </div>

      <button
        type="button"
        onClick={onOpen}
        className="mt-4 rounded-2xl border px-4 py-3 text-sm font-semibold"
        style={{
          background: "rgba(255,255,255,0.04)",
          borderColor: "rgba(255,255,255,0.08)",
          color: "#F5F7FA",
        }}
      >
        Ver atenciones
      </button>
    </CardBox>
  );
};

const MilestoneRow: React.FC<{ item: DashboardMilestone }> = ({ item }) => {
  return (
    <CardBox>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className="text-sm font-semibold"
            style={{ color: "#F5F7FA" }}
          >
            {item.title}
          </p>
          <p className="mt-1 text-xs" style={{ color: "#8A939D" }}>
            {formatMilestoneKind(item.kind)}
          </p>
        </div>

        <div className="text-right">
          <p
            className="text-sm font-semibold"
            style={{ color: "#E5E7EB" }}
          >
            {formatTime(item.at)}
          </p>
          <p className="text-xs" style={{ color: "#8A939D" }}>
            {formatShortDate(item.at)}
          </p>
        </div>
      </div>
    </CardBox>
  );
};

const SectionTitle: React.FC<{ title: string; subtitle: string }> = ({
  title,
  subtitle,
}) => (
  <div>
    <h2 className="text-lg font-semibold" style={{ color: "#F5F7FA" }}>
      {title}
    </h2>
    <p className="mt-1 text-sm" style={{ color: "#8A939D" }}>
      {subtitle}
    </p>
  </div>
);

const CardBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    className="rounded-[24px] border px-4 py-4"
    style={{
      background: "rgba(255,255,255,0.05)",
      borderColor: "rgba(255,255,255,0.08)",
      boxShadow: "0 16px 40px rgba(0,0,0,0.16)",
    }}
  >
    {children}
  </div>
);

const EmptyCard: React.FC<{ title: string; subtitle: string }> = ({
  title,
  subtitle,
}) => (
  <CardBox>
    <p className="text-base font-semibold" style={{ color: "#F5F7FA" }}>
      {title}
    </p>
    <p className="mt-2 text-sm leading-6" style={{ color: "#AAB4BE" }}>
      {subtitle}
    </p>
  </CardBox>
);

const StatCard: React.FC<{
  label: string;
  value: number;
  tone: "green" | "gold" | "blue" | "purple";
}> = ({ label, value, tone }) => {
  const palette = getTonePalette(tone);

  return (
    <div
      className="rounded-[24px] border px-4 py-4"
      style={{
        background: palette.background,
        borderColor: palette.border,
      }}
    >
      <p
        className="text-xs uppercase tracking-[0.18em]"
        style={{ color: palette.label }}
      >
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold" style={{ color: "#F5F7FA" }}>
        {value}
      </p>
    </div>
  );
};

const MiniMetric: React.FC<{ label: string; value: number }> = ({
  label,
  value,
}) => (
  <div
    className="rounded-2xl border px-3 py-3 text-center"
    style={{
      background: "rgba(255,255,255,0.04)",
      borderColor: "rgba(255,255,255,0.08)",
    }}
  >
    <p className="text-xl font-bold" style={{ color: "#F5F7FA" }}>
      {value}
    </p>
    <p className="mt-1 text-xs" style={{ color: "#8A939D" }}>
      {label}
    </p>
  </div>
);

const MiniInfo: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div
    className="rounded-2xl border px-3 py-3"
    style={{
      background: "rgba(255,255,255,0.04)",
      borderColor: "rgba(255,255,255,0.08)",
    }}
  >
    <p
      className="text-[11px] uppercase tracking-[0.18em]"
      style={{ color: "#8A939D" }}
    >
      {label}
    </p>
    <p className="mt-2 text-sm leading-5" style={{ color: "#F5F7FA" }}>
      {value}
    </p>
  </div>
);

const AlertRow: React.FC<{
  label: string;
  helper: string;
  tone: "warning" | "danger" | "neutral";
}> = ({ label, helper, tone }) => {
  const colors =
    tone === "warning"
      ? { dot: "#FBBF24", text: "#FDE68A" }
      : tone === "danger"
      ? { dot: "#F87171", text: "#FECACA" }
      : { dot: "#64748B", text: "#CBD5E1" };

  return (
    <div
      className="flex items-center justify-between gap-3 rounded-2xl border px-3 py-3"
      style={{
        background: "rgba(255,255,255,0.04)",
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex items-start gap-3">
        <StatusDot color={colors.dot} />
        <div>
          <p className="text-sm font-medium" style={{ color: colors.text }}>
            {label}
          </p>
          <p className="mt-1 text-xs" style={{ color: "#8A939D" }}>
            {helper}
          </p>
        </div>
      </div>
    </div>
  );
};

const MetaPill: React.FC<{
  label: string;
  value: string;
  accent?: string;
}> = ({ label, value, accent = "#E5E7EB" }) => (
  <div
    className="rounded-2xl border px-3 py-2"
    style={{
      background: "rgba(255,255,255,0.04)",
      borderColor: "rgba(255,255,255,0.08)",
    }}
  >
    <p
      className="text-[11px] uppercase tracking-[0.18em]"
      style={{ color: "#8A939D" }}
    >
      {label}
    </p>
    <p className="mt-1 text-sm font-semibold" style={{ color: accent }}>
      {value}
    </p>
  </div>
);

const StatusBadge: React.FC<{
  label: string;
  tone: "success" | "warning" | "danger" | "info" | "neutral";
}> = ({ label, tone }) => {
  const palette = getStatusPalette(tone);

  return (
    <span
      className="inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]"
      style={{
        background: palette.background,
        color: palette.text,
        border: `1px solid ${palette.border}`,
      }}
    >
      {label}
    </span>
  );
};

const StatusDot: React.FC<{ color: string }> = ({ color }) => (
  <span
    className="mt-1 inline-flex h-2.5 w-2.5 rounded-full"
    style={{ background: color, boxShadow: `0 0 14px ${color}` }}
  />
);

const BackgroundOrbs: React.FC = () => (
  <>
    <div
      className="pointer-events-none absolute right-[-12%] top-[-8%] h-[300px] w-[300px] rounded-full opacity-35 blur-[110px]"
      style={{
        background:
          "radial-gradient(circle, rgba(34,139,84,0.95) 0%, transparent 70%)",
        animation: "dashboardFloatA 15s ease-in-out infinite",
      }}
    />
    <div
      className="pointer-events-none absolute left-[-15%] top-[38%] h-[240px] w-[240px] rounded-full opacity-25 blur-[100px]"
      style={{
        background:
          "radial-gradient(circle, rgba(191,155,48,0.95) 0%, transparent 70%)",
        animation: "dashboardFloatB 18s ease-in-out infinite",
      }}
    />
    <div
      className="pointer-events-none absolute bottom-[-5%] right-[12%] h-[200px] w-[200px] rounded-full opacity-20 blur-[90px]"
      style={{
        background:
          "radial-gradient(circle, rgba(96,165,250,0.75) 0%, transparent 70%)",
        animation: "dashboardFloatC 12s ease-in-out infinite",
      }}
    />

    <style>{`
      @keyframes dashboardFloatA {
        0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
        50% { transform: translate3d(-18px, 20px, 0) scale(1.06); }
      }
      @keyframes dashboardFloatB {
        0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
        50% { transform: translate3d(20px, -18px, 0) scale(1.08); }
      }
      @keyframes dashboardFloatC {
        0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
        50% { transform: translate3d(14px, -16px, 0) scale(0.96); }
      }
    `}</style>
  </>
);

function getQuickActionBg(icon: QuickAction["icon"]): string {
  switch (icon) {
    case "logout":
      return "linear-gradient(135deg, rgba(185,28,28,0.32) 0%, rgba(127,29,29,0.16) 100%)";
    case "refresh":
      return "linear-gradient(135deg, rgba(59,130,246,0.32) 0%, rgba(37,99,235,0.16) 100%)";
    case "turnos":
      return "linear-gradient(135deg, rgba(34,139,84,0.3) 0%, rgba(20,83,45,0.16) 100%)";
    case "recaladas":
      return "linear-gradient(135deg, rgba(191,155,48,0.32) 0%, rgba(146,64,14,0.16) 100%)";
    case "atenciones":
      return "linear-gradient(135deg, rgba(168,85,247,0.3) 0%, rgba(107,33,168,0.16) 100%)";
    case "edit":
      return "linear-gradient(135deg, rgba(14,165,233,0.3) 0%, rgba(3,105,161,0.16) 100%)";
    case "profile":
    default:
      return "linear-gradient(135deg, rgba(255,255,255,0.14) 0%, rgba(148,163,184,0.08) 100%)";
  }
}

function getTonePalette(tone: "green" | "gold" | "blue" | "purple") {
  switch (tone) {
    case "gold":
      return {
        background:
          "linear-gradient(180deg, rgba(146,64,14,0.22) 0%, rgba(120,53,15,0.12) 100%)",
        border: "rgba(251,191,36,0.18)",
        label: "#FCD34D",
      };
    case "blue":
      return {
        background:
          "linear-gradient(180deg, rgba(30,64,175,0.22) 0%, rgba(30,41,59,0.14) 100%)",
        border: "rgba(96,165,250,0.18)",
        label: "#93C5FD",
      };
    case "purple":
      return {
        background:
          "linear-gradient(180deg, rgba(107,33,168,0.22) 0%, rgba(59,7,100,0.14) 100%)",
        border: "rgba(196,181,253,0.18)",
        label: "#C4B5FD",
      };
    case "green":
    default:
      return {
        background:
          "linear-gradient(180deg, rgba(20,83,45,0.28) 0%, rgba(21,128,61,0.12) 100%)",
        border: "rgba(74,222,128,0.18)",
        label: "#86EFAC",
      };
  }
}

function getStatusPalette(
  tone: "success" | "warning" | "danger" | "info" | "neutral"
) {
  switch (tone) {
    case "success":
      return {
        background: "rgba(34,197,94,0.15)",
        border: "rgba(74,222,128,0.2)",
        text: "#86EFAC",
      };
    case "warning":
      return {
        background: "rgba(245,158,11,0.15)",
        border: "rgba(251,191,36,0.2)",
        text: "#FCD34D",
      };
    case "danger":
      return {
        background: "rgba(239,68,68,0.15)",
        border: "rgba(248,113,113,0.2)",
        text: "#FCA5A5",
      };
    case "info":
      return {
        background: "rgba(59,130,246,0.15)",
        border: "rgba(96,165,250,0.2)",
        text: "#93C5FD",
      };
    case "neutral":
    default:
      return {
        background: "rgba(148,163,184,0.12)",
        border: "rgba(148,163,184,0.18)",
        text: "#CBD5E1",
      };
  }
}

const ActionIcon: React.FC<{ icon: QuickAction["icon"] }> = ({ icon }) => {
  const common = {
    className: "h-5 w-5",
    style: { color: "#F5F7FA" },
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24",
  } as const;

  switch (icon) {
    case "refresh":
      return (
        <svg {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0A8.003 8.003 0 015.03 15m14.389 0H15"
          />
        </svg>
      );
    case "logout":
      return (
        <svg {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M17 16l4-4m0 0l-4-4m4 4H9m4 8H7a2 2 0 01-2-2V6a2 2 0 012-2h6"
          />
        </svg>
      );
    case "turnos":
      return (
        <svg {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M8 7V3m8 4V3m-9 8h10m-11 9h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v11a2 2 0 002 2z"
          />
        </svg>
      );
    case "recaladas":
      return (
        <svg {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M3 19h18M7 16l2-8h6l2 8M12 8V5m0 0l-2 2m2-2l2 2"
          />
        </svg>
      );
    case "atenciones":
      return (
        <svg {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M12 6v12m6-6H6"
          />
        </svg>
      );
    case "edit":
      return (
        <svg {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M16.586 3.586a2 2 0 112.828 2.828L11 14.828 7 16l1.172-4 8.414-8.414z"
          />
        </svg>
      );
    case "profile":
    default:
      return (
        <svg {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      );
  }
};

export default HomePage;