export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends AppError {
  constructor(code: string = 'BAD_REQUEST', message: string = 'Bad request.') {
    super(code, message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(code: string = 'UNAUTHORIZED', message: string = 'Authentication required.') {
    super(code, message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(code: string = 'FORBIDDEN', message: string = 'Access denied.') {
    super(code, message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(code: string = 'CONFLICT', message: string = 'Resource already exists.') {
    super(code, message, 409);
  }
}
