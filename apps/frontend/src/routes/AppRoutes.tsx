import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { AppLayout } from '@/layouts/AppLayout';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { NotFoundPage } from '@/shared/pages/NotFoundPage';
import { PageHeader } from '@/shared/components/PageHeader';
import { PageSkeleton } from '@/shared/components/LoadingSkeleton';
import { ROUTES } from '@/shared/constants/routes';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path={ROUTES.AUTH.LOGIN} element={<LoginPage />} />
          </Route>
        </Route>

        {/* Protected Application Shell Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            
            {/* Module Placeholders for subsequent phases */}
            <Route
              path={ROUTES.DASHBOARD}
              element={
                <PlaceholderPage
                  title="Dashboard"
                  description="Operational overview of today's workload and business health."
                />
              }
            />
            <Route
              path={ROUTES.CUSTOMERS.LIST}
              element={
                <PlaceholderPage
                  title="Customers"
                  description="Manage customer profiles, history, and workspace."
                />
              }
            />
            <Route
              path={ROUTES.DESIGNS.LIST}
              element={
                <PlaceholderPage
                  title="Designs"
                  description="Manage reusable embroidery design library and files."
                />
              }
            />
            <Route
              path={ROUTES.JOBS.LIST}
              element={
                <PlaceholderPage
                  title="Jobs"
                  description="Manage embroidery orders and job lifecycle."
                />
              }
            />
            <Route
              path={ROUTES.PRODUCTION.LIST}
              element={
                <PlaceholderPage
                  title="Production"
                  description="Track and update production workflow state transitions."
                />
              }
            />
            <Route
              path={ROUTES.INVOICES.LIST}
              element={
                <PlaceholderPage
                  title="Invoices"
                  description="Generate, view, and issue official customer invoices."
                />
              }
            />
            <Route
              path={ROUTES.PAYMENTS.LIST}
              element={
                <PlaceholderPage
                  title="Payments"
                  description="Record customer payments and manage invoice allocations."
                />
              }
            />
            <Route
              path={ROUTES.REPORTS.ROOT}
              element={
                <PlaceholderPage
                  title="Reports"
                  description="Operational and financial insights and aggregated metrics."
                />
              }
            />
            <Route
              path={ROUTES.SETTINGS}
              element={
                <PlaceholderPage
                  title="Settings"
                  description="Manage system and business parameters."
                />
              }
            />

            {/* Global Not Found */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};

const PlaceholderPage: React.FC<{ title: string; description: string }> = ({
  title,
  description,
}) => {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        <p className="text-sm font-medium">
          {title} module implementation is scheduled for Phase {getModulePhase(title)}.
        </p>
      </div>
    </div>
  );
};

function getModulePhase(title: string): number {
  switch (title) {
    case 'Dashboard':
      return 4;
    case 'Customers':
      return 5;
    case 'Designs':
      return 6;
    case 'Jobs':
      return 7;
    case 'Production':
      return 8;
    case 'Invoices':
      return 9;
    case 'Payments':
      return 10;
    case 'Reports':
      return 11;
    case 'Settings':
      return 12;
    default:
      return 0;
  }
}
