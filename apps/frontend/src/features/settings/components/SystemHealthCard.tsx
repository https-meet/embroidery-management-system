import React from 'react';
import { Activity, Database, Server, Clock, HardDrive } from 'lucide-react';
import { useSystemHealth } from '../hooks/useBusinessSettings';
import { PageSkeleton } from '@/shared/components/LoadingSkeleton';

export const SystemHealthCard: React.FC = () => {
  const { data: health, isLoading } = useSystemHealth();

  if (isLoading || !health) {
    return <PageSkeleton />;
  }

  const formatUptime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 border-b pb-3">
        <Activity className="h-5 w-5 text-primary" />
        <div>
          <h3 className="text-base font-bold text-foreground">System Health & Environment Diagnostics</h3>
          <p className="text-xs text-muted-foreground">
            Real-time status monitor for database connectivity, API response latency, and system metrics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">App Release Version</p>
            <p className="text-base font-bold font-mono text-primary mt-0.5">{health.appVersion}</p>
          </div>
          <Server className="h-7 w-7 text-primary/20" />
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">PostgreSQL Database</p>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {health.database.status} ({health.database.latencyMs}ms)
              </span>
            </div>
          </div>
          <Database className="h-7 w-7 text-emerald-500/20" />
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Server Uptime</p>
            <p className="text-base font-bold font-mono text-foreground mt-0.5">
              {formatUptime(health.systemUptimeSeconds)}
            </p>
          </div>
          <Clock className="h-7 w-7 text-indigo-500/20" />
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Environment</p>
            <p className="text-base font-bold font-mono text-foreground uppercase mt-0.5">
              {health.environment}
            </p>
          </div>
          <HardDrive className="h-7 w-7 text-amber-500/20" />
        </div>
      </div>

      {/* Master Database Record Counts */}
      <div className="rounded-lg border bg-card p-5 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Master Database Active Records Count
        </h4>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 text-center">
          <div className="rounded-md border bg-muted/20 p-3">
            <p className="text-xl font-bold font-mono text-foreground">{health.recordCounts.customers}</p>
            <p className="text-[11px] text-muted-foreground">Customers</p>
          </div>
          <div className="rounded-md border bg-muted/20 p-3">
            <p className="text-xl font-bold font-mono text-foreground">{health.recordCounts.jobs}</p>
            <p className="text-[11px] text-muted-foreground">Job Orders</p>
          </div>
          <div className="rounded-md border bg-muted/20 p-3">
            <p className="text-xl font-bold font-mono text-foreground">{health.recordCounts.invoices}</p>
            <p className="text-[11px] text-muted-foreground">Invoices</p>
          </div>
          <div className="rounded-md border bg-muted/20 p-3">
            <p className="text-xl font-bold font-mono text-foreground">{health.recordCounts.payments}</p>
            <p className="text-[11px] text-muted-foreground">Payments</p>
          </div>
          <div className="rounded-md border bg-muted/20 p-3">
            <p className="text-xl font-bold font-mono text-foreground">{health.recordCounts.designs}</p>
            <p className="text-[11px] text-muted-foreground">Designs</p>
          </div>
        </div>
      </div>
    </div>
  );
};
