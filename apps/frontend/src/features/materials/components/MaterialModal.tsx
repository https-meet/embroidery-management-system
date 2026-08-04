import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { materialsApi } from '../api/materialsApi';
import type { CreateMaterialInput, Material, MaterialCategory, MaterialUnit } from '../types/materials.types';

interface MaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  materialToEdit?: Material | null;
}

const CATEGORIES: MaterialCategory[] = [
  'THREAD',
  'FABRIC',
  'BACKING',
  'NEEDLE',
  'PACKAGING',
  'ACCESSORY',
  'OTHER',
];

const UNITS: MaterialUnit[] = [
  'PCS',
  'KG',
  'GRAM',
  'METER',
  'ROLL',
  'CONE',
  'BOX',
  'PACKET',
  'LITER',
  'OTHER',
];

export const MaterialModal: React.FC<MaterialModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  materialToEdit,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateMaterialInput>({
    name: '',
    sku: '',
    brand: '',
    colorName: '',
    colorCode: '',
    category: 'THREAD',
    unit: 'CONE',
    purchasePrice: 0,
    sellingPrice: null,
    minimumStock: 0,
    currentStock: 0,
    description: '',
  });

  useEffect(() => {
    if (materialToEdit) {
      setFormData({
        name: materialToEdit.name,
        sku: materialToEdit.sku || '',
        brand: materialToEdit.brand || '',
        colorName: materialToEdit.colorName || '',
        colorCode: materialToEdit.colorCode || '',
        category: materialToEdit.category,
        unit: materialToEdit.unit,
        purchasePrice: materialToEdit.purchasePrice,
        sellingPrice: materialToEdit.sellingPrice,
        minimumStock: materialToEdit.minimumStock,
        currentStock: materialToEdit.currentStock,
        description: materialToEdit.description || '',
      });
    } else {
      setFormData({
        name: '',
        sku: '',
        brand: '',
        colorName: '',
        colorCode: '',
        category: 'THREAD',
        unit: 'CONE',
        purchasePrice: 0,
        sellingPrice: null,
        minimumStock: 0,
        currentStock: 0,
        description: '',
      });
    }
  }, [materialToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Material name is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: CreateMaterialInput = {
        ...formData,
        name: formData.name.trim(),
        sku: formData.sku?.trim() || null,
        brand: formData.brand?.trim() || null,
        colorName: formData.colorName?.trim() || null,
        colorCode: formData.colorCode?.trim() || null,
        description: formData.description?.trim() || null,
        purchasePrice: Number(formData.purchasePrice) || 0,
        sellingPrice: formData.sellingPrice ? Number(formData.sellingPrice) : null,
        minimumStock: Number(formData.minimumStock) || 0,
        currentStock: Number(formData.currentStock) || 0,
      };

      if (materialToEdit) {
        const result = await materialsApi.update(materialToEdit.id, payload);
        toast.success(result.skuWarning || `Material '${result.material.name}' updated successfully.`);
      } else {
        const result = await materialsApi.create(payload);
        toast.success(result.skuWarning || `Material '${result.material.name}' created successfully.`);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      const errMsg = err?.response?.data?.error?.message || 'Failed to save material.';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-base font-bold text-foreground">
          {materialToEdit ? 'Edit Material Master' : 'Add New Material Master'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-foreground mb-1">
                Material Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Madeira Rayon Thread #40 - Black"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">SKU (Code)</label>
              <input
                type="text"
                placeholder="e.g. TH-MAD-BLK-40"
                value={formData.sku || ''}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Brand / Manufacturer</label>
              <input
                type="text"
                placeholder="e.g. Madeira, Gunold, Isacord"
                value={formData.brand || ''}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as MaterialCategory })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Unit of Measurement</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value as MaterialUnit })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Color Name</label>
              <input
                type="text"
                placeholder="e.g. Royal Blue, White"
                value={formData.colorName || ''}
                onChange={(e) => setFormData({ ...formData, colorName: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Shade / Color Code</label>
              <input
                type="text"
                placeholder="e.g. 1001, PMS 286 C"
                value={formData.colorCode || ''}
                onChange={(e) => setFormData({ ...formData, colorCode: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Purchase Price (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Selling Price (₹) (Optional)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.sellingPrice ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sellingPrice: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Current Stock</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Minimum Stock (Alert Level)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0"
                value={formData.minimumStock}
                onChange={(e) => setFormData({ ...formData, minimumStock: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-foreground mb-1">Description / Remarks</label>
              <textarea
                rows={2}
                placeholder="Additional material details..."
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              {materialToEdit ? 'Save Changes' : 'Create Material'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
