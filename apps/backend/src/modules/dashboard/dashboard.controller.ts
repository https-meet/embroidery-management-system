import type { NextFunction, Request, Response } from 'express';
import { dashboardService, type DashboardService } from './dashboard.service';

export class DashboardController {
  constructor(private readonly service: DashboardService = dashboardService) {}

  public getSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getDashboardData();
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const dashboardController = new DashboardController();
