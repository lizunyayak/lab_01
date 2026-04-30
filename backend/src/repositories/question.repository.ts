import { BaseRepository } from './base.repository.js';
import type { Question } from '../types/models.js';

export class QuestionRepository extends BaseRepository<Question> {
  findByPollId(pollId: string): Question[] {
    return this.findAll()
      .filter(q => q.pollId === pollId)
      .sort((a, b) => a.order - b.order);
  }

  deleteByPollId(pollId: string): void {
    this.findByPollId(pollId).forEach(q => this.delete(q.id));
  }

  maxOrderForPoll(pollId: string): number {
    const questions = this.findByPollId(pollId);
    if (questions.length === 0) return 0;
    return Math.max(...questions.map(q => q.order));
  }
}

export const questionRepository = new QuestionRepository();
