// Shared DTOs coming from the API
export interface Category {
  _id: string;
  name: string;
  count: number;
}

export interface CategoriesState {
  items: Category[];
  status: 'idle' | 'loading' | 'ready' | 'error';
  error?: string;
}

export interface RawQuestion {
  id: string;
  question: string;
  answers: string[];
}

export interface QuizState {
  questions: RawQuestion[];
  currentIndex: number;
  answers: Record<string, string>;
  status: 'idle' | 'loading' | 'ready' | 'error';
  error?: string;
}

export interface ResultsState {
  total: number;
  correct: number;
  breakdown: {
    id: string;
    chosen: string;
    correct: string;
    isCorrect: boolean;
  }[];
  status: 'idle' | 'loading' | 'ready' | 'error';
  error?: string;
}