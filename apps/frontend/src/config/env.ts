export interface EnvConfig {
  apiBaseUrl: string;
}

export const env: EnvConfig = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL as string) || '/api/v1',
};
