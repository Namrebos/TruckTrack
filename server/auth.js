import { createHash, randomBytes } from 'node:crypto';
import { getSql } from './db.js';

const DEFAULT_COOKIE_NAME = 'trucktrack_session';
const DEFAULT_TTL_HOURS = 8;

function cookieName() {
  return process.env.SESSION_COOKIE_NAME || DEFAULT_COOKIE_NAME;
}

function sessionTtlHours() {
  const configured = Number(process.env.SESSION_TTL_HOURS);
  return Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_TTL_HOURS;
}

function tokenHash(token) {
  return createHash('sha256').update(token).digest('hex');
}

function readCookies(header = '') {
  return Object.fromEntries(header.split(';').map((part) => part.trim()).filter(Boolean).map((part) => {
    const separator = part.indexOf('=');
    return separator === -1 ? [part, ''] : [part.slice(0, separator), decodeURIComponent(part.slice(separator + 1))];
  }));
}

function secureCookie() {
  return process.env.NODE_ENV === 'production' ? '; Secure' : '';
}

export async function createSession(userId) {
  const sql = getSql();
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + sessionTtlHours() * 60 * 60 * 1000);
  await sql`insert into sessions (user_id, token_hash, expires_at) values (${userId}, ${tokenHash(token)}, ${expiresAt.toISOString()})`;
  return `${cookieName()}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax${secureCookie()}; Max-Age=${Math.floor(sessionTtlHours() * 3600)}`;
}

export async function getSessionUser(request) {
  const token = readCookies(request.headers.cookie)[cookieName()];
  if (!token) return null;
  const sql = getSql();
  const rows = await sql`
    select u.id, u.username, u.role
    from sessions s join users u on u.id = s.user_id
    where s.token_hash = ${tokenHash(token)} and s.expires_at > now() and u.active = true
    limit 1
  `;
  return rows[0] || null;
}

export async function deleteSession(request) {
  const token = readCookies(request.headers.cookie)[cookieName()];
  if (token) {
    const sql = getSql();
    await sql`delete from sessions where token_hash = ${tokenHash(token)}`;
  }
  return `${cookieName()}=; Path=/; HttpOnly; SameSite=Lax${secureCookie()}; Max-Age=0`;
}

export async function requireUser(request, role) {
  const user = await getSessionUser(request);
  if (!user) throw Object.assign(new Error('Nav derīgas autorizācijas sesijas.'), { statusCode: 401 });
  if (role && user.role !== role) throw Object.assign(new Error('Šai darbībai nav tiesību.'), { statusCode: 403 });
  return user;
}
