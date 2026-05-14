import { getDb } from '../db/database.js';
import { notFound } from '../types/api.js';

export interface QuestionWithStats {
  id: string;
  text: string;
  order: number;
  responseCount: number;
}

export interface PollDetails {
  id: string;
  title: string;
  description: string;
  endDate: string;
  visibility: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  questions: QuestionWithStats[];
}

export interface PollStats {
  pollId: string;
  title: string;
  totalResponses: number;
  totalQuestions: number;
  avgResponsesPerQuestion: number;
  uniqueParticipants: number;
}

export interface PollSearchResult {
  id: string;
  title: string;
  visibility: string;
  authorId: string;
  endDate: string;
}

export class AnalyticsService {
  // JOIN: poll + author + questions with response count per question
  getPollDetails(pollId: string): PollDetails {
    const poll = getDb()
      .prepare(
        `SELECT p.*, u.name AS authorName
         FROM polls p
         JOIN users u ON u.id = p.authorId
         WHERE p.id = '${pollId}'`
      )
      .get() as (PollDetails & { authorName: string }) | undefined;

    if (!poll) throw notFound('Poll', pollId);

    const questions = getDb()
      .prepare(
        `SELECT q.id, q.text, q."order",
                COUNT(r.id) AS responseCount
         FROM questions q
         LEFT JOIN responses r ON r.questionId = q.id
         WHERE q.pollId = '${pollId}'
         GROUP BY q.id
         ORDER BY q."order" ASC`
      )
      .all() as QuestionWithStats[];

    return {
      id:          poll.id,
      title:       poll.title,
      description: poll.description,
      endDate:     poll.endDate,
      visibility:  poll.visibility,
      authorId:    poll.authorId,
      authorName:  poll.authorName,
      createdAt:   poll.createdAt,
      questions
    };
  }

  // Aggregation: per-poll summary with COUNT / AVG
  getPollStats(pollId: string): PollStats {
    const row = getDb()
      .prepare(
        `SELECT
           p.id                                          AS pollId,
           p.title,
           COUNT(DISTINCT r.id)                          AS totalResponses,
           COUNT(DISTINCT q.id)                          AS totalQuestions,
           ROUND(
             CAST(COUNT(DISTINCT r.id) AS REAL) /
             NULLIF(COUNT(DISTINCT q.id), 0), 2
           )                                             AS avgResponsesPerQuestion,
           COUNT(DISTINCT r.userId)                      AS uniqueParticipants
         FROM polls p
         LEFT JOIN questions q ON q.pollId = p.id
         LEFT JOIN responses r ON r.pollId = p.id
         WHERE p.id = '${pollId}'
         GROUP BY p.id`
      )
      .get() as PollStats | undefined;

    if (!row) throw notFound('Poll', pollId);
    return row;
  }

  // ⚠ SQLi DEMO — raw string concat, NO escaping intentionally.
  // Example of a dangerous input: ' OR '1'='1
  // Full exploit: ?q=' OR '1'='1  →  WHERE title LIKE '%%' OR '1'='1'%'
  // This returns ALL polls regardless of their actual title.
  searchPollsUnsafe(q: string): PollSearchResult[] {
    const sql = `SELECT id, title, visibility, authorId, endDate
                 FROM polls
                 WHERE title LIKE '%${q}%'
                 ORDER BY createdAt DESC
                 LIMIT 20`;
    return getDb().prepare(sql).all() as PollSearchResult[];
  }
}

export const analyticsService = new AnalyticsService();
