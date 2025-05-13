import request from 'supertest';
import app from '../app';
import Category from '../models/Category';
import Question from '../models/Question';

describe('GET /api/quiz', () => {
  beforeAll(async () => {
    await Category.create({ _id: 99, name: 'Test', total: 3 });
    await Question.create([
      {
        _id: 'q1',
        category: 99,
        difficulty: 'easy',
        question: 'A?',
        correct: '1',
        answers: ['1', '2', '3', '4']
      },
      {
        _id: 'q2',
        category: 99,
        difficulty: 'easy',
        question: 'B?',
        correct: '2',
        answers: ['1', '2', '3', '4']
      }
    ]);
  });

  it('returns requested number of questions without exposing the correct answer', async () => {
    const res = await request(app)
      .get('/api/quiz')
      .query({ category: 99, difficulty: 'easy', amount: 2 });

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).not.toHaveProperty('correct');
  });
});