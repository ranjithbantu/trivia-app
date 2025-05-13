import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { scoreQuiz } from '@lib/api';
import type { RawQuestion } from '../types';

interface Breakdown {
  id:        string;
  chosen:    string;
  correct:   string;
  isCorrect: boolean;
}

interface State {
  total:      number;
  correct:    number;
  breakdown:  Breakdown[];
  status:     'idle' | 'loading' | 'ready' | 'error';
  error?:     string;
}

const initial: State = {
  total: 0,
  correct: 0,
  breakdown: [],
  status: 'idle'
};

export const submitResults = createAsyncThunk(
  'results/submit',
  async (answers: Record<string,string>) => await scoreQuiz(answers)
);

const slice = createSlice({
  name: 'results',
  initialState: initial,
  reducers: {
    reset: () => initial
  },
  extraReducers: b => {
    b.addCase(submitResults.pending,  s => { s.status = 'loading';             });
    b.addCase(submitResults.rejected, (s,a) => {
      s.status = 'error';
      s.error  = a.error.message;
    });
    b.addCase(submitResults.fulfilled, (s,a: PayloadAction<{
      total: number;
      correct: number;
      breakdown: Breakdown[];
    }>) => {
      s.status     = 'ready';
      s.total      = a.payload.total;
      s.correct    = a.payload.correct;
      s.breakdown  = a.payload.breakdown;
    });
  }
});

export const { reset } = slice.actions;
export default slice.reducer;