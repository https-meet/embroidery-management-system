/**
 * Standard API response formats defined in ADR-012 and System Architecture
 */

export interface ApiSuccessResponse<T> {
  success: true;
  message?: string;
  data: T;
}

export interface ApiBusinessErrorDetails {
  code: string;
  message: string;
}

export interface ApiBusinessError {
  success: false;
  error: ApiBusinessErrorDetails;
}

export interface ApiValidationErrorField {
  field: string;
  message: string;
}

export interface ApiValidationError {
  success: false;
  errors: ApiValidationErrorField[];
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiBusinessError | ApiValidationError;

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}

/**
 * Type guard for ApiBusinessError (Issue 4 fix)
 */
export function isApiBusinessError(error: unknown): error is ApiBusinessError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'success' in error &&
    (error as { success: boolean }).success === false &&
    'error' in error &&
    typeof (error as ApiBusinessError).error === 'object' &&
    (error as ApiBusinessError).error !== null
  );
}

/**
 * Type guard for ApiValidationError (Issue 4 fix)
 */
export function isApiValidationError(error: unknown): error is ApiValidationError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'success' in error &&
    (error as { success: boolean }).success === false &&
    'errors' in error &&
    Array.isArray((error as ApiValidationError).errors)
  );
}
