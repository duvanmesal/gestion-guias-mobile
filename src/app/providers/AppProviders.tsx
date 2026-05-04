import QueryProvider from "./QueryProvider";
import AuthProvider from "./AuthProvider";
import RealtimeProvider from "./RealtimeProvider";

const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <QueryProvider>
    <AuthProvider>
      <RealtimeProvider>{children}</RealtimeProvider>
    </AuthProvider>
  </QueryProvider>
);

export default AppProviders;
