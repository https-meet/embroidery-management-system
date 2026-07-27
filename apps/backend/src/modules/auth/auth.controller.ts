import type { NextFunction, Request, Response } from 'express';
import { authService, type AuthService } from './auth.service';
import type { LoginDto, RefreshTokenDto, RegisterDto } from './auth.types';

export class AuthController {
  constructor(private readonly service: AuthService = authService) {}

  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as RegisterDto;
      const user = await this.service.register(dto);

      res.status(201).json({
        success: true,
        message: 'User registered successfully.',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as LoginDto;
      const data = await this.service.login(dto);

      res.status(200).json({
        success: true,
        message: 'Login successful.',
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  public refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as RefreshTokenDto;
      const tokens = await this.service.refreshToken(dto);

      res.status(200).json({
        success: true,
        message: 'Tokens refreshed successfully.',
        data: tokens,
      });
    } catch (error) {
      next(error);
    }
  };

  public logout = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.logout();

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
