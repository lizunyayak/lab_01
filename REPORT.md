# Звіт — Лабораторна робота №5
## Уразливості та захист (OWASP Top-10)

**Репозиторій:** https://github.com/lizunyayak/lab_01  
**Тег:** `1.0.0`  
**Стек:** Node.js + TypeScript + Express + SQLite (better-sqlite3)

---

## Зведена таблиця: ризик → наслідок → виправлення

| Сценарій | Ризик | Наслідок | Виправлення |
|----------|-------|----------|-------------|
| А — SQLi | Рядкова конкатенація SQL | Витік усіх даних, обхід фільтрів, UNION-атака | Параметризовані запити (`?` binding) |
| Б — XSS | `innerHTML` з даними користувача | Виконання JS у браузері, крадіжка даних | `esc()` — HTML output encoding |
| В — IDOR | Відсутня перевірка власника | Читання/видалення чужих нотаток | `WHERE id=? AND ownerUserId=?` на бекенді |
| Г — Misconfiguration | Відсутні захисні заголовки, широкий CORS | Clickjacking, MIME sniffing, витік URL | Security headers middleware, обмежений CORS |

---

## Сценарій А — SQL Injection (SQLi)

### 1. Було (уразливо)

**Де:** `backend/src/services/analytics.service.ts` → метод `searchPollsUnsafe()`  
**Також:** всі методи `findById()`, `save()`, `delete()` у репозиторіях `user`, `poll`, `question`, `response`.

**Помилка в підході:** дані з `req.query` підставлялися безпосередньо в рядок SQL через шаблонний літерал. База даних отримувала готовий рядок, частина якого виглядала як SQL-код.

```typescript
// analytics.service.ts — вразливий код
searchPollsUnsafe(q: string): PollSearchResult[] {
  const sql = `SELECT id, title, visibility, authorId, endDate
               FROM polls
               WHERE title LIKE '%${q}%'   ← q підставляється як код
               ORDER BY createdAt DESC LIMIT 20`;
  return getDb().prepare(sql).all() as PollSearchResult[];
}

// user.repository.ts — вразливий findById
findById(id: string): User | undefined {
  return getDb()
    .prepare(`SELECT * FROM users WHERE id = '${esc(id)}'`)  ← конкатенація
    .get() as User | undefined;
}
```

> `esc()` лише екранувала `'` → `''`. Не захищала від UNION, коментарів (`--`), та інших конструкцій. Endpoint `/polls/search` не використовував навіть `esc()`.

---

### 2. Відтворення

**OR-injection** (повернути всі записи):

```bash
curl "http://localhost:3000/api/v1/analytics/polls/search?q=' OR '1'='1"
```

Сформований SQL:
```sql
WHERE title LIKE '%' OR '1'='1'%'
-- умова завжди TRUE → повертає ВСІ опитування
```

**Відповідь (до виправлення):**
```json
{
  "data": [
    { "id": "p1", "title": "Задоволеність навчанням", "visibility": "public", ... },
    { "id": "p2", "title": "Якість лабораторних", "visibility": "private", ... },
    { "id": "p3", "title": "Плани на семестр", "visibility": "restricted", ... }
  ],
  "meta": { "count": 3, "q": "' OR '1'='1" }
}
```

**UNION-атака** (витягнути таблицю users):

```bash
curl "http://localhost:3000/api/v1/analytics/polls/search?q=' UNION SELECT id,email,name,email,createdAt FROM users--"
```

**Відповідь (до виправлення):** поля email-адрес замість назв опитувань.

---

### 3. Виправлення

**Ключова зміна:** SQL-команда і значення параметрів передаються **окремо** через `?` binding. SQLite Driver розглядає `?` як дані, а не код — структура запиту не може змінитись.

