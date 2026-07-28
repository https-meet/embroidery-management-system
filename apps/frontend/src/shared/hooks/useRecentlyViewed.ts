import { useState, useEffect } from 'react';

export interface RecentlyViewedItem {
  id: string;
  category: 'CUSTOMER' | 'JOB' | 'INVOICE' | 'PAYMENT' | 'DESIGN';
  title: string;
  subtitle: string;
  url: string;
  timestamp: number;
}

const STORAGE_KEY = 'ebms_recently_viewed_records';

export function useRecentlyViewed() {
  const [recentItems, setRecentItems] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentItems(JSON.parse(stored));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const addRecentlyViewed = (item: Omit<RecentlyViewedItem, 'timestamp'>) => {
    try {
      const existing = recentItems.filter((i) => i.url !== item.url);
      const updated = [{ ...item, timestamp: Date.now() }, ...existing].slice(0, 5);
      setRecentItems(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore localStorage errors
    }
  };

  return { recentItems, addRecentlyViewed };
}
