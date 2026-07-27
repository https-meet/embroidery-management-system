import type { NextFunction, Request, Response } from 'express';
import { invoiceService, type InvoiceService } from './invoice.service';
import type { CreateInvoiceDto, InvoiceQueryFilter, UpdateInvoiceDto } from './invoice.types';

export class InvoiceController {
  constructor(private readonly service: InvoiceService = invoiceService) {}

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as CreateInvoiceDto;
      const invoice = await this.service.createInvoice(dto);

      res.status(201).json({
        success: true,
        message: 'Invoice created successfully.',
        data: { invoice },
      });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const invoice = await this.service.getInvoiceById(id);

      res.status(200).json({
        success: true,
        data: { invoice },
      });
    } catch (error) {
      next(error);
    }
  };

  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter = req.query as unknown as InvoiceQueryFilter;
      const result = await this.service.listInvoices(filter);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const dto = req.body as UpdateInvoiceDto;
      const invoice = await this.service.updateInvoice(id, dto);

      res.status(200).json({
        success: true,
        message: 'Invoice updated successfully.',
        data: { invoice },
      });
    } catch (error) {
      next(error);
    }
  };

  public cancel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const invoice = await this.service.cancelInvoice(id);

      res.status(200).json({
        success: true,
        message: 'Invoice cancelled successfully.',
        data: { invoice },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const invoiceController = new InvoiceController();
