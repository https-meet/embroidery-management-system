import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'Failed to load data. Please check your network connection and try again.',
  onRetry,
}) => {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center shadow-xs select-none">
      <div className="flex h-9 w-9 items-center justify-center rounded-md border border-destructive/30 bg-destructive/10 text-destructive">
        <AlertTriangle className="h-4 w-4" />
      </div>
      <h3 className="mt-3 text-sm font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="mt-1 max-w-md text-xs text-muted-foreground leading-relaxed">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-4 flex items-center space-x-1.5 h-8 text-xs font-semibold"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Retry Operation</span>
        </Button>
      )}
    </div>
  );
};

