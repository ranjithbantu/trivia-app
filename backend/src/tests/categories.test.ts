import request from 'supertest';
import app from '../app';
import Category from '../models/Category';

describe('GET /api/categories', () => {
  beforeAll(async () => {
    await Category.create({ _id: '1', name: 'Art' });
  });

  it('responds with an array of categories', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: '1',
          name: 'Art',
          count: expect.any(Number)
        })
      ])
    );
  });
});