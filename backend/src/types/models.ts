// ─── Domain Models (internal representation) ───────────────────────────────

export type Visibility = 'public' | 'private' | 'restricted';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Poll {
  id: string;
  title: string;
  description: string;
  endDate: string;        // ISO date string YYYY-MM-DD
  visibility: Visibility;
  authorId: string;
  createdAt: string;
}

export interface Question {
  id: string;
  pollId: string;
  text: string;
  order: number;
  createdAt: string;
}

export interface Response {
  id: string;
  pollId: string;
  questionId: string;
  userId: string;
  answer: string;
  createdAt: string;
}

// ─── Query param shapes ─────────────────────────────────────────────────────

export interface ListQuery {
  page?: string;
  pageSize?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface PollListQuery extends ListQuery {
  visibility?: Visibility;
  authorId?: string;
}

export interface QuestionListQuery extends ListQuery {
  pollId?: string;
}

export interface ResponseListQuery extends ListQuery {
  pollId?: string;
  userId?: string;
  questionId?: string;
}
