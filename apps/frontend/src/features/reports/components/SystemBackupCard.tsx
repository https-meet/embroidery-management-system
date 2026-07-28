import React, { useState } from 'react';
import { Database, Download, ShieldCheck } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { axiosClient } from '@/shared/api';

export const SystemBackupCard: React.FC = () => {
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const handleDownloadFullBackup = async () => {
    try {
      setIsExporting(true);
      const res = await axiosClient.get('/reports/export-all');
      const backupData = res.data.data;

      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(backupData, null, 2),
      )}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute(
        'download',
        `EBMS_Full_Database_Backup_${new Date().toISOString().split('T')[0]}.json`,
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch {
      alert('Failed to download system backup. Please check your admin permissions.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 rounded-lg border bg-card p-5 shadow-sm">
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
            Download a complete offline snapshot of all customers, jobs, invoices, payments, and catalog items.
          </p>
        </div>
      </div>

      <Button
        size="sm"
        onClick={handleDownloadFullBackup}
        isLoading={isExporting}
        className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        <Download className="h-4 w-4" />
        <span>Download Full System Backup (JSON)</span>
      </Button>
    </div>
  );
};
