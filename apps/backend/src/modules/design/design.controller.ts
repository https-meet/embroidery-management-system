import type { NextFunction, Request, Response } from 'express';
import { designService, type DesignService } from './design.service';
import type { CreateDesignDto, DesignQueryFilter, UpdateDesignDto } from './design.types';

export class DesignController {
  constructor(private readonly service: DesignService = designService) {}

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as CreateDesignDto;
      const design = await this.service.createDesign(dto);

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
      const design = await this.service.getDesignById(id);

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
      const result = await this.service.listDesigns(filter);

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
      const design = await this.service.updateDesign(id, dto);

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
      await this.service.archiveDesign(id);

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
