import React from 'react';
import { Calendar } from 'lucide-react';
import { formatDate } from '@/shared/utils/formatDate';

export const WelcomeHeader: React.FC = () => {
  const today = formatDate(new Date());

  return (
    <div className="flex flex-col space-y-2 rounded-lg border border-border/70 bg-card p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between sm:space-y-0 select-none">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Operational Dashboard
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Real-time production tracking, quality inspection, and cashflow management.
        </p>
      </div>
      <div className="flex items-center space-x-2 rounded-md border border-border/60 bg-muted/40 px-3 py-1.5 text-xs font-mono text-foreground self-start sm:self-auto shadow-xs">
        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
        <span>{today}</span>
      </div>
    </div>
  );
};

