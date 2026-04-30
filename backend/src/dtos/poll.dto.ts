// ─── Poll DTOs ───────────────────────────────────────────────────────────────

import type { Visibility } from '../types/models.js';

export interface CreatePollRequestDto {
  title: string;
  description?: string;
  endDate: string;
  visibility: Visibility;
  authorId: string;
}

export interface UpdatePollRequestDto {
  title?: string;
  description?: string;
  endDate?: string;
  visibility?: Visibility;
}

export interface PollResponseDto {
  id: string;
  title: string;
  description: string;
  endDate: string;
  visibility: Visibility;
  authorId: string;
  createdAt: string;
}
