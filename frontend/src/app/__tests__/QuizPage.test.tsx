import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import QuizPage from '../components/QuizPage';
import quizReducer from '../app/slices/quizSlice';
import categoriesReducer from '../app/slices/categoriesSlice';
import resultsReducer from '../app/slices/resultsSlice';
import { act } from 'react-dom/test-utils';

const mockQuestions = [
  {
    id: '1',
    question: 'Test Question 1?',
    answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4']
  },
  {
    id: '2',
    question: 'Test Question 2?',
    answers: ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4']
  }
];

const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      quiz: quizReducer,
      categories: categoriesReducer,
      results: resultsReducer
    },
    preloadedState
  });
};

const renderWithProviders = (
  preloadedState = {
    quiz: {
      questions: mockQuestions,
      current: 0,
      finished: false,
      answers: {},
      status: 'ready'
    }
  }
) => {
  const store = createTestStore(preloadedState);
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<QuizPage />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
};

describe('<QuizPage />', () => {
  it('should render the first question', async () => {
    await act(async () => {
      renderWithProviders();
    });
    
    await waitFor(() => {
      expect(screen.getByText('Test Question 1?')).toBeInTheDocument();
      expect(screen.getByText('1 / 2')).toBeInTheDocument();
    });
  });

  it('should advance to next question when answer is selected', async () => {
    await act(async () => {
      renderWithProviders();
    });
    
    await waitFor(async () => {
      const firstAnswer = screen.getByText('Answer 1');
      fireEvent.click(firstAnswer);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Test Question 2?')).toBeInTheDocument();
      expect(screen.getByText('2 / 2')).toBeInTheDocument();
    });
  });

  it('should show loading state', async () => {
    renderWithProviders({
      quiz: {
        questions: [],
        current: 0,
        finished: false,
        answers: {},
        status: 'loading'
      }
    });
    
    await waitFor(() => {
      expect(screen.getByText('Loading quiz…')).toBeInTheDocument();
    });
  });

  it('should show error state', async () => {
    renderWithProviders({
      quiz: {
        questions: [],
        current: 0,
        finished: false,
        answers: {},
        status: 'error'
      }
    });
    
    await waitFor(() => {
      expect(screen.getByText(/couldn't load quiz/i)).toBeInTheDocument();
    });
  });
});
