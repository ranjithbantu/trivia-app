import { Router } from 'express';
import Question from '../models/Question.js';

const router = Router();

/* ─────────────────────────  GET /api/quiz  ──────────────────────────
   Query:
     • category   (required – Mongo id as number)
     • difficulty (optional – 'easy' | 'medium' | 'hard')
     • amount     (optional – 1-20, default 10)
   ------------------------------------------------------------------ */
router.get('/', async (req, res) => {
  try {
    const category   = Number(req.query.category);
    const difficulty = req.query.difficulty as ('easy' | 'medium' | 'hard' | undefined);
    const amount     = Math.min(Math.max(1, Number(req.query.amount || 10)), 20);

    if (isNaN(category)) {
      return res.status(400).json({ error: 'Invalid category id' });
    }

    /* helper to fetch a random sample */
    const fetchSample = async (filter: Record<string, unknown>) =>
      Question.aggregate([
        { $match: filter },
        { $sample: { size: amount } },
        { $project: { id: { $toString: '$_id' }, question: 1, answers: 1, _id: 0 } }
      ]);

    /* first attempt — honour difficulty if provided */
    const baseFilter: Record<string, unknown> = { category };
    if (difficulty) baseFilter.difficulty = difficulty;

    let questions = await fetchSample(baseFilter);

    /* fallback — drop difficulty filter if nothing returned */
    if (!questions.length && difficulty) {
      questions = await fetchSample({ category });
    }

    if (!questions.length) {
      return res.status(404).json({ error: 'No questions found for these criteria' });
    }

    res.json(questions);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;