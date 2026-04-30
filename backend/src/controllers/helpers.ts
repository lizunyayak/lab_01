import type { Request } from 'express';

export function parsePagination(req: Request): { page: number; pageSize: number } {
  const page = Math.max(1, parseInt(req.query['page'] as string) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(req.query['pageSize'] as string) || 10));
  return { page, pageSize };
}

export function parseSortDir(req: Request): 'asc' | 'desc' {
  return req.query['sortDir'] === 'asc' ? 'asc' : 'desc';
}
