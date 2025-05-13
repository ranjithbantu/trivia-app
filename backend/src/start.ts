
import seedDatabase from './seed.js';
import startServer  from './server.js';

try {
  await seedDatabase();    
  await startServer();     
} catch (err) {
  console.error(err);
  process.exit(1);
}