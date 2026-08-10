import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface BreadcrumbContextType {
  labels: Record<string, string>;
  setLabel: (id: string, label: string) => void;
  removeLabel: (id: string) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType>({
  labels: {},
  setLabel: () => {},
  removeLabel: () => {},
});

export const BreadcrumbProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [labels, setLabels] = useState<Record<string, string>>({});

  const setLabel = useCallback((id: string, label: string) => {
    if (!id || !label) return;
    setLabels((prev) => {
      if (prev[id] === label) return prev;
      return { ...prev, [id]: label };
    });
  }, []);

  const removeLabel = useCallback((id: string) => {
    if (!id) return;
    setLabels((prev) => {
      if (!(id in prev)) return prev;
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  }, []);

  return (
    <BreadcrumbContext.Provider value={{ labels, setLabel, removeLabel }}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

export const useBreadcrumbContext = () => useContext(BreadcrumbContext);

/**
 * Custom hook to register a human-readable breadcrumb label for a given entity ID.
 * Automatically cleans up upon unmount or when ID changes to prevent stale data.
 */
export const useSetBreadcrumb = (id: string | undefined, label: string | undefined) => {
  const { setLabel, removeLabel } = useBreadcrumbContext();

  useEffect(() => {
    if (id && label) {
      setLabel(id, label);
    }
    return () => {
      if (id) {
        removeLabel(id);
      }
    };
  }, [id, label, setLabel, removeLabel]);
};
