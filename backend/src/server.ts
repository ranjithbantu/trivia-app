import 'dotenv/config';
import express  from 'express';
import cors     from 'cors';
import mongoose from 'mongoose';

import categoriesRouter from './routes/categories';
import quizRouter       from './routes/quiz';
import scoreRouter      from './routes/score';   // ← NEW

/* ───────────────────────── constants ───────────────────────── */

const PORT      = Number(process.env.PORT) || 4000;
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/trivia';

/* ───────────────────────── bootstrap ───────────────────────── */

async function start(): Promise<void> {
  await mongoose.connect(MONGO_URI);
  console.log('✅  Mongo connected');

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/api/categories', categoriesRouter);
  app.use('/api/quiz',        quizRouter);
  app.use('/api/score',       scoreRouter);      // ← NEW

  /* 404 fallback */
  app.all('*', (_req, res): void => {
    res.status(404).json({ error: 'Not found' });
  });

  app.listen(PORT, () => console.log(`🚀  API listening on :${PORT}`));
}

start().catch(err => { console.error(err); process.exit(1); });