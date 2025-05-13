import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import type { PreloadedState } from '@reduxjs/toolkit';

import categoriesReducer from '@app/slices/categoriesSlice';
import quizReducer from '@app/slices/quizSlice';
import resultsReducer from '@app/slices/resultsSlice';
import type { CategoriesState, QuizState, ResultsState } from '@app/types';

export interface TestState {
  categories?: Partial<CategoriesState>;
  quiz?: Partial<QuizState>;
  results?: Partial<ResultsState>;
}

export const createTestStore = (preloadedState: TestState = {}) => {
  return configureStore({
    reducer: {
      categories: categoriesReducer,
      quiz: quizReducer,
      results: resultsReducer
    },
    preloadedState: {
      categories: {
        status: 'idle',
        items: [],
        ...(preloadedState.categories || {})
      } as CategoriesState,
      quiz: {
        status: 'idle',
        questions: [],
        currentIndex: 0,
        answers: {},
        ...(preloadedState.quiz || {})
      } as QuizState,
      results: {
        status: 'idle',
        total: 0,
        correct: 0,
        breakdown: [],
        ...(preloadedState.results || {})
      } as ResultsState
    } as PreloadedState<any>
  });
};

export const renderWithProviders = (
  ui: React.ReactElement,
  preloadedState: TestState = {}
) => {
  const store = createTestStore(preloadedState);
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </Provider>
  );
};
