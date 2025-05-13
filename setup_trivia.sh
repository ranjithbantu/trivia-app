#!/usr/bin/env bash
set -euo pipefail

################################  paths  ################################
mkdir -p backend/src/models backend/src/routes frontend/src/app/slices
#########################################################################

############  docker-compose (root)  ####################################
cat > docker-compose.yml <<'YML'
version: "3.9"
services:
  mongo:
    image: mongo:7
    restart: unless-stopped
    ports: [ "27017:27017" ]
    volumes: [ mongo-data:/data/db ]

  backend:
    build: ./backend
    command: npm run dev
    volumes: [ ./backend:/app ]
    env_file: backend/.env.example
    depends_on: [ mongo ]
    ports: [ "4000:4000" ]

  frontend:
    build: ./frontend
    command: npm run dev -- --host
    volumes:
      - ./frontend:/app
      - /app/node_modules        # keep host-node_modules out
    ports: [ "5173:5173" ]
    depends_on: [ backend ]
volumes: { mongo-data: {} }
YML
#########################################################################

########################  backend  ######################################
cat > backend/Dockerfile <<'DOCKER'
FROM node:21-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 4000
CMD ["npm","run","dev"]
DOCKER

cat > backend/.env.example <<'ENV'
PORT=4000
MONGO_URI=mongodb://mongo:27017/trivia
ENV

# make seed.ts resilient to empty API pages
sed -i '' -e '/const { results }/c\const { results = [] } = await qsRes.json();\n  if (!results.length) continue;' \
  backend/src/seed.ts 2>/dev/null || true
#########################################################################

########################  frontend  #####################################
cat > frontend/Dockerfile <<'DOCKER'
FROM node:21-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 5173
CMD ["npm","run","dev","--","--host","0.0.0.0"]
DOCKER

cat > frontend/src/app/store.ts <<'TS'
import { configureStore } from '@reduxjs/toolkit';
import categoriesReducer from './slices/categoriesSlice';
import quizReducer from './slices/quizSlice';

export const store = configureStore({
  reducer: { categories: categoriesReducer, quiz: quizReducer },
});
export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
TS

cat > frontend/src/app/slices/categoriesSlice.ts <<'TS'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../store';

export interface Category { id: number; name: string }
interface State { list: Category[]; loading: boolean }
const initial: State = { list: [], loading: false };

export const fetchCategories = createAsyncThunk('categories/fetch', async () =>
  (await fetch('http://localhost:4000/api/categories')).json() as Promise<Category[]>
);

const slice = createSlice({
  name: 'categories',
  initialState: initial,
  reducers: {},
  extraReducers: b => {
    b.addCase(fetchCategories.pending,  s=>{s.loading = true});
    b.addCase(fetchCategories.fulfilled,(s,{payload})=>{s.loading = false; s.list = payload});
    b.addCase(fetchCategories.rejected, s=>{s.loading = false});
  }
});
export default slice.reducer;
export const selectCategories = (s:RootState)=>s.categories;
TS

cat > frontend/src/app/slices/quizSlice.ts <<'TS'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../store';

export interface QuizQ { id:string; question:string; options:string[] }
interface State { id?:string; q:QuizQ[]; score?:number; loading:boolean }
const initial: State = { q: [], loading: false };

export const createQuiz = createAsyncThunk('quiz/create',
  async (p:{category:number;difficulty:string;amount:number}) =>
    (await fetch(`http://localhost:4000/api/quiz?category=${p.category}&difficulty=${p.difficulty}&amount=${p.amount}`)).json()
);
export const submitQuiz = createAsyncThunk('quiz/submit',
  async (p:{id:string; responses:{questionId:string; answer:string}[]}) =>
    (await fetch('http://localhost:4000/api/quiz/score',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({quizId:p.id,responses:p.responses})})).json()
);

const slice=createSlice({
  name:'quiz', initialState:initial,
  reducers:{reset:()=>initial},
  extraReducers:b=>{
    b.addCase(createQuiz.pending,s=>{s.loading=true});
    b.addCase(createQuiz.fulfilled,(s,{payload})=>{s.loading=false;s.id=payload.quizId;s.q=payload.questions});
    b.addCase(submitQuiz.fulfilled,(s,{payload})=>{s.score=payload.correct});
  }
});
export const { reset } = slice.actions;
export default slice.reducer;
export const selectQuiz = (s:RootState)=>s.quiz;
TS

cat > frontend/src/App.tsx <<'TSX'
import { Provider } from 'react-redux';
import { store } from './app/store';

export default function App() {
  return (
    <Provider store={store}>
      {/* TODO: real UI goes here */}
      <h1 style={{textAlign:'center'}}>Redux wired ✔ – build UI now</h1>
    </Provider>
  );
}
TSX
#########################################################################

chmod +x backend/Dockerfile frontend/Dockerfile || true
echo -e "\n✅  Files written.\nRun:  docker compose up --build"
