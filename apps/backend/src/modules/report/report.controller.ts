import type { NextFunction, Request, Response } from 'express';
import { ReportService, reportService } from './report.service';
import type { ReportFilterDto } from './report.types';

export class ReportController {
  constructor(private readonly service: ReportService = reportService) {}

  private getService(req: Request): ReportService {
    if (req.database?.prisma) {
      return new ReportService(req.database.prisma);
    }
    return this.service;
  }

  public getCustomers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter = req.query as unknown as ReportFilterDto;
      const service = this.getService(req);
      const data = await service.getCustomerReport(filter);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  public getJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter = req.query as unknown as ReportFilterDto;
      const service = this.getService(req);
      const data = await service.getJobReport(filter);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  public getProduction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter = req.query as unknown as ReportFilterDto;
      const service = this.getService(req);
      const data = await service.getProductionReport(filter);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  public getInvoices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter = req.query as unknown as ReportFilterDto;
      const service = this.getService(req);
      const data = await service.getInvoiceReport(filter);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  public getPayments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter = req.query as unknown as ReportFilterDto;
      const service = this.getService(req);
      const data = await service.getPaymentReport(filter);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  public getRevenue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter = req.query as unknown as ReportFilterDto;
      const service = this.getService(req);
      const data = await service.getRevenueReport(filter);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  public exportAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const service = this.getService(req);
      const data = await service.getFullSystemBackup();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}

export const reportController = new ReportController();
