import { v4 as uuidv4 } from 'uuid';

export interface PaginationOptions {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// esc() was used for string-interpolation SQL in labs 1–4.
// All repositories now use parameterized queries (Lab 05 fix).
// Kept here for reference and the intentional SQLi-demo endpoint in analytics.service.ts.
export function esc(val: string): string {
  return val.replace(/'/g, "''");
}

export abstract class BaseRepository {
  generateId(): string { return uuidv4(); }
  now(): string        { return new Date().toISOString(); }

  paginate<T>(items: T[], opts: PaginationOptions): PaginatedResult<T> {
    const { page, pageSize } = opts;
    const total = items.length;
    const start = (page - 1) * pageSize;
    return { items: items.slice(start, start + pageSize), total, page, pageSize };
  }
}
