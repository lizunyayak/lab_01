import { runMigrations, getDb } from '../src/db/database.js';

const db = () => getDb();

function run(): void {
  runMigrations();

  const now = new Date().toISOString();
  const d = (offset: number) => {
    const dt = new Date();
    dt.setDate(dt.getDate() + offset);
    return dt.toISOString().split('T')[0];
  };

  // ── Users ────────────────────────────────────────────────────────────────
  const users = [
    { id: 'u1', name: 'Олена Коваленко', email: 'olena@example.com' },
    { id: 'u2', name: 'Іван Петренко',   email: 'ivan@example.com'  },
    { id: 'u3', name: 'Марія Шевченко', email: 'maria@example.com' },
    { id: 'u4', name: 'Андрій Бойко',   email: 'andriy@example.com'},
    { id: 'u5', name: 'Тетяна Мороз',   email: 'tetyana@example.com'},
  ];
  for (const u of users) {
    db().exec(
      `INSERT OR IGNORE INTO users (id, name, email, createdAt)
       VALUES ('${u.id}', '${u.name}', '${u.email}', '${now}')`
    );
  }
  console.log('[seed] users inserted');

  // ── Polls ────────────────────────────────────────────────────────────────
  const polls = [
    { id: 'p1', title: 'Задоволеність навчанням',    visibility: 'public',     authorId: 'u1', endDate: d(30)  },
    { id: 'p2', title: 'Якість лабораторних робіт', visibility: 'restricted', authorId: 'u1', endDate: d(15)  },
    { id: 'p3', title: 'Побажання на наступний семестр', visibility: 'public', authorId: 'u2', endDate: d(60) },
  ];
  for (const p of polls) {
    db().exec(
      `INSERT OR IGNORE INTO polls (id, title, description, endDate, visibility, authorId, createdAt)
       VALUES ('${p.id}', '${p.title}', '', '${p.endDate}', '${p.visibility}', '${p.authorId}', '${now}')`
    );
  }
  console.log('[seed] polls inserted');

  // ── Questions ────────────────────────────────────────────────────────────
  const questions = [
    { id: 'q1', pollId: 'p1', text: 'Чи задоволені ви якістю лекцій?',     order: 1 },
    { id: 'q2', pollId: 'p1', text: 'Чи достатньо практичних занять?',     order: 2 },
    { id: 'q3', pollId: 'p1', text: 'Що найбільше сподобалось у курсі?',   order: 3 },
    { id: 'q4', pollId: 'p2', text: 'Наскільки складні лабораторні?',      order: 1 },
    { id: 'q5', pollId: 'p2', text: 'Чи зрозуміле завдання до кожної лаб?', order: 2 },
    { id: 'q6', pollId: 'p3', text: 'Які теми хочете вивчити додатково?',  order: 1 },
    { id: 'q7', pollId: 'p3', text: 'Ваші пропозиції щодо формату занять?',order: 2 },
  ];
  for (const q of questions) {
    db().exec(
      `INSERT OR IGNORE INTO questions (id, pollId, text, "order", createdAt)
       VALUES ('${q.id}', '${q.pollId}', '${q.text}', ${q.order}, '${now}')`
    );
  }
  console.log('[seed] questions inserted');

  // ── Responses ────────────────────────────────────────────────────────────
  const responses = [
    { id: 'r1',  pollId: 'p1', questionId: 'q1', userId: 'u2', answer: 'Так, дуже задоволений' },
    { id: 'r2',  pollId: 'p1', questionId: 'q1', userId: 'u3', answer: 'Загалом так' },
    { id: 'r3',  pollId: 'p1', questionId: 'q1', userId: 'u4', answer: 'Не дуже' },
    { id: 'r4',  pollId: 'p1', questionId: 'q2', userId: 'u2', answer: 'Достатньо' },
    { id: 'r5',  pollId: 'p1', questionId: 'q2', userId: 'u3', answer: 'Хотілося б більше' },
    { id: 'r6',  pollId: 'p1', questionId: 'q3', userId: 'u2', answer: 'Практичні задачі' },
    { id: 'r7',  pollId: 'p2', questionId: 'q4', userId: 'u3', answer: 'Середня складність' },
    { id: 'r8',  pollId: 'p2', questionId: 'q4', userId: 'u4', answer: 'Складні, але цікаві' },
    { id: 'r9',  pollId: 'p2', questionId: 'q5', userId: 'u3', answer: 'Так, завдання зрозуміле' },
    { id: 'r10', pollId: 'p3', questionId: 'q6', userId: 'u5', answer: 'Хмарні технології' },
  ];
  for (const r of responses) {
    db().exec(
      `INSERT OR IGNORE INTO responses (id, pollId, questionId, userId, answer, createdAt)
       VALUES ('${r.id}', '${r.pollId}', '${r.questionId}', '${r.userId}', '${r.answer}', '${now}')`
    );
  }
  console.log('[seed] responses inserted');
  console.log('[seed] done — 5 users, 3 polls, 7 questions, 10 responses');
}

run();
