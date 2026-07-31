import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

/**
 * Demo Guard Middleware
 * Restricts sensitive administrative mutations (User Management, Company Tax Settings, Backup Dumps)
 * when running in Demo Sandbox Mode (IS_DEMO_MODE=true), while preserving full operational workflows.
 */
export function demoGuard(restrictedFeature: string) {
  return (_req: Request, res: Response, next: NextFunction): void => {
    if (config.isDemoMode) {
      res.status(403).json({
        success: false,
        error: {
          code: 'DEMO_MODE_RESTRICTION',
          message: `🔒 Demo Sandbox Mode: ${restrictedFeature} is disabled in the public demonstration. You may freely explore all operational features (Jobs, Invoices, Payments, Designs, QC)!`,
        },
      });
      return;
    }
    next();
  };
}
