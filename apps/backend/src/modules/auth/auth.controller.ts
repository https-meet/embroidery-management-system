import type { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../../utils/errors';
import { AuthService, authService } from './auth.service';
import type { ChangePasswordDto, LoginDto, RefreshTokenDto } from './auth.types';

export class AuthController {
  constructor(private readonly service: AuthService = authService) {}

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as LoginDto;
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.ip;
      const userAgent = req.headers['user-agent'];
      const activePrisma = req.database?.prisma;
      const serviceToUse = activePrisma ? new AuthService(activePrisma) : this.service;
      const data = await serviceToUse.login(dto, ipAddress, userAgent);

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
      await this.service.changePassword(req.user.userId, dto, currentRefreshToken);

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
      const tokens = await this.service.refreshToken(dto, ipAddress);

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

      const user = await this.service.getUserProfile(req.user.userId);
      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  public logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as RefreshTokenDto;
      await this.service.logout(dto);

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
