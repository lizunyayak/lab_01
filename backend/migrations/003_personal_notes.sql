-- Migration 003: Personal Notes table for IDOR demonstration (Lab 05)
CREATE TABLE IF NOT EXISTS personal_notes (
  id          TEXT PRIMARY KEY,
  ownerUserId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL CHECK(length(title) >= 1),
  content     TEXT NOT NULL DEFAULT '',
  createdAt   TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_personal_notes_owner ON personal_notes(ownerUserId);
