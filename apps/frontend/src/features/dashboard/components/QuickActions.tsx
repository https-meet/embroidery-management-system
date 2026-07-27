import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, PlusCircle, FileSpreadsheet, DollarSign } from 'lucide-react';
import { ROUTES } from '@/shared/constants/routes';

export const QuickActions: React.FC = () => {
  const actions = [
    {
      title: 'New Customer',
      description: 'Register a new customer',
      href: ROUTES.CUSTOMERS.CREATE,
      icon: UserPlus,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      title: 'New Job',
      description: 'Create an embroidery order',
      href: ROUTES.JOBS.CREATE,
      icon: PlusCircle,
      color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    },
    {
      title: 'Generate Invoice',
      description: 'Invoice completed job items',
      href: ROUTES.INVOICES.CREATE,
      icon: FileSpreadsheet,
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Record Payment',
      description: 'Receive & allocate payment',
      href: ROUTES.PAYMENTS.CREATE,
      icon: DollarSign,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
  ];

  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm">
      <h2 className="text-base font-semibold tracking-tight text-foreground">
        Quick Actions
      </h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Shortcuts for common operational tasks
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              to={action.href}
              className="flex items-center space-x-3 rounded-lg border p-3.5 transition-all hover:bg-muted/40 hover:shadow-sm"
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${action.color}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground truncate">
                  {action.title}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
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
