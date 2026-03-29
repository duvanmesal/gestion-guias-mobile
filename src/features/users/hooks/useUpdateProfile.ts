import { useCompleteProfile } from "./useCompleteProfile";

export function useUpdateProfile() {
  // Legacy alias: the active onboarding flow already uses useCompleteProfile().
  return useCompleteProfile();
}
