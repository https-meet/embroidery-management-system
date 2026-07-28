import type { NextFunction, Request, Response } from 'express';
import { reportService, type ReportService } from './report.service';
import type { ReportFilterDto } from './report.types';

export class ReportController {
  constructor(private readonly service: ReportService = reportService) {}

  public getCustomers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter = req.query as unknown as ReportFilterDto;
      const data = await this.service.getCustomerReport(filter);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  public getJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter = req.query as unknown as ReportFilterDto;
      const data = await this.service.getJobReport(filter);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  public getProduction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter = req.query as unknown as ReportFilterDto;
      const data = await this.service.getProductionReport(filter);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  public getInvoices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter = req.query as unknown as ReportFilterDto;
      const data = await this.service.getInvoiceReport(filter);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  public getPayments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter = req.query as unknown as ReportFilterDto;
      const data = await this.service.getPaymentReport(filter);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  public getRevenue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter = req.query as unknown as ReportFilterDto;
      const data = await this.service.getRevenueReport(filter);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  public exportAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getFullSystemBackup();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}

export const reportController = new ReportController();
