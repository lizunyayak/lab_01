import { userRepository } from '../repositories/user.repository.js';
import type { CreateUserRequestDto, UpdateUserRequestDto, UserResponseDto } from '../dtos/user.dto.js';
import type { PaginatedResult, PaginationOptions } from '../repositories/base.repository.js';
import { notFound, validationError, conflictError } from '../types/api.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toDto(user: import('../types/models.js').User): UserResponseDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt
  };
}

function validateCreate(dto: CreateUserRequestDto): string[] {
  const errs: string[] = [];
  if (!dto.name || dto.name.trim().length < 2)
    errs.push('name: мінімум 2 символи');
  if (!dto.email || !EMAIL_RE.test(dto.email))
    errs.push('email: невалідна адреса');
  return errs;
}

export class UserService {
  list(
    opts: PaginationOptions,
    sortBy: keyof import('../types/models.js').User = 'createdAt',
    sortDir: 'asc' | 'desc' = 'desc'
  ): PaginatedResult<UserResponseDto> {
    const items = userRepository.findAll();
    items.sort((a, b) => {
      const av = a[sortBy] ?? '';
      const bv = b[sortBy] ?? '';
      const cmp = String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    const page = userRepository.paginate(items, opts);
    return { ...page, items: page.items.map(toDto) };
  }

  getById(id: string): UserResponseDto {
    const user = userRepository.findById(id);
    if (!user) throw notFound('User', id);
    return toDto(user);
  }

  create(dto: CreateUserRequestDto): UserResponseDto {
    const errs = validateCreate(dto);
    if (errs.length) throw validationError(errs);

    const existing = userRepository.findByEmail(dto.email);
    if (existing) throw conflictError(`User with email "${dto.email}" already exists`);

    const user = userRepository.save({
      id: userRepository.generateId(),
      name: dto.name.trim(),
      email: dto.email.trim().toLowerCase(),
      createdAt: userRepository.now()
    });
    return toDto(user);
  }

  replace(id: string, dto: CreateUserRequestDto): UserResponseDto {
    const user = userRepository.findById(id);
    if (!user) throw notFound('User', id);
    const errs = validateCreate(dto);
    if (errs.length) throw validationError(errs);
    if (dto.email) {
      const conflict = userRepository.findByEmail(dto.email);
      if (conflict && conflict.id !== id)
        throw conflictError(`User with email "${dto.email}" already exists`);
    }
    return toDto(userRepository.save({
      ...user,
      name: dto.name.trim(),
      email: dto.email.trim().toLowerCase()
    }));
  }

  update(id: string, dto: UpdateUserRequestDto): UserResponseDto {
    const user = userRepository.findById(id);
    if (!user) throw notFound('User', id);

    const errs: string[] = [];
    if (dto.name !== undefined && dto.name.trim().length < 2)
      errs.push('name: мінімум 2 символи');
    if (dto.email !== undefined && !EMAIL_RE.test(dto.email))
      errs.push('email: невалідна адреса');
    if (errs.length) throw validationError(errs);

    if (dto.email) {
      const conflict = userRepository.findByEmail(dto.email);
      if (conflict && conflict.id !== id)
        throw conflictError(`User with email "${dto.email}" already exists`);
    }

    const updated = userRepository.save({
      ...user,
      name: dto.name !== undefined ? dto.name.trim() : user.name,
      email: dto.email !== undefined ? dto.email.trim().toLowerCase() : user.email
    });
    return toDto(updated);
  }

  delete(id: string): void {
    if (!userRepository.findById(id)) throw notFound('User', id);
    userRepository.delete(id);
  }
}

export const userService = new UserService();
