import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@app/hooks';
import { fetchCategories } from '@app/slices/categoriesSlice';

export default function CategoryList() {
  const dispatch = useAppDispatch();
  const { items, status } = useAppSelector(s => s.categories);

  /* first load ------------------------------------------------------------- */
  useEffect(() => {
    if (status === 'idle') dispatch(fetchCategories());
  }, [dispatch, status]);

  /* ui states -------------------------------------------------------------- */
  if (status === 'loading') return <h2>Loading…</h2>;
  if (status === 'error')
    return (
      <p style={{ color: 'crimson' }}>
        Couldn’t load categories. Please retry.
      </p>
    );

  /* ready ------------------------------------------------------------------ */
  return (
    <ul style={{ lineHeight: 1.7 }}>
      {items.map((c: { _id: Key | null | undefined; name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }) => (
        <li key={c._id}>
          <Link to={`/quiz/${c._id}`}>{c.name}</Link>
        </li>
      ))}
    </ul>
  );
}