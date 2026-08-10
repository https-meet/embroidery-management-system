import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Archive, Eye, Palette } from 'lucide-react';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { Button } from '@/shared/components/ui/button';
import { formatDate } from '@/shared/utils/formatDate';
import { ROUTES } from '@/shared/constants/routes';
import type { DesignDto } from '../types/design.types';

export interface DesignTableProps {
  designs: DesignDto[];
  isLoading?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (columnKey: string) => void;
  onArchiveClick: (design: DesignDto) => void;
}

const DesignPreviewImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded border bg-muted text-muted-foreground">
        <Palette className="h-4 w-4" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className="h-9 w-9 rounded border object-cover shrink-0"
      loading="lazy"
    />
  );
};

export const DesignTable: React.FC<DesignTableProps> = ({
  designs,
  isLoading,
  sortBy,
  sortOrder,
  onSort,
  onArchiveClick,
}) => {
  const columns: Column<DesignDto>[] = [
    {
      key: 'designCode',
      header: 'Design Code',
      sortable: true,
      accessor: (item) => (
        <Link
          to={ROUTES.DESIGNS.DETAIL(item.id)}
          className="font-mono font-medium text-foreground hover:text-primary hover:underline"
        >
          {item.designCode}
        </Link>
      ),
    },
    {
      key: 'name',
      header: 'Design Name',
      sortable: true,
      accessor: (item) => (
        <div className="flex items-center space-x-3">
          {item.previewUrl ? (
            <DesignPreviewImage src={item.previewUrl} alt={item.name} />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded border bg-muted text-muted-foreground">
              <Palette className="h-4 w-4" />
            </div>
          )}
          <div className="min-w-0">
            <span className="font-semibold text-foreground truncate block">{item.name}</span>
            {item.description && (
              <p className="text-xs text-muted-foreground truncate max-w-xs">{item.description}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      accessor: (item) =>
        item.category ? (
          <span className="inline-flex items-center rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {item.category}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'stitchCount',
      header: 'Stitch Count',
      align: 'right',
      accessor: (item) =>
        item.stitchCount !== null ? (
          <span className="font-mono">{item.stitchCount.toLocaleString('en-IN')}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'dimensions',
      header: 'Dimensions (W × H)',
      accessor: (item) =>
        item.widthMm !== null && item.heightMm !== null ? (
          <span className="text-xs font-mono font-medium text-foreground">
            {(item.widthMm / 25.4).toFixed(2)}" × {(item.heightMm / 25.4).toFixed(2)}"
            <span className="text-[11px] text-muted-foreground ml-1 font-sans">
              ({item.widthMm}mm × {item.heightMm}mm)
            </span>
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'createdAt',
      header: 'Created Date',
      sortable: true,
      accessor: (item) => formatDate(item.createdAt),
    },
    {
      key: 'isActive',
      header: 'Status',
      accessor: (item) => (
        <StatusBadge status={item.isActive ? 'ACTIVE' : 'INACTIVE'} />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      accessor: (item) => (
        <div className="flex items-center justify-end space-x-1">
          <Link to={ROUTES.DESIGNS.DETAIL(item.id)}>
            <Button variant="ghost" size="icon" title="View Design Workspace" className="h-8 w-8">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Link to={`${ROUTES.DESIGNS.DETAIL(item.id)}/edit`}>
            <Button variant="ghost" size="icon" title="Edit Design" className="h-8 w-8">
              <Edit2 className="h-4 w-4" />
            </Button>
          </Link>
          {item.isActive && (
            <Button
              variant="ghost"
              size="icon"
              title="Archive Design"
              className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onArchiveClick(item)}
            >
              <Archive className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={designs}
      keyExtractor={(item) => item.id}
      isLoading={isLoading}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSort={onSort}
      emptyTitle="No designs found"
      emptyDescription="There are no embroidery designs matching your query. Register a new design to get started."
    />
  );
};
