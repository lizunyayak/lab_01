import { getDb } from '../db/database.js';
import { BaseRepository } from './base.repository.js';
import type { PersonalNote } from '../types/models.js';

export class NoteRepository extends BaseRepository {
  findById(id: string): PersonalNote | undefined {
    return getDb()
      .prepare('SELECT * FROM personal_notes WHERE id = ?')
      .get(id) as PersonalNote | undefined;
  }

  // Returns ALL notes regardless of owner — used for IDOR demo (before fix)
  findAll(): PersonalNote[] {
    return getDb()
      .prepare('SELECT * FROM personal_notes ORDER BY createdAt DESC')
      .all() as PersonalNote[];
  }

  // Returns only notes owned by the given user — used after IDOR fix
  findByOwner(ownerUserId: string): PersonalNote[] {
    return getDb()
      .prepare('SELECT * FROM personal_notes WHERE ownerUserId = ? ORDER BY createdAt DESC')
      .all(ownerUserId) as PersonalNote[];
  }

  // ⚠ IDOR-vulnerable: fetches note by id WITHOUT checking ownership
  findByIdUnsafe(id: string): PersonalNote | undefined {
    return getDb()
      .prepare('SELECT * FROM personal_notes WHERE id = ?')
      .get(id) as PersonalNote | undefined;
  }

  // ✅ IDOR-safe: fetches note by id AND owner
  findByIdAndOwner(id: string, ownerUserId: string): PersonalNote | undefined {
    return getDb()
      .prepare('SELECT * FROM personal_notes WHERE id = ? AND ownerUserId = ?')
      .get(id, ownerUserId) as PersonalNote | undefined;
  }

  save(note: PersonalNote): PersonalNote {
    getDb()
      .prepare(`
        INSERT INTO personal_notes (id, ownerUserId, title, content, createdAt)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          title   = excluded.title,
          content = excluded.content
      `)
      .run(note.id, note.ownerUserId, note.title, note.content, note.createdAt);
    return note;
  }

  delete(id: string, ownerUserId: string): boolean {
    const result = getDb()
      .prepare('DELETE FROM personal_notes WHERE id = ? AND ownerUserId = ?')
      .run(id, ownerUserId);
    return result.changes > 0;
  }
}

export const noteRepository = new NoteRepository();
