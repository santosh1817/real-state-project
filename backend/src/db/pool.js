import pg from 'pg';
import { env } from '../config/env.js';

export const pool = new pg.Pool({
  connectionString: env.databaseUrl,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

export async function query(text, params) {
  const startedAt = Date.now();
  const result = await pool.query(text, params);
  if (env.nodeEnv === 'development' && Date.now() - startedAt > 250) {
    console.warn(`Slow query (${Date.now() - startedAt}ms):`, text);
  }
  return result;
}
