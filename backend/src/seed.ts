import 'dotenv/config';
import mongoose from 'mongoose';
import shuffle from './utils/shuffle';
import { decode } from 'html-entities';

import Category from './models/Category';
import Question from './models/Question';

const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/trivia';

interface TriviaCategory {
  id: number;
  name: string;
}

interface TriviaQuestion {
  category: number;
  type: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

interface TriviaResponse {
  response_code: number;
  results: TriviaQuestion[];
}

async function fetchWithRetry(url: string, retries = 3): Promise<TriviaResponse> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.response_code === 0) return data;
      await new Promise(r => setTimeout(r, 1000)); // Wait 1s between retries
    } catch (err) {
      if (i === retries - 1) throw err;
    }
  }
  return { response_code: 1, results: [] };
}

async function main() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅  Mongo connected');

    // Clear existing data
    await Promise.all([
      Category.deleteMany({}),
      Question.deleteMany({})
    ]);
    console.log('🧹  cleared old data');

    // Fetch categories
    const res = await fetch('https://opentdb.com/api_category.php');
    const data = await res.json() as { trivia_categories: TriviaCategory[] };
    
    // Create categories
    for (const cat of data.trivia_categories) {
      await Category.create({
        _id: cat.id,
        name: decode(cat.name),
        count: 0
      });
    }
    console.log(`🗂️  ${data.trivia_categories.length} categories inserted`);

    // Fetch questions for each category
    for (const cat of data.trivia_categories) {
      for (const diff of ['easy', 'medium', 'hard'] as const) {
        const url = new URL('https://opentdb.com/api.php');
        url.searchParams.set('amount', '20');
        url.searchParams.set('category', String(cat.id));
        url.searchParams.set('difficulty', diff);
        url.searchParams.set('type', 'multiple');

        const { results: questions } = await fetchWithRetry(url.toString());
        
        if (!questions.length) {
          console.log(`–  ${cat.name} (${diff}) 0 questions – skipped`);
          continue;
        }

        // Insert questions with decoded HTML entities and shuffled answers
        const docs = questions.map(q => {
          const correct = decode(q.correct_answer);
          const incorrect = q.incorrect_answers.map(a => decode(a));
          return {
            _id: new mongoose.Types.ObjectId().toString(), // Generate unique MongoDB ID
            category: cat.id,
            difficulty: q.difficulty,
            question: decode(q.question),
            correct: correct,
            answers: shuffle([correct, ...incorrect])
          };
        });

        // Filter out any duplicates based on question text
        const uniqueDocs = docs.filter((doc, index, self) =>
          index === self.findIndex((d) => d.question === doc.question)
        );

        await Question.insertMany(uniqueDocs);
        await Category.updateOne(
          { _id: cat.id },
          { $inc: { count: uniqueDocs.length } }
        );

        console.log(`❓  ${cat.name} (${diff}) ${uniqueDocs.length} inserted`);
        
        // Wait a bit between requests to avoid rate limiting
        await new Promise(r => setTimeout(r, 1500));
      }
    }

    console.log('🎉  Seed complete');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();