import type { CustomerType } from '@prisma/client';

export interface CustomerResponseDto {
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
  createdAt: Date;
  updatedAt: Date;
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

export interface CustomerQueryFilter {
  search?: string;
  customerType?: CustomerType;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'customerCode' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedCustomersResponseDto {
  customers: CustomerResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
