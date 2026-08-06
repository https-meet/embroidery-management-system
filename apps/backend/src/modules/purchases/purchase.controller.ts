import type { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../../utils/errors';
import { PurchaseService, purchaseService } from './purchase.service';
import type { CreatePurchaseDto, PurchaseQueryFilter, UpdatePurchaseDto } from './purchase.types';

export class PurchaseController {
  constructor(private readonly service: PurchaseService = purchaseService) {}

  private getService(req: Request): PurchaseService {
    if (req.database?.prisma) {
      return new PurchaseService(req.database.prisma);
    }
    return this.service;
  }

  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter = req.query as PurchaseQueryFilter;
      const service = this.getService(req);
      const data = await service.listPurchases(filter);

      res.status(200).json({
        success: true,
        message: 'Purchases retrieved successfully.',
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
      const purchase = await service.getPurchaseById(id);

      res.status(200).json({
        success: true,
        message: 'Purchase retrieved successfully.',
        data: { purchase },
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

      const dto = req.body as CreatePurchaseDto;
      const service = this.getService(req);
      const purchase = await service.createPurchase(dto, req.user);

      res.status(201).json({
        success: true,
        message: 'Purchase created successfully.',
        data: { purchase },
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
      const dto = req.body as UpdatePurchaseDto;
      const service = this.getService(req);
      const purchase = await service.updatePurchase(id, dto, req.user);

      res.status(200).json({
        success: true,
        message: 'Purchase updated successfully.',
        data: { purchase },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const purchaseController = new PurchaseController();
