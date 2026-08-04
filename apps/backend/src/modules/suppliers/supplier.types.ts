import type { Supplier } from '@prisma/client';

export type { Supplier };

export interface SupplierResponseDto {
  id: string;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  gstNumber: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSupplierDto {
  name: string;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
  gstNumber?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  notes?: string | null;
}

export interface UpdateSupplierDto {
  name?: string;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
  gstNumber?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  notes?: string | null;
}

export interface UpdateSupplierStatusDto {
  isActive: boolean;
}

export interface SupplierQueryFilter {
  page?: number | string;
  limit?: number | string;
  search?: string;
  active?: string | boolean;
  sortBy?: 'name' | 'city' | 'state' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedSuppliersResponseDto {
  suppliers: SupplierResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
