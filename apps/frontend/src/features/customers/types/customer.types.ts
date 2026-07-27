import type { PaginationParams } from '@/shared/types/api.types';

export type CustomerType = 'INDIVIDUAL' | 'COMPANY';

export interface CustomerDto {
  id: string;
  customerCode: string;
  customerType: CustomerType;
  name: string;
  contactPerson: string | null;
  mobile: string | null;
  alternateMobile: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerDto {
  customerType?: CustomerType;
  name: string;
  contactPerson?: string;
  mobile?: string;
  alternateMobile?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface UpdateCustomerDto {
  customerType?: CustomerType;
  name?: string;
  contactPerson?: string;
  mobile?: string;
  alternateMobile?: string;
  email?: string;
  address?: string;
  notes?: string;
  isActive?: boolean;
}

export interface CustomerQueryParams extends PaginationParams {
  search?: string;
  customerType?: CustomerType;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'customerCode' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedCustomersData {
  customers: CustomerDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CustomerDetailData {
  customer: CustomerDto;
}
