import { BaseRepository } from './base.repository.js';
import type { Poll, Visibility } from '../types/models.js';

export class PollRepository extends BaseRepository<Poll> {
  findByAuthorId(authorId: string): Poll[] {
    return this.findAll().filter(p => p.authorId === authorId);
  }

  findByVisibility(visibility: Visibility): Poll[] {
    return this.findAll().filter(p => p.visibility === visibility);
  }
}

export const pollRepository = new PollRepository();
