import type { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../../utils/errors';
import { UserService, userService } from './users.service';
import type { CreateUserDto, UpdateUserDto, UpdateUserStatusDto, UserQueryFilter } from './users.types';

export class UsersController {
  constructor(private readonly service: UserService = userService) {}

  private getService(req: Request): UserService {
    if (req.database?.prisma) {
      return new UserService(req.database.prisma);
    }
    return this.service;
  }

  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter = req.query as unknown as UserQueryFilter;
      const service = this.getService(req);
      const data = await service.listUsers(filter);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params['id'] as string;
      const service = this.getService(req);
      const user = await service.getUserById(id);

      res.status(200).json({
        success: true,
        data: { user },
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

      const dto = req.body as CreateUserDto;
      const service = this.getService(req);
      const result = await service.createUser(dto, req.user);

      res.status(201).json({
        success: true,
        message: 'Employee user account created successfully.',
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

      const id = req.params['id'] as string;
      const dto = req.body as UpdateUserDto;
      const service = this.getService(req);
      const user = await service.updateUser(id, dto, req.user);

      res.status(200).json({
        success: true,
        message: 'User account updated successfully.',
        data: { user },
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

      const id = req.params['id'] as string;
      const dto = req.body as UpdateUserStatusDto;
      const service = this.getService(req);
      const user = await service.updateUserStatus(id, dto, req.user);

      res.status(200).json({
        success: true,
        message: `User account ${dto.isActive ? 'activated' : 'deactivated'} successfully.`,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  public resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('UNAUTHORIZED', 'Authentication required.');
      }

      const id = req.params['id'] as string;
      const service = this.getService(req);
      const result = await service.resetUserPassword(id, req.user);

      res.status(200).json({
        success: true,
        message: 'User password reset successfully. All active sessions have been revoked.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const usersController = new UsersController();
