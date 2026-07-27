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
import {
  ProductionQueuePage,
  ProductionWorkspacePage,
} from '@/features/production';
import {
  InvoicesListPage,
  CreateInvoicePage,
  InvoiceDetailPage,
  EditInvoicePage,
} from '@/features/invoices';
import {
  PaymentsListPage,
  CreatePaymentPage,
  PaymentDetailPage,
} from '@/features/payments';
import { ReportsPage } from '@/features/reports';
import { SettingsPage } from '@/features/settings';
import { NotFoundPage } from '@/shared/pages/NotFoundPage';
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

            {/* Production Module */}
            <Route path={ROUTES.PRODUCTION.LIST} element={<ProductionQueuePage />} />
            <Route path="/production/:id" element={<ProductionWorkspacePage />} />

            {/* Invoices Module */}
            <Route path={ROUTES.INVOICES.LIST} element={<InvoicesListPage />} />
            <Route path={ROUTES.INVOICES.CREATE} element={<CreateInvoicePage />} />
            <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
            <Route path="/invoices/:id/edit" element={<EditInvoicePage />} />

            {/* Payments Module */}
            <Route path={ROUTES.PAYMENTS.LIST} element={<PaymentsListPage />} />
            <Route path={ROUTES.PAYMENTS.CREATE} element={<CreatePaymentPage />} />
            <Route path="/payments/:id" element={<PaymentDetailPage />} />

            {/* Reports Module */}
            <Route path={`${ROUTES.REPORTS.ROOT}/*`} element={<ReportsPage />} />

            {/* Settings Module */}
            <Route path={`${ROUTES.SETTINGS}/*`} element={<SettingsPage />} />

            {/* Global Not Found */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};
