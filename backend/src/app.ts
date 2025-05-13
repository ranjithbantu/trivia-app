import express from 'express';
import cors    from 'cors';

import categoriesRouter from './routes/categories';
import quizRouter       from './routes/quiz';
import scoreRouter      from './routes/score';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/categories', categoriesRouter);
app.use('/api/quiz',       quizRouter);
app.use('/api/score',      scoreRouter);

export default app;