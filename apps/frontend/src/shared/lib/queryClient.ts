import { QueryClient } from '@tanstack/react-query';

/**
 * Global TanStack Query Client configured for instant response times and optimal performance
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false, // Prevent laggy network bursts on tab focus
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});
