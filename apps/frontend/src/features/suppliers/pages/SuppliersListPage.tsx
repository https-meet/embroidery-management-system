import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Filter, Edit2, Power } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { PaginationBar } from '@/shared/components/PaginationBar';
import { TableSkeleton } from '@/shared/components/LoadingSkeleton';
import { suppliersApi } from '../api/suppliersApi';
import type { Supplier, SupplierQueryFilters } from '../types/suppliers.types';
import { SupplierModal } from '../components/SupplierModal';
import { SupplierStatusModal } from '../components/SupplierStatusModal';

export const SuppliersListPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters State
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [search, setSearch] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('');

  // Modals State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [statusSupplier, setStatusSupplier] = useState<Supplier | null>(null);

  const fetchSuppliers = useCallback(async () => {
    try {
      setIsLoading(true);
      const filters: SupplierQueryFilters = {
        page,
        limit,
        search: search.trim() || undefined,
        active: activeFilter || undefined,
      };
      const res = await suppliersApi.list(filters);
      setSuppliers(res.suppliers);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      const errMsg = err?.response?.data?.error?.message || 'Failed to fetch suppliers.';
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, activeFilter]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleOpenCreate = () => {
    setSelectedSupplier(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleOpenStatus = (supplier: Supplier) => {
    setStatusSupplier(supplier);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Supplier Directory</h1>
          <p className="text-xs text-muted-foreground">
            Manage thread manufacturers, fabric mills, backing vendors, and packaging suppliers.
          </p>
        </div>
        <Button onClick={handleOpenCreate} size="sm" className="shrink-0">
          <Plus className="mr-1.5 h-4 w-4" /> Add Supplier
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-lg border border-border">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search supplier name, contact person, phone, email, GST, city..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
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

      {/* Supplier Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden shadow-xs">
        {isLoading ? (
          <TableSkeleton rows={5} columns={7} />
        ) : suppliers.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-muted-foreground">No suppliers found matching search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Supplier Name & Contact</th>
                  <th className="px-4 py-3">Phone & Email</th>
                  <th className="px-4 py-3">GSTIN</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground">{s.name}</div>
                      {s.contactPerson && (
                        <div className="text-[11px] text-muted-foreground">Contact: {s.contactPerson}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-foreground">{s.phone || '—'}</div>
                      {s.email && <div className="text-[11px] text-muted-foreground">{s.email}</div>}
                    </td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">
                      {s.gstNumber || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-foreground">{s.city || '—'}</div>
                      {s.state && <div className="text-[11px] text-muted-foreground">{s.state}</div>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          s.isActive
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {s.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(s)}
                        title="Edit Supplier"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenStatus(s)}
                        title={s.isActive ? 'Deactivate Supplier' : 'Activate Supplier'}
                      >
                        <Power className={`h-3.5 w-3.5 ${s.isActive ? 'text-destructive' : 'text-emerald-600'}`} />
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

      {/* Supplier Modal */}
      <SupplierModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchSuppliers}
        supplierToEdit={selectedSupplier}
      />

      {/* Supplier Status Toggle Modal */}
      <SupplierStatusModal
        isOpen={Boolean(statusSupplier)}
        onClose={() => setStatusSupplier(null)}
        onSuccess={fetchSuppliers}
        supplier={statusSupplier}
      />
    </div>
  );
};
