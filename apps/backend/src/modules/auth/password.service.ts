import bcrypt from 'bcryptjs';
import { config } from '../../config';

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface PasswordPolicyOptions {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumber?: boolean;
  requireSpecialChar?: boolean;
}

export class PasswordService {
  private readonly defaultOptions: Required<PasswordPolicyOptions> = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: true,
  };

  /**
   * Validates a password against the security policy requirements.
   *
   * Rules:
   * - Minimum length: 8 characters
   * - At least one uppercase letter (A-Z)
   * - At least one lowercase letter (a-z)
   * - At least one number (0-9)
   * - At least one special character (!@#$%^&*...)
   */
  public validate(password: string, options?: PasswordPolicyOptions): PasswordValidationResult {
    const opts = { ...this.defaultOptions, ...options };
    const errors: string[] = [];

    if (!password || password.length < opts.minLength) {
      errors.push(`Password must be at least ${opts.minLength} characters long.`);
    }

    if (opts.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter.');
    }

    if (opts.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter.');
    }

    if (opts.requireNumber && !/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number.');
    }

    if (opts.requireSpecialChar && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password)) {
      errors.push('Password must contain at least one special character.');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Hashes a plain-text password using bcrypt.
   * Validates the password policy before hashing.
   *
   * @param password Plain-text password
   * @returns Hashed password string
   */
  public async hash(password: string): Promise<string> {
    const validation = this.validate(password);
    if (!validation.isValid) {
      throw new Error(`Password policy violation: ${validation.errors.join(' ')}`);
    }

    const saltRounds = config.security.bcryptSaltRounds;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compares a plain-text password against a hashed password.
   *
   * @param password Plain-text password
   * @param hash BCRYPT hashed password
   * @returns True if the password matches the hash, false otherwise
   */
  public async verify(password: string, hash: string): Promise<boolean> {
    if (!password || !hash) {
      return false;
    }
    return bcrypt.compare(password, hash);
  }
}

export const passwordService = new PasswordService();
