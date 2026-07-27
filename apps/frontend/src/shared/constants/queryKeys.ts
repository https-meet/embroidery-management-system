import type { PaginationParams } from '../types/api.types';

/**
 * Query Key Factories for all modules in EBMS
 */
export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
  },
  dashboard: {
    all: ['dashboard'] as const,
    summary: () => [...queryKeys.dashboard.all, 'summary'] as const,
  },
  customers: {
    all: ['customers'] as const,
    lists: () => [...queryKeys.customers.all, 'list'] as const,
    list: (params?: PaginationParams) => [...queryKeys.customers.lists(), params] as const,
    details: () => [...queryKeys.customers.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.customers.details(), id] as const,
    search: (query: string) => [...queryKeys.customers.all, 'search', query] as const,
  },
  designs: {
    all: ['designs'] as const,
    lists: () => [...queryKeys.designs.all, 'list'] as const,
    list: (params?: PaginationParams) => [...queryKeys.designs.lists(), params] as const,
    details: () => [...queryKeys.designs.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.designs.details(), id] as const,
  },
  jobs: {
    all: ['jobs'] as const,
    lists: () => [...queryKeys.jobs.all, 'list'] as const,
    list: (params?: PaginationParams) => [...queryKeys.jobs.lists(), params] as const,
    details: () => [...queryKeys.jobs.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.jobs.details(), id] as const,
  },
  production: {
    all: ['production'] as const,
    lists: () => [...queryKeys.production.all, 'list'] as const,
    list: (params?: PaginationParams) => [...queryKeys.production.lists(), params] as const,
    details: () => [...queryKeys.production.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.production.details(), id] as const,
  },
  invoices: {
    all: ['invoices'] as const,
    lists: () => [...queryKeys.invoices.all, 'list'] as const,
    list: (params?: PaginationParams) => [...queryKeys.invoices.lists(), params] as const,
    details: () => [...queryKeys.invoices.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.invoices.details(), id] as const,
  },
  payments: {
    all: ['payments'] as const,
    lists: () => [...queryKeys.payments.all, 'list'] as const,
    list: (params?: PaginationParams) => [...queryKeys.payments.lists(), params] as const,
    details: () => [...queryKeys.payments.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.payments.details(), id] as const,
  },
  reports: {
    all: ['reports'] as const,
    customers: (params?: PaginationParams) => [...queryKeys.reports.all, 'customers', params] as const,
    jobs: (params?: PaginationParams) => [...queryKeys.reports.all, 'jobs', params] as const,
    production: (params?: PaginationParams) => [...queryKeys.reports.all, 'production', params] as const,
    invoices: (params?: PaginationParams) => [...queryKeys.reports.all, 'invoices', params] as const,
    payments: (params?: PaginationParams) => [...queryKeys.reports.all, 'payments', params] as const,
    revenue: (params?: PaginationParams) => [...queryKeys.reports.all, 'revenue', params] as const,
  },
  settings: {
    all: ['settings'] as const,
    detail: () => [...queryKeys.settings.all, 'detail'] as const,
  },
} as const;
