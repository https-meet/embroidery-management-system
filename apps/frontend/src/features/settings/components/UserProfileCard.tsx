import React, { useState } from 'react';
import { User, ShieldCheck, Mail, Check, Loader2 } from 'lucide-react';
import { useAuth } from '@/shared/hooks/useAuth';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

export const UserProfileCard: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage('Name must be at least 2 characters.');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage('');
      setSuccessMessage('');
      await updateProfile({ name: name.trim() });
      setSuccessMessage('Profile name updated successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: unknown) {
      const errorObj = err as { error?: { message?: string } };
      setErrorMessage(errorObj?.error?.message || 'Failed to update profile name.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-primary" />
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              User Profile & Display Name
            </h2>
            <p className="text-xs text-muted-foreground">
              Update your account display name across the ERP workspace
            </p>
          </div>
        </div>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
          <ShieldCheck className="mr-1 h-3 w-3" />
          {user?.role || 'User'}
        </span>
      </div>

      <form onSubmit={handleSave} className="space-y-4 pt-1">
        {successMessage && (
          <div className="flex items-center space-x-2 rounded-md bg-emerald-500/10 p-3 text-xs font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Check className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="rounded-md bg-rose-500/10 p-3 text-xs font-medium text-rose-600 dark:text-rose-400 border border-rose-500/20">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Full Display Name</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Meet Chauhan"
              className="h-9 text-xs"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Account Email</label>
            <div className="relative">
              <Input
                type="email"
                value={user?.email || ''}
                disabled
                className="h-9 text-xs bg-muted text-muted-foreground cursor-not-allowed pl-8"
              />
              <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={isSaving || !name.trim() || name.trim() === user?.name}
            size="sm"
            className="h-8 text-xs font-semibold"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Name Changes</span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
