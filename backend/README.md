# Система опитування групи — Backend API

REST API для управління опитуваннями, написаний на **Node.js + TypeScript + Express + SQLite**.

## Технічний стек

- **Node.js** + **TypeScript** (tsx для dev, tsc для prod)
- **Express 4** — HTTP-фреймворк
- **better-sqlite3** — синхронний SQLite-клієнт
- **uuid** — генерація ID
- **swagger-ui-express** — Swagger UI

## Запуск

```bash
# 1. Встановити залежності
npm install

# 2. Запустити в режимі розробки (міграції виконуються автоматично при старті)
npm run dev

# 3. Наповнити БД тестовими даними (5 users, 3 polls, 7 questions, 10 responses)
npm run seed

# 4. Зібрати для продакшену
npm run build
npm start
```

Сервер стартує на **http://localhost:3000**  
Swagger UI: **http://localhost:3000/api/docs**

### Де зберігається база даних

SQLite-файл створюється автоматично при першому запуску:

```
backend/data/app.db
```

Файл `.db` не зберігається в репозиторії (прописано в `.gitignore`).

---

## Схема БД

### Таблиці та зв'язки

```
users
  id        TEXT PK
  name      TEXT NOT NULL, CHECK(length >= 2)
  email     TEXT NOT NULL, UNIQUE
  createdAt TEXT NOT NULL

polls
  id          TEXT PK
  title       TEXT NOT NULL, CHECK(length >= 3)
  description TEXT NOT NULL DEFAULT ''
  endDate     TEXT NOT NULL
  visibility  TEXT NOT NULL, CHECK IN ('public','private','restricted')
  authorId    TEXT NOT NULL → users.id  ON DELETE CASCADE
  createdAt   TEXT NOT NULL

questions
  id        TEXT PK
  pollId    TEXT NOT NULL → polls.id  ON DELETE CASCADE
  text      TEXT NOT NULL, CHECK(length >= 3)
  "order"   INTEGER NOT NULL DEFAULT 1, CHECK >= 1
  createdAt TEXT NOT NULL

responses
  id         TEXT PK
  pollId     TEXT NOT NULL → polls.id     ON DELETE CASCADE
  questionId TEXT NOT NULL → questions.id ON DELETE CASCADE
  userId     TEXT NOT NULL → users.id     ON DELETE CASCADE
  answer     TEXT NOT NULL, CHECK(length > 0)
  createdAt  TEXT NOT NULL
  UNIQUE(userId, questionId)   -- один юзер = одна відповідь на питання
```

### Зв'язки

| Від | До | Тип |
|-----|----|-----|
| `polls.authorId` | `users.id` | N:1 |
| `questions.pollId` | `polls.id` | N:1 |
| `responses.pollId` | `polls.id` | N:1 |
| `responses.questionId` | `questions.id` | N:1 |
| `responses.userId` | `users.id` | N:1 |

`responses` є зв'язувальною таблицею M:N між `users` і `questions`.

### Обмеження цілісності

| Обмеження | Де |
|-----------|----|
| `NOT NULL` | всі обов'язкові поля |
| `UNIQUE` | `users.email`, `(userId, questionId)` в `responses` |
| `CHECK` | `name length >= 2`, `title length >= 3`, `order >= 1`, `visibility IN (...)`, `answer length > 0` |
| `FOREIGN KEY … ON DELETE CASCADE` | всі зв'язки |

### Міграції

Файли у папці `migrations/` застосовуються в порядку нумерації. При кожному старті застосунок перевіряє таблицю `schema_migrations` і виконує лише нові файли.

```
migrations/
  001_init.sql        — створення всіх таблиць
  002_add_indexes.sql — індекси для типових фільтрів/сортувань
```

**Навіщо індекси** (`002_add_indexes.sql`): `authorId`, `visibility` — для фільтрів `GET /api/polls`; `pollId` на `questions`/`responses` — для вибірки по опитуванню; `userId`, `questionId` на `responses` — для пошуку відповідей учасника.

---

## API-маршрути

Основний префікс: **`/api/v1`**  
Legacy-префікс `/api` (без версії) також підтримується для зворотної сумісності.

### CORS

Дозволений origin: `http://localhost:5173` (Vite dev server фронтенду).  
Методи: `GET, POST, PUT, PATCH, DELETE, OPTIONS`.

### CRUD маршрути

