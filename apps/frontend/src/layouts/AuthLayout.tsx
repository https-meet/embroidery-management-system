import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * Unauthenticated layout container for authentication screens
 */
export const AuthLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            EBMS
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Embroidery Business Management System
          </p>
        </div>
        <main className="rounded-lg border bg-card p-6 shadow-sm">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
