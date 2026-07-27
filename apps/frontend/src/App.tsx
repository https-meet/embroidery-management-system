import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from '@/app/providers';
import { setupAxiosInterceptors } from '@/shared/api/interceptors';
import { AppRoutes } from '@/routes/AppRoutes';

export const App: React.FC = () => {
  useEffect(() => {
    setupAxiosInterceptors();
  }, []);

  return (
    <AppProviders>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProviders>
  );
};
