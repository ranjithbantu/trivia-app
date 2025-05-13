// ----------------------------------------------------------------------------
// Categories slice – keeps the category list (with live `count`) in global
// state.  The thunk fetches from GET /api/categories.
// ----------------------------------------------------------------------------

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getCategories }                                from '@lib/api';
import type { RootState }                               from '../store';

/* -------------------------------------------------------------------------- */
/* types                                                                      */
/* -------------------------------------------------------------------------- */
export interface Category {
  _id:   string;
  name:  string;
  count: number;
}

interface CategoriesState {
  items:  Category[];
  status: 'idle' | 'loading' | 'ready' | 'error';
}

/* -------------------------------------------------------------------------- */
/* initial                                                                    */
/* -------------------------------------------------------------------------- */
const initialState: CategoriesState = {
  items : [],
  status: 'idle'
};

/* -------------------------------------------------------------------------- */
/* thunk                                                                      */
/* -------------------------------------------------------------------------- */
export const fetchCategories = createAsyncThunk(
  'categories/fetch',
  async () => await getCategories()
);

/* -------------------------------------------------------------------------- */
/* slice                                                                      */
/* -------------------------------------------------------------------------- */
const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    reset: () => initialState
  },
  extraReducers: builder => {
    builder
      .addCase(fetchCategories.pending,  s => void (s.status = 'loading'))
      .addCase(fetchCategories.rejected, s => void (s.status = 'error'))
      .addCase(
        fetchCategories.fulfilled,
        (s, a: PayloadAction<Category[]>) => {
          s.items  = a.payload;
          s.status = 'ready';
        }
      );
  }
});

/* -------------------------------------------------------------------------- */
/* selectors                                                                  */
/* -------------------------------------------------------------------------- */
export const selectCategories       = (state: RootState) => state.categories.items;
export const selectCategoriesStatus = (state: RootState) => state.categories.status;

/* -------------------------------------------------------------------------- */
export const { reset } = categoriesSlice.actions;
export default categoriesSlice.reducer;