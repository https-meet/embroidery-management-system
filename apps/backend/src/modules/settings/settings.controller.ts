import type { NextFunction, Request, Response } from 'express';
import { settingsService, type SettingsService } from './settings.service';

export class SettingsController {
  constructor(private readonly service: SettingsService = settingsService) {}

  public getBusinessConfig = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const config = await this.service.getBusinessConfig();
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
      const config = await this.service.updateBusinessConfig(req.body);
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
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const health = await this.service.getSystemHealth();
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
      const data = await this.service.listAuditLogs(page, limit);
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
      const entry = await this.service.logAuditAction({
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
