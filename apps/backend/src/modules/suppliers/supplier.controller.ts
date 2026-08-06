import type { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../../utils/errors';
import { SupplierService, supplierService } from './supplier.service';
import type { CreateSupplierDto, SupplierQueryFilter, UpdateSupplierDto, UpdateSupplierStatusDto } from './supplier.types';

export class SupplierController {
  constructor(private readonly service: SupplierService = supplierService) {}

  private getService(req: Request): SupplierService {
    if (req.database?.prisma) {
      return new SupplierService(req.database.prisma);
    }
    return this.service;
  }

  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter = req.query as SupplierQueryFilter;
      const service = this.getService(req);
      const data = await service.listSuppliers(filter);

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
      const service = this.getService(req);
      const supplier = await service.getSupplierById(id);

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
      const service = this.getService(req);
      const supplier = await service.createSupplier(dto, req.user);

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
      const service = this.getService(req);
      const supplier = await service.updateSupplier(id, dto, req.user);

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
      const service = this.getService(req);
      const supplier = await service.updateSupplierStatus(id, dto, req.user);

      res.status(200).json({
        success: true,
        message: `Supplier ${dto.isActive ? 'activated' : 'deactivated'} successfully.`,
        data: { supplier },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const supplierController = new SupplierController();
