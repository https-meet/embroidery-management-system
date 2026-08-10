import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileUp, Image as ImageIcon, Sparkles, CheckCircle2 } from 'lucide-react';
import { FormField } from '@/shared/components/FormField';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { useUnsavedChanges } from '@/shared/hooks/useUnsavedChanges';
import { designSchema, type DesignFormValues } from '../schemas/design.schema';
import { parseDstFile } from '../utils/dstParser';

export interface DesignFormProps {
  initialValues?: Partial<DesignFormValues>;
  onSubmit: (values: DesignFormValues) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
}

export const DesignForm: React.FC<DesignFormProps> = ({
  initialValues,
  onSubmit,
  isLoading,
  onCancel,
}) => {
  type DimensionUnit = 'in' | 'mm' | 'cm';
  const [dimUnit, setDimUnit] = useState<DimensionUnit>('in'); // Default: Inches

  const [inputWidth, setInputWidth] = useState<string>(
    initialValues?.widthMm ? (initialValues.widthMm / 25.4).toFixed(2) : ''
  );
  const [inputHeight, setInputHeight] = useState<string>(
    initialValues?.heightMm ? (initialValues.heightMm / 25.4).toFixed(2) : ''
  );

  const [dstFileName, setDstFileName] = useState<string | null>(null);
  const [dstParsedSuccess, setDstParsedSuccess] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<DesignFormValues>({
    resolver: zodResolver(designSchema),
    defaultValues: {
      name: initialValues?.name || '',
      category: initialValues?.category || '',
      description: initialValues?.description || '',
      previewUrl: initialValues?.previewUrl || '',
      primaryFileUrl: initialValues?.primaryFileUrl || '',
      primaryFileType: initialValues?.primaryFileType || '',
      stitchCount: initialValues?.stitchCount ?? undefined,
      widthMm: initialValues?.widthMm ?? undefined,
      heightMm: initialValues?.heightMm ?? undefined,
      colorCount: initialValues?.colorCount ?? undefined,
      notes: initialValues?.notes || '',
      isActive: initialValues?.isActive ?? true,
    },
  });

  const previewUrl = watch('previewUrl');

  // Convert current input width & height to MM based on active unit selector
  const calculateMm = (valStr: string, unit: DimensionUnit): number | undefined => {
    const num = parseFloat(valStr);
    if (isNaN(num) || num <= 0) return undefined;
    if (unit === 'in') return parseFloat((num * 25.4).toFixed(1));
    if (unit === 'cm') return parseFloat((num * 10).toFixed(1));
    return parseFloat(num.toFixed(1));
  };

  const handleUnitChange = (newUnit: DimensionUnit) => {
    // Re-calculate visible width & height input values to match new unit
    const currMmW = calculateMm(inputWidth, dimUnit);
    const currMmH = calculateMm(inputHeight, dimUnit);

    setDimUnit(newUnit);

    if (currMmW) {
      if (newUnit === 'in') setInputWidth((currMmW / 25.4).toFixed(2));
      else if (newUnit === 'cm') setInputWidth((currMmW / 10).toFixed(2));
      else setInputWidth(currMmW.toString());
    }

    if (currMmH) {
      if (newUnit === 'in') setInputHeight((currMmH / 25.4).toFixed(2));
      else if (newUnit === 'cm') setInputHeight((currMmH / 10).toFixed(2));
      else setInputHeight(currMmH.toString());
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setDstFileName(file.name);
    const isDst = file.name.toLowerCase().endsWith('.dst');

    if (isDst) {
      try {
        const buffer = await file.arrayBuffer();
        const meta = parseDstFile(buffer);

        // Convert file to Data URL for primaryFileUrl storage
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setValue('primaryFileUrl', reader.result);
          }
        };
        reader.readAsDataURL(file);

        // Auto-populate form fields
        if (!watch('name')) {
          const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
          setValue('name', cleanName);
        }

        setValue('stitchCount', meta.stitchCount);
        setValue('colorCount', meta.colorCount);
        setValue('primaryFileType', 'DST');

        if (meta.previewDataUrl) {
          setValue('previewUrl', meta.previewDataUrl);
        }

        // Set dimensions based on current unit
        if (dimUnit === 'in') {
          setInputWidth(meta.widthInches.toString());
          setInputHeight(meta.heightInches.toString());
        } else if (dimUnit === 'cm') {
          setInputWidth((meta.widthMm / 10).toFixed(2));
          setInputHeight((meta.heightMm / 10).toFixed(2));
        } else {
          setInputWidth(meta.widthMm.toString());
          setInputHeight(meta.heightMm.toString());
        }

        setValue('widthMm', meta.widthMm);
        setValue('heightMm', meta.heightMm);
        setDstParsedSuccess(true);
      } catch (err) {
        console.error('Error parsing DST file:', err);
      }
    }
  };



  useEffect(() => {
    if (initialValues) {
      reset({
        name: initialValues.name || '',
        category: initialValues.category || '',
        description: initialValues.description || '',
        previewUrl: initialValues.previewUrl || '',
        primaryFileUrl: initialValues.primaryFileUrl || '',
        primaryFileType: initialValues.primaryFileType || '',
        stitchCount: initialValues.stitchCount ?? undefined,
        widthMm: initialValues.widthMm ?? undefined,
        heightMm: initialValues.heightMm ?? undefined,
        colorCount: initialValues.colorCount ?? undefined,
        notes: initialValues.notes || '',
        isActive: initialValues.isActive ?? true,
      });

      if (initialValues.widthMm) {
        setInputWidth((initialValues.widthMm / 25.4).toFixed(2));
      }
      if (initialValues.heightMm) {
        setInputHeight((initialValues.heightMm / 25.4).toFixed(2));
      }
    }
  }, [initialValues, reset]);

  const isEditing = Boolean(initialValues?.name);

  const { isBlocked, proceed, reset: cancelBlock } = useUnsavedChanges(isDirty);

  const handleFormSubmit = async (values: DesignFormValues) => {
    const finalWidthMm = calculateMm(inputWidth, dimUnit);
    const finalHeightMm = calculateMm(inputHeight, dimUnit);

    const payload: DesignFormValues = {
      ...values,
      widthMm: finalWidthMm,
      heightMm: finalHeightMm,
    };

    await onSubmit(payload);
    reset(payload);
  };

  return (
    <>
      <ConfirmDialog
        isOpen={isBlocked}
        title="Unsaved Changes"
        description="You have unsaved changes. Are you sure you want to leave?"
        onConfirm={proceed}
        onCancel={cancelBlock}
      />
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Tajima .DST File Reader Upload Box */}
      <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4 transition-all hover:bg-primary/10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-left">
            <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <FileUp className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <span>Upload Tajima (.DST) File</span>
                <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  Auto-Extract
                </span>
              </h4>
              <p className="text-[11px] text-muted-foreground">
                Drop your Tajima .DST file to automatically extract Stitch Count, Color Stops, Dimensions & Stitch Preview.
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".dst,.emb,.pes"
                className="hidden"
                onChange={handleFileUpload}
              />
              <span className="inline-flex items-center space-x-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Select .DST File</span>
              </span>
            </label>
          </div>
        </div>

        {dstFileName && (
          <div className="mt-3 flex items-center space-x-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>
              Parsed {dstFileName} — {dstParsedSuccess ? 'Stitch Count, Colors & Preview Generated!' : 'File Loaded'}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Design Name */}
        <FormField
          label="Design Name"
          htmlFor="name"
          required
          error={errors.name?.message}
        >
          <Input
            id="name"
            placeholder="e.g. Floral Pocket Logo or School Emblem"
            error={Boolean(errors.name)}
            {...register('name')}
          />
        </FormField>

        {/* Category */}
        <FormField
          label="Category (optional)"
          htmlFor="category"
          error={errors.category?.message}
        >
          <Input
            id="category"
            placeholder="e.g. Badges, Logos, Floral"
            error={Boolean(errors.category)}
            {...register('category')}
          />
        </FormField>

        {/* Stitch Count */}
        <FormField
          label="Stitch Count (optional)"
          htmlFor="stitchCount"
          error={errors.stitchCount?.message}
        >
          <Input
            id="stitchCount"
            type="number"
            placeholder="e.g. 15000"
            error={Boolean(errors.stitchCount)}
            {...register('stitchCount', {
              setValueAs: (v) => (v === '' || v === null || v === undefined || Number.isNaN(Number(v)) ? undefined : Number(v)),
            })}
          />
        </FormField>

        {/* Color Count */}
        <FormField
          label="Color Count (optional)"
          htmlFor="colorCount"
          error={errors.colorCount?.message}
        >
          <Input
            id="colorCount"
            type="number"
            placeholder="e.g. 6"
            error={Boolean(errors.colorCount)}
            {...register('colorCount', {
              setValueAs: (v) => (v === '' || v === null || v === undefined || Number.isNaN(Number(v)) ? undefined : Number(v)),
            })}
          />
        </FormField>

        {/* Dimensions with Unit Selector (Inches / MM / CM) */}
        <div className="sm:col-span-2 rounded-lg border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">Design Dimensions</span>
            <div className="flex items-center space-x-1 text-xs">
              <span className="text-muted-foreground mr-1">Unit:</span>
              <button
                type="button"
                onClick={() => handleUnitChange('in')}
                className={`px-2 py-0.5 rounded text-xs font-semibold cursor-pointer transition-colors ${
                  dimUnit === 'in'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                Inches (in)
              </button>
              <button
                type="button"
                onClick={() => handleUnitChange('mm')}
                className={`px-2 py-0.5 rounded text-xs font-semibold cursor-pointer transition-colors ${
                  dimUnit === 'mm'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                Millimeters (mm)
              </button>
              <button
                type="button"
                onClick={() => handleUnitChange('cm')}
                className={`px-2 py-0.5 rounded text-xs font-semibold cursor-pointer transition-colors ${
                  dimUnit === 'cm'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                Centimeters (cm)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label={`Width in ${dimUnit === 'in' ? 'Inches' : dimUnit.toUpperCase()} (optional)`} htmlFor="widthInput">
              <Input
                id="widthInput"
                type="number"
                step="0.01"
                placeholder={dimUnit === 'in' ? 'e.g. 3.5' : dimUnit === 'cm' ? 'e.g. 8.5' : 'e.g. 85.0'}
                value={inputWidth}
                onChange={(e) => setInputWidth(e.target.value)}
              />
            </FormField>

            <FormField label={`Height in ${dimUnit === 'in' ? 'Inches' : dimUnit.toUpperCase()} (optional)`} htmlFor="heightInput">
              <Input
                id="heightInput"
                type="number"
                step="0.01"
                placeholder={dimUnit === 'in' ? 'e.g. 4.0' : dimUnit === 'cm' ? 'e.g. 10.0' : 'e.g. 100.0'}
                value={inputHeight}
                onChange={(e) => setInputHeight(e.target.value)}
              />
            </FormField>
          </div>

          {inputWidth && inputHeight && (
            <p className="text-[11px] text-muted-foreground italic">
              Equivalent in MM:{' '}
              <span className="font-semibold text-foreground">
                {calculateMm(inputWidth, dimUnit) || 0}mm × {calculateMm(inputHeight, dimUnit) || 0}mm
              </span>
            </p>
          )}
        </div>

        {/* Preview Image / Stitch Preview Data URL */}
        <div className="sm:col-span-2 space-y-2">
          <FormField
            label="Preview Image URL or Data (optional)"
            htmlFor="previewUrl"
            error={errors.previewUrl?.message}
          >
            <Input
              id="previewUrl"
              placeholder="Auto-generated from .DST or enter image URL"
              error={Boolean(errors.previewUrl)}
              {...register('previewUrl')}
            />
          </FormField>

          {previewUrl && previewUrl.startsWith('data:image/') && (
            <div className="mt-2 flex items-center space-x-3 rounded-lg border bg-muted/40 p-3">
              <div className="h-24 w-24 shrink-0 rounded overflow-hidden border border-border bg-slate-950 flex items-center justify-center">
                <img src={previewUrl} alt="Stitch Preview" className="h-full w-full object-contain" />
              </div>
              <div className="text-xs space-y-1">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ImageIcon className="h-3.5 w-3.5" />
                  Auto-Rendered Canvas Preview
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Stitch paths generated from Tajima .DST binary buffer. Stored client-side with 0 server storage cost!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Primary File URL */}
        <FormField
          label="Primary Machine File URL (optional)"
          htmlFor="primaryFileUrl"
          error={errors.primaryFileUrl?.message}
        >
          <Input
            id="primaryFileUrl"
            type="url"
            placeholder="e.g. https://storage.example.com/logo.dst"
            error={Boolean(errors.primaryFileUrl)}
            {...register('primaryFileUrl')}
          />
        </FormField>

        {/* Machine File Type */}
        <FormField
          label="File Type (optional)"
          htmlFor="primaryFileType"
          error={errors.primaryFileType?.message}
        >
          <Input
            id="primaryFileType"
            placeholder="DST, EMB, PES, PNG"
            error={Boolean(errors.primaryFileType)}
            {...register('primaryFileType')}
          />
        </FormField>

        {/* Description */}
        <div className="sm:col-span-2">
          <FormField
            label="Description (optional)"
            htmlFor="description"
            error={errors.description?.message}
          >
            <textarea
              id="description"
              rows={2}
              placeholder="Short description of the embroidery design"
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              {...register('description')}
            />
          </FormField>
        </div>

        {/* Notes */}
        <div className="sm:col-span-2">
          <FormField
            label="Machine & Thread Notes (optional)"
            htmlFor="notes"
            error={errors.notes?.message}
          >
            <textarea
              id="notes"
              rows={2}
              placeholder="Special thread colors, stabilizer, or machine setup notes"
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              {...register('notes')}
            />
          </FormField>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-3 border-t pt-4">
        {onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" size="sm" isLoading={isLoading}>
          {isEditing ? 'Save Changes' : 'Create Design'}
        </Button>
      </div>
    </form>
  </>
  );
};

