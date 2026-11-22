import { neon } from '@neondatabase/serverless';

let schemaInitialization;

export async function getDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured.');
  }

  const sql = neon(process.env.DATABASE_URL);
  if (!schemaInitialization) {
    schemaInitialization = initializeSchema(sql).catch((error) => {
      schemaInitialization = undefined;
      throw error;
    });
  }
  await schemaInitialization;
  return sql;
}

async function initializeSchema(sql) {
  await sql`CREATE TABLE IF NOT EXISTS portfolio_messages (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    email VARCHAR(254) NOT NULL,
    message TEXT NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at TIMESTAMPTZ
  )`;
  await sql`CREATE INDEX IF NOT EXISTS portfolio_messages_received_at_idx
    ON portfolio_messages (received_at DESC)`;

  await sql`CREATE TABLE IF NOT EXISTS portfolio_page_views (
    id BIGSERIAL PRIMARY KEY,
    path VARCHAR(200) NOT NULL,
    viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await sql`CREATE INDEX IF NOT EXISTS portfolio_page_views_viewed_at_idx
    ON portfolio_page_views (viewed_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS portfolio_page_views_path_idx
    ON portfolio_page_views (path)`;

  await sql`CREATE TABLE IF NOT EXISTS portfolio_rate_limits (
    key VARCHAR(64) PRIMARY KEY,
    window_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    attempts INTEGER NOT NULL DEFAULT 0
  )`;
}

export async function consumeRateLimit(sql, { key, limit, windowSeconds }) {
  await sql`DELETE FROM portfolio_rate_limits
    WHERE window_started_at < NOW() - INTERVAL '24 hours'`;
  const rows = await sql`
    INSERT INTO portfolio_rate_limits (key, window_started_at, attempts)
    VALUES (${key}, NOW(), 1)
    ON CONFLICT (key) DO UPDATE SET
      attempts = CASE
        WHEN portfolio_rate_limits.window_started_at < NOW() - (${windowSeconds} * INTERVAL '1 second') THEN 1
        ELSE portfolio_rate_limits.attempts + 1
      END,
      window_started_at = CASE
        WHEN portfolio_rate_limits.window_started_at < NOW() - (${windowSeconds} * INTERVAL '1 second') THEN NOW()
        ELSE portfolio_rate_limits.window_started_at
      END
    RETURNING attempts
  `;
  return Number(rows[0]?.attempts ?? 0) <= limit;
}
