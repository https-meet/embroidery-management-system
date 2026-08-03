import type { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../../utils/errors';
import { userService, type UserService } from './users.service';
import type { CreateUserDto, UpdateUserDto, UpdateUserStatusDto, UserQueryFilter } from './users.types';

export class UsersController {
  constructor(private readonly service: UserService = userService) {}

  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filter = req.query as unknown as UserQueryFilter;
      const data = await this.service.listUsers(filter);

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
      const user = await this.service.getUserById(id);

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
      const result = await this.service.createUser(dto, req.user);

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
      const user = await this.service.updateUser(id, dto, req.user);

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
      const user = await this.service.updateUserStatus(id, dto, req.user);

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
      const result = await this.service.resetUserPassword(id, req.user);

      res.status(200).json({
        success: true,
        message: 'Temporary password generated successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const usersController = new UsersController();
