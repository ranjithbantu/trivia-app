import { Router } from 'express';
import Question from '../models/Question';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const answers: Record<string, string> = req.body?.answers ?? {};
    const ids = Object.keys(answers);

    if (!ids.length) {
      return res.status(400).json({ error: 'No answers supplied' });
    }

    const questions = await Question
      .find({ _id: { $in: ids } })
      .select('correct')
      .sort({ _id: 1 })  // Ensure consistent order
      .lean();

    const breakdown = questions.map(q => {
      const id = String(q._id);
      const chosen = answers[id];
      const isCorrect = q.correct === chosen;

      return {
        id,
        chosen,
        correct: q.correct,
        isCorrect
      };
    });

    const correct = breakdown.filter(b => b.isCorrect).length;

    res.json({
      total: questions.length,
      correct,
      breakdown
    });
  } catch (err) {
    next(err);
  }
});

export default router;