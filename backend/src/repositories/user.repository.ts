import { getDb } from '../db/database.js';
import { BaseRepository } from './base.repository.js';
import type { User } from '../types/models.js';

export class UserRepository extends BaseRepository {
  findAll(): User[] {
    return getDb().prepare('SELECT * FROM users ORDER BY createdAt DESC').all() as User[];
  }

  findById(id: string): User | undefined {
    return getDb()
      .prepare('SELECT * FROM users WHERE id = ?')
      .get(id) as User | undefined;
  }

  findByEmail(email: string): User | undefined {
    return getDb()
      .prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)')
      .get(email) as User | undefined;
  }

  save(user: User): User {
    getDb()
      .prepare(`
        INSERT INTO users (id, name, email, createdAt)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name  = excluded.name,
          email = excluded.email
      `)
      .run(user.id, user.name, user.email, user.createdAt);
    return user;
  }

  delete(id: string): boolean {
    const result = getDb()
      .prepare('DELETE FROM users WHERE id = ?')
      .run(id);
    return result.changes > 0;
  }
}

export const userRepository = new UserRepository();
