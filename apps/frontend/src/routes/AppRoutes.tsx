import React, { Suspense, lazy } from 'react';
import { Route, Navigate, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { AppLayout } from '@/layouts/AppLayout';
import { PageSkeleton } from '@/shared/components/LoadingSkeleton';
import { ROUTES } from '@/shared/constants/routes';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';

/**
 * Resilient lazy loader wrapper that automatically reloads page on deployment chunk hash mismatches
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safeLazy<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    try {
      return await factory();
    } catch (error) {
      const storageKey = 'ebms_chunk_retry';
      const hasRetried = sessionStorage.getItem(storageKey);
      if (!hasRetried) {
        sessionStorage.setItem(storageKey, 'true');
        window.location.reload();
      }
      throw error;
    }
  });
}

// Route-level lazy loading for page components with chunk retry wrapper
const LoginPage = safeLazy(() =>
  import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const DashboardPage = safeLazy(() =>
  import('@/features/dashboard').then((m) => ({ default: m.DashboardPage }))
);

const CustomersListPage = safeLazy(() =>
  import('@/features/customers').then((m) => ({ default: m.CustomersListPage }))
);
const CreateCustomerPage = safeLazy(() =>
  import('@/features/customers').then((m) => ({ default: m.CreateCustomerPage }))
);
const CustomerDetailPage = safeLazy(() =>
  import('@/features/customers').then((m) => ({ default: m.CustomerDetailPage }))
);
const EditCustomerPage = safeLazy(() =>
  import('@/features/customers').then((m) => ({ default: m.EditCustomerPage }))
);

const DesignsListPage = safeLazy(() =>
  import('@/features/designs').then((m) => ({ default: m.DesignsListPage }))
);
const CreateDesignPage = safeLazy(() =>
  import('@/features/designs').then((m) => ({ default: m.CreateDesignPage }))
);
const DesignDetailPage = safeLazy(() =>
  import('@/features/designs').then((m) => ({ default: m.DesignDetailPage }))
);
const EditDesignPage = safeLazy(() =>
  import('@/features/designs').then((m) => ({ default: m.EditDesignPage }))
);

const JobsListPage = safeLazy(() =>
  import('@/features/jobs').then((m) => ({ default: m.JobsListPage }))
);
const CreateJobPage = safeLazy(() =>
  import('@/features/jobs').then((m) => ({ default: m.CreateJobPage }))
);
const JobDetailPage = safeLazy(() =>
  import('@/features/jobs').then((m) => ({ default: m.JobDetailPage }))
);
const EditJobPage = safeLazy(() =>
  import('@/features/jobs').then((m) => ({ default: m.EditJobPage }))
);

const ProductionQueuePage = safeLazy(() =>
  import('@/features/production').then((m) => ({ default: m.ProductionQueuePage }))
);
const ProductionWorkspacePage = safeLazy(() =>
  import('@/features/production').then((m) => ({ default: m.ProductionWorkspacePage }))
);

const MaterialsListPage = safeLazy(() =>
  import('@/features/materials').then((m) => ({ default: m.MaterialsListPage }))
);

const SuppliersListPage = safeLazy(() =>
  import('@/features/suppliers').then((m) => ({ default: m.SuppliersListPage }))
);

const PurchasesListPage = safeLazy(() =>
  import('@/features/purchases').then((m) => ({ default: m.PurchasesListPage }))
);
const CreatePurchasePage = safeLazy(() =>
  import('@/features/purchases').then((m) => ({ default: m.CreatePurchasePage }))
);
const PurchaseDetailPage = safeLazy(() =>
  import('@/features/purchases').then((m) => ({ default: m.PurchaseDetailPage }))
);

// Print Pages
const GstInvoicePrintPage = safeLazy(() =>
  import('@/features/printing').then((m) => ({ default: m.GstInvoicePrintPage }))
);
const DeliveryChallanPrintPage = safeLazy(() =>
  import('@/features/printing').then((m) => ({ default: m.DeliveryChallanPrintPage }))
);
const JobCardPrintPage = safeLazy(() =>
  import('@/features/printing').then((m) => ({ default: m.JobCardPrintPage }))
);
const PurchasePrintPage = safeLazy(() =>
  import('@/features/printing').then((m) => ({ default: m.PurchasePrintPage }))
);

const InvoicesListPage = safeLazy(() =>
  import('@/features/invoices').then((m) => ({ default: m.InvoicesListPage }))
);
const CreateInvoicePage = safeLazy(() =>
  import('@/features/invoices').then((m) => ({ default: m.CreateInvoicePage }))
);
const InvoiceDetailPage = safeLazy(() =>
  import('@/features/invoices').then((m) => ({ default: m.InvoiceDetailPage }))
);
const EditInvoicePage = safeLazy(() =>
  import('@/features/invoices').then((m) => ({ default: m.EditInvoicePage }))
);

const PaymentsListPage = safeLazy(() =>
  import('@/features/payments').then((m) => ({ default: m.PaymentsListPage }))
);
const CreatePaymentPage = safeLazy(() =>
  import('@/features/payments').then((m) => ({ default: m.CreatePaymentPage }))
);
const PaymentDetailPage = safeLazy(() =>
  import('@/features/payments').then((m) => ({ default: m.PaymentDetailPage }))
);

const ReportsPage = safeLazy(() =>
  import('@/features/reports').then((m) => ({ default: m.ReportsPage }))
);
const SettingsPage = safeLazy(() =>
  import('@/features/settings').then((m) => ({ default: m.SettingsPage }))
);
const NotFoundPage = safeLazy(() =>
  import('@/shared/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

const routes = createRoutesFromElements(
  <Route>
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
        <Route path="/jobs/:id/print" element={<JobCardPrintPage />} />
        <Route path="/jobs/:id/challan" element={<DeliveryChallanPrintPage />} />

        {/* Production Module */}
        <Route path={ROUTES.PRODUCTION.LIST} element={<ProductionQueuePage />} />
        <Route path="/production/:id" element={<ProductionWorkspacePage />} />

        {/* Inventory & Purchasing Modules */}
        <Route path={ROUTES.MATERIALS.LIST} element={<MaterialsListPage />} />
        <Route path={ROUTES.SUPPLIERS.LIST} element={<SuppliersListPage />} />
        <Route path={ROUTES.PURCHASES.LIST} element={<PurchasesListPage />} />
        <Route path={ROUTES.PURCHASES.CREATE} element={<CreatePurchasePage />} />
        <Route path="/purchases/:id" element={<PurchaseDetailPage />} />
        <Route path="/purchases/:id/print" element={<PurchasePrintPage />} />

        {/* Invoices Module */}
        <Route path={ROUTES.INVOICES.LIST} element={<InvoicesListPage />} />
        <Route path={ROUTES.INVOICES.CREATE} element={<CreateInvoicePage />} />
        <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
        <Route path="/invoices/:id/edit" element={<EditInvoicePage />} />
        <Route path="/invoices/:id/print" element={<GstInvoicePrintPage />} />

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
  </Route>
);

export const router = createBrowserRouter(routes);

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <RouterProvider router={router} />
    </Suspense>
  );
};
