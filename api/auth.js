import { consumeRateLimit, getDatabase } from './_lib/db.js';
import {
  clearSessionCookie,
  createSessionValue,
  getAdminConfig,
  getIdentityRateLimitKey,
  getRateLimitKey,
  isSameOrigin,
  readJsonBody,
  readSession,
  requireMethod,
  sendJson,
  setSessionCookie,
  verifyPassword,
} from './_lib/http.js';

export default async function handler(req, res) {
  const config = getAdminConfig();
  if (req.method === 'GET') {
    return sendJson(res, 200, { authenticated: Boolean(readSession(req, config)) });
  }
  if (!requireMethod(req, res, 'POST')) return;
  if (!isSameOrigin(req)) return sendJson(res, 403, { error: 'This request could not be accepted.' });

  const parsed = readJsonBody(req, 2048);
  if (parsed.error) return sendJson(res, 400, { error: parsed.error });
  const { action } = parsed.body ?? {};

  if (action === 'logout') {
    clearSessionCookie(res, req);
    return sendJson(res, 200, { authenticated: false });
  }
  if (action !== 'login') return sendJson(res, 400, { error: 'Unsupported action.' });
  if (!config) return sendJson(res, 503, { error: 'Admin sign-in is not configured yet.' });

  const { username, password } = parsed.body ?? {};
  if (typeof username !== 'string' || typeof password !== 'string' || username.length > 120 || password.length > 256) {
    return sendJson(res, 401, { error: 'Username or password is incorrect.' });
  }

  try {
    const sql = await getDatabase();
    const ipKey = getRateLimitKey(req, 'login-ip', config.secret);
    if (!await consumeRateLimit(sql, { key: ipKey, limit: 6, windowSeconds: 900 })) {
      return sendJson(res, 429, { error: 'Too many sign-in attempts. Please wait 15 minutes before trying again.' });
    }

    const validUsername = username === config.username;
    const validPassword = verifyPassword(password, config.passwordHash);
    if (!validUsername || !validPassword) {
      const accountKey = getIdentityRateLimitKey('login-account', config.username, config.secret);
      if (!await consumeRateLimit(sql, { key: accountKey, limit: 20, windowSeconds: 900 })) {
        return sendJson(res, 429, { error: 'Too many failed sign-in attempts. Please wait 15 minutes before trying again.' });
      }
      return sendJson(res, 401, { error: 'Username or password is incorrect.' });
    }

    setSessionCookie(res, createSessionValue(config.username, config.secret), req);
    return sendJson(res, 200, { authenticated: true, username: config.username });
  } catch (error) {
    console.error('Admin sign-in failed.');
    return sendJson(res, 503, { error: 'Sign-in is temporarily unavailable. Check the database configuration and try again.' });
  }
}
