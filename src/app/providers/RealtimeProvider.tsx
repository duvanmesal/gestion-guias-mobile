import { useGlobalRealtime } from "../../core/socket/useGlobalRealtime";

const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useGlobalRealtime();
  return <>{children}</>;
};

export default RealtimeProvider;
