CREATE TABLE IF NOT EXISTS users (
  id        TEXT PRIMARY KEY,
  name      TEXT NOT NULL CHECK(length(name) >= 2),
  email     TEXT NOT NULL UNIQUE,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS polls (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL CHECK(length(title) >= 3),
  description TEXT NOT NULL DEFAULT '',
  endDate     TEXT NOT NULL,
  visibility  TEXT NOT NULL CHECK(visibility IN ('public','private','restricted')),
  authorId    TEXT NOT NULL,
  createdAt   TEXT NOT NULL,
  FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS questions (
  id        TEXT PRIMARY KEY,
  pollId    TEXT NOT NULL,
  text      TEXT NOT NULL CHECK(length(text) >= 3),
  "order"   INTEGER NOT NULL DEFAULT 1 CHECK("order" >= 1),
  createdAt TEXT NOT NULL,
  FOREIGN KEY (pollId) REFERENCES polls(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS responses (
  id         TEXT PRIMARY KEY,
  pollId     TEXT NOT NULL,
  questionId TEXT NOT NULL,
  userId     TEXT NOT NULL,
  answer     TEXT NOT NULL CHECK(length(answer) > 0),
  createdAt  TEXT NOT NULL,
  UNIQUE(userId, questionId),
  FOREIGN KEY (pollId)     REFERENCES polls(id)     ON DELETE CASCADE,
  FOREIGN KEY (questionId) REFERENCES questions(id) ON DELETE CASCADE,
  FOREIGN KEY (userId)     REFERENCES users(id)     ON DELETE CASCADE
);
