export const usersKeys = {
  all: ["users"] as const,
  me: () => [...usersKeys.all, "me"] as const,
  guidesLookup: () => [...usersKeys.all, "guides"] as const,
  guideAvailability: () => [...usersKeys.all, "guide-availability"] as const,
  sessions: () => ["sessions"] as const,
};
