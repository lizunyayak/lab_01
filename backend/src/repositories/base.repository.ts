import { v4 as uuidv4 } from 'uuid';

export interface WithId {
  id: string;
  createdAt: string;
}

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

export class BaseRepository<T extends WithId> {
  protected store: Map<string, T> = new Map();

  generateId(): string {
    return uuidv4();
  }

  now(): string {
    return new Date().toISOString();
  }

  findAll(): T[] {
    return Array.from(this.store.values());
  }

  findById(id: string): T | undefined {
    return this.store.get(id);
  }

  save(entity: T): T {
    this.store.set(entity.id, entity);
    return entity;
  }

  delete(id: string): boolean {
    return this.store.delete(id);
  }

  paginate(items: T[], opts: PaginationOptions): PaginatedResult<T> {
    const { page, pageSize } = opts;
    const total = items.length;
    const start = (page - 1) * pageSize;
    return {
      items: items.slice(start, start + pageSize),
      total,
      page,
      pageSize
    };
  }
}
