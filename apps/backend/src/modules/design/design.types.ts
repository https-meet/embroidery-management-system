export interface DesignResponseDto {
  id: string;
  designCode: string;
  name: string;
  description: string | null;
  category: string | null;
  previewUrl: string | null;
  primaryFileUrl: string | null;
  primaryFileType: string | null;
  stitchCount: number | null;
  widthMm: number | null;
  heightMm: number | null;
  colorCount: number | null;
  notes: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDesignDto {
  name: string;
  description?: string;
  category?: string;
  previewUrl?: string;
  primaryFileUrl?: string;
  primaryFileType?: string;
  stitchCount?: number;
  widthMm?: number;
  heightMm?: number;
  colorCount?: number;
  notes?: string;
}

export interface UpdateDesignDto {
  name?: string;
  description?: string;
  category?: string;
  previewUrl?: string;
  primaryFileUrl?: string;
  primaryFileType?: string;
  stitchCount?: number;
  widthMm?: number;
  heightMm?: number;
  colorCount?: number;
  notes?: string;
  isActive?: boolean;
}

export interface DesignQueryFilter {
  search?: string;
  category?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'designCode' | 'createdAt' | 'category';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedDesignsResponseDto {
  designs: DesignResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
