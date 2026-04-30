import { BaseRepository } from './base.repository.js';
import type { User } from '../types/models.js';

export class UserRepository extends BaseRepository<User> {
  findByEmail(email: string): User | undefined {
    return this.findAll().find(u => u.email === email);
  }
}

export const userRepository = new UserRepository();
