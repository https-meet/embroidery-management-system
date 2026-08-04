import type { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../../utils/errors';
import { supplierService, type SupplierService } from './supplier.service';
import type { CreateSupplierDto, SupplierQueryFilter, UpdateSupplierDto, UpdateSupplierStatusDto } from './supplier.types';

export class SupplierController {
  constructor(private readonly service: SupplierService = supplierService) {}

  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter = req.query as SupplierQueryFilter;
      const data = await this.service.listSuppliers(filter);

      res.status(200).json({
        success: true,
        message: 'Suppliers retrieved successfully.',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const supplier = await this.service.getSupplierById(id);

      res.status(200).json({
        success: true,
        message: 'Supplier retrieved successfully.',
        data: { supplier },
      });
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('UNAUTHORIZED', 'Authentication required.');
      }

      const dto = req.body as CreateSupplierDto;
      const supplier = await this.service.createSupplier(dto, req.user);

      res.status(201).json({
        success: true,
        message: 'Supplier created successfully.',
        data: { supplier },
      });
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('UNAUTHORIZED', 'Authentication required.');
      }

      const id = req.params.id as string;
      const dto = req.body as UpdateSupplierDto;
      const supplier = await this.service.updateSupplier(id, dto, req.user);

      res.status(200).json({
        success: true,
        message: 'Supplier updated successfully.',
        data: { supplier },
      });
    } catch (error) {
      next(error);
    }
  };

  public updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('UNAUTHORIZED', 'Authentication required.');
      }

      const id = req.params.id as string;
      const dto = req.body as UpdateSupplierStatusDto;
      const supplier = await this.service.updateSupplierStatus(id, dto, req.user);

      res.status(200).json({
        success: true,
        message: 'Supplier status updated successfully.',
        data: { supplier },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const supplierController = new SupplierController();
