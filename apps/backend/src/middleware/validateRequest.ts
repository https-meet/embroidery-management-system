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
      if (req.query && typeof req.query === 'object') {
        for (const key of Object.keys(req.query)) {
          delete (req.query as Record<string, unknown>)[key];
        }
        Object.assign(req.query, result.data);
      }
    } else if (target === 'params') {
      if (req.params && typeof req.params === 'object') {
        Object.assign(req.params, result.data);
      }
    } else {
      req.body = result.data;
    }

    next();
  };
}
