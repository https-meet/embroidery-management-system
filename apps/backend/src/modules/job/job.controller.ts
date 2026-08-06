import type { NextFunction, Request, Response } from 'express';
import { JobService, jobService } from './job.service';
import type { CreateJobDto, JobQueryFilter, UpdateJobDto } from './job.types';

export class JobController {
  constructor(private readonly service: JobService = jobService) {}

  private getService(req: Request): JobService {
    if (req.database?.prisma) {
      return new JobService(req.database.prisma);
    }
    return this.service;
  }

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as CreateJobDto;
      const userEmail = req.user?.email;
      const service = this.getService(req);
      const job = await service.createJob(dto, userEmail);

      res.status(201).json({
        success: true,
        message: 'Job created successfully.',
        data: { job },
      });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params['id'] as string;
      const service = this.getService(req);
      const job = await service.getJobById(id);

      res.status(200).json({
        success: true,
        data: { job },
      });
    } catch (error) {
      next(error);
    }
  };

  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter = req.query as unknown as JobQueryFilter;
      const service = this.getService(req);
      const result = await service.listJobs(filter);

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
      const dto = req.body as UpdateJobDto;
      const service = this.getService(req);
      const job = await service.updateJob(id, dto);

      res.status(200).json({
        success: true,
        message: 'Job updated successfully.',
        data: { job },
      });
    } catch (error) {
      next(error);
    }
  };

  public archive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params['id'] as string;
      const service = this.getService(req);
      await service.archiveJob(id);

      res.status(200).json({
        success: true,
        message: 'Job archived successfully.',
      });
    } catch (error) {
      next(error);
    }
  };
}

export const jobController = new JobController();
