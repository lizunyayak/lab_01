# Система опитування групи — Backend API

REST API для управління опитуваннями, написаний на **Node.js + TypeScript + Express**.

## Технічний стек

- **Node.js** + **TypeScript** (tsx для dev, tsc для prod)
- **Express 4** — HTTP-фреймворк
- **uuid** — генерація ID
- **swagger-ui-express** — Swagger UI
- Дані зберігаються **в оперативній пам'яті** (після перезапуску зникають)

## Запуск

```bash
# 1. Встановити залежності
npm install

# 2. Запустити в режимі розробки (hot-reload)
npm run dev

# 3. Зібрати для продакшену
npm run build
npm start

# 4. Перевірити типи та лінтер
npx tsc --noEmit
npm run lint
```

Сервер стартує на **http://localhost:3000**  
Swagger UI доступний на **http://localhost:3000/api/docs**

---

## Архітектура проекту

```
src/
├── server.ts            # Точка входу (PORT)
├── app.ts               # Ініціалізація Express, middleware, routes
├── swagger.ts           # OpenAPI 3.0 специфікація
│
├── routes/              # Реєстрація маршрутів
│   ├── user.routes.ts
│   ├── poll.routes.ts
│   ├── question.routes.ts
│   └── response.routes.ts
│
├── controllers/         # HTTP-прийом (req/res), делегує сервісу
│   ├── user.controller.ts
│   ├── poll.controller.ts
│   ├── question.controller.ts
│   ├── response.controller.ts
│   └── helpers.ts       # Парсинг пагінації/сортування
│
├── services/            # Бізнес-логіка, валідація
│   ├── user.service.ts
│   ├── poll.service.ts
│   ├── question.service.ts
│   └── response.service.ts
│
├── repositories/        # In-memory сховище (Map<id, entity>)
│   ├── base.repository.ts
│   ├── user.repository.ts
│   ├── poll.repository.ts
│   ├── question.repository.ts
│   └── response.repository.ts
│
├── dtos/                # DTO для запитів та відповідей
│   ├── user.dto.ts
│   ├── poll.dto.ts
│   ├── question.dto.ts
│   └── response.dto.ts
│
├── middlewares/
│   ├── logger.middleware.ts    # Логування: метод, url, статус, ms
│   ├── error.middleware.ts     # Централізований error handler
│   └── notfound.middleware.ts  # 404 для невідомих маршрутів
│
└── types/
    ├── models.ts        # Внутрішні доменні типи
    └── api.ts           # ApiList, ApiError, AppError
```

---

## Реалізовані сутності

| Сутність  | Опис                              |
|-----------|-----------------------------------|
| **Users** | Користувачі системи               |
| **Polls** | Опитування (заголовок, дата, видимість) |
| **Questions** | Питання всередині опитування  |
| **Responses** | Відповіді учасників на питання |

---

## API-маршрути

Усі маршрути мають префікс `/api`.

### Загальні query-параметри для GET списків

| Параметр   | Тип     | За замовч. | Опис                       |
|------------|---------|------------|----------------------------|
| `page`     | integer | 1          | Номер сторінки             |
| `pageSize` | integer | 10         | Розмір сторінки (макс 100) |
| `sortDir`  | asc/desc| desc       | Напрямок сортування        |

Формат відповіді списку:
```json
{ "items": [...], "total": 5, "page": 1, "pageSize": 10 }
```

---

## Приклади запитів (curl)

### Users

```bash
# Список користувачів
curl http://localhost:3000/api/users

# Створити
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Іван Петренко","email":"ivan@example.com"}'
# → 201 { "id": "uuid", "name": "...", "email": "...", "createdAt": "..." }

# Отримати за ID
curl http://localhost:3000/api/users/<ID>

# Часткове оновлення (PATCH)
curl -X PATCH http://localhost:3000/api/users/<ID> \
  -H "Content-Type: application/json" \
  -d '{"name":"Іван Шевченко"}'

# Повне оновлення (PUT)
curl -X PUT http://localhost:3000/api/users/<ID> \
  -H "Content-Type: application/json" \
  -d '{"name":"Новий Іван","email":"newemail@example.com"}'

# Видалити
curl -X DELETE http://localhost:3000/api/users/<ID>
# → 204 No Content
```

