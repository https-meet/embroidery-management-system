import React, { useEffect } from 'react';
import { AlertCircle, HelpCircle } from 'lucide-react';
import { Button } from './ui/button';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  // Handle Escape key to cancel and Enter key to confirm
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.key === 'Enter' && !isLoading) {
        e.preventDefault();
        onConfirm();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isLoading, onCancel, onConfirm]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      {/* Overlay Backdrop (Style Guide §6.6) */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-150"
        onClick={onCancel}
      />

      {/* Modal Card Panel (Style Guide §6.6) */}
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl shadow-slate-900/10 space-y-4">
        <div className="flex items-start space-x-3.5">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border ${
              isDestructive
                ? 'border-destructive/30 bg-destructive/10 text-destructive'
                : 'border-border/60 bg-muted/40 text-muted-foreground'
            }`}
          >
            {isDestructive ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <HelpCircle className="h-4 w-4 text-primary" />
            )}
          </div>
          <div className="space-y-1">
            <h3 id="confirm-dialog-title" className="text-sm font-semibold tracking-tight text-foreground">
              {title}
            </h3>
            <p id="confirm-dialog-description" className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={isDestructive ? 'destructive' : 'default'}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
