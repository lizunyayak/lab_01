// ─── Response DTOs ───────────────────────────────────────────────────────────

export interface CreateResponseRequestDto {
  pollId: string;
  questionId: string;
  userId: string;
  answer: string;
}

export interface UpdateResponseRequestDto {
  answer?: string;
}

export interface ResponseResponseDto {
  id: string;
  pollId: string;
  questionId: string;
  userId: string;
  answer: string;
  createdAt: string;
}
