import type { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../../utils/errors';
import { purchaseService, type PurchaseService } from './purchase.service';
import type { CreatePurchaseDto, PurchaseQueryFilter, UpdatePurchaseDto } from './purchase.types';

export class PurchaseController {
  constructor(private readonly service: PurchaseService = purchaseService) {}

  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter = req.query as PurchaseQueryFilter;
      const data = await this.service.listPurchases(filter);

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
      const purchase = await this.service.getPurchaseById(id);

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
      const purchase = await this.service.createPurchase(dto, req.user);

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
      const purchase = await this.service.updatePurchase(id, dto, req.user);

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
