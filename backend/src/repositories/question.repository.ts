import { getDb } from '../db/database.js';
import { BaseRepository, esc } from './base.repository.js';
import type { Question } from '../types/models.js';

export class QuestionRepository extends BaseRepository {
  findAll(): Question[] {
    return getDb()
      .prepare('SELECT * FROM questions ORDER BY pollId, "order" ASC')
      .all() as Question[];
  }

  findById(id: string): Question | undefined {
    return getDb()
      .prepare(`SELECT * FROM questions WHERE id = '${esc(id)}'`)
      .get() as Question | undefined;
  }

  findByPollId(pollId: string): Question[] {
    return getDb()
      .prepare(`SELECT * FROM questions WHERE pollId = '${esc(pollId)}' ORDER BY "order" ASC`)
      .all() as Question[];
  }

  maxOrderForPoll(pollId: string): number {
    const row = getDb()
      .prepare(`SELECT MAX("order") as maxOrder FROM questions WHERE pollId = '${esc(pollId)}'`)
      .get() as { maxOrder: number | null };
    return row.maxOrder ?? 0;
  }

  save(question: Question): Question {
    getDb().exec(`
      INSERT INTO questions (id, pollId, text, "order", createdAt)
      VALUES (
        '${esc(question.id)}', '${esc(question.pollId)}',
        '${esc(question.text)}', ${question.order}, '${esc(question.createdAt)}'
      )
      ON CONFLICT(id) DO UPDATE SET
        text    = '${esc(question.text)}',
        "order" = ${question.order}
    `);
    return question;
  }

  delete(id: string): boolean {
    const result = getDb()
      .prepare(`DELETE FROM questions WHERE id = '${esc(id)}'`)
      .run();
    return result.changes > 0;
  }

  deleteByPollId(pollId: string): void {
    getDb().exec(`DELETE FROM questions WHERE pollId = '${esc(pollId)}'`);
  }
}

export const questionRepository = new QuestionRepository();
