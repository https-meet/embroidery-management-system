import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { Button } from '@/shared/components/ui/button';
import { PaginationBar } from '@/shared/components/PaginationBar';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { usePagination } from '@/shared/hooks/usePagination';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import { ErrorState } from '@/shared/components/ErrorState';
import { ROUTES } from '@/shared/constants/routes';
import { useDesigns } from '../hooks/useDesigns';
import { useArchiveDesign } from '../hooks/useDesignMutations';
import { DesignTable } from '../components/DesignTable';
import { DesignFilters } from '../components/DesignFilters';
import type { DesignDto } from '../types/design.types';

export const DesignsListPage: React.FC = () => {
  const { page, limit, search, setPage, setLimit, setSearch } = usePagination();
  const [category, setCategoryState] = useState<string | undefined>(undefined);
  const [isActive, setIsActiveState] = useState<boolean | undefined>(true);
  const [sortBy, setSortBy] = useState<'name' | 'designCode' | 'createdAt' | 'category'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [selectedDesign, setSelectedDesign] = useState<DesignDto | null>(null);
  const archiveDialog = useDisclosure();

  const handleCategoryChange = (cat: string | undefined) => {
    setCategoryState(cat);
    setPage(1);
  };

  const handleStatusChange = (status: boolean | undefined) => {
    setIsActiveState(status);
    setPage(1);
  };

  const { data, isLoading, isError, refetch } = useDesigns({
    page,
    limit,
    search,
    category,
    isActive,
    sortBy,
    sortOrder,
  });

  const archiveMutation = useArchiveDesign();

  const handleSort = (columnKey: string) => {
    if (
      columnKey === 'name' ||
      columnKey === 'designCode' ||
      columnKey === 'createdAt' ||
      columnKey === 'category'
    ) {
      if (sortBy === columnKey) {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
      } else {
        setSortBy(columnKey);
        setSortOrder('asc');
      }
      setPage(1);
    }
  };

  const handleArchiveClick = (design: DesignDto) => {
    setSelectedDesign(design);
    archiveDialog.onOpen();
  };

  const handleConfirmArchive = async () => {
    if (selectedDesign) {
      await archiveMutation.mutateAsync(selectedDesign.id);
      archiveDialog.onClose();
      setSelectedDesign(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Design Catalog"
        description="Manage embroidery patterns, machine files, and technical specifications."
        action={
          <Link to={ROUTES.DESIGNS.CREATE}>
            <Button size="sm" className="flex items-center space-x-1.5">
              <Plus className="h-4 w-4" />
              <span>New Design</span>
            </Button>
          </Link>
        }
      />

      <DesignFilters
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={handleCategoryChange}
        isActive={isActive}
        onStatusChange={handleStatusChange}
      />

      {isError ? (
        <ErrorState
          title="Failed to load designs"
          message="An error occurred while retrieving design records."
          onRetry={() => refetch()}
        />
      ) : (
        <div className="space-y-4">
          <DesignTable
            designs={data?.designs || []}
            isLoading={isLoading}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            onArchiveClick={handleArchiveClick}
          />

          {data && (
            <PaginationBar
              currentPage={data.page}
              totalPages={data.totalPages}
              totalItems={data.total}
              pageSize={data.limit}
              onPageChange={setPage}
              onPageSizeChange={setLimit}
            />
          )}
        </div>
      )}

      {/* Confirm Archive Dialog */}
      <ConfirmDialog
        isOpen={archiveDialog.isOpen}
        title="Archive Design?"
        description={`Are you sure you want to archive '${selectedDesign?.name}'? The design will no longer appear in active lists but historical records remain preserved.`}
        confirmText="Archive"
        cancelText="Cancel"
        isDestructive
        isLoading={archiveMutation.isPending}
        onConfirm={handleConfirmArchive}
        onCancel={archiveDialog.onClose}
      />
    </div>
  );
};
