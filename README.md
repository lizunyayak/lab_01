# Система опитування групи

Повностековий застосунок для управління опитуваннями.  
Складається з REST API бекенду та SPA фронтенду.

## Структура проєкту

```
lab_02/
├── backend/          # Node.js + TypeScript + Express + SQLite
│   ├── migrations/   # SQL-міграції (001_init, 002_indexes)
│   ├── data/         # SQLite-файл app.db (не в репо)
│   └── src/
│       ├── controllers/
│       ├── services/
│       ├── repositories/
│       ├── routes/
│       ├── dtos/
│       ├── types/
│       ├── middlewares/
│       ├── db/
│       └── app.ts / server.ts
└── frontend/         # Vite + TypeScript (vanilla, без фреймворків)
    └── src/
        ├── main.ts
        ├── apiClient.ts
        └── types.ts
```

---

## Швидкий старт

### 1. Бекенд

```bash
cd backend
npm install
npm run dev       # http://localhost:3000
```

> Міграції виконуються автоматично при першому запуску.  
> Заповнити тестовими даними: `npm run seed`

### 2. Фронтенд

```bash
cd frontend
npm install
npm run dev       # http://localhost:5173
```

Відкрийте **http://localhost:5173** — фронтенд автоматично звертається до API на порту 3000.

---

## Технічний стек

| Шар | Технології |
|-----|-----------|
| Бекенд | Node.js, TypeScript, Express 4, better-sqlite3, uuid |
| Фронтенд | Vite, TypeScript (vanilla), fetch API |
| БД | SQLite (файл `backend/data/app.db`) |
| Документація API | Swagger UI — `http://localhost:3000/api/docs` |

---

## Функціональність фронтенду

- **Список опитувань** — таблиця з усіма опитуваннями, порядковими номерами, бейджами видимості
- **Створення опитування** — форма з полями: Назва, Дата завершення, Видимість, Автор (ПІБ), Email, Опис
- **Редагування** — кнопка «Редагувати» заповнює форму; зміни зберігаються через `PUT /api/v1/polls/:id`
- **Видалення** — кнопка «Видалити» з підтвердженням
- **Валідація** — клієнтська (назва ≥ 3 символи, коректний email, заповнені поля) + серверна
- **Стани** — завантаження (спіннер), порожній список, помилка мережі з кнопкою «Повторити»
- **Ресайз колонок** — кожен стовпець таблиці можна розтягнути мишею
- **AbortController** — всі запити мають таймаут 10 секунд

### Двокроковий submit

При збереженні форма виконує:
1. `POST /api/v1/users` — знаходить або створює користувача за email  
   (якщо ПІБ змінилось — `PATCH /api/v1/users/:id`)
2. `POST /api/v1/polls` або `PUT /api/v1/polls/:id` — створює або оновлює опитування

---

## API

Базовий URL: `http://localhost:3000/api/v1`  
Також доступний legacy-префікс `/api` (без версії).

### Користувачі

| Метод | Шлях | Опис |
|-------|------|------|
| GET | `/api/v1/users` | список |
| POST | `/api/v1/users` | створити |
| GET | `/api/v1/users/:id` | за id |
| PUT | `/api/v1/users/:id` | повне оновлення |
| PATCH | `/api/v1/users/:id` | часткове оновлення |
| DELETE | `/api/v1/users/:id` | видалити |

### Опитування

| Метод | Шлях | Опис |
|-------|------|------|
| GET | `/api/v1/polls` | список (`?visibility=`, `?authorId=`, `?sortBy=`, `?sortDir=`, `?page=`, `?pageSize=`) |
| POST | `/api/v1/polls` | створити |
| GET | `/api/v1/polls/:id` | за id |
| PUT | `/api/v1/polls/:id` | повне оновлення (title, endDate, visibility, authorId, description) |
| PATCH | `/api/v1/polls/:id` | часткове оновлення |
| DELETE | `/api/v1/polls/:id` | видалити (каскад: questions + responses) |

### Питання та відповіді

| Метод | Шлях | Опис |
|-------|------|------|
| GET | `/api/v1/questions` | список (`?pollId=`) |
| POST | `/api/v1/questions` | додати |
| PATCH | `/api/v1/questions/:id` | оновити |
| DELETE | `/api/v1/questions/:id` | видалити |
| GET | `/api/v1/responses` | список (`?pollId=`, `?userId=`, `?questionId=`) |
| POST | `/api/v1/responses` | відправити відповідь |
| PATCH | `/api/v1/responses/:id` | оновити |
| DELETE | `/api/v1/responses/:id` | видалити |

### Аналітика

| Метод | Шлях | Опис |
|-------|------|------|
| GET | `/api/v1/analytics/polls/:id/details` | JOIN: опитування + автор + питання з кількістю відповідей |
| GET | `/api/v1/analytics/polls/:id/stats` | COUNT / AVG / DISTINCT учасників |
| GET | `/api/v1/analytics/polls/search?q=` | ⚠ SQLi-демо: пошук за назвою |

---

## Схема БД

```
users          id, name, email (UNIQUE), createdAt
polls          id, title, description, endDate, visibility, authorId→users, createdAt
questions      id, pollId→polls, text, order, createdAt
responses      id, pollId→polls, questionId→questions, userId→users, answer, createdAt
               UNIQUE(userId, questionId)
```

Всі зв'язки: `FOREIGN KEY … ON DELETE CASCADE`  
Міграції: `migrations/001_init.sql`, `migrations/002_add_indexes.sql`

---

## ⚠ SQLi-демонстрація

`GET /api/v1/analytics/polls/search?q=` використовує рядкову конкатенацію навмисно — для демонстрації вразливості SQL-ін'єкції (вимога лабораторної роботи №3).

```
?q=' OR '1'='1        → повертає всі записи
?q=' UNION SELECT id,email,name,email,createdAt FROM users--
```

---

## HTTP-статуси

| Код | Ситуація |
|-----|----------|
| 200 | Успішне читання / оновлення |
| 201 | Успішне створення |
| 204 | Успішне видалення |
| 400 | Помилка валідації |
| 404 | Ресурс не знайдено |
| 409 | Конфлікт (дублікат email) |
| 500 | Непередбачена помилка |

Формат помилки:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": ["title: мінімум 3 символи"]
  }
}
```

---

## Версії

| Тег | Лабораторна | Опис |
|-----|-------------|------|
| `0.1.0` | Lab 01 | статичний HTML |
| `0.2.0` | Lab 02 | REST API (in-memory) |
| `0.3.0` | Lab 03 | SQLite + міграції + аналітика |
| `0.4.0` | Lab 04 | Фронтенд + CORS + API v1 |
