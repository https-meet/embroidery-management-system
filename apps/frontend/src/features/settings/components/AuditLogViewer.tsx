import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { History, ShieldAlert } from 'lucide-react';
import { axiosClient } from '@/shared/api';
import { formatDate } from '@/shared/utils/formatDate';
import { PageSkeleton } from '@/shared/components/LoadingSkeleton';

export interface AuditLogEntry {
  id: string;
  userId?: string | null;
  userName: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  previousValue?: string | null;
  newValue?: string | null;
  reason?: string | null;
  timestamp: string;
}

export const AuditLogViewer: React.FC = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<{ items: AuditLogEntry[]; total: number }>({
    queryKey: ['auditLogs', page],
    queryFn: async () => {
      const res = await axiosClient.get(`/settings/audit-logs?page=${page}&limit=15`);
      return (res as any).data;
    },
  });

  if (isLoading) {
    return <PageSkeleton />;
  }

  const logs = data?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 border-b border-border/60 pb-3">
        <History className="h-5 w-5 text-muted-foreground" />
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-foreground">System Audit Trail & Accountability Log</h3>
          <p className="text-[11px] text-muted-foreground">
            Immutable log tracking user actions, entity status changes, financial alterations, and recorded reasons.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border/70 bg-card shadow-xs overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <ShieldAlert className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-xs text-muted-foreground italic">No audit log entries recorded yet.</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="border-b border-border/60 bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-3.5 py-2.5">Timestamp</th>
                <th className="px-3.5 py-2.5">User</th>
                <th className="px-3.5 py-2.5">Action</th>
                <th className="px-3.5 py-2.5">Entity Type</th>
                <th className="px-3.5 py-2.5">Previous Value</th>
                <th className="px-3.5 py-2.5">New Value</th>
                <th className="px-3.5 py-2.5">Reason / Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-3.5 py-2.5 font-mono text-muted-foreground">{formatDate(log.timestamp)}</td>
                  <td className="px-3.5 py-2.5 font-semibold text-foreground">{log.userName}</td>
                  <td className="px-3.5 py-2.5">
                    <span className="inline-flex rounded px-2 py-0.5 text-[10px] font-bold uppercase bg-primary/10 text-primary border border-primary/20">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5 font-mono text-muted-foreground">{log.entityType}</td>
                  <td className="px-3.5 py-2.5 font-mono text-muted-foreground">{log.previousValue || '—'}</td>
                  <td className="px-3.5 py-2.5 font-mono font-semibold text-foreground">{log.newValue || '—'}</td>
                  <td className="px-3.5 py-2.5 text-muted-foreground">{log.reason || 'No reason specified'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      {data && data.total > 15 && (
        <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
          <span>Showing page {page} of {Math.ceil(data.total / 15)}</span>
          <div className="flex space-x-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded border border-border/60 bg-card disabled:opacity-50 hover:bg-muted/40 font-medium"
            >
              Previous
            </button>
            <button
              disabled={page * 15 >= data.total}
              onClick={() => setPage((p) => p + 1)}
              className="px-2.5 py-1 rounded border border-border/60 bg-card disabled:opacity-50 hover:bg-muted/40 font-medium"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

