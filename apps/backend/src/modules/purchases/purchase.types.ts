import type { Purchase, PurchaseItem } from '@prisma/client';

export type { Purchase, PurchaseItem };

export interface PurchaseItemResponseDto {
  id: string;
  purchaseId: string;
  materialId: string;
  materialName?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface PurchaseResponseDto {
  id: string;
  purchaseNumber: string;
  supplierId: string;
  supplierName?: string;
  purchaseDate: Date;
  invoiceNumber: string | null;
  invoiceDate: Date | null;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes: string | null;
  inventoryUpdated: boolean;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: PurchaseItemResponseDto[];
}

export interface CreatePurchaseItemDto {
  materialId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreatePurchaseDto {
  supplierId: string;
  purchaseDate?: Date | string;
  invoiceNumber?: string | null;
  invoiceDate?: Date | string | null;
  discount?: number;
  tax?: number;
  notes?: string | null;
  updateInventory?: boolean;
  items: CreatePurchaseItemDto[];
}

export interface UpdatePurchaseDto {
  supplierId?: string;
  purchaseDate?: Date | string;
  invoiceNumber?: string | null;
  invoiceDate?: Date | string | null;
  discount?: number;
  tax?: number;
  notes?: string | null;
  updateInventory?: boolean;
  items?: CreatePurchaseItemDto[];
}

export interface PurchaseQueryFilter {
  page?: number | string;
  limit?: number | string;
  search?: string;
  supplierId?: string;
  inventoryUpdated?: string | boolean;
  startDate?: string;
  endDate?: string;
  sortBy?: 'purchaseNumber' | 'purchaseDate' | 'total' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedPurchasesResponseDto {
  purchases: PurchaseResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
