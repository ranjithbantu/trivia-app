/* eslint-disable no-console */
import 'dotenv/config';
import mongoose from 'mongoose';
import { decode } from 'html-entities';

import shuffle   from './utils/shuffle.js';
import Category  from './models/Category.js';
import Question  from './models/Question.js';

/* ───────────────────────── constants ───────────────────────── */
const MONGO_URI =
  process.env.MONGO_URI ?? 'mongodb://mongo:27017/trivia';

interface TriviaCategory { id: number; name: string }
interface TriviaQuestion  {
  category: number;
  type: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}
interface TriviaResponse {
  response_code: number;
  results: TriviaQuestion[];
}

/* ───────────────────────── helpers ─────────────────────────── */
async function fetchWithRetry(url: string, retries = 3): Promise<TriviaResponse> {
  for (let i = 0; i < retries; i++) {
    try {
      const res  = await fetch(url);
      const data = await res.json() as TriviaResponse;
      if (data.response_code === 0) return data;
    } catch (err) {
      if (i === retries - 1) throw err;
    }
    await new Promise(r => setTimeout(r, 1_000));        // 1 s back-off
  }
  return { response_code: 1, results: [] };
}

/* ───────────────────────── main seeder ─────────────────────── */
async function seedDatabase(): Promise<void> {
  await mongoose.connect(MONGO_URI);
  console.log('✅  Mongo connected');

  await Promise.all([Category.deleteMany({}), Question.deleteMany({})]);
  console.log('🧹  cleared old data');

  const catRes = await fetch('https://opentdb.com/api_category.php');
  const { trivia_categories } =
    await catRes.json() as { trivia_categories: TriviaCategory[] };

  /* insert categories first */
  for (const c of trivia_categories) {
    await Category.create({ _id: c.id, name: decode(c.name), count: 0 });
  }
  console.log(`🗂️  ${trivia_categories.length} categories inserted`);

  /* fetch questions per category / difficulty */
  for (const cat of trivia_categories) {
    for (const diff of ['easy', 'medium', 'hard'] as const) {
      const url = new URL('https://opentdb.com/api.php');
      url.searchParams.set('amount',     '20');
      url.searchParams.set('category',   String(cat.id));
      url.searchParams.set('difficulty', diff);
      url.searchParams.set('type',       'multiple');

      const { results } = await fetchWithRetry(url.toString());
      if (!results.length) {
        console.log(`–  ${cat.name} (${diff}) 0 questions – skipped`);
        continue;
      }

      const docs = results.map(q => {
        const correct   = decode(q.correct_answer);
        const incorrect = q.incorrect_answers.map(a => decode(a));
        return {
          _id       : new mongoose.Types.ObjectId().toString(),
          category  : cat.id,
          difficulty: q.difficulty,
          question  : decode(q.question),
          correct,
          answers   : shuffle([correct, ...incorrect]),
        };
      });

      /* avoid duplicates by question text */
      const unique = docs.filter(
        (d, i, arr) => i === arr.findIndex(x => x.question === d.question)
      );

      await Question.insertMany(unique);
      await Category.updateOne({ _id: cat.id }, { $inc: { count: unique.length } });

      console.log(`❓  ${cat.name} (${diff}) ${unique.length} inserted`);
      await new Promise(r => setTimeout(r, 1_500));      // gentle rate-limit
    }
  }

  console.log('🎉  Seed complete');
}

/* Script-mode execution ─────────────────────────────────────── */
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => mongoose.disconnect());
}

export default seedDatabase;