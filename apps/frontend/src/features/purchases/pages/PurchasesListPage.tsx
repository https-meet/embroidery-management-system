import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { PaginationBar } from '@/shared/components/PaginationBar';
import { TableSkeleton } from '@/shared/components/LoadingSkeleton';
import { ROUTES } from '@/shared/constants/routes';
import { purchasesApi } from '../api/purchasesApi';
import type { Purchase, PurchaseQueryFilters } from '../types/purchases.types';

export const PurchasesListPage: React.FC = () => {
  const navigate = useNavigate();

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filter State
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [search, setSearch] = useState<string>('');
  const [inventoryFilter, setInventoryFilter] = useState<string>('');

  const fetchPurchases = useCallback(async () => {
    try {
      setIsLoading(true);
      const filters: PurchaseQueryFilters = {
        page,
        limit,
        search: search.trim() || undefined,
        inventoryUpdated: inventoryFilter || undefined,
      };
      const res = await purchasesApi.list(filters);
      setPurchases(res.purchases);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      const errMsg = err?.response?.data?.error?.message || 'Failed to fetch purchases.';
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, inventoryFilter]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Purchase Management Log</h1>
          <p className="text-xs text-muted-foreground">
            Track material purchases from suppliers and optional stock updates.
          </p>
        </div>
        <Button onClick={() => navigate(ROUTES.PURCHASES.CREATE)} size="sm" className="shrink-0">
          <Plus className="mr-1.5 h-4 w-4" /> Record Purchase
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-lg border border-border">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search purchase number, supplier, invoice number, notes..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Inventory Policy Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <select
            value={inventoryFilter}
            onChange={(e) => {
              setInventoryFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-background border border-input rounded-md px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Purchases</option>
            <option value="true">Stock Updated</option>
            <option value="false">Financial Only</option>
          </select>
        </div>
      </div>

      {/* Purchase Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden shadow-xs">
        {isLoading ? (
          <TableSkeleton rows={5} columns={7} />
        ) : purchases.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-muted-foreground">No purchases found matching search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Purchase No</th>
                  <th className="px-4 py-3">Supplier Name</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Supplier Invoice No</th>
                  <th className="px-4 py-3 text-right">Total Amount</th>
                  <th className="px-4 py-3 text-center">Stock Policy</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {purchases.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-bold font-mono text-primary">
                      {p.purchaseNumber}
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {p.supplierName || '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(p.purchaseDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">
                      {p.invoiceNumber || '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-foreground">
                      ₹{Number(p.total).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          p.inventoryUpdated
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {p.inventoryUpdated ? 'Stock Updated' : 'Financial Record Only'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(ROUTES.PURCHASES.DETAIL(p.id))}
                        title="View Details"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" /> View
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
    </div>
  );
};
