import QueryProvider from "./QueryProvider";
import AuthProvider from "./AuthProvider";
import RealtimeProvider from "./RealtimeProvider";
import PushNotificationsProvider from "../../core/notifications/PushNotificationsProvider";

const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <QueryProvider>
    <AuthProvider>
      <PushNotificationsProvider>
        <RealtimeProvider>{children}</RealtimeProvider>
      </PushNotificationsProvider>
    </AuthProvider>
  </QueryProvider>
);

export default AppProviders;
