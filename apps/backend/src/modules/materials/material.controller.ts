import type { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../../utils/errors';
import { materialService, type MaterialService } from './material.service';
import type { CreateMaterialDto, MaterialQueryFilter, UpdateMaterialDto, UpdateMaterialStatusDto } from './material.types';

export class MaterialController {
  constructor(private readonly service: MaterialService = materialService) {}

  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter = req.query as MaterialQueryFilter;
      const data = await this.service.listMaterials(filter);

      res.status(200).json({
        success: true,
        message: 'Materials retrieved successfully.',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const material = await this.service.getMaterialById(id);

      res.status(200).json({
        success: true,
        message: 'Material retrieved successfully.',
        data: { material },
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

      const dto = req.body as CreateMaterialDto;
      const result = await this.service.createMaterial(dto, req.user);

      res.status(201).json({
        success: true,
        message: 'Material created successfully.',
        data: result,
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
      const dto = req.body as UpdateMaterialDto;
      const result = await this.service.updateMaterial(id, dto, req.user);

      res.status(200).json({
        success: true,
        message: 'Material updated successfully.',
        data: result,
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
      const dto = req.body as UpdateMaterialStatusDto;
      const material = await this.service.updateMaterialStatus(id, dto, req.user);

      res.status(200).json({
        success: true,
        message: 'Material status updated successfully.',
        data: { material },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const materialController = new MaterialController();
