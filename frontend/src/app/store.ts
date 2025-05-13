import { configureStore } from '@reduxjs/toolkit';
import categoriesReducer from '@app/slices/categoriesSlice';
import quizReducer       from '@app/slices/quizSlice';
import resultsReducer    from '@app/slices/resultsSlice';

/* --------------------------------------------------------------- */

export const store = configureStore({
  reducer: {
    categories: categoriesReducer,
    quiz      : quizReducer,
    results   : resultsReducer
  }
});

/* typed helpers -------------------------------------------------- */
export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;