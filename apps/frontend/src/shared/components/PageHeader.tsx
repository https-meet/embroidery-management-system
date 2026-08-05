import React from 'react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 min-w-0">
      <div className="min-w-0 break-words">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl md:text-3xl break-words">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground break-words">{description}</p>
        )}
      </div>
      {action && (
        <div className="flex flex-wrap items-center gap-2 shrink-0 pt-1 sm:pt-0">
          {action}
        </div>
      )}
    </div>
  );
};
