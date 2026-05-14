import { getDb } from '../db/database.js';
import { BaseRepository, esc } from './base.repository.js';
import type { Poll, Visibility } from '../types/models.js';

export class PollRepository extends BaseRepository {
  findAll(): Poll[] {
    return getDb().prepare('SELECT * FROM polls ORDER BY createdAt DESC').all() as Poll[];
  }

  findById(id: string): Poll | undefined {
    return getDb()
      .prepare(`SELECT * FROM polls WHERE id = '${esc(id)}'`)
      .get() as Poll | undefined;
  }

  findByAuthorId(authorId: string): Poll[] {
    return getDb()
      .prepare(`SELECT * FROM polls WHERE authorId = '${esc(authorId)}' ORDER BY createdAt DESC`)
      .all() as Poll[];
  }

  findByVisibility(visibility: Visibility): Poll[] {
    return getDb()
      .prepare(`SELECT * FROM polls WHERE visibility = '${esc(visibility)}' ORDER BY createdAt DESC`)
      .all() as Poll[];
  }

  save(poll: Poll): Poll {
    getDb().exec(`
      INSERT INTO polls (id, title, description, endDate, visibility, authorId, createdAt)
      VALUES (
        '${esc(poll.id)}', '${esc(poll.title)}', '${esc(poll.description)}',
        '${esc(poll.endDate)}', '${esc(poll.visibility)}', '${esc(poll.authorId)}', '${esc(poll.createdAt)}'
      )
      ON CONFLICT(id) DO UPDATE SET
        title       = '${esc(poll.title)}',
        description = '${esc(poll.description)}',
        endDate     = '${esc(poll.endDate)}',
        visibility  = '${esc(poll.visibility)}'
    `);
    return poll;
  }

  delete(id: string): boolean {
    const result = getDb()
      .prepare(`DELETE FROM polls WHERE id = '${esc(id)}'`)
      .run();
    return result.changes > 0;
  }
}

export const pollRepository = new PollRepository();
