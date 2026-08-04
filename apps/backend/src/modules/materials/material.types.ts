import type { Material, MaterialCategory, MaterialUnit } from '@prisma/client';

export type { Material, MaterialCategory, MaterialUnit };

export interface MaterialResponseDto {
  id: string;
  name: string;
  sku: string | null;
  brand: string | null;
  colorName: string | null;
  colorCode: string | null;
  category: MaterialCategory;
  unit: MaterialUnit;
  purchasePrice: number;
  sellingPrice: number | null;
  minimumStock: number;
  currentStock: number;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMaterialDto {
  name: string;
  sku?: string | null;
  brand?: string | null;
  colorName?: string | null;
  colorCode?: string | null;
  category?: MaterialCategory;
  unit?: MaterialUnit;
  purchasePrice?: number;
  sellingPrice?: number | null;
  minimumStock?: number;
  currentStock?: number;
  description?: string | null;
}

export interface UpdateMaterialDto {
  name?: string;
  sku?: string | null;
  brand?: string | null;
  colorName?: string | null;
  colorCode?: string | null;
  category?: MaterialCategory;
  unit?: MaterialUnit;
  purchasePrice?: number;
  sellingPrice?: number | null;
  minimumStock?: number;
  currentStock?: number;
  description?: string | null;
}

export interface UpdateMaterialStatusDto {
  isActive: boolean;
}

export interface MaterialQueryFilter {
  page?: number | string;
  limit?: number | string;
  search?: string;
  category?: MaterialCategory;
  brand?: string;
  active?: string | boolean;
  sortBy?: 'name' | 'brand' | 'currentStock' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedMaterialsResponseDto {
  materials: MaterialResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  skuWarning?: string;
}