```typescript
// user.repository.ts — після виправлення
findById(id: string): User | undefined {
  return getDb()
    .prepare('SELECT * FROM users WHERE id = ?')  ← структура фіксована
    .get(id) as User | undefined;                 ← значення окремо
}

// analytics.service.ts — захищений пошук
searchPollsSafe(q: string): PollSearchResult[] {
  return getDb()
    .prepare(`SELECT id, title, visibility, authorId, endDate
              FROM polls WHERE title LIKE ?
              ORDER BY createdAt DESC LIMIT 20`)
    .all(`%${q}%`) as PollSearchResult[];         ← % додаються до значення, не SQL
}

// Репозиторії save() через excluded (параметризований upsert)
getDb().prepare(`
  INSERT INTO users (id, name, email, createdAt) VALUES (?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET name = excluded.name, email = excluded.email
`).run(user.id, user.name, user.email, user.createdAt);
```

**Змінені файли:**
- `backend/src/repositories/user.repository.ts`
- `backend/src/repositories/poll.repository.ts`
- `backend/src/repositories/question.repository.ts`
- `backend/src/repositories/response.repository.ts`
- `backend/src/services/analytics.service.ts`

---

### 4. Перевірка

**Той самий OR-injection через захищений endpoint:**

```bash
curl "http://localhost:3000/api/v1/analytics/polls/search-safe?q=' OR '1'='1"
```

**Відповідь після виправлення:**
```json
{
  "data": [],
  "meta": { "count": 0, "q": "' OR '1'='1" }
}
```

Рядок `' OR '1'='1` трактується як буквальний текст для LIKE. Збігів немає — пошук повернув 0 результатів.

**Легітимний пошук не зламався:**

```bash
curl "http://localhost:3000/api/v1/analytics/polls/search-safe?q=навч"
```

```json
{
  "data": [{ "id": "p1", "title": "Задоволеність навчанням", ... }],
  "meta": { "count": 1, "q": "навч" }
}
```

**Порівняння endpoints:**

| Endpoint | Механізм | OR-injection `' OR '1'='1` |
|----------|----------|---------------------------|
| `/polls/search` | конкатенація | ⚠ повертає всі записи |
| `/polls/search-safe` | `?` binding | ✅ повертає 0 результатів |

---

## Сценарій Б — XSS (Stored)

### 1. Було (уразливо)

**Де:** `frontend/src/main.ts` → функція `renderPolls()`.

**Помилка в підході:** дані користувача (title, description, authorName) підставлялися безпосередньо в шаблонний рядок, який потрапляв в `innerHTML`. Браузер парсив вставлений рядок як HTML і міг виконати скрипти.

```typescript
// Вразливий варіант (без esc):
const rows = polls.map(p => `
  <tr>
    <td>${p.title}</td>          ← НЕБЕЗПЕЧНО: p.title стає HTML
    <td>${p.description}</td>   ← НЕБЕЗПЕЧНО
  </tr>`).join('');

container.innerHTML = `<table>...<tbody>${rows}</tbody></table>`;
```

Якщо `p.title = '<script>alert(1)</script>'` — браузер **виконає** скрипт при рендері.

---

### 2. Відтворення

**Крок 1.** Через форму або API зберегти опитування з XSS payload у назві:

```bash
curl -X POST http://localhost:3000/api/v1/polls \
  -H "Content-Type: application/json" \
  -d '{
    "title": "<img src=x onerror=alert(\"XSS!\")>",
    "endDate": "2027-12-31",
    "visibility": "public",
    "authorId": "u1",
    "description": "<b>Bold</b> text"
  }'
```

**Відповідь:** `201 Created` — бекенд зберігає як є (бекенд не відповідає за HTML-rendering).

**Крок 2.** Відкрити фронтенд у браузері. Без `esc()`:
- `<img src=x onerror=...>` — браузер створює `<img>` елемент, `onerror` спрацьовує → `alert("XSS!")`
- `<b>Bold</b>` — рендериться як жирний текст, а не як рядок

---

### 3. Виправлення

**Ключова зміна:** функція `esc()` у `frontend/src/main.ts` — output encoding на момент рендеру. Всі спецсимволи HTML перетворюються в безпечні HTML-сутності **перед** вставкою в `innerHTML`.

```typescript
// frontend/src/main.ts
function esc(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')   // & → &amp;
    .replace(/</g, '&lt;')    // < → &lt;   ← забороняє HTML-теги
    .replace(/>/g, '&gt;')    // > → &gt;
    .replace(/"/g, '&quot;'); // " → &quot; ← забороняє атрибути
}

// Використовується для КОЖНОГО поля з даними користувача:
const rows = polls.map(p => `
  <tr>
    <td>${esc(p.title)}</td>          ← тепер безпечно
    <td>${esc(p.description) || '—'}</td>
    <td>${esc(userName(p.authorId))}</td>
  </tr>`).join('');
```

Після `esc()` рядок `<img src=x onerror=alert(1)>` стає `&lt;img src=x onerror=alert(1)&gt;` — браузер відображає як текст, не як HTML.

---

### 4. Перевірка

**Той самий XSS payload після виправлення:**

1. Зберегти опитування з `title: "<script>alert('XSS')</script>"` (той самий POST-запит з кроку 2).
2. Відкрити таблицю у браузері.

**Результат:** у клітинці "Назва" відображається буквальний рядок:
```
<script>alert('XSS')</script>
```
Скрипт **не виконується** — DOM inspector покаже `&lt;script&gt;alert(&#39;XSS&#39;)&lt;/script&gt;`.

**Легітимний сценарій:** опитування із звичайним текстом (`Задоволеність навчанням`) відображаються коректно — `esc()` не змінює текст без спецсимволів.

---

## Сценарій В — IDOR (Broken Access Control)

### 1. Було (уразливо)

**Де:** `GET /api/v1/notes/:id/unsafe` → `NoteService.getByIdUnsafe()` → `NoteRepository.findByIdUnsafe()`.

**Помилка в підході:** endpoint повертав нотатку лише за `id` без перевірки того, чи є поточний користувач власником. Будь-який автентифікований користувач міг прочитати чужу нотатку, знаючи (або перебираючи) її `id`.

```typescript
// note.service.ts — вразливий варіант
getByIdUnsafe(id: string): NoteResponseDto {
  const note = noteRepository.findByIdUnsafe(id); // WHERE id = ?
  if (!note) throw notFound('PersonalNote', id);
  return toDto(note);  // власник НЕ перевіряється
}
```

---

### 2. Відтворення

**Підготовка:** Аліса (u1) створює приватну нотатку:

```bash
curl -X POST http://localhost:3000/api/v1/notes \
  -H "X-Demo-UserId: u1" \
  -H "Content-Type: application/json" \
  -d '{"title":"Мій секрет","content":"Пароль: qwerty123"}'
```

```json
{
  "id": "a1b2c3d4-...",
  "ownerUserId": "u1",
  "title": "Мій секрет",
  "content": "Пароль: qwerty123",
  "createdAt": "2026-06-04T..."
}
```

**Атака:** Боб (u2) читає нотатку Аліси через вразливий endpoint:

```bash
curl http://localhost:3000/api/v1/notes/a1b2c3d4-.../unsafe \
  -H "X-Demo-UserId: u2"
```

**Відповідь (до виправлення):**
```json
{
  "id": "a1b2c3d4-...",
  "ownerUserId": "u1",
  "title": "Мій секрет",
  "content": "Пароль: qwerty123"
}
```

**Витік:** Боб отримав приватні дані Аліси.

---

### 3. Виправлення

**Ключова зміна:** перевірка власника вбудована в SQL-запит на бекенді. Клієнт **не може** обійти її, бо `ownerUserId` береться з middleware (`req.demoUserId`), а не з тіла запиту.

```typescript
// note.repository.ts — захищений запит
findByIdAndOwner(id: string, ownerUserId: string): PersonalNote | undefined {
  return getDb()
    .prepare('SELECT * FROM personal_notes WHERE id = ? AND ownerUserId = ?')
    .get(id, ownerUserId) as PersonalNote | undefined;
  // якщо id правильний, але ownerUserId не збігається → undefined → 404
}

// note.service.ts — захищений метод
getById(id: string, ownerUserId: string): NoteResponseDto {
  const note = noteRepository.findByIdAndOwner(id, ownerUserId);
  if (!note) throw notFound('PersonalNote', id); // 404 для чужих нотаток
  return toDto(note);
}
```

**demoAuth middleware** додатково перевіряє існування userId в БД:

```typescript
// demoAuth.middleware.ts
const user = userRepository.findById(userId);
if (!user) {
  next(new AppError(401, 'UNAUTHORIZED', `User "${userId}" not found`));
  return;
}
```

**Операції з перевіркою власника:** `GET /:id`, `DELETE /:id`. Список (`GET /`) — лише свої нотатки (`WHERE ownerUserId = ?`).

**Вибір коду відповіді:** використовується **404** (а не 403), щоб не розкривати факт існування чужої нотатки — одна гілка логіки покриває «не існує» і «чуже».

---

### 4. Перевірка

**Той самий запит Боба через захищений endpoint:**

```bash
curl http://localhost:3000/api/v1/notes/a1b2c3d4-... \
  -H "X-Demo-UserId: u2"
```

**Відповідь після виправлення:**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "PersonalNote with id \"a1b2c3d4-...\" not found"
  }
}
```
HTTP статус: **404** — Боб не знає, чи нотатка існує взагалі.

**Аліса читає власну нотатку — успішно:**

```bash
curl http://localhost:3000/api/v1/notes/a1b2c3d4-... \
  -H "X-Demo-UserId: u1"
