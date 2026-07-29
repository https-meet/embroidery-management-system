import React, { useState } from 'react';
import { Database, Download, FileSpreadsheet, ShieldCheck, Clock, HardDrive, CheckCircle2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { axiosClient } from '@/shared/api';
import { useSystemHealth } from '@/features/settings/hooks/useBusinessSettings';

export const SystemBackupCard: React.FC = () => {
  const [isExportingJson, setIsExportingJson] = useState<boolean>(false);
  const [isExportingCsv, setIsExportingCsv] = useState<boolean>(false);
  const [lastBackupTime, setLastBackupTime] = useState<string | null>(() => {
    return localStorage.getItem('ebms_last_backup_timestamp');
  });

  const { data: health } = useSystemHealth();

  const fetchBackupData = async () => {
    const res = await axiosClient.get('/reports/export-all');
    return res.data?.data || res.data;
  };

  const markBackupTaken = () => {
    const nowStr = new Date().toLocaleString();
    setLastBackupTime(nowStr);
    localStorage.setItem('ebms_last_backup_timestamp', nowStr);
  };

  const handleDownloadJsonBackup = async () => {
    try {
      setIsExportingJson(true);
      const backupData = await fetchBackupData();

      const jsonContent = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = url;
      downloadAnchor.setAttribute(
        'download',
        `EBMS_Full_Database_Backup_${new Date().toISOString().split('T')[0]}.json`,
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
      URL.revokeObjectURL(url);
      markBackupTaken();
    } catch {
      alert('Failed to download system backup. Please check your network connection.');
    } finally {
      setIsExportingJson(false);
    }
  };

  const handleDownloadCsvBackup = async () => {
    try {
      setIsExportingCsv(true);
      const backupData = await fetchBackupData();

      const jobs = backupData.jobs || [];
      const invoices = backupData.invoices || [];
      const payments = backupData.payments || [];

      const csvRows: string[] = [];
      csvRows.push('Record Type,Reference No,Customer Name,Date,Status,Amount (₹),Details');

      jobs.forEach((j: Record<string, unknown>) => {
        const customerObj = j.customer as Record<string, unknown> | undefined;
        csvRows.push(
          `"JOB","${j.jobNo || ''}","${customerObj?.name || ''}","${j.jobDate || ''}","${j.status || ''}","${j.totalAmount || 0}","Operator: ${j.assignedOperator || 'Unassigned'}"`,
        );
      });

      invoices.forEach((i: Record<string, unknown>) => {
        const customerObj = i.customer as Record<string, unknown> | undefined;
        csvRows.push(
          `"INVOICE","${i.invoiceNo || ''}","${customerObj?.name || ''}","${i.invoiceDate || ''}","${i.status || ''}","${i.grandTotal || 0}","Outstanding: ${i.outstandingBalance || 0}"`,
        );
      });

      payments.forEach((p: Record<string, unknown>) => {
        const customerObj = p.customer as Record<string, unknown> | undefined;
        csvRows.push(
          `"PAYMENT","${p.paymentNo || ''}","${customerObj?.name || ''}","${p.paymentDate || ''}","${p.status || ''}","${p.amount || 0}","Method: ${p.paymentMethod || ''}, Ref: ${p.referenceNo || 'N/A'}"`,
        );
      });

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = url;
      downloadAnchor.setAttribute(
        'download',
        `EBMS_Master_Transactions_Backup_${new Date().toISOString().split('T')[0]}.csv`,
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
      URL.revokeObjectURL(url);
      markBackupTaken();
    } catch {
      alert('Failed to generate CSV backup ledger.');
    } finally {
      setIsExportingCsv(false);
    }
  };

  const totalRecords = health?.recordCounts
    ? (health.recordCounts.customers || 0) +
      (health.recordCounts.jobs || 0) +
      (health.recordCounts.invoices || 0) +
      (health.recordCounts.payments || 0) +
      (health.recordCounts.designs || 0)
    : 0;

  return (
    <div className="space-y-4 rounded-lg border border-border/70 bg-card p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border/50 bg-muted/40 text-foreground shrink-0">
            <Database className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-semibold tracking-tight text-foreground">Backup & Recovery Metadata Hub</h3>
              <span className="inline-flex items-center rounded-md bg-muted/50 px-2 py-0.5 text-[10px] font-semibold text-foreground border border-border/50">
                <ShieldCheck className="h-3 w-3 mr-1 text-emerald-600 dark:text-emerald-400" /> Backup Ready
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Monitor backup status, record counts, payload size estimates, and generate offline recovery snapshots.
            </p>
          </div>
        </div>
      </div>

      {/* Metadata Strip */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
        <div className="rounded-md border border-border/50 bg-muted/30 p-3 flex items-center space-x-3">
          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
          <div>
            <p className="text-[11px] text-muted-foreground font-semibold">Last Offline Backup</p>
            <p className="font-semibold font-mono text-foreground truncate">{lastBackupTime || 'Never (Take initial backup)'}</p>
          </div>
        </div>

        <div className="rounded-md border border-border/50 bg-muted/30 p-3 flex items-center space-x-3">
          <HardDrive className="h-4 w-4 text-muted-foreground shrink-0" />
          <div>
            <p className="text-[11px] text-muted-foreground font-semibold">Active Database Records</p>
            <p className="font-semibold font-mono text-foreground">{totalRecords} total entries across 5 tables</p>
          </div>
        </div>

        <div className="rounded-md border border-border/50 bg-muted/30 p-3 flex items-center space-x-3">
          <CheckCircle2 className="h-4 w-4 text-muted-foreground shrink-0" />
          <div>
            <p className="text-[11px] text-muted-foreground font-semibold">Disaster Recovery</p>
            <p className="font-semibold text-foreground">JSON & CSV Ledgers Ready</p>
          </div>
        </div>
      </div>

      {/* Download Action Bar */}
      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/60 pt-3">
        <Button
          size="sm"
          variant="outline"
          onClick={handleDownloadCsvBackup}
          isLoading={isExportingCsv}
          className="flex items-center space-x-1.5 h-8 text-xs font-semibold"
        >
          <FileSpreadsheet className="h-3.5 w-3.5" />
          <span>Download Master CSV Ledger</span>
        </Button>

        <Button
          size="sm"
          onClick={handleDownloadJsonBackup}
          isLoading={isExportingJson}
          className="flex items-center space-x-1.5 h-8 text-xs font-semibold"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Download System Backup (JSON)</span>
        </Button>
      </div>
    </div>
  );
};

