import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { queryClient } from '@/shared/lib/queryClient';
import { AuthProvider } from '@/shared/providers/AuthProvider';
import { BreadcrumbProvider } from '@/shared/context/BreadcrumbContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BreadcrumbProvider>
          {children}
          <Toaster position="bottom-right" richColors />
        </BreadcrumbProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

