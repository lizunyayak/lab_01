// ─── Question DTOs ───────────────────────────────────────────────────────────

export interface CreateQuestionRequestDto {
  pollId: string;
  text: string;
  order?: number;
}

export interface UpdateQuestionRequestDto {
  text?: string;
  order?: number;
}

export interface QuestionResponseDto {
  id: string;
  pollId: string;
  text: string;
  order: number;
  createdAt: string;
}
