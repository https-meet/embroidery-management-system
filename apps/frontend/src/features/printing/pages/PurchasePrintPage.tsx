import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { ROUTES } from '@/shared/constants/routes';
import { purchasesApi } from '@/features/purchases';
import { axiosClient } from '@/shared/api';

export const PurchasePrintPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [purchase, setPurchase] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const [purRes, setRes]: [any, any] = await Promise.all([
          purchasesApi.getById(id),
          axiosClient.get('/settings/business'),
        ]);
        setPurchase(purRes);
        setSettings(setRes.data?.config || setRes.data?.settings || setRes.data);
      } catch {
        toast.error('Failed to load purchase receipt details.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-sm font-medium text-muted-foreground">
        Preparing Material Purchase Voucher Print View...
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

  const handlePrint = () => {
    window.print();
  };

  const company = settings || {
    companyName: 'EBMS Embroidery Factory',
    address: 'Plot 102, Industrial Estate',
    city: 'Surat',
    gstin: '24AAAAA0000A1Z5',
  };

  const items = purchase.items || [];
  const subtotal = Number(purchase.subtotal || 0);
  const discount = Number(purchase.discount || 0);
  const tax = Number(purchase.tax || 0);
  const total = Number(purchase.total || subtotal - discount + tax);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-4 sm:p-8">
      {/* Action Bar */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.PURCHASES.DETAIL(purchase.id))}>
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Purchase Detail
        </Button>
        <Button size="sm" onClick={handlePrint} className="bg-slate-900 hover:bg-slate-800 text-white">
          <Printer className="mr-1.5 h-4 w-4" /> Print Purchase Voucher (A4)
        </Button>
      </div>

      {/* Printable A4 Paper Document Container */}
      <div className="max-w-4xl mx-auto bg-white text-slate-900 p-8 rounded-lg shadow-lg border border-slate-200 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none font-sans text-xs">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-4">
          <div className="space-y-1">
            <h1 className="text-xl font-bold uppercase tracking-wider text-slate-900">{company.companyName}</h1>
            <p className="text-slate-600">{company.address}, {company.city}</p>
            <p className="font-mono text-slate-900 font-bold">GSTIN: {company.gstin}</p>
          </div>
          <div className="text-right space-y-1">
            <div className="inline-block px-3 py-1 bg-slate-900 text-white font-bold tracking-widest text-sm rounded">
              PURCHASE VOUCHER
            </div>
            <div className="text-xs font-mono font-bold text-slate-900 pt-1">No: {purchase.purchaseNumber}</div>
            <div className="text-slate-600">Date: {new Date(purchase.purchaseDate).toLocaleDateString()}</div>
          </div>
        </div>

        {/* Supplier Details */}
        <div className="grid grid-cols-2 gap-4 border border-slate-300 rounded p-3 mb-4 bg-slate-50">
          <div>
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Supplier Details:</span>
            <div className="font-bold text-slate-900 text-sm">{purchase.supplierName || 'Supplier'}</div>
          </div>
          <div className="text-right space-y-1">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Supplier Invoice Ref:</span>
            <div className="font-mono font-bold text-slate-900">{purchase.invoiceNumber || 'N/A'}</div>
            <div className="text-slate-600">Stock Status: <span className="font-bold uppercase text-emerald-800">{purchase.inventoryUpdated ? 'Catalog Stock Updated' : 'Financial Record Only'}</span></div>
          </div>
        </div>

        {/* Raw Material Items Table */}
        <table className="w-full border-collapse border border-slate-300 mb-4 text-left">
          <thead>
            <tr className="bg-slate-900 text-white font-semibold text-[11px]">
              <th className="border border-slate-400 px-3 py-2 text-center w-12">#</th>
              <th className="border border-slate-400 px-3 py-2">Material Description</th>
              <th className="border border-slate-400 px-3 py-2 text-right">Quantity</th>
              <th className="border border-slate-400 px-3 py-2 text-right">Unit Price (₹)</th>
              <th className="border border-slate-400 px-3 py-2 text-right">Line Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any, index: number) => (
              <tr key={index} className="border-b border-slate-200">
                <td className="border border-slate-300 px-3 py-2 text-center font-mono">{index + 1}</td>
                <td className="border border-slate-300 px-3 py-2 font-bold text-slate-900">{item.materialName || item.materialId}</td>
                <td className="border border-slate-300 px-3 py-2 text-right font-mono">{item.quantity}</td>
                <td className="border border-slate-300 px-3 py-2 text-right font-mono">₹{Number(item.unitPrice).toFixed(2)}</td>
                <td className="border border-slate-300 px-3 py-2 text-right font-mono font-bold">₹{Number(item.lineTotal || item.quantity * item.unitPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Financial Summary */}
        <div className="flex justify-end mb-8">
          <div className="w-64 border border-slate-300 rounded p-3 space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-bold text-slate-900">₹{subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Discount:</span>
                <span className="font-bold text-slate-900">-₹{discount.toFixed(2)}</span>
              </div>
            )}
            {tax > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Tax / GST:</span>
                <span className="font-bold text-slate-900">+₹{tax.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-900 font-bold text-sm border-t-2 border-slate-900 pt-2">
              <span>Grand Total:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer & Signatures */}
        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-300 items-end">
          <div className="text-[10px] text-slate-500">
            Recorded By: {purchase.createdBy || 'Store Manager'}
          </div>
          <div className="text-right space-y-8">
            <div className="text-slate-500 border-t border-slate-400 inline-block pt-1 px-8 text-xs font-semibold">
              Receiving Storekeeper Signature
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
