import type { NextFunction, Request, Response } from 'express';
import { DesignService, designService } from './design.service';
import type { CreateDesignDto, DesignQueryFilter, UpdateDesignDto } from './design.types';

export class DesignController {
  constructor(private readonly service: DesignService = designService) {}

  private getService(req: Request): DesignService {
    if (req.database?.prisma) {
      return new DesignService(req.database.prisma);
    }
    return this.service;
  }

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as CreateDesignDto;
      const service = this.getService(req);
      const design = await service.createDesign(dto);

      res.status(201).json({
        success: true,
        message: 'Design created successfully.',
        data: { design },
      });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params['id'] as string;
      const service = this.getService(req);
      const design = await service.getDesignById(id);

      res.status(200).json({
        success: true,
        data: { design },
      });
    } catch (error) {
      next(error);
    }
  };

  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter = req.query as unknown as DesignQueryFilter;
      const service = this.getService(req);
      const result = await service.listDesigns(filter);

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
      const dto = req.body as UpdateDesignDto;
      const service = this.getService(req);
      const design = await service.updateDesign(id, dto);

      res.status(200).json({
        success: true,
        message: 'Design updated successfully.',
        data: { design },
      });
    } catch (error) {
      next(error);
    }
  };

  public archive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params['id'] as string;
      const service = this.getService(req);
      await service.archiveDesign(id);

      res.status(200).json({
        success: true,
        message: 'Design archived successfully.',
      });
    } catch (error) {
      next(error);
    }
  };
}

export const designController = new DesignController();
