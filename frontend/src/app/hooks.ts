import {
  TypedUseSelectorHook,
  useDispatch,
  useSelector
} from 'react-redux';
import type { RootState, AppDispatch } from '@app/store';

/* ------------------------------------------------------------------ */
/* typed aliases – always use these instead of raw useDispatch/useSelector */

export const useAppDispatch: () => AppDispatch = () =>
  useDispatch<AppDispatch>();

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;