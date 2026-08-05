import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { ROUTES } from '@/shared/constants/routes';

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0 || (pathnames.length === 1 && pathnames[0] === 'dashboard')) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-xs text-muted-foreground overflow-hidden max-w-full">
      <ol className="flex flex-wrap items-center gap-1.5 max-w-full">
        <li>
          <Link
            to={ROUTES.DASHBOARD}
            className="flex items-center hover:text-foreground transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span className="sr-only">Dashboard</span>
          </Link>
        </li>
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(name);
          const displayName = isUuid
            ? name
            : name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');

          return (
            <li key={routeTo} className="flex items-center space-x-1.5">
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
              {isLast ? (
                <span className="font-medium text-foreground">{displayName}</span>
              ) : (
                <Link
                  to={routeTo}
                  className="hover:text-foreground transition-colors"
                >
                  {displayName}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
