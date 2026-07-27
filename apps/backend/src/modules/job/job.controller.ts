import type { NextFunction, Request, Response } from 'express';
import { jobService, type JobService } from './job.service';
import type { CreateJobDto, JobQueryFilter, UpdateJobDto } from './job.types';

export class JobController {
  constructor(private readonly service: JobService = jobService) {}

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as CreateJobDto;
      const userEmail = req.user?.email;
      const job = await this.service.createJob(dto, userEmail);

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
      const job = await this.service.getJobById(id);

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
      const result = await this.service.listJobs(filter);

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
      const job = await this.service.updateJob(id, dto);

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
      await this.service.archiveJob(id);

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
