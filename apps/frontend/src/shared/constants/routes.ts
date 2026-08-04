/**
 * Centralized Route Path Constants
 */
export const ROUTES = {
  AUTH: {
    LOGIN: '/login',
  },
  DASHBOARD: '/dashboard',
  CUSTOMERS: {
    LIST: '/customers',
    CREATE: '/customers/new',
    DETAIL: (id: string) => `/customers/${id}`,
  },
  DESIGNS: {
    LIST: '/designs',
    CREATE: '/designs/new',
    DETAIL: (id: string) => `/designs/${id}`,
  },
  JOBS: {
    LIST: '/jobs',
    CREATE: '/jobs/new',
    DETAIL: (id: string) => `/jobs/${id}`,
    PRINT_CARD: (id: string) => `/jobs/${id}/print`,
    PRINT_CHALLAN: (id: string) => `/jobs/${id}/challan`,
  },
  PRODUCTION: {
    LIST: '/production',
    DETAIL: (id: string) => `/production/${id}`,
  },
  INVOICES: {
    LIST: '/invoices',
    CREATE: '/invoices/new',
    DETAIL: (id: string) => `/invoices/${id}`,
    PRINT: (id: string) => `/invoices/${id}/print`,
  },
  PAYMENTS: {
    LIST: '/payments',
    CREATE: '/payments/new',
    DETAIL: (id: string) => `/payments/${id}`,
  },
  MATERIALS: {
    LIST: '/materials',
  },
  SUPPLIERS: {
    LIST: '/suppliers',
  },
  PURCHASES: {
    LIST: '/purchases',
    CREATE: '/purchases/new',
    DETAIL: (id: string) => `/purchases/${id}`,
    PRINT: (id: string) => `/purchases/${id}/print`,
  },
  REPORTS: {
    ROOT: '/reports',
    CUSTOMERS: '/reports/customers',
    JOBS: '/reports/jobs',
    PRODUCTION: '/reports/production',
    INVOICES: '/reports/invoices',
    PAYMENTS: '/reports/payments',
    REVENUE: '/reports/revenue',
  },
  SETTINGS: '/settings',
} as const;
