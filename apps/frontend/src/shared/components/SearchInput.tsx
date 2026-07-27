import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import { Input } from './ui/input';

export interface SearchInputProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value: externalValue = '',
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
  className,
}) => {
  const [searchTerm, setSearchTerm] = useState(externalValue);
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);

  // Synchronize internal search state if external value changes
  useEffect(() => {
    setSearchTerm(externalValue);
  }, [externalValue]);

  // Emit debounced search term
  useEffect(() => {
    if (debouncedSearchTerm !== externalValue) {
      onChange(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, onChange, externalValue]);

  const handleClear = () => {
    setSearchTerm('');
    onChange('');
  };

  return (
    <div className={`relative flex items-center ${className || ''}`}>
      <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-8"
      />
      {searchTerm && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};
