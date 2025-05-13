import resultsReducer, {
  submitResults,
  reset
} from '../app/slices/resultsSlice';

describe('results slice', () => {
  const initialState = {
    total: 0,
    correct: 0,
    breakdown: [],
    status: 'idle'
  };

  it('should return initial state', () => {
    expect(resultsReducer(undefined, { type: undefined })).toEqual(initialState);
  });

  it('should handle reset', () => {
    const state = {
      total: 2,
      correct: 1,
      breakdown: [
        { id: '1', chosen: 'A', correct: 'A', isCorrect: true },
        { id: '2', chosen: 'B', correct: 'C', isCorrect: false }
      ],
      status: 'ready'
    };
    expect(resultsReducer(state, reset())).toEqual(initialState);
  });

  it('should handle pending state', () => {
    const action = { type: submitResults.pending.type };
    const state = resultsReducer(initialState, action);
    expect(state.status).toBe('loading');
  });

  it('should handle fulfilled state', () => {
    const mockResults = {
      total: 2,
      correct: 1,
      breakdown: [
        { id: '1', chosen: 'A', correct: 'A', isCorrect: true },
        { id: '2', chosen: 'B', correct: 'C', isCorrect: false }
      ]
    };
    
    const action = {
      type: submitResults.fulfilled.type,
      payload: mockResults
    };
    
    const state = resultsReducer(initialState, action);
    expect(state.status).toBe('ready');
    expect(state.total).toBe(2);
    expect(state.correct).toBe(1);
    expect(state.breakdown).toEqual(mockResults.breakdown);
  });

  it('should handle rejected state', () => {
    const action = {
      type: submitResults.rejected.type,
      error: { message: 'Failed to submit' }
    };
    const state = resultsReducer(initialState, action);
    expect(state.status).toBe('error');
    expect(state.error).toBe('Failed to submit');
  });
});
