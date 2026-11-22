import { createHmac, scryptSync, timingSafeEqual } from 'node:crypto';

const SESSION_SECONDS = 60 * 60 * 8;

export function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(JSON.stringify(payload));
}

export function requireMethod(req, res, method) {
  if (req.method === method) return true;
  res.setHeader('Allow', method);
  sendJson(res, 405, { error: 'Method not allowed.' });
  return false;
}

export function isSameOrigin(req) {
  const origin = req.headers.origin;
  const host = req.headers.host;
  if (typeof origin !== 'string' || typeof host !== 'string') return false;

  try {
    const originUrl = new URL(origin);
    if (originUrl.host.toLowerCase() !== host.toLowerCase()) return false;
    const fetchSite = req.headers['sec-fetch-site'];
    return fetchSite !== 'cross-site';
  } catch {
    return false;
  }
}

export function readJsonBody(req, maxBytes = 8192) {
  const contentType = req.headers['content-type'];
  if (typeof contentType !== 'string' || !contentType.toLowerCase().includes('application/json')) {
    return { error: 'Expected a JSON request.' };
  }

  const length = Number(req.headers['content-length'] ?? 0);
  if (Number.isFinite(length) && length > maxBytes) return { error: 'Request is too large.' };

  if (req.body && typeof req.body === 'object') {
    if (Buffer.byteLength(JSON.stringify(req.body), 'utf8') > maxBytes) return { error: 'Request is too large.' };
    if (Array.isArray(req.body)) return { error: 'Expected a JSON object.' };
    return { body: req.body };
  }
  if (typeof req.body === 'string') {
    try {
      return { body: JSON.parse(req.body) };
    } catch {
      return { error: 'Invalid JSON request.' };
    }
  }
  return { error: 'Request body is empty.' };
}

export function getAdminConfig() {
  const { ADMIN_USERNAME: username, ADMIN_PASSWORD_HASH: passwordHash, SESSION_SECRET: secret } = process.env;
  if (!username || !passwordHash || !secret || secret.length < 32) return null;
  return { username, passwordHash, secret };
}

export function verifyPassword(password, encodedHash) {
  if (typeof password !== 'string') return false;
  const [algorithm, nText, rText, pText, saltText, hashText] = encodedHash.split(':');
  if (algorithm !== 'scrypt' || !saltText || !hashText) return false;
  const n = Number(nText);
  const r = Number(rText);
  const p = Number(pText);
  const expected = Buffer.from(hashText, 'base64url');
  const salt = Buffer.from(saltText, 'base64url');
  const supportedCost = (n === 16384 && r === 8 && p === 1) || (n === 32768 && r === 8 && p === 3);
  if (!supportedCost || salt.length !== 16 || expected.length !== 64) return false;

  const actual = scryptSync(password, salt, expected.length, {
    N: n,
    r,
    p,
    maxmem: 64 * 1024 * 1024,
  });
  return timingSafeEqual(actual, expected);
}

export function createSessionValue(username, secret, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({
    sub: username,
    exp: Math.floor(now / 1000) + SESSION_SECONDS,
  })).toString('base64url');
  const signature = sign(payload, secret);
  return `${payload}.${signature}`;
}

export function readSession(req, config, now = Date.now()) {
  if (!config) return null;
  const cookieHeader = req.headers.cookie;
  if (typeof cookieHeader !== 'string') return null;
  const cookieName = sessionCookieName(req);
  const cookie = cookieHeader.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${cookieName}=`));
  if (!cookie) return null;

  const value = cookie.slice(cookieName.length + 1);
  const [payload, signature, extra] = value.split('.');
  if (!payload || !signature || extra) return null;
  const expected = Buffer.from(sign(payload, config.secret));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (session.sub !== config.username || !Number.isFinite(session.exp) || session.exp <= Math.floor(now / 1000)) return null;
    return session;
  } catch {
    return null;
  }
}

export function setSessionCookie(res, value, req) {
  const secure = isSecureRequest(req);
  const cookieName = secure ? '__Host-portfolio_session' : 'portfolio_session';
  res.setHeader('Set-Cookie', `${cookieName}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_SECONDS}${secure ? '; Secure' : ''}`);
}

export function clearSessionCookie(res, req) {
  const secure = isSecureRequest(req);
  const cookieName = secure ? '__Host-portfolio_session' : 'portfolio_session';
  res.setHeader('Set-Cookie', `${cookieName}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure ? '; Secure' : ''}`);
}

export function getRateLimitKey(req, action, secret) {
  const forwarded = req.headers['x-forwarded-for'];
  const addresses = typeof forwarded === 'string' ? forwarded.split(',') : [];
  const clientHint = addresses.at(-1)?.trim() || 'unknown-client';
  return createHmac('sha256', secret).update(`${action}:${clientHint}`).digest('hex');
}

export function getIdentityRateLimitKey(action, identity, secret) {
  return createHmac('sha256', secret).update(`${action}:${identity}`).digest('hex');
}

function sessionCookieName(req) {
  return isSecureRequest(req) ? '__Host-portfolio_session' : 'portfolio_session';
}

function isSecureRequest(req) {
  const forwardedProtocol = req.headers['x-forwarded-proto'];
  return process.env.VERCEL_ENV === 'production' || (typeof forwardedProtocol === 'string' && forwardedProtocol.split(',')[0].trim() === 'https');
}

function sign(value, secret) {
  return createHmac('sha256', secret).update(value).digest('base64url');
}
