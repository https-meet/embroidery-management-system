import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Filter, Edit2, Power } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { PaginationBar } from '@/shared/components/PaginationBar';
import { TableSkeleton } from '@/shared/components/LoadingSkeleton';
import { materialsApi } from '../api/materialsApi';
import type { Material, MaterialCategory, MaterialQueryFilters } from '../types/materials.types';
import { MaterialModal } from '../components/MaterialModal';
import { MaterialStatusModal } from '../components/MaterialStatusModal';

export const MaterialsListPage: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters State
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('');

  // Modals State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [statusMaterial, setStatusMaterial] = useState<Material | null>(null);

  const fetchMaterials = useCallback(async () => {
    try {
      setIsLoading(true);
      const filters: MaterialQueryFilters = {
        page,
        limit,
        search: search.trim() || undefined,
        category: (categoryFilter as MaterialCategory) || undefined,
        active: activeFilter || undefined,
      };
      const res = await materialsApi.list(filters);
      setMaterials(res.materials);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      const errMsg = err?.response?.data?.error?.message || 'Failed to fetch materials.';
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, categoryFilter, activeFilter]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const handleOpenCreate = () => {
    setSelectedMaterial(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (material: Material) => {
    setSelectedMaterial(material);
    setIsModalOpen(true);
  };

  const handleOpenStatus = (material: Material) => {
    setStatusMaterial(material);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Material Master Catalog</h1>
          <p className="text-xs text-muted-foreground">
            Manage raw materials, threads, backing rolls, needles, and consumables.
          </p>
        </div>
        <Button onClick={handleOpenCreate} size="sm" className="shrink-0">
          <Plus className="mr-1.5 h-4 w-4" /> Add Material
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-lg border border-border">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search material name, SKU, brand, color..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Category & Status Filters */}
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-background border border-input rounded-md px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Categories</option>
            <option value="THREAD">THREAD</option>
            <option value="FABRIC">FABRIC</option>
            <option value="BACKING">BACKING</option>
            <option value="NEEDLE">NEEDLE</option>
            <option value="PACKAGING">PACKAGING</option>
            <option value="ACCESSORY">ACCESSORY</option>
            <option value="OTHER">OTHER</option>
          </select>

          <select
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-background border border-input rounded-md px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Material Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden shadow-xs">
        {isLoading ? (
          <TableSkeleton rows={5} columns={8} />
        ) : materials.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-muted-foreground">No materials found matching search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Material Name & SKU</th>
                  <th className="px-4 py-3">Brand & Color</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Purchase Price</th>
                  <th className="px-4 py-3 text-right">Current Stock</th>
                  <th className="px-4 py-3 text-center">Unit</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {materials.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground">{m.name}</div>
                      {m.sku && <div className="text-[11px] text-muted-foreground font-mono">SKU: {m.sku}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-foreground">{m.brand || '—'}</div>
                      {(m.colorName || m.colorCode) && (
                        <div className="text-[11px] text-muted-foreground">
                          {m.colorName} {m.colorCode ? `(#${m.colorCode})` : ''}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">
                        {m.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-medium text-foreground">
                      ₹{m.purchasePrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`font-mono font-bold ${
                          m.currentStock <= m.minimumStock
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-foreground'
                        }`}
                      >
                        {m.currentStock}
                      </span>
                      {m.minimumStock > 0 && (
                        <div className="text-[10px] text-muted-foreground">Min: {m.minimumStock}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground font-mono">
                      {m.unit}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          m.isActive
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {m.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(m)}
                        title="Edit Material"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenStatus(m)}
                        title={m.isActive ? 'Deactivate Material' : 'Activate Material'}
                      >
                        <Power className={`h-3.5 w-3.5 ${m.isActive ? 'text-destructive' : 'text-emerald-600'}`} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {total > 0 && (
          <div className="border-t border-border px-4 py-3">
            <PaginationBar
              currentPage={page}
              totalPages={totalPages}
              totalItems={total}
              pageSize={limit}
              onPageChange={setPage}
              onPageSizeChange={setLimit}
            />
          </div>
        )}
      </div>

      {/* Material Create / Edit Modal */}
      <MaterialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchMaterials}
        materialToEdit={selectedMaterial}
      />

      {/* Material Status Toggle Modal */}
      <MaterialStatusModal
        isOpen={Boolean(statusMaterial)}
        onClose={() => setStatusMaterial(null)}
        onSuccess={fetchMaterials}
        material={statusMaterial}
      />
    </div>
  );
};
