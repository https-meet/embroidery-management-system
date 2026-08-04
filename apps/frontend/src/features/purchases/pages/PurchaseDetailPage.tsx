import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, FileText, User, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { ROUTES } from '@/shared/constants/routes';
import { purchasesApi } from '../api/purchasesApi';
import type { Purchase } from '../types/purchases.types';

export const PurchaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const data = await purchasesApi.getById(id);
        setPurchase(data);
      } catch {
        toast.error('Failed to fetch purchase details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm font-medium text-muted-foreground">Loading purchase record details...</p>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm font-medium text-muted-foreground">Purchase record not found.</p>
        <Button size="sm" onClick={() => navigate(ROUTES.PURCHASES.LIST)}>Back to Purchase Log</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.PURCHASES.LIST)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{purchase.purchaseNumber}</h1>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  purchase.inventoryUpdated
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {purchase.inventoryUpdated ? 'Stock Updated' : 'Financial Record Only'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Purchase Order Details</p>
          </div>
        </div>

        <Button size="sm" onClick={() => navigate(ROUTES.PURCHASES.PRINT(purchase.id))}>
          <Printer className="mr-1.5 h-4 w-4" /> Print Voucher
        </Button>
      </div>

      {/* Meta Card */}
      <div className="bg-card p-5 rounded-lg border border-border grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="space-y-1">
          <div className="flex items-center text-muted-foreground space-x-1.5">
            <User className="h-3.5 w-3.5" />
            <span className="font-semibold">Supplier Name</span>
          </div>
          <div className="text-sm font-bold text-foreground">{purchase.supplierName || 'Supplier'}</div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center text-muted-foreground space-x-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span className="font-semibold">Purchase Date</span>
          </div>
          <div className="text-sm font-bold text-foreground">
            {new Date(purchase.purchaseDate).toLocaleDateString()}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center text-muted-foreground space-x-1.5">
            <FileText className="h-3.5 w-3.5" />
            <span className="font-semibold">Supplier Invoice No</span>
          </div>
          <div className="text-sm font-bold text-foreground font-mono">{purchase.invoiceNumber || 'N/A'}</div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="px-4 py-3 bg-muted/40 border-b border-border font-bold text-xs uppercase text-foreground">
          Purchase Line Items
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/20 border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="px-4 py-2.5">Material</th>
                <th className="px-4 py-2.5 text-right">Quantity</th>
                <th className="px-4 py-2.5 text-right">Unit Price</th>
                <th className="px-4 py-2.5 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {purchase.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-medium text-foreground">{item.materialName || item.materialId}</td>
                  <td className="px-4 py-2.5 text-right font-mono">{item.quantity}</td>
                  <td className="px-4 py-2.5 text-right font-mono">₹{Number(item.unitPrice).toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-semibold">
                    ₹{Number(item.lineTotal || item.quantity * item.unitPrice).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Breakdown */}
        <div className="p-4 bg-muted/20 border-t border-border flex justify-end">
          <div className="w-64 space-y-1.5 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal:</span>
              <span className="font-mono">₹{Number(purchase.subtotal).toFixed(2)}</span>
            </div>
            {Number(purchase.discount) > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Discount:</span>
                <span className="font-mono">-₹{Number(purchase.discount).toFixed(2)}</span>
              </div>
            )}
            {Number(purchase.tax) > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Tax / GST:</span>
                <span className="font-mono">+₹{Number(purchase.tax).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-foreground border-t border-border pt-2">
              <span>Total Amount:</span>
              <span className="font-mono text-primary">₹{Number(purchase.total).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
