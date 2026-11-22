import { consumeRateLimit, getDatabase } from './_lib/db.js';
import {
  getAdminConfig,
  getRateLimitKey,
  isSameOrigin,
  readJsonBody,
  requireMethod,
  sendJson,
} from './_lib/http.js';

export default async function handler(req, res) {
  if (!requireMethod(req, res, 'POST')) return;
  if (!isSameOrigin(req)) return sendJson(res, 403, { error: 'This request could not be accepted.' });

  const parsed = readJsonBody(req, 8192);
  if (parsed.error) return sendJson(res, 400, { error: parsed.error });

  const { name, email, message, website } = parsed.body ?? {};
  if (typeof website === 'string' && website.trim()) return sendJson(res, 201, { ok: true });
  if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') {
    return sendJson(res, 400, { error: 'Enter your name, email, and message.' });
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim();
  const cleanMessage = message.trim();
  if (cleanName.length < 1 || cleanName.length > 80) return sendJson(res, 400, { error: 'Name must be between 1 and 80 characters.' });
  if (cleanEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return sendJson(res, 400, { error: 'Enter a valid email address.' });
  if (cleanMessage.length < 8 || cleanMessage.length > 3000) return sendJson(res, 400, { error: 'Message must be between 8 and 3,000 characters.' });

  try {
    const sql = await getDatabase();
    const config = getAdminConfig();
    const key = getRateLimitKey(req, 'message', config?.secret ?? process.env.DATABASE_URL);
    const allowed = await consumeRateLimit(sql, { key, limit: 6, windowSeconds: 3600 });
    if (!allowed) return sendJson(res, 429, { error: 'Too many notes were sent from this connection. Please try again later.' });

    await sql`INSERT INTO portfolio_messages (name, email, message)
      VALUES (${cleanName}, ${cleanEmail}, ${cleanMessage})`;
    return sendJson(res, 201, { ok: true });
  } catch (error) {
    console.error('Message submission failed.');
    return sendJson(res, 503, { error: 'The note could not be saved right now. Please try again in a moment, or email Ankit directly.' });
  }
}
