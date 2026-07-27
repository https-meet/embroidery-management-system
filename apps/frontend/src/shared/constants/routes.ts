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
  },
  PRODUCTION: {
    LIST: '/production',
    DETAIL: (id: string) => `/production/${id}`,
  },
  INVOICES: {
    LIST: '/invoices',
    CREATE: '/invoices/new',
    DETAIL: (id: string) => `/invoices/${id}`,
  },
  PAYMENTS: {
    LIST: '/payments',
    CREATE: '/payments/new',
    DETAIL: (id: string) => `/payments/${id}`,
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
