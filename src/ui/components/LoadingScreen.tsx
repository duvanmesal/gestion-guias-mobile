import { IonPage, IonContent, IonSpinner } from "@ionic/react";

const LoadingScreen: React.FC = () => (
  <IonPage>
    <IonContent className="ion-padding" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", paddingTop: "40vh" }}>
        <IonSpinner name="crescent" />
        <p>Cargando...</p>
      </div>
    </IonContent>
  </IonPage>
);

export default LoadingScreen;
