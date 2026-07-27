/**
 * Shared backend type definitions.
 *
 * Guidelines:
 * - Feature-specific types belong in their own module folder (src/modules/<feature>/types.ts).
 * - Only truly cross-cutting types live here.
 */

/**
 * Standard successful API response envelope.
 * See ADR-012 for the full error response format.
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message?: string;
  data: T;
}

/**
 * Business / Domain error response (single named failure).
 */
export interface ApiBusinessErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

/**
 * Validation error response (multiple simultaneous field failures).
 */
export interface ApiValidationErrorResponse {
  success: false;
  errors: Array<{
    field: string;
    message: string;
  }>;
}

export type ApiErrorResponse = ApiBusinessErrorResponse | ApiValidationErrorResponse;
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;
