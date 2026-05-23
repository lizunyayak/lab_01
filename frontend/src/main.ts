import type { PollDto, UserDto, Visibility } from './types.js';
import { apiClient, ApiClientError } from './apiClient.js';

// ── DOM refs ──────────────────────────────────────────────────────────────────
const form          = document.getElementById('poll-form') as HTMLFormElement;
const titleInput    = document.getElementById('title') as HTMLInputElement;
const endDateInput  = document.getElementById('endDate') as HTMLInputElement;
const visSelect     = document.getElementById('visibility') as HTMLSelectElement;
const authorInput   = document.getElementById('author') as HTMLInputElement;
const emailInput    = document.getElementById('email') as HTMLInputElement;
const descTextarea  = document.getElementById('description') as HTMLTextAreaElement;
const submitBtn     = document.getElementById('submit-btn') as HTMLButtonElement;
const cancelBtn     = document.getElementById('cancel-btn') as HTMLButtonElement;
const formHeading   = document.getElementById('form-heading') as HTMLElement;
const successBanner = document.getElementById('success-banner') as HTMLElement;
const serverErrBox  = document.getElementById('server-error-box') as HTMLElement;
const container     = document.getElementById('polls-container') as HTMLElement;
const countBadge    = document.getElementById('count-badge') as HTMLElement;

// ── State ─────────────────────────────────────────────────────────────────────
let polls: PollDto[]       = [];
let users: UserDto[]       = [];
let editingPollId: string | null = null;

// ── Helpers ───────────────────────────────────────────────────────────────────
const today = (): string => new Date().toISOString().split('T')[0]!;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function esc(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fmtDate(d: string): string {
  const parts = d.split('-');
  return parts.length === 3 ? `${parts[2]}.${parts[1]}.${parts[0]}` : d;
}

const visLabel: Record<string, string> = {
  public: 'Публічне', private: 'Приватне', restricted: 'Обмежене'
};
const visBadge: Record<string, string> = {
  public: 'badge-public', private: 'badge-private', restricted: 'badge-restricted'
};

function userName(authorId: string): string {
  return users.find(u => u.id === authorId)?.name ?? authorId.slice(0, 8) + '…';
}

function userEmail(authorId: string): string {
  return users.find(u => u.id === authorId)?.email ?? '—';
}

// ── Render list ───────────────────────────────────────────────────────────────
function renderPolls(): void {
  countBadge.textContent = String(polls.length);

  if (polls.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="1.5"/>
          <path d="M8 12h8M8 8h5M8 16h3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        Поки що немає жодного опитування
      </div>`;
    return;
  }

  const rows = polls.map((p, i) => `
    <tr>
      <td class="cell-id" title="${esc(p.id)}">${String(i + 1).padStart(2, '0')}</td>
      <td class="cell-title">${esc(p.title)}</td>
      <td class="cell-date">${fmtDate(p.endDate)}</td>
      <td class="cell-date">${fmtDate(p.createdAt.slice(0, 10))}</td>
      <td><span class="badge ${esc(visBadge[p.visibility] ?? '')}">${esc(visLabel[p.visibility] ?? p.visibility)}</span></td>
      <td>${esc(userName(p.authorId))}</td>
      <td class="cell-email">${esc(userEmail(p.authorId))}</td>
      <td class="cell-desc">${esc(p.description) || '—'}</td>
      <td style="text-align:center; white-space:nowrap;">
        <button class="btn-edit" type="button"
          data-id="${esc(p.id)}"
          aria-label="Редагувати «${esc(p.title)}»">
          <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M8.5 1.5l2 2L3 11H1V9L8.5 1.5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
          </svg>
          Редагувати
        </button>
        <button class="btn-danger" type="button"
          data-id="${esc(p.id)}" data-title="${esc(p.title)}"
          aria-label="Видалити «${esc(p.title)}»">
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
          Видалити
        </button>
      </td>
    </tr>`).join('');

  container.innerHTML = `
    <div class="table-wrap">
      <table id="polls-table">
        <thead><tr>
          <th>ID</th>
          <th>Назва</th>
          <th>Дата завершення</th>
          <th>Створено</th>
          <th>Видимість</th>
          <th>Автор</th>
          <th>Email</th>
          <th>Опис</th>
          <th></th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;

  container.querySelectorAll<HTMLButtonElement>('.btn-edit[data-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const poll = polls.find(p => p.id === btn.dataset['id']);
      if (poll) enterEditMode(poll);
    });
  });

  container.querySelectorAll<HTMLButtonElement>('.btn-danger[data-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id    = btn.dataset['id']!;
      const title = btn.dataset['title']!;
      if (confirm(`Видалити опитування «${title}»?`)) void handleDelete(id);
    });
  });

  const table = container.querySelector<HTMLTableElement>('#polls-table');
  if (table) makeColumnsResizable(table);
}

