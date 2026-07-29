import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Briefcase, FileText, CreditCard, Palette, Clock, ArrowRight } from 'lucide-react';
import { axiosClient } from '@/shared/api';
import { useRecentlyViewed, type RecentlyViewedItem } from '@/shared/hooks/useRecentlyViewed';

export interface SearchItem {
  id: string;
  category: 'CUSTOMER' | 'JOB' | 'INVOICE' | 'PAYMENT' | 'DESIGN';
  title: string;
  subtitle: string;
  url: string;
}

export interface GroupedResults {
  customers: SearchItem[];
  jobs: SearchItem[];
  invoices: SearchItem[];
  payments: SearchItem[];
  designs: SearchItem[];
}

export interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GroupedResults>({
    customers: [],
    jobs: [],
    invoices: [],
    payments: [],
    designs: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { recentItems, addRecentlyViewed } = useRecentlyViewed();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ customers: [], jobs: [], invoices: [], payments: [], designs: [] });
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        const res = await axiosClient.get(`/search?q=${encodeURIComponent(query.trim())}`);
        const payload = res as unknown as { data?: { results: GroupedResults }; results?: GroupedResults };
        const data = payload.data || payload;
        if (data.results) {
          setResults(data.results);
          setSelectedIndex(0);
        }
      } catch {
        // Silent catch for search errors
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Flattened prioritized results array for keyboard arrow navigation
  const flatResults: SearchItem[] = query.trim()
    ? [
        ...results.customers,
        ...results.jobs,
        ...results.invoices,
        ...results.payments,
        ...results.designs,
      ]
    : recentItems;

  const handleSelect = (item: SearchItem | RecentlyViewedItem) => {
    addRecentlyViewed({
      id: item.id,
      category: item.category,
      title: item.title,
      subtitle: item.subtitle,
      url: item.url,
    });
    onClose();
    navigate(item.url);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < flatResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flatResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatResults[selectedIndex]) {
        handleSelect(flatResults[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'CUSTOMER':
        return <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'JOB':
        return <Briefcase className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
      case 'INVOICE':
        return <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
      case 'PAYMENT':
        return <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case 'DESIGN':
        return <Palette className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />;
      default:
        return <Search className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-xs p-4 pt-16 transition-opacity duration-150"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-lg border border-border bg-card shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Header Input */}
        <div className="flex items-center border-b border-border/60 px-4 py-3 bg-card">
          <Search className="h-4 w-4 text-muted-foreground mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Customers, Jobs (#JOB-...), Invoices, Payments, Designs..."
            className="w-full bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center rounded border border-border bg-muted/60 px-2 py-0.5 text-[10px] font-mono text-muted-foreground ml-2">
            ESC
          </kbd>
        </div>


        {/* Results Stream */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3">
          {isLoading && (
            <p className="text-xs text-muted-foreground p-3 italic">Searching records...</p>
          )}

          {!isLoading && !query.trim() && (
            <div className="space-y-1">
              <div className="flex items-center space-x-1 px-3 py-1 text-[11px] font-semibold text-muted-foreground uppercase">
                <Clock className="h-3 w-3 mr-1" />
                <span>Recently Viewed Records</span>
              </div>
              {recentItems.length === 0 ? (
                <p className="text-xs text-muted-foreground px-3 py-2 italic">
                  No recently viewed records yet. Type to search across all entities.
                </p>
              ) : (
                recentItems.map((item, idx) => (
                  <div
                    key={item.url}
                    onClick={() => handleSelect(item)}
                    className={`flex items-center justify-between rounded-md px-3 py-2 text-xs cursor-pointer transition-colors ${
                      idx === selectedIndex
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'hover:bg-muted/50 text-foreground'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      {getCategoryIcon(item.category)}
                      <div className="min-w-0">
                        <p className="font-bold truncate">{item.title}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{item.subtitle}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 ml-2" />
                  </div>
                ))
              )}
            </div>
          )}

          {!isLoading && query.trim() && flatResults.length === 0 && (
            <p className="text-xs text-muted-foreground p-4 text-center">
              No matching customers, jobs, invoices, or designs found for "{query}".
            </p>
          )}

          {!isLoading && query.trim() && flatResults.length > 0 && (
            <div className="space-y-3">
              {results.customers.length > 0 && (
                <div>
                  <h4 className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Customers ({results.customers.length})
                  </h4>
                  {results.customers.map((item) => {
                    const globalIdx = flatResults.findIndex((f) => f.id === item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className={`flex items-center justify-between rounded-md px-3 py-2 text-xs cursor-pointer ${
                          globalIdx === selectedIndex
                            ? 'bg-primary/10 text-primary font-semibold'
                            : 'hover:bg-muted/50 text-foreground'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <User className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-bold truncate">{item.title}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{item.subtitle}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {results.jobs.length > 0 && (
                <div>
                  <h4 className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Jobs ({results.jobs.length})
                  </h4>
                  {results.jobs.map((item) => {
                    const globalIdx = flatResults.findIndex((f) => f.id === item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className={`flex items-center justify-between rounded-md px-3 py-2 text-xs cursor-pointer ${
                          globalIdx === selectedIndex
                            ? 'bg-primary/10 text-primary font-semibold'
                            : 'hover:bg-muted/50 text-foreground'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <Briefcase className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-bold truncate">{item.title}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{item.subtitle}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {results.invoices.length > 0 && (
                <div>
                  <h4 className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Invoices ({results.invoices.length})
                  </h4>
                  {results.invoices.map((item) => {
                    const globalIdx = flatResults.findIndex((f) => f.id === item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className={`flex items-center justify-between rounded-md px-3 py-2 text-xs cursor-pointer ${
                          globalIdx === selectedIndex
                            ? 'bg-primary/10 text-primary font-semibold'
                            : 'hover:bg-muted/50 text-foreground'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-bold truncate">{item.title}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{item.subtitle}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {results.payments.length > 0 && (
                <div>
                  <h4 className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Payments ({results.payments.length})
                  </h4>
                  {results.payments.map((item) => {
                    const globalIdx = flatResults.findIndex((f) => f.id === item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className={`flex items-center justify-between rounded-md px-3 py-2 text-xs cursor-pointer ${
                          globalIdx === selectedIndex
                            ? 'bg-primary/10 text-primary font-semibold'
                            : 'hover:bg-muted/50 text-foreground'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-bold truncate">{item.title}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{item.subtitle}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {results.designs.length > 0 && (
                <div>
                  <h4 className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Designs ({results.designs.length})
                  </h4>
                  {results.designs.map((item) => {
                    const globalIdx = flatResults.findIndex((f) => f.id === item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className={`flex items-center justify-between rounded-md px-3 py-2 text-xs cursor-pointer ${
                          globalIdx === selectedIndex
                            ? 'bg-primary/10 text-primary font-semibold'
                            : 'hover:bg-muted/50 text-foreground'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <Palette className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-bold truncate">{item.title}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{item.subtitle}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Keyboard Navigation Footer */}
        <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-2 text-[10px] text-muted-foreground">
          <span>
            Use <kbd className="font-mono bg-muted border rounded px-1">↑</kbd>{' '}
            <kbd className="font-mono bg-muted border rounded px-1">↓</kbd> to navigate,{' '}
            <kbd className="font-mono bg-muted border rounded px-1">Enter</kbd> to open
          </span>
          <span>Shortcut: Ctrl + K</span>
        </div>
      </div>
    </div>
  );
};
