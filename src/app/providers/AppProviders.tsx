import QueryProvider from "./QueryProvider";
import AuthProvider from "./AuthProvider";

const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <QueryProvider>
    <AuthProvider>{children}</AuthProvider>
  </QueryProvider>
);

export default AppProviders;
