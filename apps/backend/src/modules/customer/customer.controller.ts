import type { NextFunction, Request, Response } from 'express';
import { CustomerService, customerService } from './customer.service';
import type { CreateCustomerDto, CustomerQueryFilter, UpdateCustomerDto } from './customer.types';

export class CustomerController {
  constructor(private readonly service: CustomerService = customerService) {}

  private getService(req: Request): CustomerService {
    if (req.database?.prisma) {
      return new CustomerService(req.database.prisma);
    }
    return this.service;
  }

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as CreateCustomerDto;
      const service = this.getService(req);
      const customer = await service.createCustomer(dto);

      res.status(201).json({
        success: true,
        message: 'Customer created successfully.',
        data: { customer },
      });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params['id'] as string;
      const service = this.getService(req);
      const customer = await service.getCustomerById(id);

      res.status(200).json({
        success: true,
        data: { customer },
      });
    } catch (error) {
      next(error);
    }
  };

  public get360 = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params['id'] as string;
      const service = this.getService(req);
      const data = await service.getCustomer360Data(id);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter = req.query as unknown as CustomerQueryFilter;
      const service = this.getService(req);
      const result = await service.listCustomers(filter);

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
      const id = req.params['id'] as string;
      const dto = req.body as UpdateCustomerDto;
      const service = this.getService(req);
      const customer = await service.updateCustomer(id, dto);

      res.status(200).json({
        success: true,
        message: 'Customer updated successfully.',
        data: { customer },
      });
    } catch (error) {
      next(error);
    }
  };

  public archive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params['id'] as string;
      const service = this.getService(req);
      await service.archiveCustomer(id);

      res.status(200).json({
        success: true,
        message: 'Customer archived successfully.',
      });
    } catch (error) {
      next(error);
    }
  };
}

export const customerController = new CustomerController();
