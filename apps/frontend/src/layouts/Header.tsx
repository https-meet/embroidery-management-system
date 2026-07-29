import React, { useState, useEffect } from 'react';
import { Menu, LogOut, User as UserIcon, PanelLeftClose, PanelLeft, Search, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/shared/hooks/useAuth';
import { Button } from '@/shared/components/ui/button';
import { GlobalSearchModal } from '@/shared/components/GlobalSearchModal';

export interface HeaderProps {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onOpenMobileNav: () => void;
  isMobileNavOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isSidebarCollapsed,
  onToggleSidebar,
  onOpenMobileNav,
  isMobileNavOpen = false,
}) => {
  const { user, logout } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Theme state check
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      return (
        document.documentElement.classList.contains('dark') ||
        localStorage.getItem('ebms_theme') === 'dark'
      );
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      try {
        localStorage.setItem('ebms_theme', 'dark');
      } catch {}
    } else {
      document.documentElement.classList.remove('dark');
      try {
        localStorage.setItem('ebms_theme', 'light');
      } catch {}
    }
  }, [isDark]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border/70 bg-card px-4 shadow-xs sm:px-6 select-none">
        <div className="flex items-center space-x-3">
          {/* Mobile menu trigger */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={onOpenMobileNav}
            aria-label="Open mobile menu"
            aria-expanded={isMobileNavOpen}
            aria-controls="mobile-navigation"
          >
            <Menu className="h-4 w-4" />
          </Button>

          {/* Desktop collapse toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={onToggleSidebar}
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>

          {/* Mobile Brand Name */}
          <span className="text-base font-bold tracking-tight text-primary lg:hidden">
            EBMS
          </span>

          {/* Global Search Trigger Bar */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center space-x-2 rounded-md border border-input bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground transition-all duration-150 hover:bg-muted hover:text-foreground w-44 sm:w-60 md:w-72"
          >
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate text-[11px]">Search Customers, Jobs (#JOB-...)...</span>
            <kbd className="hidden sm:inline-flex items-center rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono font-medium ml-auto">
              Ctrl + K
            </kbd>
          </button>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDark((prev) => !prev)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700" />
            )}
          </Button>

          {user && (
            <div className="flex items-center space-x-2.5 text-xs">
              <div className="hidden flex-col text-right sm:flex leading-tight">
                <span className="font-semibold text-foreground">
                  {user.name}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {user.email}
                </span>
              </div>

              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs border border-primary/20">
                <UserIcon className="h-3.5 w-3.5" />
              </div>

              <span className="hidden rounded bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground md:inline-block border border-border/60">
                {user.role}
              </span>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="h-8 px-2.5 text-xs flex items-center space-x-1.5"
            title="Sign out of EBMS"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      {/* Global Search Modal Overlay */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

