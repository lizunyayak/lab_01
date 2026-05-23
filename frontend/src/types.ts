// ── DTO types — must match backend contracts exactly ─────────────────────────

export type Visibility = 'public' | 'private' | 'restricted';

export interface UserDto {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface PollDto {
  id: string;
  title: string;
  description: string;
  endDate: string;
  visibility: Visibility;
  authorId: string;
  createdAt: string;
}

export interface ListResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreatePollDto {
  title: string;
  description?: string;
  endDate: string;
  visibility: Visibility;
  authorId: string;
}
