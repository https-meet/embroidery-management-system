import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navItems } from '@/config/navConfig';
import { cn } from '@/lib/utils';

export interface SidebarProps {
  isCollapsed: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
  const location = useLocation();

  return (
    <aside
      className={cn(
        'hidden border-r bg-card transition-all duration-300 lg:flex lg:flex-col',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center border-b px-4">
        <Link to="/dashboard" className="flex items-center space-x-3 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">
            E
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold tracking-tight text-foreground">EBMS</span>
              <span className="text-[10px] text-muted-foreground">Management System</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Links */}
      <nav aria-label="Sidebar" className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/dashboard'
              ? location.pathname === '/dashboard'
              : location.pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              to={item.href}
              title={isCollapsed ? item.title : undefined}
              className={cn(
                'flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                isCollapsed && 'justify-center px-0'
              )}
            >
              <Icon className={cn('h-5 w-5 shrink-0', !isCollapsed && 'mr-3')} />
              {!isCollapsed && <span className="truncate">{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer Version Info */}
      {!isCollapsed && (
        <div className="border-t p-3 text-center text-[11px] text-muted-foreground">
          v1.0.0
        </div>
      )}
    </aside>
  );
};
