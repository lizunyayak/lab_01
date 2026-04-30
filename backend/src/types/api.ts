// ─── Unified API response contracts ─────────────────────────────────────────

export interface ApiList<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: string[];
  };
}

// ─── Application error (thrown from services, caught by error handler) ───────

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: string[]
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const notFound = (entity: string, id: string): AppError =>
  new AppError(404, 'NOT_FOUND', `${entity} with id "${id}" not found`);

export const validationError = (details: string[]): AppError =>
  new AppError(400, 'VALIDATION_ERROR', 'Invalid request body', details);

export const conflictError = (message: string): AppError =>
  new AppError(409, 'CONFLICT', message);
