import React, { useState } from 'react';
import { Database, Download, FileSpreadsheet, ShieldCheck } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { axiosClient } from '@/shared/api';

export const SystemBackupCard: React.FC = () => {
  const [isExportingJson, setIsExportingJson] = useState<boolean>(false);
  const [isExportingCsv, setIsExportingCsv] = useState<boolean>(false);

  const fetchBackupData = async () => {
    const res = await axiosClient.get('/reports/export-all');
    return res.data?.data || res.data;
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
    } catch {
      alert('Failed to generate CSV backup ledger.');
    } finally {
      setIsExportingCsv(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 rounded-lg border bg-card p-5 shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Database className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-foreground">Full System Data Backup & Recovery</h3>
            <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="h-3 w-3 mr-1" /> Ready
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Export a complete offline database backup snapshot in JSON or Master Spreadsheet CSV format.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleDownloadCsvBackup}
          isLoading={isExportingCsv}
          className="flex items-center space-x-1.5"
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Download Master CSV Ledger</span>
        </Button>

        <Button
          size="sm"
          onClick={handleDownloadJsonBackup}
          isLoading={isExportingJson}
          className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Download className="h-4 w-4" />
          <span>Download System Backup (JSON)</span>
        </Button>
      </div>
    </div>
  );
};
