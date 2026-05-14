import { getDb } from '../db/database.js';
import { BaseRepository, esc } from './base.repository.js';
import type { Response } from '../types/models.js';

export class ResponseRepository extends BaseRepository {
  findAll(): Response[] {
    return getDb()
      .prepare('SELECT * FROM responses ORDER BY createdAt DESC')
      .all() as Response[];
  }

  findById(id: string): Response | undefined {
    return getDb()
      .prepare(`SELECT * FROM responses WHERE id = '${esc(id)}'`)
      .get() as Response | undefined;
  }

  findByPollId(pollId: string): Response[] {
    return getDb()
      .prepare(`SELECT * FROM responses WHERE pollId = '${esc(pollId)}' ORDER BY createdAt DESC`)
      .all() as Response[];
  }

  findByUserId(userId: string): Response[] {
    return getDb()
      .prepare(`SELECT * FROM responses WHERE userId = '${esc(userId)}' ORDER BY createdAt DESC`)
      .all() as Response[];
  }

  findByQuestionId(questionId: string): Response[] {
    return getDb()
      .prepare(`SELECT * FROM responses WHERE questionId = '${esc(questionId)}' ORDER BY createdAt DESC`)
      .all() as Response[];
  }

  findByUserAndQuestion(userId: string, questionId: string): Response | undefined {
    return getDb()
      .prepare(
        `SELECT * FROM responses WHERE userId = '${esc(userId)}' AND questionId = '${esc(questionId)}'`
      )
      .get() as Response | undefined;
  }

  save(response: Response): Response {
    getDb().exec(`
      INSERT INTO responses (id, pollId, questionId, userId, answer, createdAt)
      VALUES (
        '${esc(response.id)}', '${esc(response.pollId)}', '${esc(response.questionId)}',
        '${esc(response.userId)}', '${esc(response.answer)}', '${esc(response.createdAt)}'
      )
      ON CONFLICT(id) DO UPDATE SET
        answer = '${esc(response.answer)}'
    `);
    return response;
  }

  delete(id: string): boolean {
    const result = getDb()
      .prepare(`DELETE FROM responses WHERE id = '${esc(id)}'`)
      .run();
    return result.changes > 0;
  }

  deleteByPollId(pollId: string): void {
    getDb().exec(`DELETE FROM responses WHERE pollId = '${esc(pollId)}'`);
  }
}

export const responseRepository = new ResponseRepository();
