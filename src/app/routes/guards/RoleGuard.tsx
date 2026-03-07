import { Redirect } from "react-router-dom";
import { useSessionStore } from "../../../core/auth/sessionStore";
import type { Role } from "../../../core/auth/types";

interface RoleGuardProps {
  allowed: Role[];
  children: React.ReactNode;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ allowed, children }) => {
  const status = useSessionStore((s) => s.status);
  const role = useSessionStore((s) => s.user?.role);

  if (status !== "authed") return <Redirect to="/login" />;
  if (!role || !allowed.includes(role)) return <Redirect to="/" />;
  return <>{children}</>;
};

export default RoleGuard;
