import React, { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { AppProviders } from '@/app/providers';
import { setupAxiosInterceptors } from '@/shared/api/interceptors';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { AppRoutes } from '@/routes/AppRoutes';

export const App: React.FC = () => {
  useEffect(() => {
    setupAxiosInterceptors();
  }, []);

  return (
    <ErrorBoundary>
      <AppProviders>
        <AppRoutes />
        <Analytics />
      </AppProviders>
    </ErrorBoundary>
  );
};

