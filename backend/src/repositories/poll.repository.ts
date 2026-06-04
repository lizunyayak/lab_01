import { getDb } from '../db/database.js';
import { BaseRepository } from './base.repository.js';
import type { Poll, Visibility } from '../types/models.js';

export class PollRepository extends BaseRepository {
  findAll(): Poll[] {
    return getDb().prepare('SELECT * FROM polls ORDER BY createdAt DESC').all() as Poll[];
  }

  findById(id: string): Poll | undefined {
    return getDb()
      .prepare('SELECT * FROM polls WHERE id = ?')
      .get(id) as Poll | undefined;
  }

  findByAuthorId(authorId: string): Poll[] {
    return getDb()
      .prepare('SELECT * FROM polls WHERE authorId = ? ORDER BY createdAt DESC')
      .all(authorId) as Poll[];
  }

  findByVisibility(visibility: Visibility): Poll[] {
    return getDb()
      .prepare('SELECT * FROM polls WHERE visibility = ? ORDER BY createdAt DESC')
      .all(visibility) as Poll[];
  }

  save(poll: Poll): Poll {
    getDb()
      .prepare(`
        INSERT INTO polls (id, title, description, endDate, visibility, authorId, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          title       = excluded.title,
          description = excluded.description,
          endDate     = excluded.endDate,
          visibility  = excluded.visibility,
          authorId    = excluded.authorId
      `)
      .run(
        poll.id, poll.title, poll.description,
        poll.endDate, poll.visibility, poll.authorId, poll.createdAt
      );
    return poll;
  }

  delete(id: string): boolean {
    const result = getDb()
      .prepare('DELETE FROM polls WHERE id = ?')
      .run(id);
    return result.changes > 0;
  }
}

export const pollRepository = new PollRepository();
