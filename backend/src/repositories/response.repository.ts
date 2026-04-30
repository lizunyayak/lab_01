import { BaseRepository } from './base.repository.js';
import type { Response } from '../types/models.js';

export class ResponseRepository extends BaseRepository<Response> {
  findByPollId(pollId: string): Response[] {
    return this.findAll().filter(r => r.pollId === pollId);
  }

  findByUserId(userId: string): Response[] {
    return this.findAll().filter(r => r.userId === userId);
  }

  findByQuestionId(questionId: string): Response[] {
    return this.findAll().filter(r => r.questionId === questionId);
  }

  findByUserAndQuestion(userId: string, questionId: string): Response | undefined {
    return this.findAll().find(
      r => r.userId === userId && r.questionId === questionId
    );
  }

  deleteByPollId(pollId: string): void {
    this.findByPollId(pollId).forEach(r => this.delete(r.id));
  }
}

export const responseRepository = new ResponseRepository();
