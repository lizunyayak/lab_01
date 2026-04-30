import { responseRepository } from '../repositories/response.repository.js';
import { pollRepository } from '../repositories/poll.repository.js';
import { questionRepository } from '../repositories/question.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import type { CreateResponseRequestDto, UpdateResponseRequestDto, ResponseResponseDto } from '../dtos/response.dto.js';
import type { PaginatedResult, PaginationOptions } from '../repositories/base.repository.js';
import type { Response } from '../types/models.js';
import { notFound, validationError, conflictError } from '../types/api.js';

function toDto(r: Response): ResponseResponseDto {
  return {
    id: r.id,
    pollId: r.pollId,
    questionId: r.questionId,
    userId: r.userId,
    answer: r.answer,
    createdAt: r.createdAt
  };
}

export class ResponseService {
  list(
    opts: PaginationOptions,
    filters: { pollId?: string; userId?: string; questionId?: string },
    sortDir: 'asc' | 'desc' = 'desc'
  ): PaginatedResult<ResponseResponseDto> {
    let items = responseRepository.findAll();
    if (filters.pollId) items = items.filter(r => r.pollId === filters.pollId);
    if (filters.userId) items = items.filter(r => r.userId === filters.userId);
    if (filters.questionId) items = items.filter(r => r.questionId === filters.questionId);

    items = [...items].sort((a, b) => {
      const cmp = a.createdAt.localeCompare(b.createdAt);
      return sortDir === 'asc' ? cmp : -cmp;
    });

    const page = responseRepository.paginate(items, opts);
    return { ...page, items: page.items.map(toDto) };
  }

  getById(id: string): ResponseResponseDto {
    const r = responseRepository.findById(id);
    if (!r) throw notFound('Response', id);
    return toDto(r);
  }

  create(dto: CreateResponseRequestDto): ResponseResponseDto {
    const errs: string[] = [];
    if (!dto.pollId) errs.push('pollId: обов\'язкове поле');
    if (!dto.questionId) errs.push('questionId: обов\'язкове поле');
    if (!dto.userId) errs.push('userId: обов\'язкове поле');
    if (!dto.answer || dto.answer.trim().length === 0) errs.push('answer: обов\'язкове поле');
    if (errs.length) throw validationError(errs);

    if (!pollRepository.findById(dto.pollId))
      throw validationError([`pollId: poll "${dto.pollId}" не знайдено`]);
    if (!questionRepository.findById(dto.questionId))
      throw validationError([`questionId: question "${dto.questionId}" не знайдено`]);
    if (!userRepository.findById(dto.userId))
      throw validationError([`userId: user "${dto.userId}" не знайдено`]);

    const existing = responseRepository.findByUserAndQuestion(dto.userId, dto.questionId);
    if (existing)
      throw conflictError(`User "${dto.userId}" вже відповів на питання "${dto.questionId}"`);

    const r = responseRepository.save({
      id: responseRepository.generateId(),
      pollId: dto.pollId,
      questionId: dto.questionId,
      userId: dto.userId,
      answer: dto.answer.trim(),
      createdAt: responseRepository.now()
    });
    return toDto(r);
  }

  update(id: string, dto: UpdateResponseRequestDto): ResponseResponseDto {
    const r = responseRepository.findById(id);
    if (!r) throw notFound('Response', id);

    if (dto.answer !== undefined && dto.answer.trim().length === 0)
      throw validationError(['answer: не може бути порожнім']);

    return toDto(responseRepository.save({
      ...r,
      answer: dto.answer !== undefined ? dto.answer.trim() : r.answer
    }));
  }

  delete(id: string): void {
    if (!responseRepository.findById(id)) throw notFound('Response', id);
    responseRepository.delete(id);
  }
}

export const responseService = new ResponseService();
