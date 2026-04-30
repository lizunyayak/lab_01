import { pollRepository } from '../repositories/poll.repository.js';
import { questionRepository } from '../repositories/question.repository.js';
import { responseRepository } from '../repositories/response.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import type { CreatePollRequestDto, UpdatePollRequestDto, PollResponseDto } from '../dtos/poll.dto.js';
import type { PaginatedResult, PaginationOptions } from '../repositories/base.repository.js';
import type { Poll, Visibility } from '../types/models.js';
import { notFound, validationError } from '../types/api.js';

const VISIBILITIES: Visibility[] = ['public', 'private', 'restricted'];
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function toDto(poll: Poll): PollResponseDto {
  return {
    id: poll.id,
    title: poll.title,
    description: poll.description,
    endDate: poll.endDate,
    visibility: poll.visibility,
    authorId: poll.authorId,
    createdAt: poll.createdAt
  };
}

function validateCreate(dto: CreatePollRequestDto): string[] {
  const errs: string[] = [];
  if (!dto.title || dto.title.trim().length < 3)
    errs.push('title: мінімум 3 символи');
  if (!dto.endDate || !ISO_DATE_RE.test(dto.endDate))
    errs.push('endDate: формат YYYY-MM-DD');
  else if (dto.endDate < new Date().toISOString().split('T')[0])
    errs.push('endDate: дата не може бути в минулому');
  if (!dto.visibility || !VISIBILITIES.includes(dto.visibility))
    errs.push(`visibility: одне з ${VISIBILITIES.join(', ')}`);
  if (!dto.authorId)
    errs.push('authorId: обов\'язкове поле');
  return errs;
}

export class PollService {
  list(
    opts: PaginationOptions,
    filters: { visibility?: Visibility; authorId?: string },
    sortBy: keyof Poll = 'createdAt',
    sortDir: 'asc' | 'desc' = 'desc'
  ): PaginatedResult<PollResponseDto> {
    let items = pollRepository.findAll();

    if (filters.visibility) items = items.filter(p => p.visibility === filters.visibility);
    if (filters.authorId) items = items.filter(p => p.authorId === filters.authorId);

    items.sort((a, b) => {
      const cmp = String(a[sortBy] ?? '').localeCompare(String(b[sortBy] ?? ''));
      return sortDir === 'asc' ? cmp : -cmp;
    });

    const page = pollRepository.paginate(items, opts);
    return { ...page, items: page.items.map(toDto) };
  }

  getById(id: string): PollResponseDto {
    const poll = pollRepository.findById(id);
    if (!poll) throw notFound('Poll', id);
    return toDto(poll);
  }

  create(dto: CreatePollRequestDto): PollResponseDto {
    const errs = validateCreate(dto);
    if (errs.length) throw validationError(errs);

    if (!userRepository.findById(dto.authorId))
      throw validationError([`authorId: user "${dto.authorId}" не знайдено`]);

    const poll = pollRepository.save({
      id: pollRepository.generateId(),
      title: dto.title.trim(),
      description: dto.description?.trim() ?? '',
      endDate: dto.endDate,
      visibility: dto.visibility,
      authorId: dto.authorId,
      createdAt: pollRepository.now()
    });
    return toDto(poll);
  }

  replace(id: string, dto: CreatePollRequestDto): PollResponseDto {
    const poll = pollRepository.findById(id);
    if (!poll) throw notFound('Poll', id);
    const errs = validateCreate(dto);
    if (errs.length) throw validationError(errs);
    return toDto(pollRepository.save({
      ...poll,
      title: dto.title.trim(),
      description: dto.description?.trim() ?? '',
      endDate: dto.endDate,
      visibility: dto.visibility
    }));
  }

  update(id: string, dto: UpdatePollRequestDto): PollResponseDto {
    const poll = pollRepository.findById(id);
    if (!poll) throw notFound('Poll', id);

    const errs: string[] = [];
    if (dto.title !== undefined && dto.title.trim().length < 3)
      errs.push('title: мінімум 3 символи');
    if (dto.endDate !== undefined) {
      if (!ISO_DATE_RE.test(dto.endDate)) errs.push('endDate: формат YYYY-MM-DD');
      else if (dto.endDate < new Date().toISOString().split('T')[0])
        errs.push('endDate: дата не може бути в минулому');
    }
    if (dto.visibility !== undefined && !VISIBILITIES.includes(dto.visibility))
      errs.push(`visibility: одне з ${VISIBILITIES.join(', ')}`);
    if (errs.length) throw validationError(errs);

    const updated = pollRepository.save({ ...poll, ...dto });
    return toDto(updated);
  }

  delete(id: string): void {
    if (!pollRepository.findById(id)) throw notFound('Poll', id);
    // cascade delete questions and responses
    questionRepository.deleteByPollId(id);
    responseRepository.deleteByPollId(id);
    pollRepository.delete(id);
  }
}

export const pollService = new PollService();
