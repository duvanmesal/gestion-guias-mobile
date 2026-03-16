import { IonContent, IonPage } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { useSessionStore } from "../../../core/auth/sessionStore";
import LoadingScreen from "../../../ui/components/LoadingScreen";
import DashboardNeumorphic from "../components/DashboardNeumorphic";
import { useDashboardOverview } from "../hooks/useDashboardOverview";

const HomePage: React.FC = () => {
  const history = useHistory();
  const user = useSessionStore((state) => state.user);
  const { data, isLoading, isFetching, error, refetch } =
    useDashboardOverview();

  if (isLoading && !data) {
    return <LoadingScreen message="Cargando tu centro de operaciones..." />;
  }

  return (
    <IonPage>
      <IonContent scrollY={true}>
        <DashboardNeumorphic
          data={data}
          user={user}
          isRefreshing={isFetching}
          errorMessage={
            error instanceof Error ? error.message : error ? String(error) : null
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
