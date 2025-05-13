// FILE: frontend/src/lib/api.ts
import type { Category, RawQuestion } from '@app/types';
import { API_BASE_URL } from './config';

const BASE = API_BASE_URL + '/api';

/* ----------------------------- categories ----------------------------- */
export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${BASE}/categories`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/* ------------------------------- quizzes ------------------------------ */
export async function getQuiz(
  catId: string,
  amount = 10,
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<RawQuestion[]> {
  const url = new URL(`${BASE}/quiz`);
  url.searchParams.set('category',  catId);
  url.searchParams.set('amount',    String(amount));
  url.searchParams.set('difficulty', difficulty);
  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/* -------------------------------- score ------------------------------ */
export async function scoreQuiz(
  answers: Record<string, string>
): Promise<{ total: number; correct: number; breakdown: any[] }> {
  const res = await fetch(`${BASE}/score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}