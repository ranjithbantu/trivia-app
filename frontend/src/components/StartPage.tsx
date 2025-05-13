import { FormEvent, useEffect, useState } from 'react';
import { useNavigate }                    from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@app/hooks';
import { fetchCategories }                from '@app/slices/categoriesSlice';

/* ──────────────────────────────────────────────────────────── */
/*  Constants                                                  */
/* ──────────────────────────────────────────────────────────── */
const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
const DIFF_COLORS  = ['#22c55e', '#eab308', '#ef4444'] as const;

/* ──────────────────────────────────────────────────────────── */
/*  Component                                                  */
/* ──────────────────────────────────────────────────────────── */
export default function StartPage() {
  const dispatch                 = useAppDispatch();
  const navigate                 = useNavigate();
  const { items, status }        = useAppSelector(s => s.categories);

  const [catId , setCatId ]      = useState('');
  const [diff  , setDiff  ]      = useState(0);      // 0-easy 1-medium 2-hard
  const [amount, setAmount]      = useState(5);

  /* fetch categories once ─────────────────────────────────── */
  useEffect(() => {
    if (status === 'idle') dispatch(fetchCategories());
  }, [dispatch, status]);

  /* derived data ───────────────────────────────────────────── */
  const available  = items.filter(c => c.count > 0);      // 👍 hide empty sets
  const cat        = available.find(c => c._id === catId);
  const max        = cat?.count ?? 20;                    // default max per API
  const ready      = status === 'ready';

  /* handle submit ─────────────────────────────────────────── */
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!catId) return;
    navigate(
      `/quiz/${catId}?d=${DIFFICULTIES[diff]}&n=${amount}`
    );
  };

  /* loading + error states ────────────────────────────────── */
  if (status === 'loading' || status === 'idle')
    return (
      <p className="mt-20 text-center text-xl">
        Loading categories…
      </p>
    );

  if (status === 'error')
    return (
      <p className="mt-20 text-center text-xl text-red-600">
        Couldn’t load categories.
      </p>
    );

  /* main UI ───────────────────────────────────────────────── */
  return (
    <main className="flex items-start justify-center pt-12 min-h-full">
      {/* card */}
      <section
        className="w-full max-w-md p-8 rounded-xl shadow-xl
                   bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-100
                   backdrop-blur"
      >
        <h1 className="text-3xl font-bold text-center mb-8">
          Quiz Challenge
        </h1>

        <form onSubmit={submit} className="space-y-8">
          {/* category select */}
          <div className="space-y-2">
            <label
              htmlFor="category"
              className="block font-semibold tracking-wide"
            >
              Choose a category
            </label>

            <select
              id="category"
              className="w-full rounded-md border px-4 py-2 focus:ring-2
                         focus:ring-indigo-500"
              value={catId}
              onChange={e => { setCatId(e.target.value); setAmount(5); }}
            >
              <option value="" disabled>
                Select a category…
              </option>

              {available.map(c => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.count})
                </option>
              ))}
            </select>
          </div>

          {/* difficulty slider */}
          <div className="space-y-2">
            <label
              htmlFor="diff"
              className="font-semibold block"
            >
              Difficulty: <span className="capitalize">
                {DIFFICULTIES[diff]}
              </span>
            </label>

            <input
              id="diff"
              type="range"
              min={0}
              max={2}
              step={1}
              value={diff}
              onChange={e => setDiff(+e.target.value)}
              style={{ accentColor: DIFF_COLORS[diff] }}
              className="w-full range-track"
            />
          </div>

          {/* amount slider */}
          <div className="space-y-2">
            <label
              htmlFor="amt"
              className="font-semibold block"
            >
              Questions: {amount}
            </label>

            <input
              id="amt"
              type="range"
              min={1}
              max={Math.min(max, 20)}
              value={amount}
              onChange={e => setAmount(+e.target.value)}
              className="w-full range-track"
            />

            {cat && (
              <p className="mt-1 text-xs text-slate-500">
                {cat.name} contains {cat.count}&nbsp;question
                {cat.count !== 1 && 's'}.
              </p>
            )}
          </div>

          {/* submit */}
          <button
            type="submit"
            disabled={!catId || !ready}
            className="btn-primary"
          >
            Create quiz
          </button>
        </form>
      </section>
    </main>
  );
}