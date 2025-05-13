// Import the mock config
import './mocks/config';
import { getCategories, getQuiz, scoreQuiz } from '../lib/api';

// Mock fetch globally
const fetchMock = jest.fn();
window.fetch = fetchMock;

describe('API', () => {
  beforeEach(() => {
    fetchMock.mockClear();
  });

  describe('getCategories', () => {
    it('should fetch categories from the API', async () => {
      const mockCategories = [
        { _id: '1', name: 'History', count: 10 },
        { _id: '2', name: 'Science', count: 15 }
      ];

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCategories)
      });

      const result = await getCategories();

      expect(fetchMock).toHaveBeenCalledWith('http://localhost:4000/api/categories');
      expect(result).toEqual(mockCategories);
    });

    it('should throw error when API call fails', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve('Server error')
      });

      await expect(getCategories()).rejects.toThrow('Server error');
    });
  });

  describe('getQuiz', () => {
    it('should fetch quiz questions with correct parameters', async () => {
      const mockQuestions = [
        { _id: '1', question: 'Test Q1', answers: ['A', 'B', 'C', 'D'], correct: 0 },
        { _id: '2', question: 'Test Q2', answers: ['A', 'B', 'C', 'D'], correct: 1 }
      ];

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockQuestions)
      });

      const result = await getQuiz('123', 5, 'medium');

      expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('http://localhost:4000/api/quiz'));
      expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('category=123'));
      expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('amount=5'));
      expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('difficulty=medium'));
      expect(result).toEqual(mockQuestions);
    });

    it('should throw error when quiz fetch fails', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve('Invalid category')
      });

      await expect(getQuiz('invalid', 5, 'easy')).rejects.toThrow('Invalid category');
    });
  });

  describe('scoreQuiz', () => {
    it('should submit answers and return score', async () => {
      const mockScore = {
        total: 5,
        correct: 4,
        breakdown: [true, true, true, true, false]
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockScore)
      });

      const answers = {
        'q1': '0',
        'q2': '1',
        'q3': '2',
        'q4': '3',
        'q5': '0'
      };
      const result = await scoreQuiz(answers);

      expect(fetchMock).toHaveBeenCalledWith('http://localhost:4000/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });
      expect(result).toEqual(mockScore);
    });

    it('should throw error when scoring fails', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve('Invalid answers')
      });

      const invalidAnswers = { 'invalid': '0' };
      await expect(scoreQuiz(invalidAnswers)).rejects.toThrow('Invalid answers');
    });
  });
});
