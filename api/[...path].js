import bcrypt from 'bcryptjs';
import { createSession, deleteSession, getSessionUser, requireUser } from '../server/auth.js';
import { getSql } from '../server/db.js';

function send(response, status, body, headers = {}) {
  Object.entries(headers).forEach(([name, value]) => response.setHeader(name, value));
  return response.status(status).json(body);
}

function routePath(request) {
  const path = request.query.path;
  return `/${Array.isArray(path) ? path.join('/') : path || ''}`;
}

function assertSameOrigin(request) {
  const origin = request.headers.origin;
  const host = request.headers['x-forwarded-host'] || request.headers.host;
  if (origin && host && new URL(origin).host !== host) {
    throw Object.assign(new Error('Pieprasījuma izcelsme nav atļauta.'), { statusCode: 403 });
  }
}

function bodyOf(request) {
  if (request.body && typeof request.body === 'object') return request.body;
  if (typeof request.body === 'string') return JSON.parse(request.body);
  return {};
}

export default async function handler(request, response) {
  const path = routePath(request);
  const method = request.method;

  try {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) assertSameOrigin(request);
    const sql = getSql();

    if (method === 'POST' && path === '/auth/login') {
      const body = bodyOf(request);
      const username = String(body.username || '').trim();
      const password = String(body.password || '');
      if (!username || !password) return send(response, 400, { error: 'Ievadi lietotājvārdu un paroli.' });
      const users = await sql`select id, username, password, role from users where lower(username) = lower(${username}) and active = true limit 1`;
      const user = users[0];
      const valid = user ? await bcrypt.compare(password, user.password) : false;
      if (!valid) return send(response, 401, { error: 'Nepareizs lietotājvārds vai parole.' });
      const cookie = await createSession(user.id);
      return send(response, 200, { user: { id: user.id, username: user.username, role: user.role } }, { 'Set-Cookie': cookie });
    }

    if (method === 'POST' && path === '/auth/logout') {
      return send(response, 200, { ok: true }, { 'Set-Cookie': await deleteSession(request) });
    }

    if (method === 'GET' && path === '/auth/session') {
      return send(response, 200, { user: await getSessionUser(request) });
    }

    if (method === 'GET' && path === '/trucks') {
      await requireUser(request);
      return send(response, 200, { trucks: await sql`select id, name, color from trucks order by id` });
    }

    if (method === 'POST' && path === '/trucks') {
      await requireUser(request, 'admin');
      const body = bodyOf(request);
      const name = String(body.name || '').trim();
      const color = /^#[0-9a-f]{6}$/i.test(String(body.color)) ? String(body.color) : '#cccccc';
      if (!name) return send(response, 400, { error: 'Auto nosaukums ir obligāts.' });
      const rows = await sql`insert into trucks (name, color) values (${name}, ${color}) returning id, name, color`;
      return send(response, 201, { truck: rows[0] });
    }

    if (method === 'DELETE' && path.startsWith('/trucks/')) {
      await requireUser(request, 'admin');
      await sql`delete from trucks where name = ${decodeURIComponent(path.slice('/trucks/'.length))}`;
      return send(response, 200, { ok: true });
    }

    if (method === 'GET' && path === '/entries') {
      const user = await requireUser(request);
      const truck = typeof request.query.truck === 'string' ? request.query.truck : null;
      if (user.role !== 'admin' && !truck) return send(response, 400, { error: 'Jānorāda auto.' });
      const entries = truck
        ? await sql`select id, truck, "user", driver, date, odometer, fuel, created_at from entries where truck = ${truck} order by created_at asc`
        : await sql`select id, truck, "user", driver, date, odometer, fuel, created_at from entries order by created_at asc`;
      return send(response, 200, { entries });
    }

    if (method === 'POST' && path === '/entries') {
      const user = await requireUser(request);
      const body = bodyOf(request);
      const truck = String(body.truck || '').trim();
      const date = String(body.date || '').trim();
      const odometer = Number(body.odometer);
      const fuel = Number(body.fuel || 0);
      if (!truck || !date || !Number.isFinite(odometer) || odometer < 0 || !Number.isFinite(fuel) || fuel < 0) {
        return send(response, 400, { error: 'Ievadītie dati nav derīgi.' });
      }
      const existingTruck = await sql`select 1 from trucks where name = ${truck} limit 1`;
      if (!existingTruck[0]) return send(response, 400, { error: 'Norādītais auto neeksistē.' });
      const previous = await sql`select odometer from entries where truck = ${truck} order by created_at desc limit 1`;
      if (previous[0] && odometer < Number(previous[0].odometer)) {
        return send(response, 409, { error: 'Odometra rādījums nevar būt mazāks par iepriekšējo.' });
      }
      const driver = user.username.charAt(0).toUpperCase() + user.username.slice(1);
      const rows = await sql`
        insert into entries (truck, "user", driver, date, odometer, fuel)
        values (${truck}, ${user.username}, ${driver}, ${date}, ${odometer}, ${fuel})
        returning id, truck, "user", driver, date, odometer, fuel, created_at
      `;
      return send(response, 201, { entry: rows[0] });
    }

    if (method === 'GET' && path === '/users') {
      await requireUser(request, 'admin');
      return send(response, 200, { users: await sql`select id, username, role, active, created_at from users order by username` });
    }

    if (method === 'POST' && path === '/users') {
      await requireUser(request, 'admin');
      const body = bodyOf(request);
      const username = String(body.username || '').trim();
      const password = String(body.password || '');
      const role = body.role === 'admin' ? 'admin' : 'driver';
      if (!username || password.length < 8) return send(response, 400, { error: 'Parolei jābūt vismaz 8 rakstzīmes garai.' });
      const passwordHash = await bcrypt.hash(password, 12);
      const rows = await sql`insert into users (username, password, role) values (${username}, ${passwordHash}, ${role}) returning id, username, role, active, created_at`;
      return send(response, 201, { user: rows[0] });
    }

    const passwordMatch = path.match(/^\/users\/(\d+)\/password$/);
    if (method === 'PATCH' && passwordMatch) {
      await requireUser(request, 'admin');
      const password = String(bodyOf(request).password || '');
      if (password.length < 8) return send(response, 400, { error: 'Parolei jābūt vismaz 8 rakstzīmes garai.' });
      await sql`update users set password = ${await bcrypt.hash(password, 12)} where id = ${passwordMatch[1]}`;
      await sql`delete from sessions where user_id = ${passwordMatch[1]}`;
      return send(response, 200, { ok: true });
    }

    const deleteMatch = path.match(/^\/users\/(\d+)$/);
    if (method === 'DELETE' && deleteMatch) {
      const currentUser = await requireUser(request, 'admin');
      const id = deleteMatch[1];
      if (String(currentUser.id) === id) return send(response, 409, { error: 'Nevar dzēst pašreizējo lietotāju.' });
      const target = await sql`select role from users where id = ${id} limit 1`;
      if (target[0]?.role === 'admin') {
        const count = await sql`select count(*)::int as count from users where role = 'admin' and active = true`;
        if (count[0].count <= 1) return send(response, 409, { error: 'Nevar dzēst pēdējo administratoru.' });
      }
      await sql`delete from users where id = ${id}`;
      return send(response, 200, { ok: true });
    }

    return send(response, 404, { error: 'API ceļš nav atrasts.' });
  } catch (error) {
    console.error(error);
    const status = error.statusCode || (error.code === '23505' ? 409 : 500);
    return send(response, status, { error: status === 500 ? 'Servera kļūda.' : error.message });
  }
}
