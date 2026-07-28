import React, { useState, useEffect } from 'react';
import { Menu, LogOut, User as UserIcon, PanelLeftClose, PanelLeft, Search } from 'lucide-react';
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
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-card px-4 shadow-sm sm:px-6">
        <div className="flex items-center space-x-3">
          {/* Mobile menu trigger */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onOpenMobileNav}
            aria-label="Open mobile menu"
            aria-expanded={isMobileNavOpen}
            aria-controls="mobile-navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Desktop collapse toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex"
            onClick={onToggleSidebar}
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? (
              <PanelLeft className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </Button>

          {/* Mobile Brand Name */}
          <span className="text-lg font-bold tracking-tight text-primary lg:hidden">
            EBMS
          </span>

          {/* Global Search Trigger Bar */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center space-x-2 rounded-md border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground transition-all hover:bg-muted hover:text-foreground w-48 sm:w-64 md:w-80"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="truncate">Search records...</span>
            <kbd className="hidden sm:inline-flex items-center rounded border bg-background px-1.5 py-0.5 text-[10px] font-mono font-medium ml-auto">
              Ctrl + K
            </kbd>
          </button>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {user && (
            <div className="flex items-center space-x-3 text-sm">
              <div className="hidden flex-col text-right sm:flex">
                <span className="font-semibold leading-none text-foreground">
                  {user.name}
                </span>
                <span className="mt-1 text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserIcon className="h-4 w-4" />
              </div>

              <span className="hidden rounded bg-muted px-2 py-0.5 text-xs font-medium uppercase text-muted-foreground md:inline-block">
                {user.role}
              </span>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="flex items-center space-x-1.5"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      {/* Global Search Modal Overlay */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
