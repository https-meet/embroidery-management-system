export type MaterialCategory =
  | 'THREAD'
  | 'FABRIC'
  | 'BACKING'
  | 'NEEDLE'
  | 'PACKAGING'
  | 'ACCESSORY'
  | 'OTHER';

export type MaterialUnit =
  | 'PCS'
  | 'KG'
  | 'GRAM'
  | 'METER'
  | 'ROLL'
  | 'CONE'
  | 'BOX'
  | 'PACKET'
  | 'LITER'
  | 'OTHER';

export interface Material {
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
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaterialInput {
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

export interface UpdateMaterialInput extends Partial<CreateMaterialInput> {}

export interface MaterialQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: MaterialCategory;
  brand?: string;
  active?: string;
  sortBy?: 'name' | 'brand' | 'currentStock' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedMaterialsResponse {
  materials: Material[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  skuWarning?: string;
}
