import { Redirect } from "react-router-dom";
import { useSessionStore } from "../../../core/auth/sessionStore";

interface OnboardingGuardProps {
  children: React.ReactNode;
}

const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ children }) => {
  const status = useSessionStore((s) => s.status);
  const profileStatus = useSessionStore((s) => s.user?.profileStatus);

  if (status !== "authed") return <>{children}</>;
  if (profileStatus === "INCOMPLETE") return <Redirect to="/onboarding" />;
  return <>{children}</>;
};

export default OnboardingGuard;
