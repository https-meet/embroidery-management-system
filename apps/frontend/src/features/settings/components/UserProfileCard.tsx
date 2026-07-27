import React from 'react';
import { User, Shield, Mail } from 'lucide-react';
import { useAuth } from '@/shared/hooks/useAuth';

export const UserProfileCard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm space-y-4">
      <div className="flex items-center space-x-4 border-b pb-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <User className="h-7 w-7" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">{user?.name || 'Authenticated Staff'}</h3>
          <span className="inline-flex items-center space-x-1 rounded bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary uppercase">
            <Shield className="h-3 w-3 mr-1" />
            {user?.role || 'OPERATOR'}
          </span>
        </div>
      </div>

      <div className="space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground flex items-center space-x-1.5">
            <Mail className="h-4 w-4" />
            <span>Email Address</span>
          </span>
          <span className="font-semibold text-foreground">{user?.email || '—'}</span>
        </div>

        <div className="flex items-center justify-between border-t pt-2">
          <span className="text-muted-foreground">User ID</span>
          <span className="font-mono text-muted-foreground">{user?.id || '—'}</span>
        </div>
      </div>
    </div>
  );
};
