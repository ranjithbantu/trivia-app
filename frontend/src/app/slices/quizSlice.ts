// FILE: frontend/src/app/slices/quizSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RawQuestion } from '../types';
import { getQuiz }     from '@lib/api';

/* ------------------------------------------------------------------ */
/* State                                                              */
/* ------------------------------------------------------------------ */
interface State {
  questions: RawQuestion[];
  current:   number;
  finished:  boolean;
  answers:   Record<string,string>;
  status:    'idle'|'loading'|'ready'|'error';
}

const initialState: State = {
  questions: [],
  current:   0,
  finished:  false,
  answers:   {},
  status:    'idle'
};

/* ------------------------------------------------------------------ */
/* Thunks                                                             */
/* ------------------------------------------------------------------ */
export const fetchQuiz = createAsyncThunk(
  'quiz/fetch',
  async ({ category, difficulty, amount }:
         { category:string; difficulty:'easy'|'medium'|'hard'; amount:number }) =>
    await getQuiz(category, difficulty, amount)
);

/* ------------------------------------------------------------------ */
/* Slice                                                              */
/* ------------------------------------------------------------------ */
const slice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    choose(state, action: PayloadAction<{id:string;answer:string}>) {
      state.answers[action.payload.id] = action.payload.answer;
      state.current = Math.min(state.current + 1, state.questions.length - 1);
      state.finished = Object.keys(state.answers).length === state.questions.length;
    },
    reset: () => initialState
  },
  extraReducers: b => {
    b.addCase(fetchQuiz.pending,   s => { s.status = 'loading'; });
    b.addCase(fetchQuiz.fulfilled, (s,a) => {
      s.questions = a.payload;
      s.status    = 'ready';
    });
    b.addCase(fetchQuiz.rejected,  s => { s.status = 'error'; });
  }
});

export const { choose, reset } = slice.actions;
export default slice.reducer;