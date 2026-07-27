import type { NextFunction, Request, Response } from 'express';
import { paymentService, type PaymentService } from './payment.service';
import type { CreatePaymentDto, PaymentQueryFilter } from './payment.types';

export class PaymentController {
  constructor(private readonly service: PaymentService = paymentService) {}

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as CreatePaymentDto;
      const payment = await this.service.recordPayment(dto);

      res.status(201).json({
        success: true,
        message: 'Payment recorded successfully.',
        data: { payment },
      });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const payment = await this.service.getPaymentById(id);

      res.status(200).json({
        success: true,
        data: { payment },
      });
    } catch (error) {
      next(error);
    }
  };

  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter = req.query as unknown as PaymentQueryFilter;
      const result = await this.service.listPayments(filter);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const paymentController = new PaymentController();
