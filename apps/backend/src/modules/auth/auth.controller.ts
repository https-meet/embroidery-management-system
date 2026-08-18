import type { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../../utils/errors';
import { AuthService, authService } from './auth.service';
import type { ChangePasswordDto, LoginDto, RefreshTokenDto } from './auth.types';

export class AuthController {
  constructor(private readonly service: AuthService = authService) {}

  private getService(req: Request): AuthService {
    if (req.database?.prisma) {
      return new AuthService(req.database.prisma);
    }
    return this.service;
  }

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as LoginDto;
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip;
      const userAgent = req.headers['user-agent'];
      const dbMode = req.database?.environment || 'production';
      const serviceToUse = this.getService(req);
      const data = await serviceToUse.login(dto, ipAddress, userAgent, dbMode);

      res.status(200).json({
        success: true,
        message: 'Login successful.',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  public changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('UNAUTHORIZED', 'Authentication required.');
      }

      const dto = req.body as ChangePasswordDto;
      const currentRefreshToken = req.body.refreshToken as string | undefined;
      const serviceToUse = this.getService(req);
      await serviceToUse.changePassword(req.user.userId, dto, currentRefreshToken);

      res.status(200).json({
        success: true,
        message: 'Password changed successfully.',
      });
    } catch (error) {
      next(error);
    }
  };

  public refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as RefreshTokenDto;
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip;
      const serviceToUse = this.getService(req);
      const tokens = await serviceToUse.refreshToken(dto, ipAddress);

      res.status(200).json({
        success: true,
        message: 'Tokens refreshed successfully.',
        data: tokens,
      });
    } catch (error) {
      next(error);
    }
  };

  public me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required.',
          },
        });
        return;
      }

      const serviceToUse = this.getService(req);
      const user = await serviceToUse.getUserProfile(req.user.userId);
      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  public updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication token required.',
          },
        });
        return;
      }

      const { name } = req.body;
      if (!name || typeof name !== 'string' || name.trim().length < 2) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Name must be at least 2 characters.',
          },
        });
        return;
      }

      const serviceToUse = this.getService(req);
      const user = await serviceToUse.updateUserProfile(req.user.userId, { name });
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  public logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as RefreshTokenDto;
      const serviceToUse = this.getService(req);
      await serviceToUse.logout(dto);

      res.status(200).json({
        success: true,
        message: 'Logged out successfully.',
      });
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();
