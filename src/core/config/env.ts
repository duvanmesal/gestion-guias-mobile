export const ENV = {
  API_URL: import.meta.env.VITE_API_URL as string | undefined,
  get apiUrl(): string {
    if (!this.API_URL) throw new Error("VITE_API_URL is not set");
    return this.API_URL;
  },
} as const;
