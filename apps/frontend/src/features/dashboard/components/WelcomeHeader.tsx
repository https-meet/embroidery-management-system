import React from 'react';
import { Calendar } from 'lucide-react';
import { formatDate } from '@/shared/utils/formatDate';

export const WelcomeHeader: React.FC = () => {
  const today = formatDate(new Date());

  return (
    <div className="flex flex-col space-y-2 rounded-lg border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Operational Dashboard
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Real-time production, quality control, and cashflow management.
        </p>
      </div>
      <div className="flex items-center space-x-2 rounded-md border bg-muted/30 px-3 py-1.5 text-xs font-semibold text-foreground self-start sm:self-auto">
        <Calendar className="h-4 w-4 text-primary" />
        <span>{today}</span>
      </div>
    </div>
  );
};
