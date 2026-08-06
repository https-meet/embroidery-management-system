import type { NextFunction, Request, Response } from 'express';
import { DashboardService, dashboardService } from './dashboard.service';

export class DashboardController {
  constructor(private readonly service: DashboardService = dashboardService) {}

  private getService(req: Request): DashboardService {
    if (req.database?.prisma) {
      return new DashboardService(req.database.prisma);
    }
    return this.service;
  }

  public getSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const service = this.getService(req);
      const data = await service.getDashboardData();
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
