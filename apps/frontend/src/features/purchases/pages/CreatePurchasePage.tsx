import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { useUnsavedChanges } from '@/shared/hooks/useUnsavedChanges';
import { ROUTES } from '@/shared/constants/routes';
import { suppliersApi, type Supplier } from '@/features/suppliers';
import { materialsApi, type Material } from '@/features/materials';
import { purchasesApi } from '../api/purchasesApi';
import type { CreatePurchaseItemInput } from '../types/purchases.types';

interface PurchaseFormRow {
  materialId: string;
  materialName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export const CreatePurchasePage: React.FC = () => {
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoadingMasterData, setIsLoadingMasterData] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [supplierId, setSupplierId] = useState<string>('');
  const [purchaseDate, setPurchaseDate] = useState<string>(new Date().toISOString().split('T')[0] || '');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [updateInventory, setUpdateInventory] = useState<boolean>(false); // Default = OFF

  // Selected Items State
  const [items, setItems] = useState<PurchaseFormRow[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
  const [inputQty, setInputQty] = useState<number>(1);
  const [inputPrice, setInputPrice] = useState<number>(0);

  const isDirty = Boolean(supplierId || invoiceNumber || items.length > 0 || notes);
  const { isBlocked, proceed, reset: cancelBlock } = useUnsavedChanges(isDirty);

  useEffect(() => {
    const loadMasterData = async () => {
      try {
        setIsLoadingMasterData(true);
        const [supRes, matRes] = await Promise.all([
          suppliersApi.list({ limit: 100, active: 'true' }),
          materialsApi.list({ limit: 100, active: 'true' }),
        ]);
        setSuppliers(supRes.suppliers);
        setMaterials(matRes.materials);
      } catch {
        toast.error('Failed to load supplier/material directory.');
      } finally {
        setIsLoadingMasterData(false);
      }
    };
    loadMasterData();
  }, []);

  const handleMaterialSelect = (matId: string) => {
    setSelectedMaterialId(matId);
    const found = materials.find((m) => m.id === matId);
    if (found) {
      setInputPrice(found.purchasePrice || 0);
    }
  };

  const handleAddItem = () => {
    if (!selectedMaterialId) {
      toast.error('Please select a material.');
      return;
    }
    if (inputQty <= 0) {
      toast.error('Quantity must be greater than 0.');
      return;
    }
    if (inputPrice < 0) {
      toast.error('Price cannot be negative.');
      return;
    }

    const foundMat = materials.find((m) => m.id === selectedMaterialId);
    const lineTotal = Number((inputQty * inputPrice).toFixed(2));

    const existingIndex = items.findIndex((i) => i.materialId === selectedMaterialId);
    if (existingIndex >= 0 && items[existingIndex]) {
      const updated = [...items];
      const existing = updated[existingIndex]!;
      const newQty = existing.quantity + inputQty;
      updated[existingIndex] = {
        ...existing,
        quantity: newQty,
        unitPrice: inputPrice,
        lineTotal: Number((newQty * inputPrice).toFixed(2)),
      };
      setItems(updated);
    } else {
      setItems([
        ...items,
        {
          materialId: selectedMaterialId,
          materialName: foundMat?.name || 'Material',
          quantity: inputQty,
          unitPrice: inputPrice,
          lineTotal,
        },
      ]);
    }

    setSelectedMaterialId('');
    setInputQty(1);
    setInputPrice(0);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  // Financial Calculations
  const subtotal = Number(items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2));
  const numDiscount = Number(discount) || 0;
  const numTax = Number(tax) || 0;
  const grandTotal = Number((subtotal - numDiscount + numTax).toFixed(2));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) {
      toast.error('Please select a supplier.');
      return;
    }
    if (items.length === 0) {
      toast.error('Please add at least one material item.');
      return;
    }
    if (grandTotal < 0) {
      toast.error('Purchase total cannot be negative.');
      return;
    }

