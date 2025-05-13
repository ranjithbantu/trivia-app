// UPDATED FILE: backend/src/models/QuizSession.ts
import { Schema, model } from 'mongoose';

export interface IQuizSession {
  quizId: string;
  answers: Map<string, string>;
  createdAt: Date;
}

const QuizSessionSchema = new Schema<IQuizSession>({
  quizId: { type: String, unique: true },
  answers: { type: Map, of: String },
  createdAt: { type: Date, default: Date.now, expires: 3600 }
});

export const QuizSession = model<IQuizSession>('QuizSession', QuizSessionSchema);