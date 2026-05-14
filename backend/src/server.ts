import { runMigrations } from './db/database.js';
import app from './app.js';

runMigrations();

const PORT = process.env['PORT'] ? parseInt(process.env['PORT']) : 3000;

app.listen(PORT, () => {
  console.log(`\x1b[36m✓ Server running at http://localhost:${PORT}\x1b[0m`);
  console.log(`\x1b[36m✓ Swagger UI:   http://localhost:${PORT}/api/docs\x1b[0m`);
});
