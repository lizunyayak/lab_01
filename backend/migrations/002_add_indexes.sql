-- Indexes for typical search/sort/filter patterns.
-- authorId: frequent filter on /api/polls?authorId=
-- visibility: frequent filter on /api/polls?visibility=
-- pollId on questions/responses: used to list by poll
-- userId/questionId on responses: used to filter by participant
CREATE INDEX IF NOT EXISTS idx_polls_authorId     ON polls(authorId);
CREATE INDEX IF NOT EXISTS idx_polls_visibility   ON polls(visibility);
CREATE INDEX IF NOT EXISTS idx_questions_pollId   ON questions(pollId);
CREATE INDEX IF NOT EXISTS idx_responses_pollId   ON responses(pollId);
CREATE INDEX IF NOT EXISTS idx_responses_userId   ON responses(userId);
CREATE INDEX IF NOT EXISTS idx_responses_qId      ON responses(questionId);
