export interface PurchaseItem {
  id?: string;
  purchaseId?: string;
  materialId: string;
  materialName?: string;
  quantity: number;
  unitPrice: number;
  lineTotal?: number;
}

export interface Purchase {
  id: string;
  purchaseNumber: string;
  supplierId: string;
  supplierName?: string;
  purchaseDate: string;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes: string | null;
  inventoryUpdated: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  items: PurchaseItem[];
}

export interface CreatePurchaseItemInput {
  materialId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreatePurchaseInput {
  supplierId: string;
  purchaseDate?: string;
  invoiceNumber?: string | null;
  invoiceDate?: string | null;
  discount?: number;
  tax?: number;
  notes?: string | null;
  updateInventory?: boolean;
  items: CreatePurchaseItemInput[];
}

export interface PurchaseQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  supplierId?: string;
  inventoryUpdated?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'purchaseNumber' | 'purchaseDate' | 'total' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedPurchasesResponse {
  purchases: Purchase[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
