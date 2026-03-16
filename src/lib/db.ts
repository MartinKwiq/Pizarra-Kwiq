import { sql } from '@vercel/postgres';

export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS clickup_tokens (
      user_id TEXT PRIMARY KEY,
      access_token TEXT NOT NULL,
      refresh_token TEXT,
      expires_at TIMESTAMP WITH TIME ZONE,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS task_positions (
      task_id TEXT PRIMARY KEY,
      x FLOAT NOT NULL,
      y FLOAT NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

export async function saveTaskPosition(taskId: string, x: number, y: number) {
  await sql`
    INSERT INTO task_positions (task_id, x, y)
    VALUES (${taskId}, ${x}, ${y})
    ON CONFLICT (task_id) 
    DO UPDATE SET 
      x = EXCLUDED.x,
      y = EXCLUDED.y,
      updated_at = CURRENT_TIMESTAMP;
  `;
}

export async function getAllTaskPositions() {
  const { rows } = await sql`SELECT task_id, x, y FROM task_positions`;
  return rows;
}

export async function saveTokens(userId: string, tokens: { access_token: string, refresh_token?: string, expires_in?: number }) {
  const expiresAt = tokens.expires_in 
    ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    : null;

  await sql`
    INSERT INTO clickup_tokens (user_id, access_token, refresh_token, expires_at)
    VALUES (${userId}, ${tokens.access_token}, ${tokens.refresh_token || null}, ${expiresAt})
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      access_token = EXCLUDED.access_token,
      refresh_token = COALESCE(EXCLUDED.refresh_token, clickup_tokens.refresh_token),
      expires_at = EXCLUDED.expires_at,
      updated_at = CURRENT_TIMESTAMP;
  `;
}

export async function getTokens(userId: string) {
  const { rows } = await sql`SELECT * FROM clickup_tokens WHERE user_id = ${userId} LIMIT 1`;
  return rows[0];
}
