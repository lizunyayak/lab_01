import { getDb } from '../db/database.js';
import { BaseRepository } from './base.repository.js';
import type { Response } from '../types/models.js';

export class ResponseRepository extends BaseRepository {
  findAll(): Response[] {
    return getDb()
      .prepare('SELECT * FROM responses ORDER BY createdAt DESC')
      .all() as Response[];
  }

  findById(id: string): Response | undefined {
    return getDb()
      .prepare('SELECT * FROM responses WHERE id = ?')
      .get(id) as Response | undefined;
  }

  findByPollId(pollId: string): Response[] {
    return getDb()
      .prepare('SELECT * FROM responses WHERE pollId = ? ORDER BY createdAt DESC')
      .all(pollId) as Response[];
  }

  findByUserId(userId: string): Response[] {
    return getDb()
      .prepare('SELECT * FROM responses WHERE userId = ? ORDER BY createdAt DESC')
      .all(userId) as Response[];
  }

  findByQuestionId(questionId: string): Response[] {
    return getDb()
      .prepare('SELECT * FROM responses WHERE questionId = ? ORDER BY createdAt DESC')
      .all(questionId) as Response[];
  }

  findByUserAndQuestion(userId: string, questionId: string): Response | undefined {
    return getDb()
      .prepare('SELECT * FROM responses WHERE userId = ? AND questionId = ?')
      .get(userId, questionId) as Response | undefined;
  }

  save(response: Response): Response {
    getDb()
      .prepare(`
        INSERT INTO responses (id, pollId, questionId, userId, answer, createdAt)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          answer = excluded.answer
      `)
      .run(
        response.id, response.pollId, response.questionId,
        response.userId, response.answer, response.createdAt
      );
    return response;
  }

  delete(id: string): boolean {
    const result = getDb()
      .prepare('DELETE FROM responses WHERE id = ?')
      .run(id);
    return result.changes > 0;
  }

  deleteByPollId(pollId: string): void {
    getDb()
      .prepare('DELETE FROM responses WHERE pollId = ?')
      .run(pollId);
  }
}

export const responseRepository = new ResponseRepository();
