import type { NextFunction, Request, Response } from 'express';
import { customerService, type CustomerService } from './customer.service';
import type { CreateCustomerDto, CustomerQueryFilter, UpdateCustomerDto } from './customer.types';

export class CustomerController {
  constructor(private readonly service: CustomerService = customerService) {}

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as CreateCustomerDto;
      const customer = await this.service.createCustomer(dto);

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
      const customer = await this.service.getCustomerById(id);

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
      const data = await this.service.getCustomer360Data(id);

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
      const result = await this.service.listCustomers(filter);

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
      const customer = await this.service.updateCustomer(id, dto);

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
      await this.service.archiveCustomer(id);

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
