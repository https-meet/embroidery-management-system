import { useEffect, useCallback } from 'react';
import { useBlocker } from 'react-router-dom';

export interface UseUnsavedChangesReturn {
  isBlocked: boolean;
  proceed: () => void;
  reset: () => void;
}

/**
 * Custom hook to prevent accidental data loss when navigating away from dirty forms.
 * Handles both:
 * 1. Internal React Router navigation via useBlocker (Sidebar, Breadcrumbs, Back buttons, links).
 * 2. Browser refresh (F5), tab close, and window close via browser-native beforeunload.
 *
 * @param isDirty boolean indicating if form contains unsaved changes.
 */
export function useUnsavedChanges(isDirty: boolean): UseUnsavedChangesReturn {
  // 1. Handle browser refresh / tab close via standard beforeunload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    if (isDirty) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  // 2. Handle React Router internal navigation via useBlocker
  const blocker = useBlocker(
    useCallback(
      ({
        currentLocation,
        nextLocation,
      }: {
        currentLocation: { pathname: string };
        nextLocation: { pathname: string };
      }) => isDirty && currentLocation.pathname !== nextLocation.pathname,
      [isDirty]
    )
  );

  const isBlocked = blocker.state === 'blocked';

  const proceed = useCallback(() => {
    if (blocker.state === 'blocked') {
      blocker.proceed();
    }
  }, [blocker]);

  const reset = useCallback(() => {
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
  }, [blocker]);

  return {
    isBlocked,
    proceed,
    reset,
  };
}
