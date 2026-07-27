import { useContext } from 'react';
import { AuthContext, type AuthContextType } from '../providers/AuthProvider';

/**
 * Custom hook to access authentication context state and actions
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
