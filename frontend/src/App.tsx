// FILE: frontend/src/App.tsx                                      ← UPDATED FILE
import { Provider } from 'react-redux';
import { store }    from '@app/store';

import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom';

import StartPage   from '@components/StartPage';
import QuizPage    from '@components/QuizPage';
import ResultsPage from '@components/ResultsPage';

/* --------------------------------------------------------------- */

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/"         element={<StartPage   />} />
          <Route path="/quiz/:id" element={<QuizPage    />} />
          <Route path="/results"  element={<ResultsPage />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}