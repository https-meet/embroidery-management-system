import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, PlusCircle, FileSpreadsheet } from 'lucide-react';
import { RupeeIcon } from '@/shared/components/icons/RupeeIcon';
import { ROUTES } from '@/shared/constants/routes';

export const QuickActions: React.FC = () => {
  const actions = [
    {
      title: 'New Customer',
      description: 'Register a new customer',
      href: ROUTES.CUSTOMERS.CREATE,
      icon: UserPlus,
    },
    {
      title: 'New Job Order',
      description: 'Create an embroidery order',
      href: ROUTES.JOBS.CREATE,
      icon: PlusCircle,
    },
    {
      title: 'Generate Invoice',
      description: 'Invoice completed job items',
      href: ROUTES.INVOICES.CREATE,
      icon: FileSpreadsheet,
    },
    {
      title: 'Record Payment',
      description: 'Receive & allocate payment',
      href: ROUTES.PAYMENTS.CREATE,
      icon: RupeeIcon,
    },
  ];

  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Operational Quick Actions
          </h2>
          <p className="text-xs text-muted-foreground">
            Shortcuts for primary business workflows
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              to={action.href}
              className="flex items-center space-x-3 rounded-md border border-border bg-background p-3.5 transition-colors duration-150 hover:bg-accent hover:border-border/80"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40 text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground truncate">
                  {action.title}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {action.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