```

```json
{
  "id": "a1b2c3d4-...",
  "ownerUserId": "u1",
  "title": "Мій секрет",
  "content": "Пароль: qwerty123"
}
```

**demoAuth — відсутній заголовок:**

```bash
curl http://localhost:3000/api/v1/notes
```

```json
{ "error": { "code": "UNAUTHORIZED", "message": "X-Demo-UserId header is required" } }
```
HTTP статус: **401**

**demoAuth — невідомий userId:**

```bash
curl http://localhost:3000/api/v1/notes \
  -H "X-Demo-UserId: ghost-user"
```

```json
{ "error": { "code": "UNAUTHORIZED", "message": "User \"ghost-user\" not found" } }
```
HTTP статус: **401**

---

## Сценарій Г — Security Misconfiguration

### 1. Було (уразливо)

**Де:** `backend/src/app.ts` — налаштування Express. Відсутні захисні HTTP-заголовки. CORS `allowedHeaders` не включав `X-Demo-UserId`.

**Помилка в підході:**
- Без `X-Content-Type-Options` браузер міг виконати JSON-файл як скрипт (MIME sniffing).
- Без `X-Frame-Options` сайт можна вбудувати в `<iframe>` для clickjacking.
- Без `Referrer-Policy` внутрішні URL витікали в Referer до зовнішніх ресурсів.
- `X-Powered-By: Express` розкривав технологічний стек.

---

### 2. Відтворення (до виправлення)

```bash
curl -I http://localhost:3000/api/v1/polls
```

**Відповідь без security headers:**
```
HTTP/1.1 200 OK
X-Powered-By: Express          ← розкриває стек
Content-Type: application/json
# X-Content-Type-Options: немає
# X-Frame-Options: немає
# Referrer-Policy: немає
```

---

### 3. Виправлення

**Ключова зміна:** новий middleware `securityHeaders` встановлює захисні заголовки для **всіх** відповідей. Підключений у `app.ts` одразу після CORS.

```typescript
// backend/src/middlewares/securityHeaders.middleware.ts
export function securityHeaders(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-XSS-Protection', '0');
  next();
}
```

**Що дає кожен заголовок у цьому проекті:**

| Заголовок | Захист у нашому проекті |
|-----------|------------------------|
| `X-Content-Type-Options: nosniff` | Забороняє браузеру виконувати файли з неправильним Content-Type як скрипти. Наприклад, якщо зловмисник завантажив би JSON з XSS payload і спробував відкрити його як скрипт — браузер заблокує. |
| `X-Frame-Options: DENY` | Забороняє вбудовувати наш API/фронтенд у `<iframe>`. Захищає від clickjacking — атаки коли жертва бачить прозорий iframe поверх іншої сторінки і клікає не туди. |
| `Referrer-Policy: no-referrer` | Браузер не відправляє `Referer` при переходах. Внутрішні URL типу `localhost:3000/api/v1/notes/UUID` не витікають у заголовки запитів до зовнішніх ресурсів. |
| `X-XSS-Protection: 0` | Вимикає застарілий XSS auditor у IE/старому Chrome. Новий стандарт — покладатися на CSP, а не на deprecated фільтр, який сам мав уразливості. |

**Приховування stack trace** (вже було реалізовано):

```typescript
// error.middleware.ts
console.error('[UNHANDLED ERROR]', err);   // логуємо на сервері
res.status(500).json({
  error: {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred'  // без деталей реалізації
  }
});
```

**CORS обмежений одним origin:**

```typescript
app.use(cors({
  origin: 'http://localhost:5173',           // лише наш фронтенд
  allowedHeaders: ['Content-Type', 'X-Demo-UserId']
}));
```

---

### 4. Перевірка

```bash
curl -I http://localhost:3000/api/v1/polls
```

**Відповідь після виправлення:**
```
HTTP/1.1 200 OK
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
X-XSS-Protection: 0
Content-Type: application/json; charset=utf-8
```

**Помилка не розкриває dev-деталі:**

```bash
curl http://localhost:3000/api/v1/polls/nonexistent-id
```

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Poll with id \"nonexistent-id\" not found"
  }
}
```

