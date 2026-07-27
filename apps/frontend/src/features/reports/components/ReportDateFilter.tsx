import React from 'react';
import { Calendar, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

export interface ReportDateFilterProps {
  startDate?: string;
  endDate?: string;
  onDateChange: (start?: string, end?: string) => void;
  onReset: () => void;
}

export const ReportDateFilter: React.FC<ReportDateFilterProps> = ({
  startDate,
  endDate,
  onDateChange,
  onReset,
}) => {
  const handlePreset = (preset: 'THIS_MONTH' | 'LAST_30' | 'THIS_QUARTER' | 'ALL') => {
    const today = new Date();
    const endStr = today.toISOString().split('T')[0];

    if (preset === 'THIS_MONTH') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      onDateChange(firstDay.toISOString().split('T')[0], endStr);
    } else if (preset === 'LAST_30') {
      const past30 = new Date();
      past30.setDate(today.getDate() - 30);
      onDateChange(past30.toISOString().split('T')[0], endStr);
    } else if (preset === 'THIS_QUARTER') {
      const quarterMonth = Math.floor(today.getMonth() / 3) * 3;
      const firstQuarterDay = new Date(today.getFullYear(), quarterMonth, 1);
      onDateChange(firstQuarterDay.toISOString().split('T')[0], endStr);
    } else {
      onDateChange(undefined, undefined);
    }
  };

  return (
    <div className="flex flex-col space-y-3 rounded-lg border bg-card p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground flex items-center space-x-1 mr-1">
          <Calendar className="h-3.5 w-3.5" />
          <span>Presets:</span>
        </span>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => handlePreset('THIS_MONTH')}
        >
          This Month
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => handlePreset('LAST_30')}
        >
          Last 30 Days
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => handlePreset('THIS_QUARTER')}
        >
          This Quarter
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => handlePreset('ALL')}
        >
          All Time
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center space-x-2 text-xs">
          <span className="font-medium text-muted-foreground">From:</span>
          <Input
            type="date"
            value={startDate || ''}
            onChange={(e) => onDateChange(e.target.value || undefined, endDate)}
            className="h-8 w-36 text-xs"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="font-medium text-muted-foreground">To:</span>
          <Input
            type="date"
            value={endDate || ''}
            onChange={(e) => onDateChange(startDate, e.target.value || undefined)}
            className="h-8 w-36 text-xs"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          title="Reset Filters"
          className="h-8 w-8"
          onClick={onReset}
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};
