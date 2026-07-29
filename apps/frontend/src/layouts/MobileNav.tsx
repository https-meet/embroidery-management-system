import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { navGroups } from '@/config/navConfig';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/components/ui/button';

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  // Close mobile nav ONLY when route path actually changes
  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity duration-150"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative flex w-full max-w-xs flex-col border-r border-border bg-card p-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <Link to="/dashboard" className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground text-sm shadow-xs">
              E
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-foreground text-sm">EBMS Enterprise</span>
              <span className="text-[10px] text-muted-foreground">Mobile Navigation</span>
            </div>
          </Link>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose} aria-label="Close mobile menu">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav id="mobile-navigation" aria-label="Mobile menu" className="mt-4 flex-1 space-y-5 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <h3 className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                {group.label}
              </h3>
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
                    className={cn(
                      'flex items-center rounded-md px-3 py-2 text-xs font-medium transition-colors duration-150',
                      isActive
                        ? 'bg-primary/10 text-primary font-semibold border-l-2 border-primary pl-2.5'
                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                    )}
                  >
                    <Icon className={cn('mr-2.5 h-4 w-4 shrink-0', isActive && 'text-primary')} />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-border/60 pt-3 text-center text-[10px] text-muted-foreground font-mono">
          EBMS Commercial v1.0
        </div>
      </div>
    </div>
  );
};

