import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';

/**
 * Middleware factory that validates req.body against a Zod schema.
 * Returns standard validation error envelope on failure (ADR-012).
 */
export function validateRequest(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || 'body',
        message: issue.message,
      }));

      res.status(400).json({
        success: false,
        errors,
      });
      return;
    }

    req.body = result.data;
    next();
  };
}
