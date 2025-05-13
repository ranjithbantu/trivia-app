import './mocks/config';
import { configureStore } from '@reduxjs/toolkit';
import categoriesReducer, { 
  fetchCategories,
  selectCategories,
  selectCategoriesStatus,
  Category
} from '../app/slices/categoriesSlice';
import quizReducer from '../app/slices/quizSlice';
import resultsReducer from '../app/slices/resultsSlice';
import type { RootState } from '../app/store';
import type { AppDispatch } from '../app/store';

// Mock the fetch function
const mockFetch = jest.fn();
window.fetch = mockFetch;

const createTestStore = () => {
  return configureStore({
    reducer: {
      categories: categoriesReducer,
      quiz: quizReducer,
      results: resultsReducer
    }
  });
};

describe('categoriesSlice', () => {
  let store: {
    dispatch: AppDispatch;
    getState: () => RootState;
  };

  beforeEach(() => {
    store = createTestStore();
    mockFetch.mockClear();
  });

  describe('fetchCategories', () => {
    it('should handle successful fetch', async () => {
      const mockCategories: Category[] = [
        { _id: '1', name: 'History', count: 10 },
        { _id: '2', name: 'Science', count: 15 }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCategories)
      });

      await store.dispatch(fetchCategories());

      expect(selectCategories(store.getState())).toEqual(mockCategories);
      expect(selectCategoriesStatus(store.getState())).toBe('ready');
    });

    it('should handle fetch failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve('Failed to fetch')
      });

      await store.dispatch(fetchCategories());

      expect(selectCategories(store.getState())).toEqual([]);
      expect(selectCategoriesStatus(store.getState())).toBe('error');
    });
  });
});
