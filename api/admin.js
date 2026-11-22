import { getDatabase } from './_lib/db.js';
import { getAdminConfig, isSameOrigin, readJsonBody, readSession, requireMethod, sendJson } from './_lib/http.js';

export default async function handler(req, res) {
  const config = getAdminConfig();
  const session = readSession(req, config);
  if (!session) return sendJson(res, 401, { error: 'Sign in to view the dashboard.' });

  if (req.method === 'POST') {
    if (!isSameOrigin(req)) return sendJson(res, 403, { error: 'This request could not be accepted.' });
    const parsed = readJsonBody(req, 1024);
    if (parsed.error) return sendJson(res, 400, { error: parsed.error });
    const { action, id } = parsed.body ?? {};
    if (action !== 'read' || typeof id !== 'string' || !/^\d{1,20}$/.test(id)) {
      return sendJson(res, 400, { error: 'Invalid message update.' });
    }
    try {
      const sql = await getDatabase();
      await sql`UPDATE portfolio_messages SET read_at = COALESCE(read_at, NOW()) WHERE id = ${id}`;
      return sendJson(res, 200, { ok: true });
    } catch (error) {
      console.error('Message update failed.');
      return sendJson(res, 503, { error: 'The message could not be updated right now.' });
    }
  }
  if (!requireMethod(req, res, 'GET')) return;

  try {
    const sql = await getDatabase();
    const [counts, pages, messages, recentViews, messageCounts] = await Promise.all([
      sql`SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE viewed_at >= (DATE_TRUNC('day', NOW() AT TIME ZONE 'Asia/Kolkata') AT TIME ZONE 'Asia/Kolkata'))::int AS today
        FROM portfolio_page_views`,
      sql`SELECT path, COUNT(*)::int AS views, MAX(viewed_at) AS last_viewed
        FROM portfolio_page_views GROUP BY path ORDER BY views DESC, last_viewed DESC LIMIT 12`,
      sql`SELECT id::text AS id, name, email, message, received_at, read_at
        FROM portfolio_messages ORDER BY received_at DESC LIMIT 100`,
      sql`SELECT path, viewed_at FROM portfolio_page_views ORDER BY viewed_at DESC LIMIT 24`,
      sql`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE read_at IS NULL)::int AS unread
        FROM portfolio_messages`,
    ]);

    return sendJson(res, 200, {
      username: session.sub,
      pageViews: { total: Number(counts[0]?.total ?? 0), today: Number(counts[0]?.today ?? 0) },
      messageCounts: { total: Number(messageCounts[0]?.total ?? 0), unread: Number(messageCounts[0]?.unread ?? 0) },
      pages: pages.map((page) => ({ ...page, views: Number(page.views) })),
      messages: messages.map((message) => ({ ...message, unread: !message.read_at })),
      recentViews,
    });
  } catch (error) {
    console.error('Admin dashboard load failed.');
    return sendJson(res, 503, { error: 'The dashboard could not load. Check the database configuration and try again.' });
  }
}
