import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

export interface ExportCsvButtonProps {
  filename: string;
  data: Record<string, unknown>[];
}

export const ExportCsvButton: React.FC<ExportCsvButtonProps> = ({ filename, data }) => {
  const handleExport = () => {
    if (!data || data.length === 0 || !data[0]) return;

    const firstRow = data[0];
    const headers = Object.keys(firstRow);
    const csvRows: string[] = [];

    // Header row
    csvRows.push(headers.join(','));

    // Data rows
    for (const row of data) {
      if (!row) continue;
      const values = headers.map((header) => {
        const val = row[header];
        const escaped = ('' + (val ?? '')).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={!data || data.length === 0}
      className="flex items-center space-x-1.5"
    >
      <Download className="h-4 w-4" />
      <span>Export CSV</span>
    </Button>
  );
};
