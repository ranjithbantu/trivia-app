import request from 'supertest';
import app from '../app';
import Question from '../models/Question';

describe('POST /api/quiz/score', () => {
  beforeAll(async () => {
    await Question.create([
      {
        _id: 'test1',
        category: '9',
        difficulty: 'easy',
        question: 'Test Question 1?',
        correct: 'Correct Answer 1',
        answers: ['Wrong 1', 'Correct Answer 1', 'Wrong 2', 'Wrong 3']
      },
      {
        _id: 'test2',
        category: '9',
        difficulty: 'easy',
        question: 'Test Question 2?',
        correct: 'Correct Answer 2',
        answers: ['Wrong 1', 'Correct Answer 2', 'Wrong 2', 'Wrong 3']
      }
    ]);
  });

  it('calculates score correctly for all correct answers', async () => {
    const res = await request(app)
      .post('/api/quiz/score')
      .send({
        answers: {
          'test1': 'Correct Answer 1',
          'test2': 'Correct Answer 2'
        }
      });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      total: 2,
      correct: 2,
      breakdown: [
        {
          id: 'test1',
          chosen: 'Correct Answer 1',
          correct: 'Correct Answer 1',
          isCorrect: true
        },
        {
          id: 'test2',
          chosen: 'Correct Answer 2',
          correct: 'Correct Answer 2',
          isCorrect: true
        }
      ]
    });
  });

  it('calculates score correctly for mixed answers', async () => {
    const res = await request(app)
      .post('/api/quiz/score')
      .send({
        answers: {
          'test1': 'Correct Answer 1',
          'test2': 'Wrong 1'
        }
      });

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    expect(res.body.correct).toBe(1);
    expect(res.body.breakdown).toHaveLength(2);
    expect(res.body.breakdown[0].isCorrect).toBe(true);
    expect(res.body.breakdown[1].isCorrect).toBe(false);
  });

  it('returns 400 for empty answers', async () => {
    const res = await request(app)
      .post('/api/quiz/score')
      .send({ answers: {} });

    expect(res.status).toBe(400);
  });
});
