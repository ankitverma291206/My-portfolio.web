import { consumeRateLimit, getDatabase } from './_lib/db.js';
import { getAdminConfig, getRateLimitKey, isSameOrigin, readJsonBody, requireMethod, sendJson } from './_lib/http.js';

const trackedPaths = new Set(['/', '/#home', '/#about', '/#work', '/#path', '/#notes', '/#contact']);

export default async function handler(req, res) {
  if (!requireMethod(req, res, 'POST')) return;
  if (!isSameOrigin(req)) return sendJson(res, 403, { error: 'This request could not be accepted.' });
  const parsed = readJsonBody(req, 1024);
  if (parsed.error) return sendJson(res, 400, { error: parsed.error });

  const { path } = parsed.body ?? {};
  if (typeof path !== 'string' || !trackedPaths.has(path)) return sendJson(res, 400, { error: 'Unrecognized page.' });

  try {
    const sql = await getDatabase();
    const config = getAdminConfig();
    const key = getRateLimitKey(req, 'page-view', config?.secret ?? process.env.DATABASE_URL);
    if (!await consumeRateLimit(sql, { key, limit: 300, windowSeconds: 3600 })) {
      res.statusCode = 204;
      res.setHeader('Cache-Control', 'no-store');
      return res.end();
    }
    await sql`INSERT INTO portfolio_page_views (path) VALUES (${path})`;
    res.statusCode = 204;
    res.setHeader('Cache-Control', 'no-store');
    res.end();
  } catch (error) {
    console.error('Page-view recording failed.');
    return sendJson(res, 503, { error: 'Analytics are temporarily unavailable.' });
  }
}
