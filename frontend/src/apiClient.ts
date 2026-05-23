import type { PollDto, UserDto, CreatePollDto, ListResponse } from './types.js';

// ── Config ────────────────────────────────────────────────────────────────────
const BASE_URL = 'http://localhost:3000/api/v1';
const TIMEOUT_MS = 10_000;

// ── Error class ───────────────────────────────────────────────────────────────
export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: string[]
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...options.headers }
    });
    clearTimeout(timer);

    if (res.status === 204) return undefined as T;

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      const err = (body as { error?: { code?: string; message?: string; details?: string[] } }).error;
      throw new ApiClientError(
        res.status,
        err?.code ?? 'HTTP_ERROR',
        err?.message ?? `HTTP ${res.status}`,
        err?.details
      );
    }

    return body as T;
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof ApiClientError) throw err;
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiClientError(0, 'TIMEOUT',
        'Запит перевищив час очікування (10 с). Перевірте чи запущений бекенд.');
    }
    throw new ApiClientError(0, 'NETWORK_ERROR',
      'Мережева помилка. Переконайтесь, що бекенд запущений на порту 3000.');
  }
}

// ── API methods ───────────────────────────────────────────────────────────────
export const apiClient = {
  getPolls(): Promise<ListResponse<PollDto>> {
    return request('/polls?pageSize=100&sortDir=desc');
  },

  createPoll(data: CreatePollDto): Promise<PollDto> {
    return request('/polls', { method: 'POST', body: JSON.stringify(data) });
  },

  updatePoll(id: string, data: CreatePollDto): Promise<PollDto> {
    return request(`/polls/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  deletePoll(id: string): Promise<void> {
    return request(`/polls/${id}`, { method: 'DELETE' });
  },

  createUser(data: { name: string; email: string }): Promise<UserDto> {
    return request('/users', { method: 'POST', body: JSON.stringify(data) });
  },

  patchUser(id: string, data: { name?: string; email?: string }): Promise<UserDto> {
    return request(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  },

  getUsers(): Promise<ListResponse<UserDto>> {
    return request('/users?pageSize=100');
  }
};
