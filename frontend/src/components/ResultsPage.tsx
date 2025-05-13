import { useLocation, useNavigate } from 'react-router-dom';

interface ScoreData {
  total: number;
  correct: number;
  breakdown: {
    id: string;
    chosen: string;
    correct: string;
    isCorrect: boolean;
  }[];
}

export default function ResultsPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const data      = location.state as ScoreData | undefined;

  if (!data)
    return (
      <p style={{ textAlign: 'center', marginTop: 40 }}>
        Results unavailable.{' '}
        <button onClick={() => navigate('/')} style={{ color: '#2563eb' }}>
          Start a new quiz
        </button>
      </p>
    );

  const pct       = (data.correct / data.total) * 100;
  const barColour =
    pct < 40 ? '#dc2626' : pct < 80 ? '#facc15' : '#16a34a';

  return (
    <section style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
      <h1>Results</h1>

      {/* progress bar */}
      <div
        style={{
          height: 8,
          width: '100%',
          background: '#e5e7eb',
          borderRadius: 4,
          overflow: 'hidden',
          marginBottom: 24
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            background: barColour,
            height: '100%'
          }}
        />
      </div>

      <p style={{ fontSize: 20 }}>
        You scored {data.correct} of {data.total}
      </p>

      <ul style={{ listStyle: 'none', padding: 0, marginTop: 32 }}>
        {data.breakdown.map(b => (
          <li
            key={b.id}
            style={{
              padding: '12px 16px',
              margin: '8px 0',
              border: `1px solid ${b.isCorrect ? '#16a34a' : '#dc2626'}`,
              background: b.isCorrect ? '#f0fdf4' : '#fef2f2',
              borderRadius: 6,
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: b.chosen }} />
            {!b.isCorrect && (
              <span
                style={{ color: '#16a34a' }}
                dangerouslySetInnerHTML={{ __html: b.correct }}
              />
            )}
          </li>
        ))}
      </ul>

      <button
        onClick={() => navigate('/')}
        style={{
          marginTop: 32,
          background: '#0f172a',
          color: '#fff',
          border: 'none',
          padding: '12px 24px',
          borderRadius: 6,
          fontSize: 16,
          cursor: 'pointer'
        }}
      >
        Start a new quiz
      </button>
    </section>
  );
}