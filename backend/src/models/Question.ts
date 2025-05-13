import { Schema, model } from 'mongoose';

/* TypeScript interface ---------------------------------------------------- */
export interface QuestionDoc {
  _id: string;
  category: number;  // Store category as number to match Category model
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  answers: string[];
  correct: string;
}

/* Mongoose schema --------------------------------------------------------- */
const schema = new Schema<QuestionDoc>({
  _id: { type: String, required: true },
  category: { type: Number, required: true, index: true },
  difficulty: { type: String, required: true, enum: ['easy', 'medium', 'hard'] },
  question: { type: String, required: true },
  answers: {
    type: [String],
    required: true,
    validate: [(val: string[]) => val.length === 4, 'answers must have exactly 4 options']
  },
  correct: { type: String, required: true }
}, {
  _id: false, // Use provided _id
  timestamps: true
});

// Ensure question text is unique to prevent duplicates
schema.index({ question: 1 }, { unique: true });

export default model<QuestionDoc>('Question', schema);