function setLoading(): void {
  countBadge.textContent = '…';
  container.innerHTML = `<div class="status-state"><div class="spinner"></div>Завантаження…</div>`;
}

function setError(msg: string): void {
  countBadge.textContent = '!';
  container.innerHTML = `
    <div class="status-state error-state">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
        <path d="M12 7v6M12 16h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
      <span>${esc(msg)}</span>
      <button class="btn-retry" id="retry-btn">Спробувати знову</button>
    </div>`;
  document.getElementById('retry-btn')?.addEventListener('click', () => void loadAll());
}

// ── Edit mode ─────────────────────────────────────────────────────────────────
function enterEditMode(poll: PollDto): void {
  editingPollId = poll.id;
  formHeading.textContent = 'Редагування опитування';
  submitBtn.textContent   = 'Зберегти зміни';
  cancelBtn.style.display = 'block';

  titleInput.value      = poll.title;
  endDateInput.value    = poll.endDate;
  visSelect.value       = poll.visibility;
  descTextarea.value    = poll.description;

  const author = users.find(u => u.id === poll.authorId);
  authorInput.value = author?.name  ?? '';
  emailInput.value  = author?.email ?? '';

  clearFieldErrors();
  hideServerError();
  formHeading.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function exitEditMode(): void {
  editingPollId           = null;
  formHeading.textContent = 'Нове опитування';
  submitBtn.textContent   = 'Додати опитування';
  cancelBtn.style.display = 'none';
  form.reset();
  clearFieldErrors();
  hideServerError();
}

// ── Load data ─────────────────────────────────────────────────────────────────
async function loadAll(): Promise<void> {
  setLoading();
  try {
    const [pollsRes, usersRes] = await Promise.all([
      apiClient.getPolls(),
      apiClient.getUsers()
    ]);
    users = usersRes.items;
    polls = pollsRes.items;
    renderPolls();
  } catch (err) {
    const msg = err instanceof ApiClientError ? err.message : 'Невідома помилка';
    setError(msg);
  }
}

// ── Delete ────────────────────────────────────────────────────────────────────
async function handleDelete(id: string): Promise<void> {
  try {
    await apiClient.deletePoll(id);
    polls = polls.filter(p => p.id !== id);
    renderPolls();
  } catch (err) {
    const msg = err instanceof ApiClientError ? err.message : 'Помилка видалення';
    alert(msg);
  }
}

// ── Validation helpers ────────────────────────────────────────────────────────
const FIELDS = ['title', 'endDate', 'visibility', 'author', 'email'] as const;

function setFieldError(field: string, hasError: boolean): void {
  const el = document.getElementById(field);
  const er = document.getElementById(`err-${field}`);
  if (!el || !er) return;
  if (hasError) {
    el.classList.add('invalid');
    el.setAttribute('aria-invalid', 'true');
    er.classList.add('visible');
  } else {
    el.classList.remove('invalid');
    el.removeAttribute('aria-invalid');
    er.classList.remove('visible');
  }
}

function clearFieldErrors(): void {
  FIELDS.forEach(f => setFieldError(f, false));
}

function showServerError(msg: string, details?: string[]): void {
  serverErrBox.innerHTML =
    `<strong>Помилка сервера:</strong> ${esc(msg)}` +
    (details?.length
      ? `<ul>${details.map(d => `<li>${esc(d)}</li>`).join('')}</ul>`
      : '');
  serverErrBox.classList.add('visible');
}

function hideServerError(): void {
  serverErrBox.classList.remove('visible');
}

// ── Form submit ───────────────────────────────────────────────────────────────
form.addEventListener('submit', (e: Event) => {
  e.preventDefault();
  void handleSubmit();
});

async function handleSubmit(): Promise<void> {
  clearFieldErrors();
  hideServerError();

  const title       = titleInput.value.trim();
  const endDate     = endDateInput.value;
  const visibility  = visSelect.value as Visibility;
  const authorName  = authorInput.value.trim();
  const email       = emailInput.value.trim().toLowerCase();
  const description = descTextarea.value.trim();

  // ── Client-side validation ────────────────────────────────────────────────
  let hasErrors = false;
  if (!title || title.length < 3)      { setFieldError('title', true);      hasErrors = true; }
  if (!endDate || (!editingPollId && endDate < today())) { setFieldError('endDate', true); hasErrors = true; }
  if (!visibility)                     { setFieldError('visibility', true); hasErrors = true; }
  if (!authorName || authorName.length < 2) { setFieldError('author', true); hasErrors = true; }
  if (!email || !EMAIL_RE.test(email)) { setFieldError('email', true);      hasErrors = true; }
  if (hasErrors) {
    document.querySelector<HTMLElement>('.invalid')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Збереження…';

  const wasEditing = Boolean(editingPollId);

  try {
    // Крок 1: створити або знайти/оновити користувача
    let user = users.find(u => u.email === email);
    if (!user) {
      user = await apiClient.createUser({ name: authorName, email });
      users.push(user);
    } else if (user.name !== authorName) {
      // email збігається, але ПІБ змінився — оновлюємо ім'я
      user = await apiClient.patchUser(user.id, { name: authorName });
      users = users.map(u => u.id === user!.id ? user! : u);
    }

    if (editingPollId) {
      // ── Режим редагування: PUT ────────────────────────────────────────────
      const updated = await apiClient.updatePoll(editingPollId, {
        title, endDate, visibility,
        authorId: user.id,
        description
      });
      polls = polls.map(p => p.id === editingPollId ? updated : p);
      exitEditMode();
    } else {
      // ── Режим створення: POST ─────────────────────────────────────────────
      const created = await apiClient.createPoll({
        title, endDate, visibility,
        authorId: user.id,
        description
      });
      polls.unshift(created);
      form.reset();
      clearFieldErrors();
    }

    renderPolls();
    successBanner.textContent = wasEditing ? '✓ Зміни збережено!' : '✓ Опитування успішно додано!';
    successBanner.classList.add('visible');
    setTimeout(() => successBanner.classList.remove('visible'), 2500);

  } catch (err) {
    console.error('[handleSubmit] error:', err);
    const msg = err instanceof ApiClientError ? err.message : 'Невідома помилка';
    const details = err instanceof ApiClientError ? err.details : undefined;
    showServerError(msg, details);
    serverErrBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = editingPollId ? 'Зберегти зміни' : 'Додати опитування';
  }
}

// ── Cancel edit ───────────────────────────────────────────────────────────────
cancelBtn.addEventListener('click', exitEditMode);

// ── Clear field error on input ────────────────────────────────────────────────
FIELDS.forEach(f => {
  document.getElementById(f)?.addEventListener('input', () => setFieldError(f, false));
});

// ── Resizable columns ─────────────────────────────────────────────────────────
function makeColumnsResizable(table: HTMLTableElement): void {
  const headers = Array.from(table.querySelectorAll<HTMLTableCellElement>('thead th'));

  headers.forEach((th, i) => {
    if (i === headers.length - 1) return; // остання колонка — не ресайзиться

    const handle = document.createElement('div');
    handle.className = 'col-resizer';
    th.appendChild(handle);

    let startX = 0;
    let startW = 0;

    const onMove = (e: MouseEvent): void => {
      const newW = Math.max(50, startW + (e.clientX - startX));
      th.style.width    = `${newW}px`;
      th.style.minWidth = `${newW}px`;
    };

    const onUp = (): void => {
      handle.classList.remove('col-resizer--active');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    handle.addEventListener('mousedown', (e: MouseEvent) => {
      startX = e.clientX;
      startW = th.offsetWidth;
      handle.classList.add('col-resizer--active');
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      e.preventDefault();
    });
  });
}

// ── Boot ──────────────────────────────────────────────────────────────────────
void loadAll();
