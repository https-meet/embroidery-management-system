import type { NextFunction, Request, Response } from 'express';
import { SearchService, searchService } from './search.service';

export class SearchController {
  constructor(private readonly service: SearchService = searchService) {}

  private getService(req: Request): SearchService {
    if (req.database?.prisma) {
      return new SearchService(req.database.prisma);
    }
    return this.service;
  }

  public search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const q = (req.query['q'] as string) || '';
      const service = this.getService(req);
      const result = await service.searchAll(q);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const searchController = new SearchController();
