# API Commands — Quick Reference

**Base URL:** `http://localhost:3000/api/v1`

---

## POLLS

```bash
# Отримати всі опитування
curl http://localhost:3000/api/v1/polls

# Отримати з пагінацією і сортуванням
curl "http://localhost:3000/api/v1/polls?page=1&pageSize=5&sortBy=createdAt&sortDir=desc"

# Отримати одне опитування за ID
curl http://localhost:3000/api/v1/polls/p1

# Створити опитування
curl -X POST http://localhost:3000/api/v1/polls \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Нове опитування",
    "description": "Опис",
    "endDate": "2027-12-31",
    "visibility": "public",
    "authorId": "u1"
  }'

# Повністю замінити (PUT) — всі поля обов'язкові
curl -X PUT http://localhost:3000/api/v1/polls/p1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Оновлена назва",
    "description": "Новий опис",
    "endDate": "2028-01-01",
    "visibility": "private",
    "authorId": "u1"
  }'

# Частково оновити (PATCH) — лише потрібні поля
curl -X PATCH http://localhost:3000/api/v1/polls/p1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Тільки назва змінилась"}'

# Видалити опитування
curl -X DELETE http://localhost:3000/api/v1/polls/p1
```

---

## USERS

```bash
# Отримати всіх користувачів
curl http://localhost:3000/api/v1/users

# Отримати одного користувача
curl http://localhost:3000/api/v1/users/u1

# Створити користувача
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Іваненко Іван", "email": "ivan@example.com"}'

# Частково оновити (PATCH)
curl -X PATCH http://localhost:3000/api/v1/users/u1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Нове імя"}'

# Повністю замінити (PUT)
curl -X PUT http://localhost:3000/api/v1/users/u1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Нове імя", "email": "new@example.com"}'

# Видалити користувача
curl -X DELETE http://localhost:3000/api/v1/users/u1
```

---

## QUESTIONS

```bash
# Отримати всі питання (фільтр по pollId)
curl "http://localhost:3000/api/v1/questions?pollId=p1"

# Отримати одне питання
curl http://localhost:3000/api/v1/questions/QUESTION_ID

# Створити питання
curl -X POST http://localhost:3000/api/v1/questions \
  -H "Content-Type: application/json" \
  -d '{
    "pollId": "p1",
    "text": "Як оцінюєш якість навчання?",
    "type": "text"
  }'

# Оновити питання (PATCH)
curl -X PATCH http://localhost:3000/api/v1/questions/QUESTION_ID \
  -H "Content-Type: application/json" \
  -d '{"text": "Оновлений текст питання"}'

# Видалити питання
curl -X DELETE http://localhost:3000/api/v1/questions/QUESTION_ID
```

---

## RESPONSES

```bash
# Отримати відповіді (фільтр по pollId або questionId)
curl "http://localhost:3000/api/v1/responses?pollId=p1"
curl "http://localhost:3000/api/v1/responses?questionId=QUESTION_ID"

# Залишити відповідь
curl -X POST http://localhost:3000/api/v1/responses \
  -H "Content-Type: application/json" \
  -d '{
    "pollId": "p1",
    "questionId": "QUESTION_ID",
    "userId": "u2",
    "answer": "Добре"
  }'

# Оновити відповідь (PATCH)
curl -X PATCH http://localhost:3000/api/v1/responses/RESPONSE_ID \
  -H "Content-Type: application/json" \
  -d '{"answer": "Відмінно"}'

# Видалити відповідь
curl -X DELETE http://localhost:3000/api/v1/responses/RESPONSE_ID
```

---

## ANALYTICS

```bash
# Статистика по опитуванню
curl http://localhost:3000/api/v1/analytics/polls/p1/stats

# Деталі опитування з питаннями і відповідями
curl http://localhost:3000/api/v1/analytics/polls/p1/details

# Пошук опитувань (безпечний — параметризований запит)
curl "http://localhost:3000/api/v1/analytics/polls/search-safe?q=навч"

# Пошук опитувань (вразливий — демо SQL Injection)
curl "http://localhost:3000/api/v1/analytics/polls/search?q=test"
```

---

## PUT vs PATCH — різниця

| | PUT | PATCH |
|---|---|---|
| Що робить | Повністю замінює об'єкт | Оновлює лише вказані поля |
| Обов'язкові поля | Всі | Тільки ті що змінюєш |
| Якщо поле не вказати | Скидається або помилка | Залишається як було |

```bash
# PUT — треба передати ВСІ поля, інакше можуть скинутись
curl -X PUT http://localhost:3000/api/v1/polls/p1 \
  -H "Content-Type: application/json" \
  -d '{"title":"...", "description":"...", "endDate":"...", "visibility":"...", "authorId":"..."}'

# PATCH — достатньо одного поля
curl -X PATCH http://localhost:3000/api/v1/polls/p1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Тільки це поле зміниться"}'
```

---

## Seed дані (після npm run seed)

| Тип | IDs |
|-----|-----|
| Users | `u1` `u2` `u3` `u4` `u5` |
| Polls | `p1` `p2` `p3` |
