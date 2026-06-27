import { app } from './app.js';
import { env } from './config/env.js';
import { pool } from './db/pool.js';

const server = app.listen(env.port, () => {
  console.log(`API listening on http://localhost:${env.port}`);
  console.log(`Swagger docs at http://localhost:${env.port}/api-docs`);
});

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

async function shutdown() {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}