Жодного stack trace, шляхів файлів, або назв внутрішніх методів.

---

## Security Regression набір

Файл `requests.http` у корені репозиторію містить повний набір HTTP-запитів для повторної перевірки всіх 4 сценаріїв. Формат сумісний з VS Code REST Client та IntelliJ HTTP Client.

```
requests.http
  [A-1..A-6]  SQLi: OR-injection, UNION, легітимний пошук
  [B-1..B-9]  IDOR: створення нотатки, атака, захист, 401-сценарії, DELETE
  [G-1..G-3]  Security headers, формат помилок
  [X-1..X-2]  XSS payload збереження + перевірка
```

---

## Нові файли та зміни

| Файл | Що зроблено |
|------|------------|
| `backend/migrations/003_personal_notes.sql` | Таблиця `personal_notes` з `ownerUserId` |
| `backend/src/types/models.ts` | Додано `PersonalNote` |
| `backend/src/repositories/note.repository.ts` | `findByIdAndOwner()` — безпечний; `findByIdUnsafe()` — демо |
| `backend/src/services/note.service.ts` | `getById()` — з перевіркою; `getByIdUnsafe()` — демо |
| `backend/src/controllers/note.controller.ts` | Два варіанти GET |
| `backend/src/routes/note.routes.ts` | `/notes`, `/notes/:id`, `/notes/:id/unsafe` |
| `backend/src/middlewares/demoAuth.middleware.ts` | Перевірка заголовка + існування user в БД |
| `backend/src/middlewares/securityHeaders.middleware.ts` | 4 security headers |
| `backend/src/repositories/*.ts` (4 файли) | Параметризовані запити замість конкатенації |
| `backend/src/services/analytics.service.ts` | `searchPollsSafe()` + параметризація safe методів |
| `backend/src/routes/analytics.routes.ts` | `/polls/search-safe` endpoint |
| `backend/src/app.ts` | Security headers + note routes + CORS allowedHeaders |
| `requests.http` | Security regression набір |
