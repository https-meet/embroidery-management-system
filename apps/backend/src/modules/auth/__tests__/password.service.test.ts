import { describe, expect, it } from 'vitest';
import { PasswordService } from '../password.service';

describe('PasswordService', () => {
  const passwordService = new PasswordService();

  describe('validate', () => {
    it('should pass for a valid strong password', () => {
      const result = passwordService.validate('ValidPass123!');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail if password is too short', () => {
      const result = passwordService.validate('Val1!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long.');
    });

    it('should fail if password lacks uppercase letter', () => {
      const result = passwordService.validate('validpass123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter.');
    });

    it('should fail if password lacks lowercase letter', () => {
      const result = passwordService.validate('VALIDPASS123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter.');
    });

    it('should fail if password lacks number', () => {
      const result = passwordService.validate('ValidPassword!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number.');
    });

    it('should fail if password lacks special character', () => {
      const result = passwordService.validate('ValidPassword123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character.');
    });
  });

  describe('hash and verify', () => {
    it('should hash a valid password and verify correctly', async () => {
      const plainPassword = 'StrongPassword123!';
      const hash = await passwordService.hash(plainPassword);

      expect(hash).not.toBe(plainPassword);
      expect(typeof hash).toBe('string');

      const isValidMatch = await passwordService.verify(plainPassword, hash);
      expect(isValidMatch).toBe(true);
    });

    it('should return false when verifying an incorrect password', async () => {
      const plainPassword = 'StrongPassword123!';
      const hash = await passwordService.hash(plainPassword);

      const isValidMatch = await passwordService.verify('WrongPassword123!', hash);
      expect(isValidMatch).toBe(false);
    });

    it('should throw BadRequestError when attempting to hash an invalid password', async () => {
      await expect(passwordService.hash('weak')).rejects.toThrow('Password policy violation');
    });
  });
});
