import type { Role } from '@prisma/client';
import type { SignOptions } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import { config } from '../../config';

export interface UserTokenPayload {
  id: string;
  email: string;
  role: Role;
}

export interface AccessTokenPayload {
  userId: string;
  email: string;
  role: Role;
  type: 'access';
}

export interface RefreshTokenPayload {
  userId: string;
  type: 'refresh';
}

export class JwtService {
  /**
   * Generates a short-lived Access Token for the user.
   *
   * @param user User payload containing id, email, and role
   * @returns Signed JWT access token string
   */
  public generateAccessToken(user: UserTokenPayload): string {
    const payload: AccessTokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      type: 'access',
    };

    const options: SignOptions = {
      expiresIn: config.jwt.accessExpiresIn as SignOptions['expiresIn'],
    };

    return jwt.sign(payload, config.jwt.accessSecret, options);
  }

  /**
   * Generates a longer-lived Refresh Token for the user.
   *
   * @param user User payload containing id
   * @returns Signed JWT refresh token string
   */
  public generateRefreshToken(user: Pick<UserTokenPayload, 'id'>): string {
    const payload: RefreshTokenPayload = {
      userId: user.id,
      type: 'refresh',
    };

    const options: SignOptions = {
      expiresIn: config.jwt.refreshExpiresIn as SignOptions['expiresIn'],
    };

    return jwt.sign(payload, config.jwt.refreshSecret, options);
  }

  /**
   * Verifies an Access Token and returns its decoded payload.
   * Safely returns null if the token is expired, tampered with, or invalid type.
   *
   * @param token JWT access token string
   * @returns Verified AccessTokenPayload or null
   */
  public verifyAccessToken(token: string): AccessTokenPayload | null {
    if (!token) {
      return null;
    }

    try {
      const decoded = jwt.verify(token, config.jwt.accessSecret) as AccessTokenPayload;
      if (decoded.type !== 'access') {
        return null;
      }
      return decoded;
    } catch {
      return null;
    }
  }

  /**
   * Verifies a Refresh Token and returns its decoded payload.
   * Safely returns null if the token is expired, tampered with, or invalid type.
   *
   * @param token JWT refresh token string
   * @returns Verified RefreshTokenPayload or null
   */
  public verifyRefreshToken(token: string): RefreshTokenPayload | null {
    if (!token) {
      return null;
    }

    try {
      const decoded = jwt.verify(token, config.jwt.refreshSecret) as RefreshTokenPayload;
      if (decoded.type !== 'refresh') {
        return null;
      }
      return decoded;
    } catch {
      return null;
    }
  }
}

export const jwtService = new JwtService();
