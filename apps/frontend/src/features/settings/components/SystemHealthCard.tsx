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
      <div className="flex items-center space-x-3 border-b border-border/60 pb-3">
        <Activity className="h-5 w-5 text-muted-foreground" />
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-foreground">System Health & Environment Diagnostics</h3>
          <p className="text-[11px] text-muted-foreground">
            Real-time status monitor for database connectivity, API response latency, and system metrics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border/70 bg-card p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-semibold">App Release Version</p>
            <p className="text-base font-bold font-mono text-foreground mt-0.5">{health.appVersion}</p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border/40 bg-muted/30 text-muted-foreground">
            <Server className="h-4 w-4" />
          </div>
        </div>

        <div className="rounded-lg border border-border/70 bg-card p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-semibold">PostgreSQL Database</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-bold font-mono text-foreground">
                {health.database.status} ({health.database.latencyMs}ms)
              </span>
            </div>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border/40 bg-muted/30 text-muted-foreground">
            <Database className="h-4 w-4" />
          </div>
        </div>

        <div className="rounded-lg border border-border/70 bg-card p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Server Uptime</p>
            <p className="text-base font-bold font-mono text-foreground mt-0.5">
              {formatUptime(health.systemUptimeSeconds || health.system?.uptimeSeconds || 0)}
            </p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border/40 bg-muted/30 text-muted-foreground">
            <Clock className="h-4 w-4" />
          </div>
        </div>

        <div className="rounded-lg border border-border/70 bg-card p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Environment</p>
            <p className="text-base font-bold font-mono text-foreground uppercase mt-0.5">
              {health.environment || health.system?.environment || 'PRODUCTION'}
            </p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border/40 bg-muted/30 text-muted-foreground">
            <HardDrive className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Master Database Record Counts */}
      <div className="rounded-lg border border-border/70 bg-card p-5 shadow-xs space-y-3">
        <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase border-b border-border/50 pb-2">
          Master Database Active Records Count
        </h4>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 text-center">
          <div className="rounded-md border border-border/50 bg-muted/30 p-3">
            <p className="text-xl font-bold font-mono text-foreground">{health.recordCounts?.customers ?? 0}</p>
            <p className="text-[11px] text-muted-foreground font-medium">Customers</p>
          </div>
          <div className="rounded-md border border-border/50 bg-muted/30 p-3">
            <p className="text-xl font-bold font-mono text-foreground">{health.recordCounts?.jobs ?? 0}</p>
            <p className="text-[11px] text-muted-foreground font-medium">Job Orders</p>
          </div>
          <div className="rounded-md border border-border/50 bg-muted/30 p-3">
            <p className="text-xl font-bold font-mono text-foreground">{health.recordCounts?.invoices ?? 0}</p>
            <p className="text-[11px] text-muted-foreground font-medium">Invoices</p>
          </div>
          <div className="rounded-md border border-border/50 bg-muted/30 p-3">
            <p className="text-xl font-bold font-mono text-foreground">{health.recordCounts?.payments ?? 0}</p>
            <p className="text-[11px] text-muted-foreground font-medium">Payments</p>
          </div>
          <div className="rounded-md border border-border/50 bg-muted/30 p-3">
            <p className="text-xl font-bold font-mono text-foreground">{health.recordCounts?.designs ?? 0}</p>
            <p className="text-[11px] text-muted-foreground font-medium">Designs</p>
          </div>
        </div>
      </div>
    </div>
  );
};

