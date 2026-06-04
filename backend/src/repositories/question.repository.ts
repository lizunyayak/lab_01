import { getDb } from '../db/database.js';
import { BaseRepository } from './base.repository.js';
import type { Question } from '../types/models.js';

export class QuestionRepository extends BaseRepository {
  findAll(): Question[] {
    return getDb()
      .prepare('SELECT * FROM questions ORDER BY pollId, "order" ASC')
      .all() as Question[];
  }

  findById(id: string): Question | undefined {
    return getDb()
      .prepare('SELECT * FROM questions WHERE id = ?')
      .get(id) as Question | undefined;
  }

  findByPollId(pollId: string): Question[] {
    return getDb()
      .prepare('SELECT * FROM questions WHERE pollId = ? ORDER BY "order" ASC')
      .all(pollId) as Question[];
  }

  maxOrderForPoll(pollId: string): number {
    const row = getDb()
      .prepare('SELECT MAX("order") as maxOrder FROM questions WHERE pollId = ?')
      .get(pollId) as { maxOrder: number | null };
    return row.maxOrder ?? 0;
  }

  save(question: Question): Question {
    getDb()
      .prepare(`
        INSERT INTO questions (id, pollId, text, "order", createdAt)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          text    = excluded.text,
          "order" = excluded."order"
      `)
      .run(question.id, question.pollId, question.text, question.order, question.createdAt);
    return question;
  }

  delete(id: string): boolean {
    const result = getDb()
      .prepare('DELETE FROM questions WHERE id = ?')
      .run(id);
    return result.changes > 0;
  }

  deleteByPollId(pollId: string): void {
    getDb()
      .prepare('DELETE FROM questions WHERE pollId = ?')
      .run(pollId);
  }
}

export const questionRepository = new QuestionRepository();
