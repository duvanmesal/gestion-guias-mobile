import type { RefresherEventDetail } from "@ionic/core";
import {
  IonContent,
  IonPage,
  IonRefresher,
  IonRefresherContent,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { useSessionStore } from "../../../core/auth/sessionStore";
import LoadingScreen from "../../../ui/components/LoadingScreen";
import DashboardNeumorphic from "../components/DashboardNeumorphic";
import { useDashboardOverview } from "../hooks/useDashboardOverview";
import { useTurnoSocket } from "../../turnos/hooks/useTurnoSocket";
import { useRecaladaSocket } from "../../recaladas/hooks/useRecaladaSocket";

const HomePage: React.FC = () => {
  const history = useHistory();
  const user = useSessionStore((state) => state.user);
  useTurnoSocket();
  useRecaladaSocket();
  const { data, isLoading, isFetching, error, refetch } =
    useDashboardOverview();

  if (isLoading && !data) {
    return <LoadingScreen message="Cargando tu centro de operaciones..." />;
  }

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    try {
      await refetch();
    } finally {
      event.detail.complete();
    }
  };

  return (
    <IonPage className="premium-page">
      <IonContent scrollY={true}>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent
            pullingIcon="chevron-down-circle-outline"
            refreshingSpinner="crescent"
          />
        </IonRefresher>

        <DashboardNeumorphic
          data={data}
          user={user}
          isRefreshing={isFetching}
          errorMessage={
            error instanceof Error
              ? error.message
              : error
              ? String(error)
              : null
          }
          onRetry={() => {
            void refetch();
          }}
          onNavigate={(path) => {
            history.push(path);
          }}
        />
      </IonContent>
    </IonPage>
  );
};

export default HomePage;
