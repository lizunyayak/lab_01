export interface CreateNoteRequestDto {
  title: string;
  content?: string;
}

export interface NoteResponseDto {
  id: string;
  ownerUserId: string;
  title: string;
  content: string;
  createdAt: string;
}
