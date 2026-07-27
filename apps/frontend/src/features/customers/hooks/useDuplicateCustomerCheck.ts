import { useState, useEffect } from 'react';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { getCustomersApi } from '../api/customers.api';
import type { CustomerDto } from '../types/customer.types';

export function useDuplicateCustomerCheck(name: string, mobile?: string) {
  const [duplicate, setDuplicate] = useState<CustomerDto | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const debouncedName = useDebounce(name, 400);
  const debouncedMobile = useDebounce(mobile, 400);

  useEffect(() => {
    let isCurrent = true;

    async function checkDuplicate() {
      if (!debouncedName || debouncedName.trim().length < 2) {
        setDuplicate(null);
        return;
      }

      setIsChecking(true);
      try {
        const response = await getCustomersApi({
          search: debouncedName.trim(),
          limit: 5,
        });

        if (!isCurrent) return;

        // Check if any matching active customer has identical name and/or mobile (BR-005)
        const match = response.customers.find((c) => {
          const nameMatches = c.name.toLowerCase() === debouncedName.trim().toLowerCase();
          const mobileMatches =
            debouncedMobile && c.mobile ? c.mobile.replace(/\s+/g, '') === debouncedMobile.replace(/\s+/g, '') : false;

          return nameMatches || mobileMatches;
        });

        setDuplicate(match || null);
      } catch {
        if (isCurrent) setDuplicate(null);
      } finally {
        if (isCurrent) setIsChecking(false);
      }
    }

    checkDuplicate();

    return () => {
      isCurrent = false;
    };
  }, [debouncedName, debouncedMobile]);

  return { duplicate, isChecking };
}
