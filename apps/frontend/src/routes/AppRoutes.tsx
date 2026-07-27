import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { AppLayout } from '@/layouts/AppLayout';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { DashboardPage } from '@/features/dashboard';
import {
  CustomersListPage,
  CreateCustomerPage,
  CustomerDetailPage,
  EditCustomerPage,
} from '@/features/customers';
import {
  DesignsListPage,
  CreateDesignPage,
  DesignDetailPage,
  EditDesignPage,
} from '@/features/designs';
import {
  JobsListPage,
  CreateJobPage,
  JobDetailPage,
  EditJobPage,
} from '@/features/jobs';
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
            
            {/* Dashboard Module */}
            <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />

            {/* Customers Module */}
            <Route path={ROUTES.CUSTOMERS.LIST} element={<CustomersListPage />} />
            <Route path={ROUTES.CUSTOMERS.CREATE} element={<CreateCustomerPage />} />
            <Route path="/customers/:id" element={<CustomerDetailPage />} />
            <Route path="/customers/:id/edit" element={<EditCustomerPage />} />

            {/* Designs Module */}
            <Route path={ROUTES.DESIGNS.LIST} element={<DesignsListPage />} />
            <Route path={ROUTES.DESIGNS.CREATE} element={<CreateDesignPage />} />
            <Route path="/designs/:id" element={<DesignDetailPage />} />
            <Route path="/designs/:id/edit" element={<EditDesignPage />} />

            {/* Jobs Module */}
            <Route path={ROUTES.JOBS.LIST} element={<JobsListPage />} />
            <Route path={ROUTES.JOBS.CREATE} element={<CreateJobPage />} />
            <Route path="/jobs/:id" element={<JobDetailPage />} />
            <Route path="/jobs/:id/edit" element={<EditJobPage />} />

            {/* Module Placeholders for subsequent phases (supporting subroutes) */}
            <Route
              path={`${ROUTES.PRODUCTION.LIST}/*`}
              element={
                <PlaceholderPage
                  title="Production"
                  description="Track and update production workflow state transitions."
                />
              }
            />
            <Route
              path={`${ROUTES.INVOICES.LIST}/*`}
              element={
                <PlaceholderPage
                  title="Invoices"
                  description="Generate, view, and issue official customer invoices."
                />
              }
            />
            <Route
              path={`${ROUTES.PAYMENTS.LIST}/*`}
              element={
                <PlaceholderPage
                  title="Payments"
                  description="Record customer payments and manage invoice allocations."
                />
              }
            />
            <Route
              path={`${ROUTES.REPORTS.ROOT}/*`}
              element={
                <PlaceholderPage
                  title="Reports"
                  description="Operational and financial insights and aggregated metrics."
                />
              }
            />
            <Route
              path={`${ROUTES.SETTINGS}/*`}
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
