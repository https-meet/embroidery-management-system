import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { AppLayout } from '@/layouts/AppLayout';
import { PageSkeleton } from '@/shared/components/LoadingSkeleton';
import { ROUTES } from '@/shared/constants/routes';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';

// Route-level lazy loading for page components
const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const DashboardPage = lazy(() =>
  import('@/features/dashboard').then((m) => ({ default: m.DashboardPage }))
);

const CustomersListPage = lazy(() =>
  import('@/features/customers').then((m) => ({ default: m.CustomersListPage }))
);
const CreateCustomerPage = lazy(() =>
  import('@/features/customers').then((m) => ({ default: m.CreateCustomerPage }))
);
const CustomerDetailPage = lazy(() =>
  import('@/features/customers').then((m) => ({ default: m.CustomerDetailPage }))
);
const EditCustomerPage = lazy(() =>
  import('@/features/customers').then((m) => ({ default: m.EditCustomerPage }))
);

const DesignsListPage = lazy(() =>
  import('@/features/designs').then((m) => ({ default: m.DesignsListPage }))
);
const CreateDesignPage = lazy(() =>
  import('@/features/designs').then((m) => ({ default: m.CreateDesignPage }))
);
const DesignDetailPage = lazy(() =>
  import('@/features/designs').then((m) => ({ default: m.DesignDetailPage }))
);
const EditDesignPage = lazy(() =>
  import('@/features/designs').then((m) => ({ default: m.EditDesignPage }))
);

const JobsListPage = lazy(() =>
  import('@/features/jobs').then((m) => ({ default: m.JobsListPage }))
);
const CreateJobPage = lazy(() =>
  import('@/features/jobs').then((m) => ({ default: m.CreateJobPage }))
);
const JobDetailPage = lazy(() =>
  import('@/features/jobs').then((m) => ({ default: m.JobDetailPage }))
);
const EditJobPage = lazy(() =>
  import('@/features/jobs').then((m) => ({ default: m.EditJobPage }))
);

const ProductionQueuePage = lazy(() =>
  import('@/features/production').then((m) => ({ default: m.ProductionQueuePage }))
);
const ProductionWorkspacePage = lazy(() =>
  import('@/features/production').then((m) => ({ default: m.ProductionWorkspacePage }))
);

const InvoicesListPage = lazy(() =>
  import('@/features/invoices').then((m) => ({ default: m.InvoicesListPage }))
);
const CreateInvoicePage = lazy(() =>
  import('@/features/invoices').then((m) => ({ default: m.CreateInvoicePage }))
);
const InvoiceDetailPage = lazy(() =>
  import('@/features/invoices').then((m) => ({ default: m.InvoiceDetailPage }))
);
const EditInvoicePage = lazy(() =>
  import('@/features/invoices').then((m) => ({ default: m.EditInvoicePage }))
);

const PaymentsListPage = lazy(() =>
  import('@/features/payments').then((m) => ({ default: m.PaymentsListPage }))
);
const CreatePaymentPage = lazy(() =>
  import('@/features/payments').then((m) => ({ default: m.CreatePaymentPage }))
);
const PaymentDetailPage = lazy(() =>
  import('@/features/payments').then((m) => ({ default: m.PaymentDetailPage }))
);

const ReportsPage = lazy(() =>
  import('@/features/reports').then((m) => ({ default: m.ReportsPage }))
);
const SettingsPage = lazy(() =>
  import('@/features/settings').then((m) => ({ default: m.SettingsPage }))
);
const NotFoundPage = lazy(() =>
  import('@/shared/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

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
