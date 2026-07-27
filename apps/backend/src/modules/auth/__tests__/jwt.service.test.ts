import { describe, expect, it } from 'vitest';
import { JwtService, type UserTokenPayload } from '../jwt.service';

describe('JwtService', () => {
  const jwtService = new JwtService();
  const mockUser: UserTokenPayload = {
    id: 'user-uuid-1234',
    email: 'test@example.com',
    role: 'ADMIN',
  };

  describe('AccessToken', () => {
    it('should generate and verify a valid access token', () => {
      const token = jwtService.generateAccessToken(mockUser);
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(20);

      const decoded = jwtService.verifyAccessToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded?.userId).toBe(mockUser.id);
      expect(decoded?.email).toBe(mockUser.email);
      expect(decoded?.role).toBe(mockUser.role);
      expect(decoded?.type).toBe('access');
    });

    it('should return null when verifying an invalid access token', () => {
      const decoded = jwtService.verifyAccessToken('invalid.jwt.token');
      expect(decoded).toBeNull();
    });

    it('should return null when verifying empty token', () => {
      const decoded = jwtService.verifyAccessToken('');
      expect(decoded).toBeNull();
    });
  });

  describe('RefreshToken', () => {
    it('should generate and verify a valid refresh token', () => {
      const token = jwtService.generateRefreshToken(mockUser);
      expect(typeof token).toBe('string');

      const decoded = jwtService.verifyRefreshToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded?.userId).toBe(mockUser.id);
      expect(decoded?.type).toBe('refresh');
    });

    it('should reject refresh token when verified as access token', () => {
      const refreshToken = jwtService.generateRefreshToken(mockUser);
      const decodedAsAccess = jwtService.verifyAccessToken(refreshToken);
      expect(decodedAsAccess).toBeNull();
    });

    it('should reject access token when verified as refresh token', () => {
      const accessToken = jwtService.generateAccessToken(mockUser);
      const decodedAsRefresh = jwtService.verifyRefreshToken(accessToken);
      expect(decodedAsRefresh).toBeNull();
    });
  });
});
