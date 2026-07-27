import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

export interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export const PaginationBar: React.FC<PaginationBarProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  if (totalPages <= 1 && (!totalItems || totalItems <= pageSize)) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-between space-y-3 px-2 py-3 sm:flex-row sm:space-y-0">
      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
        {totalItems !== undefined && (
          <span>
            Total <strong className="font-semibold text-foreground">{totalItems}</strong> records
          </span>
        )}

        {onPageSizeChange && (
          <div className="flex items-center space-x-1.5">
            <span>Show:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-7 rounded border border-input bg-transparent px-2 py-0.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-xs text-muted-foreground">
          Page <strong className="font-semibold text-foreground">{currentPage}</strong> of{' '}
          <strong className="font-semibold text-foreground">{totalPages || 1}</strong>
        </span>

        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Previous page"
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
