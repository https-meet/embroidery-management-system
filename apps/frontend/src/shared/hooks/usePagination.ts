import { useState } from 'react';
import type { PaginationParams } from '../types/api.types';

export interface UsePaginationReturn {
  page: number;
  limit: number;
  search: string;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSearch: (search: string) => void;
  paginationParams: PaginationParams;
  resetPagination: () => void;
}

/**
 * Custom hook to manage page, limit, and search parameters for list queries
 */
export function usePagination(
  defaultPage = 1,
  defaultLimit = 20,
  defaultSearch = ''
): UsePaginationReturn {
  const [page, setPage] = useState<number>(defaultPage);
  const [limit, setLimit] = useState<number>(defaultLimit);
  const [search, setSearchState] = useState<string>(defaultSearch);

  const setSearch = (newSearch: string) => {
    setSearchState(newSearch);
    setPage(1); // Reset to page 1 on new search
  };

  const resetPagination = () => {
    setPage(defaultPage);
    setLimit(defaultLimit);
    setSearchState(defaultSearch);
  };

  const paginationParams: PaginationParams = {
    page,
    limit,
    ...(search ? { search } : {}),
  };

  return {
    page,
    limit,
    search,
    setPage,
    setLimit,
    setSearch,
    paginationParams,
    resetPagination,
  };
}