| Метод | URL | Опис |
|-------|-----|------|
| GET | `/api/v1/users` | список користувачів |
| POST | `/api/v1/users` | створити |
| GET | `/api/v1/users/:id` | отримати за id |
| PUT | `/api/v1/users/:id` | повне оновлення |
| PATCH | `/api/v1/users/:id` | часткове оновлення |
| DELETE | `/api/v1/users/:id` | видалити |
| GET | `/api/v1/polls` | список опитувань (`?visibility=`, `?authorId=`, `?sortBy=`, `?sortDir=`, `?page=`, `?pageSize=`) |
| POST | `/api/v1/polls` | створити |
| GET | `/api/v1/polls/:id` | отримати за id |
| PUT | `/api/v1/polls/:id` | повне оновлення (title, endDate, visibility, authorId, description) |
| PATCH | `/api/v1/polls/:id` | часткове оновлення |
| DELETE | `/api/v1/polls/:id` | видалити (каскад: questions + responses) |
| GET | `/api/v1/questions` | список питань (`?pollId=`) |
| POST | `/api/v1/questions` | додати питання |
| GET | `/api/v1/questions/:id` | питання за id |
| PATCH | `/api/v1/questions/:id` | оновити |
| DELETE | `/api/v1/questions/:id` | видалити |
| GET | `/api/v1/responses` | список відповідей (`?pollId=`, `?userId=`, `?questionId=`) |
| POST | `/api/v1/responses` | відправити відповідь |
| GET | `/api/v1/responses/:id` | відповідь за id |
| PATCH | `/api/v1/responses/:id` | оновити |
| DELETE | `/api/v1/responses/:id` | видалити |

### Аналітичні маршрути

| Метод | URL | Опис |
|-------|-----|------|
| GET | `/api/v1/analytics/polls/:id/details` | JOIN: опитування + автор + питання з кількістю відповідей |
| GET | `/api/v1/analytics/polls/:id/stats` | агрегація: COUNT / AVG / DISTINCT учасників |
| GET | `/api/v1/analytics/polls/search?q=` | ⚠ SQLi-демо: пошук за назвою |

---

## Приклади запитів (curl)

### 1. Створити користувача

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Іван Петренко","email":"ivan@example.com"}'
# → 201 { "id": "...", "name": "Іван Петренко", ... }
```

### 2. Список опитувань з фільтром + сортуванням + пагінацією (WHERE + ORDER + LIMIT)

```bash
curl "http://localhost:3000/api/v1/polls?visibility=public&sortBy=endDate&sortDir=asc&page=1&pageSize=5"
```

### 3. Аналітика — JOIN (опитування + автор + питання з лічильниками)

```bash
curl http://localhost:3000/api/v1/analytics/polls/p1/details
# → { "id": "p1", "title": "...", "authorName": "Олена Коваленко",
#     "questions": [{ "text": "...", "responseCount": 3 }, ...] }
```

### 4. Агрегація — статистика опитування (COUNT / AVG)

```bash
curl http://localhost:3000/api/v1/analytics/polls/p1/stats
# → { "pollId": "p1", "totalResponses": 6, "totalQuestions": 3,
#     "avgResponsesPerQuestion": 2.0, "uniqueParticipants": 3 }
```

### 5. Повне оновлення опитування (PUT)

```bash
curl -X PUT http://localhost:3000/api/v1/polls/POLL_ID \
  -H "Content-Type: application/json" \
  -d '{"title":"Нова назва","endDate":"2026-12-31","visibility":"public","authorId":"USER_ID","description":""}'
# → 200 { "id": "...", "title": "Нова назва", ... }
```

### 6. Видалення опитування (каскад)

```bash
curl -X DELETE http://localhost:3000/api/v1/polls/p1
# → 204 No Content (видаляє questions і responses автоматично через ON DELETE CASCADE)
```

---

## ⚠ SQLi-демонстрація (навчальна)

Endpoint `GET /api/analytics/polls/search?q=` використовує рядкову конкатенацію для формування SQL:

```typescript
const sql = `SELECT ... FROM polls WHERE title LIKE '%${q}%' ...`;
```

**Чому це небезпечно:**  
Зловмисник може передати керуючі символи SQL у параметрі `q`. Наприклад:

```
GET /api/analytics/polls/search?q=' OR '1'='1
```

Сформований SQL:
```sql
WHERE title LIKE '%' OR '1'='1'%'
-- умова завжди TRUE → повертає ВСІ записи
```

Або:

```
q=' UNION SELECT id,email,name,email,createdAt FROM users--
```

Поверне дані з таблиці `users` замість `polls`.

**Важливо:** цей endpoint залишено вразливим навмисно (вимога лабораторної роботи №3). Виправлення через параметризовані запити — у лабораторній №4.

---

## HTTP-коди стану

| Код | Ситуація |
|-----|----------|
| 200 | Успішне читання/оновлення |
| 201 | Успішне створення |
| 204 | Успішне видалення |
| 400 | Помилка валідації |
| 404 | Ресурс не знайдено |
| 409 | Конфлікт (дублікат email, повторна відповідь) |
| 500 | Непередбачена помилка |

## Формат помилки

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": ["title: мінімум 3 символи"]
  }
}
```
