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
    { id: 'u1',  name: 'Олена Коваленко',   email: 'olena@example.com'    },
    { id: 'u2',  name: 'Іван Петренко',      email: 'ivan@example.com'     },
    { id: 'u3',  name: 'Марія Шевченко',     email: 'maria@example.com'    },
    { id: 'u4',  name: 'Андрій Бойко',       email: 'andriy@example.com'   },
    { id: 'u5',  name: 'Тетяна Мороз',       email: 'tetyana@example.com'  },
    { id: 'u6',  name: 'Василь Гриценко',    email: 'vasyl@example.com'    },
    { id: 'u7',  name: 'Наталія Кравченко',  email: 'natalia@example.com'  },
    { id: 'u8',  name: 'Дмитро Савченко',    email: 'dmytro@example.com'   },
    { id: 'u9',  name: 'Ярослава Ткаченко',  email: 'yaroslava@example.com'},
    { id: 'u10', name: 'Сергій Олійник',     email: 'serhiy@example.com'   },
    { id: 'u11', name: 'Людмила Власенко',   email: 'liudmyla@example.com' },
    { id: 'u12', name: 'Микола Пономаренко', email: 'mykola@example.com'   },
    { id: 'u13', name: 'Оксана Руденко',     email: 'oksana@example.com'   },
    { id: 'u14', name: 'Богдан Марченко',    email: 'bohdan@example.com'   },
    { id: 'u15', name: 'Ірина Назаренко',    email: 'iryna@example.com'    },
    { id: 'u16', name: 'Павло Захаренко',    email: 'pavlo@example.com'    },
    { id: 'u17', name: 'Аліна Литвиненко',   email: 'alina@example.com'    },
    { id: 'u18', name: 'Роман Тимченко',     email: 'roman@example.com'    },
    { id: 'u19', name: 'Вікторія Даниленко', email: 'viktoria@example.com' },
    { id: 'u20', name: 'Григорій Стець',     email: 'hryhoriy@example.com' },
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
    { id: 'p1',  title: 'Задоволеність навчанням',           visibility: 'public',     authorId: 'u1',  endDate: d(30)  },
    { id: 'p2',  title: 'Якість лабораторних робіт',         visibility: 'restricted', authorId: 'u1',  endDate: d(15)  },
    { id: 'p3',  title: 'Побажання на наступний семестр',    visibility: 'public',     authorId: 'u2',  endDate: d(60)  },
    { id: 'p4',  title: 'Оцінка викладача',                  visibility: 'private',    authorId: 'u2',  endDate: d(20)  },
    { id: 'p5',  title: 'Зручність розкладу',                visibility: 'public',     authorId: 'u3',  endDate: d(45)  },
    { id: 'p6',  title: 'Технічне забезпечення аудиторій',   visibility: 'public',     authorId: 'u3',  endDate: d(10)  },
    { id: 'p7',  title: 'Дистанційне навчання: за чи проти', visibility: 'public',     authorId: 'u4',  endDate: d(25)  },
    { id: 'p8',  title: 'Студентське самоврядування',        visibility: 'restricted', authorId: 'u4',  endDate: d(40)  },
    { id: 'p9',  title: 'Якість їжі в їдальні',              visibility: 'public',     authorId: 'u5',  endDate: d(5)   },
    { id: 'p10', title: 'Бібліотека: ресурси та доступ',     visibility: 'public',     authorId: 'u5',  endDate: d(35)  },
    { id: 'p11', title: 'Спортивна інфраструктура',          visibility: 'public',     authorId: 'u6',  endDate: d(50)  },
    { id: 'p12', title: 'Стипендіальна програма',            visibility: 'restricted', authorId: 'u6',  endDate: d(18)  },
    { id: 'p13', title: 'Іноземні мови у навчальному плані', visibility: 'public',     authorId: 'u7',  endDate: d(28)  },
    { id: 'p14', title: 'Практика та стажування',            visibility: 'public',     authorId: 'u7',  endDate: d(55)  },
    { id: 'p15', title: 'Курсові та дипломні роботи',        visibility: 'private',    authorId: 'u8',  endDate: d(90)  },
    { id: 'p16', title: 'Наукові гуртки та конференції',     visibility: 'public',     authorId: 'u8',  endDate: d(70)  },
    { id: 'p17', title: 'Студентське дозвілля',              visibility: 'public',     authorId: 'u9',  endDate: d(14)  },
    { id: 'p18', title: 'Цифровізація навчального процесу',  visibility: 'public',     authorId: 'u9',  endDate: d(42)  },
    { id: 'p19', title: 'Ментальне здоровʼя студентів',      visibility: 'restricted', authorId: 'u10', endDate: d(33)  },
    { id: 'p20', title: 'Вступна кампанія: відгуки',         visibility: 'public',     authorId: 'u10', endDate: d(22)  },
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
    // p1
    { id: 'q1',  pollId: 'p1',  text: 'Чи задоволені ви якістю лекцій?',          order: 1 },
    { id: 'q2',  pollId: 'p1',  text: 'Чи достатньо практичних занять?',           order: 2 },
    { id: 'q3',  pollId: 'p1',  text: 'Що найбільше сподобалось у курсі?',         order: 3 },
    // p2
    { id: 'q4',  pollId: 'p2',  text: 'Наскільки складні лабораторні?',            order: 1 },
    { id: 'q5',  pollId: 'p2',  text: 'Чи зрозуміле завдання до кожної лаб?',     order: 2 },
    // p3
    { id: 'q6',  pollId: 'p3',  text: 'Які теми хочете вивчити додатково?',        order: 1 },
    { id: 'q7',  pollId: 'p3',  text: 'Ваші пропозиції щодо формату занять?',      order: 2 },
    // p4
    { id: 'q8',  pollId: 'p4',  text: 'Чи пояснює викладач матеріал зрозуміло?',  order: 1 },
    { id: 'q9',  pollId: 'p4',  text: 'Чи доступний викладач для консультацій?',  order: 2 },
    // p5
    { id: 'q10', pollId: 'p5',  text: 'Чи зручний для вас поточний розклад?',     order: 1 },
    { id: 'q11', pollId: 'p5',  text: 'Скільки вільних вікон у вашому розкладі?', order: 2 },
    // p6
    { id: 'q12', pollId: 'p6',  text: 'Чи достатньо проєкторів в аудиторіях?',   order: 1 },
    { id: 'q13', pollId: 'p6',  text: 'Як оцінюєте якість інтернету на кампусі?', order: 2 },
    // p7
    { id: 'q14', pollId: 'p7',  text: 'Чи ефективне дистанційне навчання?',       order: 1 },
    { id: 'q15', pollId: 'p7',  text: 'Яка форма навчання для вас комфортніша?',  order: 2 },
    // p8
    { id: 'q16', pollId: 'p8',  text: 'Чи знаєте ви своїх представників у СС?',  order: 1 },
    // p9
    { id: 'q17', pollId: 'p9',  text: 'Як часто ви харчуєтесь в їдальні?',        order: 1 },
    { id: 'q18', pollId: 'p9',  text: 'Оцініть смакові якості страв (1–5)?',       order: 2 },
    // p10
    { id: 'q19', pollId: 'p10', text: 'Чи користуєтесь ви бібліотекою?',          order: 1 },
    { id: 'q20', pollId: 'p10', text: 'Яких ресурсів найбільше не вистачає?',     order: 2 },
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
    // p1 — 9 responses (most popular)
    { id: 'r1',  pollId: 'p1',  questionId: 'q1',  userId: 'u2',  answer: 'Так, дуже задоволений'      },
    { id: 'r2',  pollId: 'p1',  questionId: 'q1',  userId: 'u3',  answer: 'Загалом так'                },
    { id: 'r3',  pollId: 'p1',  questionId: 'q1',  userId: 'u4',  answer: 'Не дуже'                   },
    { id: 'r4',  pollId: 'p1',  questionId: 'q2',  userId: 'u2',  answer: 'Достатньо'                  },
    { id: 'r5',  pollId: 'p1',  questionId: 'q2',  userId: 'u3',  answer: 'Хотілося б більше'          },
    { id: 'r6',  pollId: 'p1',  questionId: 'q3',  userId: 'u2',  answer: 'Практичні задачі'           },
    { id: 'r7',  pollId: 'p1',  questionId: 'q3',  userId: 'u5',  answer: 'Командна робота'            },
    { id: 'r8',  pollId: 'p1',  questionId: 'q3',  userId: 'u6',  answer: 'Лекції з прикладами'        },
    { id: 'r9',  pollId: 'p1',  questionId: 'q1',  userId: 'u7',  answer: 'Так'                        },
    // p2 — 6 responses
    { id: 'r10', pollId: 'p2',  questionId: 'q4',  userId: 'u3',  answer: 'Середня складність'         },
    { id: 'r11', pollId: 'p2',  questionId: 'q4',  userId: 'u4',  answer: 'Складні, але цікаві'        },
    { id: 'r12', pollId: 'p2',  questionId: 'q5',  userId: 'u3',  answer: 'Так, завдання зрозуміле'    },
    { id: 'r13', pollId: 'p2',  questionId: 'q5',  userId: 'u8',  answer: 'Частково зрозуміле'         },
    { id: 'r14', pollId: 'p2',  questionId: 'q4',  userId: 'u9',  answer: 'Дуже складні'               },
    { id: 'r15', pollId: 'p2',  questionId: 'q5',  userId: 'u10', answer: 'Так'                        },
    // p3 — 5 responses
    { id: 'r16', pollId: 'p3',  questionId: 'q6',  userId: 'u5',  answer: 'Хмарні технології'          },
    { id: 'r17', pollId: 'p3',  questionId: 'q6',  userId: 'u11', answer: 'Кібербезпека'               },
    { id: 'r18', pollId: 'p3',  questionId: 'q7',  userId: 'u5',  answer: 'Більше практики'            },
    { id: 'r19', pollId: 'p3',  questionId: 'q7',  userId: 'u12', answer: 'Гібридний формат'           },
    { id: 'r20', pollId: 'p3',  questionId: 'q6',  userId: 'u13', answer: 'Машинне навчання'           },
    // p4 — 4 responses
    { id: 'r21', pollId: 'p4',  questionId: 'q8',  userId: 'u2',  answer: 'Так, дуже чітко'            },
    { id: 'r22', pollId: 'p4',  questionId: 'q9',  userId: 'u3',  answer: 'Завжди доступний'           },
    { id: 'r23', pollId: 'p4',  questionId: 'q8',  userId: 'u14', answer: 'Загалом так'                },
    { id: 'r24', pollId: 'p4',  questionId: 'q9',  userId: 'u15', answer: 'Лише на заняттях'           },
    // p5 — 4 responses
    { id: 'r25', pollId: 'p5',  questionId: 'q10', userId: 'u4',  answer: 'Так, зручний'               },
    { id: 'r26', pollId: 'p5',  questionId: 'q11', userId: 'u4',  answer: '2 вікна на день'            },
    { id: 'r27', pollId: 'p5',  questionId: 'q10', userId: 'u16', answer: 'Не дуже, занадто рано'      },
    { id: 'r28', pollId: 'p5',  questionId: 'q11', userId: 'u17', answer: '1 вікно'                    },
    // p6 — 3 responses
    { id: 'r29', pollId: 'p6',  questionId: 'q12', userId: 'u6',  answer: 'Достатньо'                  },
    { id: 'r30', pollId: 'p6',  questionId: 'q13', userId: 'u6',  answer: 'Середня якість'             },
    { id: 'r31', pollId: 'p6',  questionId: 'q12', userId: 'u18', answer: 'Не вистачає проєкторів'     },
    // p7 — 3 responses
    { id: 'r32', pollId: 'p7',  questionId: 'q14', userId: 'u7',  answer: 'Так, але з обмеженнями'     },
    { id: 'r33', pollId: 'p7',  questionId: 'q15', userId: 'u7',  answer: 'Змішана форма'             },
    { id: 'r34', pollId: 'p7',  questionId: 'q14', userId: 'u19', answer: 'Ні, краще офлайн'           },
    // p8 — 2 responses
    { id: 'r35', pollId: 'p8',  questionId: 'q16', userId: 'u8',  answer: 'Так, знаю'                  },
    { id: 'r36', pollId: 'p8',  questionId: 'q16', userId: 'u20', answer: 'Ні, не знаю'                },
    // p9 — 2 responses
    { id: 'r37', pollId: 'p9',  questionId: 'q17', userId: 'u9',  answer: 'Щодня'                      },
    { id: 'r38', pollId: 'p9',  questionId: 'q18', userId: 'u9',  answer: '3'                          },
    // p10 — 2 responses
    { id: 'r39', pollId: 'p10', questionId: 'q19', userId: 'u10', answer: 'Так, регулярно'             },
    { id: 'r40', pollId: 'p10', questionId: 'q20', userId: 'u10', answer: 'Електронних книг'           },
  ];
  for (const r of responses) {
    db().exec(
      `INSERT OR IGNORE INTO responses (id, pollId, questionId, userId, answer, createdAt)
       VALUES ('${r.id}', '${r.pollId}', '${r.questionId}', '${r.userId}', '${r.answer}', '${now}')`
    );
  }
  console.log('[seed] responses inserted');
  console.log('[seed] done — 20 users, 20 polls, 20 questions, 40 responses');
}

run();
