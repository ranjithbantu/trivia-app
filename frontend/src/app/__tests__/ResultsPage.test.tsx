import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import ResultsPage from '../components/ResultsPage';
import quizReducer from '../app/slices/quizSlice';
import resultsReducer from '../app/slices/resultsSlice';
import { act } from 'react-dom/test-utils';

const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      quiz: quizReducer,
      results: resultsReducer
    },
    preloadedState
  });
};

const renderWithProviders = (preloadedState = {}) => {
  const store = createTestStore(preloadedState);
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<ResultsPage />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
};

describe('<ResultsPage />', () => {
  it('should show loading state', async () => {
    renderWithProviders({
      quiz: { answers: { '1': 'Answer 1' } },
      results: { status: 'loading' }
    });

    await waitFor(() => {
      expect(screen.getByText('Loading score...')).toBeInTheDocument();
    });
  });

  it('should show error state', async () => {
    await act(async () => {
      renderWithProviders({
        quiz: { answers: { '1': 'Answer 1' } },
        results: { status: 'error' }
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/couldn't load score/i)).toBeInTheDocument();
      expect(screen.getByText('Start again')).toBeInTheDocument();
    });
  });

  it('should display results correctly', async () => {
    await act(async () => {
      renderWithProviders({
        quiz: { answers: { '1': 'Answer 1', '2': 'Answer 2' } },
        results: {
          status: 'ready',
          total: 2,
          correct: 1,
          breakdown: [
            {
              id: '1',
              chosen: 'Answer 1',
              correct: 'Answer 1',
              isCorrect: true
            },
            {
              id: '2',
              chosen: 'Wrong Answer',
              correct: 'Answer 2',
              isCorrect: false
            }
          ]
        }
      });
    });

    await waitFor(() => {
      expect(screen.getByText('You scored 1 of 2')).toBeInTheDocument();
      expect(screen.getByText('Answer 1')).toBeInTheDocument();
      expect(screen.getByText('Wrong Answer')).toBeInTheDocument();
      expect(screen.getByText('Answer 2')).toBeInTheDocument();
      expect(screen.getByText('Start a new quiz')).toBeInTheDocument();
    });
  });

  it('should redirect to home if no answers are present', async () => {
    await act(async () => {
      renderWithProviders({
        quiz: { answers: {} },
        results: { status: 'idle' }
      });
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Loading score...')).not.toBeInTheDocument();
      expect(screen.queryByText('Results')).not.toBeInTheDocument();
    });
  });
});
