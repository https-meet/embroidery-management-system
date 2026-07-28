import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';

/**
 * Middleware factory that validates req.body, req.query, or req.params against a Zod schema.
 * Returns standard validation error envelope on failure (ADR-012).
 */
export function validateRequest(
  schema: ZodSchema,
  target: 'body' | 'query' | 'params' = 'body',
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const dataToValidate = req[target];
    const result = schema.safeParse(dataToValidate);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || target,
        message: issue.message,
      }));

      res.status(400).json({
        success: false,
        errors,
      });
      return;
    }

    if (target === 'query') {
      req.query = result.data as Record<string, unknown>;
    } else if (target === 'params') {
      req.params = result.data as Record<string, string>;
    } else {
      req.body = result.data;
    }

    next();
  };
}
