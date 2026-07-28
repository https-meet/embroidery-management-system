import type { NextFunction, Request, Response } from 'express';
import { searchService, type SearchService } from './search.service';

export class SearchController {
  constructor(private readonly service: SearchService = searchService) {}

  public search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const q = (req.query['q'] as string) || '';
      const result = await this.service.searchAll(q);

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
