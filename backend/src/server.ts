/* eslint-disable no-console */
import 'dotenv/config';
import express  from 'express';
import cors     from 'cors';
import mongoose from 'mongoose';

import categoriesRouter from './routes/categories.js';
import quizRouter       from './routes/quiz.js';
import scoreRouter      from './routes/score.js';

/* ───────────────────────── constants ───────────────────────── */
const PORT      = Number(process.env.PORT) || 4000;
const MONGO_URI =
  process.env.MONGO_URI ?? 'mongodb://mongo:27017/trivia';

/* ───────────────────────── bootstrap ───────────────────────── */
async function startServer(): Promise<void> {
  await mongoose.connect(MONGO_URI);
  console.log('✅  Mongo connected');

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/api/categories', categoriesRouter);
  app.use('/api/quiz',        quizRouter);
  app.use('/api/score',       scoreRouter);

  app.all('*', (_req, res) => res.status(404).json({ error: 'Not found' }));
  app.listen(PORT, () => console.log(`🚀  API listening on :${PORT}`));
}

/* Script-mode execution ─────────────────────────────────────── */
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer().catch(e => { console.error(e); process.exit(1); });
}

export default startServer;