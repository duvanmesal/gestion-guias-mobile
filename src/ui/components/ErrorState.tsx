import { IonText } from "@ionic/react";

interface ErrorStateProps {
  message?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message = "Ha ocurrido un error" }) => (
  <div style={{ textAlign: "center", padding: 32 }}>
    <IonText color="danger">
      <p>{message}</p>
    </IonText>
  </div>
);

export default ErrorState;