    try {
      setIsSubmitting(true);
      const itemDtos: CreatePurchaseItemInput[] = items.map((i) => ({
        materialId: i.materialId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      }));

      const purchase = await purchasesApi.create({
        supplierId,
        purchaseDate,
        invoiceNumber: invoiceNumber.trim() || null,
        discount: numDiscount,
        tax: numTax,
        notes: notes.trim() || null,
        updateInventory,
        items: itemDtos,
      });

      toast.success(`Purchase '${purchase.purchaseNumber}' created successfully.`);
      setSupplierId('');
      setInvoiceNumber('');
      setItems([]);
      setNotes('');
      navigate(ROUTES.PURCHASES.LIST);
    } catch (err: any) {
      const errMsg = err?.error?.message || err?.message || 'Failed to record purchase.';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingMasterData) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm font-medium text-muted-foreground">Loading supplier and material directories...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.PURCHASES.LIST)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Record Material Purchase</h1>
          <p className="text-xs text-muted-foreground">
            Log raw material orders, supplier invoice numbers, and optional stock updates.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Supplier & Date Details */}
        <div className="bg-card p-5 rounded-lg border border-border shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider border-b border-border pb-2">
            1. Supplier & Invoice Information
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-foreground mb-1">
                Select Supplier <span className="text-destructive">*</span>
              </label>
              <select
                required
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">-- Choose Supplier --</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.city ? `(${s.city})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Purchase Date
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Supplier Invoice No (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. INV-SUP-9001"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-foreground mb-1">
                Purchase Notes / Instructions
              </label>
              <input
                type="text"
                placeholder="e.g. 5000m cones batch order"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Add Materials */}
        <div className="bg-card p-5 rounded-lg border border-border shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider border-b border-border pb-2">
            2. Add Material Line Items
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 items-end bg-muted/40 p-3 rounded-md border border-border">
            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold text-foreground mb-1">Select Material</label>
              <select
                value={selectedMaterialId}
                onChange={(e) => handleMaterialSelect(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">-- Choose Material --</option>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} [{m.unit}] (₹{m.purchasePrice})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-foreground mb-1">Qty</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={inputQty}
                onChange={(e) => setInputQty(parseFloat(e.target.value) || 0)}
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-foreground mb-1">Unit Price (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={inputPrice}
                onChange={(e) => setInputPrice(parseFloat(e.target.value) || 0)}
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="sm:col-span-2">
              <Button type="button" size="sm" onClick={handleAddItem} className="w-full">
                <Plus className="mr-1 h-3.5 w-3.5" /> Add
              </Button>
            </div>
          </div>

          {items.length > 0 ? (
            <div className="overflow-x-auto border border-border rounded-md">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 border-b border-border uppercase font-semibold text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Material</th>
                    <th className="px-3 py-2 text-right">Quantity</th>
                    <th className="px-3 py-2 text-right">Unit Price</th>
                    <th className="px-3 py-2 text-right">Line Total</th>
                    <th className="px-3 py-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-muted/20">
                      <td className="px-3 py-2 font-medium text-foreground">{item.materialName}</td>
                      <td className="px-3 py-2 text-right font-mono">{item.quantity}</td>
                      <td className="px-3 py-2 text-right font-mono">₹{item.unitPrice.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right font-mono font-semibold">₹{item.lineTotal.toFixed(2)}</td>
                      <td className="px-3 py-2 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic text-center py-4">No material items added yet.</p>
          )}
        </div>

        {/* Step 3: Financial Summary & Inventory Checkbox */}
        <div className="bg-card p-5 rounded-lg border border-border shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider border-b border-border pb-2">
            3. Financial Summary & Inventory Policy
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 items-center">
            <div className="p-4 bg-muted/30 border border-border rounded-lg space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={updateInventory}
                  onChange={(e) => setUpdateInventory(e.target.checked)}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                />
                <span className="text-sm font-bold text-foreground">Update Material Stock Quantities</span>
              </label>
              <p className="text-xs text-muted-foreground pl-7">
                If checked, received quantities will immediately increase material stock counts in the Material Master catalog. Default is OFF.
              </p>
            </div>

            <div className="space-y-2 bg-muted/40 p-4 rounded-lg border border-border text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal:</span>
                <span className="font-mono font-medium text-foreground">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Discount (₹):</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-24 px-2 py-1 text-right font-mono text-xs bg-background border border-input rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Tax / GST (₹):</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={tax}
                  onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                  className="w-24 px-2 py-1 text-right font-mono text-xs bg-background border border-input rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex justify-between text-sm font-bold text-foreground border-t border-border pt-2">
                <span>Grand Total:</span>
                <span className="font-mono text-primary">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" size="sm" onClick={() => navigate(ROUTES.PURCHASES.LIST)}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isSubmitting}>
            Record Purchase Order
          </Button>
        </div>
      </form>

      <ConfirmDialog
        isOpen={isBlocked}
        title="Unsaved Changes"
        description="You have unsaved changes. Are you sure you want to leave?"
        confirmText="Leave Page"
        cancelText="Stay"
        isDestructive
        onConfirm={proceed}
        onCancel={cancelBlock}
      />
    </div>
  );
};
