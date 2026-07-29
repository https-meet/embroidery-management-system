import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navGroups } from '@/config/navConfig';
import { cn } from '@/lib/utils';

export interface SidebarProps {
  isCollapsed: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
  const location = useLocation();

  return (
    <aside
      className={cn(
        'hidden border-r border-border/70 bg-card transition-all duration-150 ease-out lg:flex lg:flex-col select-none',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex h-14 items-center border-b border-border/60 px-4">
        <Link to="/dashboard" className="flex items-center space-x-3 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground text-sm shadow-xs">
            E
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate leading-tight">
              <span className="font-bold tracking-tight text-foreground text-sm">EBMS Enterprise</span>
              <span className="text-[10px] text-muted-foreground">Embroidery Business ERP</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Groups */}
      <nav aria-label="Sidebar Navigation" className="flex-1 overflow-y-auto p-3 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            {!isCollapsed && (
              <h3 className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                {group.label}
              </h3>
            )}
            {group.items.map((item) => {
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
                    'flex items-center rounded-md px-3 py-2 text-xs font-medium transition-all duration-150 ease-out',
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold border-l-2 border-primary pl-2.5'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                    isCollapsed && 'justify-center px-0 border-l-0'
                  )}
                >
                  <Icon className={cn('h-4 w-4 shrink-0', !isCollapsed && 'mr-2.5', isActive && 'text-primary')} />
                  {!isCollapsed && <span className="truncate">{item.title}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Version Info */}
      {!isCollapsed && (
        <div className="border-t border-border/60 p-3 text-center text-[10px] text-muted-foreground font-mono">
          EBMS Commercial v1.0
        </div>
      )}
    </aside>
  );
};

