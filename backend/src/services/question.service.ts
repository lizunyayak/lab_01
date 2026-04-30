import { questionRepository } from '../repositories/question.repository.js';
import { pollRepository } from '../repositories/poll.repository.js';
import type { CreateQuestionRequestDto, UpdateQuestionRequestDto, QuestionResponseDto } from '../dtos/question.dto.js';
import type { PaginatedResult, PaginationOptions } from '../repositories/base.repository.js';
import type { Question } from '../types/models.js';
import { notFound, validationError } from '../types/api.js';

function toDto(q: Question): QuestionResponseDto {
  return { id: q.id, pollId: q.pollId, text: q.text, order: q.order, createdAt: q.createdAt };
}

export class QuestionService {
  list(
    opts: PaginationOptions,
    filters: { pollId?: string },
    sortDir: 'asc' | 'desc' = 'asc'
  ): PaginatedResult<QuestionResponseDto> {
    let items = filters.pollId
      ? questionRepository.findByPollId(filters.pollId)
      : questionRepository.findAll();

    items = [...items].sort((a, b) => {
      const cmp = a.order - b.order;
      return sortDir === 'asc' ? cmp : -cmp;
    });

    const page = questionRepository.paginate(items, opts);
    return { ...page, items: page.items.map(toDto) };
  }

  getById(id: string): QuestionResponseDto {
    const q = questionRepository.findById(id);
    if (!q) throw notFound('Question', id);
    return toDto(q);
  }

  create(dto: CreateQuestionRequestDto): QuestionResponseDto {
    const errs: string[] = [];
    if (!dto.pollId) errs.push('pollId: обов\'язкове поле');
    if (!dto.text || dto.text.trim().length < 3) errs.push('text: мінімум 3 символи');
    if (errs.length) throw validationError(errs);

    if (!pollRepository.findById(dto.pollId))
      throw validationError([`pollId: poll "${dto.pollId}" не знайдено`]);

    const order = dto.order ?? questionRepository.maxOrderForPoll(dto.pollId) + 1;

    const q = questionRepository.save({
      id: questionRepository.generateId(),
      pollId: dto.pollId,
      text: dto.text.trim(),
      order,
      createdAt: questionRepository.now()
    });
    return toDto(q);
  }

  update(id: string, dto: UpdateQuestionRequestDto): QuestionResponseDto {
    const q = questionRepository.findById(id);
    if (!q) throw notFound('Question', id);

    const errs: string[] = [];
    if (dto.text !== undefined && dto.text.trim().length < 3)
      errs.push('text: мінімум 3 символи');
    if (dto.order !== undefined && (!Number.isInteger(dto.order) || dto.order < 1))
      errs.push('order: ціле число >= 1');
    if (errs.length) throw validationError(errs);

    return toDto(questionRepository.save({ ...q, ...dto }));
  }

  delete(id: string): void {
    if (!questionRepository.findById(id)) throw notFound('Question', id);
    questionRepository.delete(id);
  }
}

export const questionService = new QuestionService();
