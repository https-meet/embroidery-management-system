import React from 'react';
import { Calendar } from 'lucide-react';
import { formatDate } from '@/shared/utils/formatDate';
import { useAuth } from '@/shared/hooks/useAuth';

export const WelcomeHeader: React.FC = () => {
  const { user } = useAuth();
  const today = formatDate(new Date());

  return (
    <div className="flex flex-col space-y-2 rounded-lg border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Welcome back, {user?.name || 'User'}!
        </h1>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          Here is your business operational overview for today.
        </p>
      </div>
      <div className="flex items-center space-x-2 rounded-md bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground self-start sm:self-auto">
        <Calendar className="h-4 w-4 text-primary" />
        <span>Today: {today}</span>
      </div>
    </div>
  );
};