### Polls

```bash
# Список з фільтрацією та пагінацією
curl "http://localhost:3000/api/polls?visibility=public&page=1&pageSize=5&sortBy=endDate&sortDir=asc"

# Фільтр за автором
curl "http://localhost:3000/api/polls?authorId=<USER_ID>"

# Створити (authorId — id існуючого user)
curl -X POST http://localhost:3000/api/polls \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Задоволеність навчанням",
    "description": "Опитування по кінцю семестру",
    "endDate": "2027-12-31",
    "visibility": "public",
    "authorId": "<USER_ID>"
  }'
# → 201

# PATCH — часткове оновлення
curl -X PATCH http://localhost:3000/api/polls/<POLL_ID> \
  -H "Content-Type: application/json" \
  -d '{"visibility":"private"}'

# Видалення каскадно видаляє питання і відповіді
curl -X DELETE http://localhost:3000/api/polls/<POLL_ID>
# → 204
```

### Questions

```bash
# Питання конкретного опитування
curl "http://localhost:3000/api/questions?pollId=<POLL_ID>"

# Додати питання
curl -X POST http://localhost:3000/api/questions \
  -H "Content-Type: application/json" \
  -d '{
    "pollId": "<POLL_ID>",
    "text": "Чи задоволені ви якістю лекцій?",
    "order": 1
  }'
# → 201

# Оновити текст
curl -X PATCH http://localhost:3000/api/questions/<Q_ID> \
  -H "Content-Type: application/json" \
  -d '{"text":"Оновлений текст питання?"}'

# Видалити
curl -X DELETE http://localhost:3000/api/questions/<Q_ID>
# → 204
```

### Responses

```bash
# Відповіді на конкретне питання
curl "http://localhost:3000/api/responses?questionId=<Q_ID>"

# Відповіді конкретного користувача
curl "http://localhost:3000/api/responses?userId=<USER_ID>"

# Відправити відповідь
curl -X POST http://localhost:3000/api/responses \
  -H "Content-Type: application/json" \
  -d '{
    "pollId": "<POLL_ID>",
    "questionId": "<Q_ID>",
    "userId": "<USER_ID>",
    "answer": "Так, дуже задоволений"
  }'
# → 201

# Повторна відповідь на те саме питання → 409 Conflict

# Оновити відповідь
curl -X PATCH http://localhost:3000/api/responses/<R_ID> \
  -H "Content-Type: application/json" \
  -d '{"answer":"Змінена відповідь"}'

# Видалити
curl -X DELETE http://localhost:3000/api/responses/<R_ID>
# → 204
```

---

## HTTP-коди стану

| Код | Ситуація                                |
|-----|-----------------------------------------|
| 200 | Успішне читання/оновлення               |
| 201 | Успішне створення                       |
| 204 | Успішне видалення                       |
| 400 | Помилка валідації                       |
| 404 | Ресурс не знайдено                      |
| 409 | Конфлікт (дублікат email, повторна відп.)|
| 500 | Непередбачена помилка                   |

---

## Формат помилки

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": [
      "title: мінімум 3 символи",
      "endDate: дата не може бути в минулому"
    ]
  }
}
```

---

## Логування

Кожен запит логується у консоль:
```
[2025-01-15T10:23:45.123Z] POST /api/polls → 201 (8ms)
[2025-01-15T10:23:46.200Z] GET  /api/polls/fake → 404 (2ms)
```

---

## Додаткові REST-можливості (рівень «відмінно»)

1. **Фільтрація** — `?visibility=public`, `?authorId=...`, `?pollId=...`, `?userId=...`
2. **Пагінація** — `?page=1&pageSize=10`
3. **Сортування** — `?sortBy=endDate&sortDir=asc`
4. **PATCH** — часткове оновлення для всіх сутностей
5. **Cascade delete** — видалення Poll видаляє пов'язані Questions і Responses

## Swagger UI

Інтерактивна документація: **http://localhost:3000/api/docs**
