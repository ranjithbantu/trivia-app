// FILE: frontend/src/components/QuizPage.tsx      ← UPDATED FILE
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

/* ------------------------------------------------------------------ */
/* types                                                               */
/* ------------------------------------------------------------------ */
interface Question {
  id: string;
  question: string;
  answers: string[];
}

interface ScoreResponse {
  total: number;
  correct: number;
  breakdown: {
    id: string;
    chosen: string;
    correct: string;
    isCorrect: boolean;
  }[];
}

interface QuizState {
  questions: Question[];
  currentIndex: number;
  answers: Record<string, string>;
  loading: boolean;
  error?: string;
}

/* ------------------------------------------------------------------ */
/* component                                                           */
/* ------------------------------------------------------------------ */
export default function QuizPage() {
  const navigate                   = useNavigate();
  const { id: categoryId }         = useParams<{ id: string }>();
  const [search]                   = useSearchParams();
  const difficulty                 = search.get('d') ?? undefined;
  const amount                     = search.get('n') ?? undefined;

  const [state, setState]          = useState<QuizState>({
    questions   : [],
    currentIndex: 0,
    answers     : {},
    loading     : true
  });

  /* fetch questions ------------------------------------------------- */
  useEffect(() => {
    if (!categoryId) return;

    (async () => {
      try {
        setState(s => ({ ...s, loading: true, error: undefined }));

        const url = new URL('/api/quiz', window.location.origin);
        url.searchParams.set('category', categoryId);
        if (difficulty) url.searchParams.set('difficulty', difficulty);
        if (amount)     url.searchParams.set('amount', amount);

        const res  = await fetch(url);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load questions');

        setState({
          questions   : data as Question[],
          currentIndex: 0,
          answers     : {},
          loading     : false
        });
      } catch (err) {
        setState({
          questions   : [],
          currentIndex: 0,
          answers     : {},
          loading     : false,
          error       :
            err instanceof Error ? err.message : 'Could not load questions.'
        });
      }
    })();
  }, [categoryId, difficulty, amount]);

  /* submit to backend ---------------------------------------------- */
  const submitQuiz = async (answers: Record<string, string>) => {
    try {
      setState(s => ({ ...s, loading: true }));
      const res = await fetch('/api/score', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ answers })
      });
      const data: ScoreResponse = await res.json();
      if (!res.ok) throw new Error(data as unknown as string);
      navigate('/results', { state: data });
    } catch (err) {
      setState(s => ({
        ...s,
        loading: false,
        error  :
          err instanceof Error ? err.message : 'Could not submit answers.'
      }));
    }
  };

  /* handle answer --------------------------------------------------- */
  const handleAnswer = (answer: string) => {
    setState(s => {
      const q        = s.questions[s.currentIndex];
      const answers  = { ...s.answers, [q.id]: answer };
      const next     = s.currentIndex + 1;

      if (next === s.questions.length) {
        submitQuiz(answers);
        return { ...s, answers }; // stay; loader appears
      }
      return { ...s, answers, currentIndex: next };
    });
  };

  /* ui states ------------------------------------------------------- */
  if (state.error)
    return (
      <div className="mt-20 text-center text-red-600">
        {state.error}
        <div className="mt-4">
          <button onClick={() => navigate('/')} className="btn-primary">
            Back to start
          </button>
        </div>
      </div>
    );

  if (state.loading)
    return (
      <div className="flex flex-col items-center mt-24">
        <div className="h-10 w-10 rounded-full border-4 border-t-blue-600 border-blue-200 animate-spin" />
        <p className="mt-4 text-gray-600">Loading…</p>
      </div>
    );

  if (!state.questions.length)
    return (
      <div className="mt-20 text-center">
        <p>No questions found for these criteria</p>
        <button onClick={() => navigate('/')} className="btn-primary mt-4">
          Back to start
        </button>
      </div>
    );

  /* main render ----------------------------------------------------- */
  const q         = state.questions[state.currentIndex];
  const progress  = ((state.currentIndex + 1) / state.questions.length) * 100;

  return (
    <div className="flex justify-center pt-12 px-4">
      <section className="card">
        {/* progress bar */}
        <div className="w-full h-2 bg-zinc-200 rounded overflow-hidden mb-6">
          <span
            style={{ width: `${progress}%` }}
            className="block h-full bg-gradient-to-r from-blue-500 to-sky-400 transition-all"
          />
        </div>

        {/* question text */}
        <p className="text-sm text-gray-500 mb-1">
          Question {state.currentIndex + 1} of {state.questions.length}
        </p>

        <h2
          className="text-2xl font-bold mb-6 leading-snug"
          dangerouslySetInnerHTML={{ __html: q.question }}
        />

        {/* answers */}
        <div className="space-y-4">
          {q.answers.map(ans => (
            <button
              key={ans}
              onClick={() => handleAnswer(ans)}
              className="w-full text-left px-5 py-3 rounded-lg border
                         border-slate-300 bg-white hover:bg-blue-50
                         hover:border-blue-400 shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-400
                         transition-colors"
              dangerouslySetInnerHTML={{ __html: ans }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}