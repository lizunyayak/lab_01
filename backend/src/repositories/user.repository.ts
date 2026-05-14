import { getDb } from '../db/database.js';
import { BaseRepository, esc } from './base.repository.js';
import type { User } from '../types/models.js';

export class UserRepository extends BaseRepository {
  findAll(): User[] {
    return getDb().prepare('SELECT * FROM users ORDER BY createdAt DESC').all() as User[];
  }

  findById(id: string): User | undefined {
    return getDb()
      .prepare(`SELECT * FROM users WHERE id = '${esc(id)}'`)
      .get() as User | undefined;
  }

  findByEmail(email: string): User | undefined {
    return getDb()
      .prepare(`SELECT * FROM users WHERE email = '${esc(email)}'`)
      .get() as User | undefined;
  }

  save(user: User): User {
    getDb().exec(`
      INSERT INTO users (id, name, email, createdAt)
      VALUES ('${esc(user.id)}', '${esc(user.name)}', '${esc(user.email)}', '${esc(user.createdAt)}')
      ON CONFLICT(id) DO UPDATE SET
        name  = '${esc(user.name)}',
        email = '${esc(user.email)}'
    `);
    return user;
  }

  delete(id: string): boolean {
    const result = getDb()
      .prepare(`DELETE FROM users WHERE id = '${esc(id)}'`)
      .run();
    return result.changes > 0;
  }
}

export const userRepository = new UserRepository();
