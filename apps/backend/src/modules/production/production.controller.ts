import type { NextFunction, Request, Response } from 'express';
import { productionService, type ProductionService } from './production.service';
import type {
  AssignProductionDto,
  CompleteProductionDto,
  DeliveryReadinessDto,
  ProductionQueryFilter,
  QualityCheckDto,
  StartProductionDto,
} from './production.types';

export class ProductionController {
  constructor(private readonly service: ProductionService = productionService) {}

  public assign = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as AssignProductionDto;
      const job = await this.service.assignOperator(dto);

      res.status(200).json({
        success: true,
        message: 'Operator assigned successfully.',
        data: { job },
      });
    } catch (error) {
      next(error);
    }
  };

  public start = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as StartProductionDto;
      const job = await this.service.startProduction(dto);

      res.status(200).json({
        success: true,
        message: 'Production started successfully.',
        data: { job },
      });
    } catch (error) {
      next(error);
    }
  };

  public complete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as CompleteProductionDto;
      const job = await this.service.completeProduction(dto);

      res.status(200).json({
        success: true,
        message: 'Production completed successfully.',
        data: { job },
      });
    } catch (error) {
      next(error);
    }
  };

  public qualityCheck = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as QualityCheckDto;
      const inspector = req.user?.email;
      const job = await this.service.recordQualityCheck(dto, inspector);

      res.status(200).json({
        success: true,
        message: 'Quality check recorded successfully.',
        data: { job },
      });
    } catch (error) {
      next(error);
    }
  };

  public deliver = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as DeliveryReadinessDto;
      const job = await this.service.markReadyForDelivery(dto);

      res.status(200).json({
        success: true,
        message: 'Job marked ready for delivery.',
        data: { job },
      });
    } catch (error) {
      next(error);
    }
  };

  public listQueue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter = req.query as unknown as ProductionQueryFilter;
      const result = await this.service.getProductionQueue(filter);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const productionController = new ProductionController();
