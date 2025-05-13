import quizReducer, {
  fetchQuiz,
  choose,
  reset
} from '../app/slices/quizSlice';

describe('quiz slice', () => {
  const initialState = {
    questions: [],
    current: 0,
    finished: false,
    answers: {},
    status: 'idle'
  };

  it('should return initial state', () => {
    expect(quizReducer(undefined, { type: undefined })).toEqual(initialState);
  });

  it('should handle reset', () => {
    const state = {
      questions: [{ id: '1', question: 'Q1', answers: ['A', 'B', 'C', 'D'] }],
      current: 1,
      finished: true,
      answers: { '1': 'A' },
      status: 'ready'
    };
    expect(quizReducer(state, reset())).toEqual(initialState);
  });

  it('should handle choose action', () => {
    const state = {
      ...initialState,
      questions: [
        { id: '1', question: 'Q1', answers: ['A', 'B', 'C', 'D'] },
        { id: '2', question: 'Q2', answers: ['A', 'B', 'C', 'D'] }
      ],
      status: 'ready'
    };

    const nextState = quizReducer(state, choose({ id: '1', answer: 'B' }));
    expect(nextState.answers).toEqual({ '1': 'B' });
    expect(nextState.current).toBe(1);
    expect(nextState.finished).toBe(false);

    // Second answer should mark as finished
    const finalState = quizReducer(nextState, choose({ id: '2', answer: 'C' }));
    expect(finalState.answers).toEqual({ '1': 'B', '2': 'C' });
    expect(finalState.current).toBe(1);
    expect(finalState.finished).toBe(true);
  });

  it('should handle pending state', () => {
    const action = { type: fetchQuiz.pending.type };
    const state = quizReducer(initialState, action);
    expect(state.status).toBe('loading');
  });

  it('should handle fulfilled state', () => {
    const mockQuestions = [
      { id: '1', question: 'Q1', answers: ['A', 'B', 'C', 'D'] }
    ];
    
    const action = {
      type: fetchQuiz.fulfilled.type,
      payload: mockQuestions
    };
    
    const state = quizReducer(initialState, action);
    expect(state.status).toBe('ready');
    expect(state.questions).toEqual(mockQuestions);
  });

  it('should handle rejected state', () => {
    const action = { type: fetchQuiz.rejected.type };
    const state = quizReducer(initialState, action);
    expect(state.status).toBe('error');
  });
});
