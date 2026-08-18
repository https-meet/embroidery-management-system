import React from 'react';
import { Calendar } from 'lucide-react';
import { formatDate } from '@/shared/utils/formatDate';
import { useAuth } from '@/shared/hooks/useAuth';

export const WelcomeHeader: React.FC = () => {
  const { user } = useAuth();
  const today = formatDate(new Date());

  const hour = new Date().getHours();
  let timeGreeting = 'Good morning';
  if (hour >= 12 && hour < 17) {
    timeGreeting = 'Good afternoon';
  } else if (hour >= 17) {
    timeGreeting = 'Good evening';
  }

  const displayName = user?.name || 'Chauhan Embroidery';

  return (
    <div className="flex flex-col space-y-3 rounded-xl border border-border/80 bg-gradient-to-r from-card via-card to-muted/30 p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between sm:space-y-0 select-none">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl flex items-center gap-2">
          <span>{timeGreeting}, {displayName}</span>
          <span className="inline-block text-xl">👋</span>
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Here is your factory's production, billing, and collection summary for today.
        </p>
      </div>

      <div className="flex items-center space-x-2 self-start sm:self-auto">
        <div className="inline-flex items-center space-x-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Factory Live</span>
        </div>

        <div className="flex items-center space-x-2 rounded-md border border-border/60 bg-muted/40 px-3 py-1.5 text-xs font-mono text-foreground shadow-xs">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{today}</span>
        </div>
      </div>
    </div>
  );
};

