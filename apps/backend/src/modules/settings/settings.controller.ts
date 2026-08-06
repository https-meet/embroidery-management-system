import type { NextFunction, Request, Response } from 'express';
import { SettingsService, settingsService } from './settings.service';

export class SettingsController {
  constructor(private readonly service: SettingsService = settingsService) {}

  private getService(req: Request): SettingsService {
    if (req.database?.prisma) {
      return new SettingsService(req.database.prisma);
    }
    return this.service;
  }

  public getBusinessConfig = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const service = this.getService(req);
      const config = await service.getBusinessConfig();
      res.status(200).json({
        success: true,
        data: { config },
      });
    } catch (error) {
      next(error);
    }
  };

  public updateBusinessConfig = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const service = this.getService(req);
      const config = await service.updateBusinessConfig(req.body);
      res.status(200).json({
        success: true,
        message: 'Business configuration updated successfully.',
        data: { config },
      });
    } catch (error) {
      next(error);
    }
  };

  public getSystemHealth = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const service = this.getService(req);
      const health = await service.getSystemHealth();
      res.status(200).json({
        success: true,
        data: health,
      });
    } catch (error) {
      next(error);
    }
  };

  public listAuditLogs = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const page = Number(req.query['page']) || 1;
      const limit = Number(req.query['limit']) || 20;
      const service = this.getService(req);
      const data = await service.listAuditLogs(page, limit);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  public createAuditLog = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = req.user;
      const service = this.getService(req);
      const entry = await service.logAuditAction({
        userId: user?.userId,
        userName: user?.email || 'System User',
        ...req.body,
      });
      res.status(201).json({
        success: true,
        data: { entry },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const settingsController = new SettingsController();
