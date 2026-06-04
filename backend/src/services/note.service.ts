/**
 * PersonalNote service — demonstrates IDOR vulnerability and its fix (Lab 05).
 *
 * The `getByIdUnsafe` method returns any note by id WITHOUT checking ownership.
 * The `getById` method adds the ownership check: WHERE id = ? AND ownerUserId = ?
 */
import { noteRepository } from '../repositories/note.repository.js';
import type { CreateNoteRequestDto, NoteResponseDto } from '../dtos/note.dto.js';
import type { PersonalNote } from '../types/models.js';
import { notFound, validationError } from '../types/api.js';

function toDto(note: PersonalNote): NoteResponseDto {
  return {
    id:          note.id,
    ownerUserId: note.ownerUserId,
    title:       note.title,
    content:     note.content,
    createdAt:   note.createdAt
  };
}

export class NoteService {
  // List notes belonging to the current user
  list(ownerUserId: string): NoteResponseDto[] {
    return noteRepository.findByOwner(ownerUserId).map(toDto);
  }

  // ✅ Safe get: checks ownership — returns 404 if note belongs to another user
  getById(id: string, ownerUserId: string): NoteResponseDto {
    const note = noteRepository.findByIdAndOwner(id, ownerUserId);
    if (!note) throw notFound('PersonalNote', id);
    return toDto(note);
  }

  // ⚠ IDOR-vulnerable get: returns note by id WITHOUT ownership check.
  // Any authenticated user can read any note by guessing (or iterating) its id.
  getByIdUnsafe(id: string): NoteResponseDto {
    const note = noteRepository.findByIdUnsafe(id);
    if (!note) throw notFound('PersonalNote', id);
    return toDto(note);
  }

  create(dto: CreateNoteRequestDto, ownerUserId: string): NoteResponseDto {
    const errs: string[] = [];
    if (!dto.title || dto.title.trim().length < 1)
      errs.push('title: обов\'язкове поле');
    if (errs.length) throw validationError(errs);

    const note = noteRepository.save({
      id:          noteRepository.generateId(),
      ownerUserId,
      title:       dto.title.trim(),
      content:     dto.content?.trim() ?? '',
      createdAt:   noteRepository.now()
    });
    return toDto(note);
  }

  delete(id: string, ownerUserId: string): void {
    const deleted = noteRepository.delete(id, ownerUserId);
    if (!deleted) throw notFound('PersonalNote', id);
  }
}

export const noteService = new NoteService();
