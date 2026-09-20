import { chmod, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import pg from 'pg';

const root = process.cwd();
const apply = process.argv.includes('--apply');

function parseEnv(contents) {
  return Object.fromEntries(
    contents.split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith('#')).map((line) => {
      const separator = line.indexOf('=');
      return [line.slice(0, separator), line.slice(separator + 1)];
    }),
  );
}

function client(connectionString, rejectUnauthorized) {
  const url = new URL(connectionString);
  const enableChannelBinding = url.searchParams.get('channel_binding') === 'require';
  url.searchParams.delete('sslmode');
  url.searchParams.delete('channel_binding');
  return new pg.Client({
    connectionString: url.toString(),
    ssl: { rejectUnauthorized },
    enableChannelBinding,
    connectionTimeoutMillis: 15_000,
  });
}

async function sourceSnapshot(source) {
  await source.query('begin read only');
  try {
    const users = await source.query('select id, created_at, username, password, role from public.users order by id');
    const trucks = await source.query('select id, created_at, name, color from public.trucks order by id');
    const entries = await source.query('select id, created_at, truck, driver, odometer, fuel, date, "user" from public.entries order by created_at, id');
    await source.query('commit');
    return { users: users.rows, trucks: trucks.rows, entries: entries.rows };
  } catch (error) {
    await source.query('rollback');
    throw error;
  }
}

async function writeBackup(snapshot) {
  const directory = path.join(root, '.migration-backups');
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const stamp = new Date().toISOString().replaceAll(':', '-');
  const filename = path.join(directory, `supabase-${stamp}.json`);
  await writeFile(filename, `${JSON.stringify({ createdAt: new Date().toISOString(), ...snapshot }, null, 2)}\n`, { mode: 0o600 });
  await chmod(filename, 0o600);
  return filename;
}

async function assertEmptyTarget(target) {
  const result = await target.query(`
    select table_name
    from information_schema.tables
    where table_schema = 'public' and table_type = 'BASE TABLE'
    order by table_name
  `);
  if (result.rows.length) {
    throw new Error(`Neon public schema is not empty: ${result.rows.map((row) => row.table_name).join(', ')}`);
  }
}

async function importSnapshot(target, snapshot, schemaSql) {
  await target.query('begin');
  try {
    await target.query(schemaSql);

    for (const user of snapshot.users) {
      await target.query(
        'insert into users (id, created_at, username, password, role, active) values ($1, $2, $3, $4, $5, true)',
        [user.id, user.created_at, user.username, user.password, user.role],
      );
    }
    for (const truck of snapshot.trucks) {
      await target.query(
        'insert into trucks (id, created_at, name, color) values ($1, $2, $3, $4)',
        [truck.id, truck.created_at, truck.name, truck.color || '#cccccc'],
      );
    }
    for (const entry of snapshot.entries) {
      await target.query(
        'insert into entries (id, created_at, truck, driver, odometer, fuel, date, "user") values ($1, $2, $3, $4, $5, $6, $7, $8)',
        [entry.id, entry.created_at, entry.truck, entry.driver, entry.odometer, entry.fuel, entry.date, entry.user],
      );
    }

    await target.query("select setval(pg_get_serial_sequence('users', 'id'), (select max(id) from users), true)");
    await target.query("select setval(pg_get_serial_sequence('trucks', 'id'), (select max(id) from trucks), true)");

    for (const [table, expected] of Object.entries({ users: snapshot.users.length, trucks: snapshot.trucks.length, entries: snapshot.entries.length })) {
      const actual = Number((await target.query(`select count(*) count from ${table}`)).rows[0].count);
      if (actual !== expected) throw new Error(`${table}: expected ${expected} rows, imported ${actual}`);
    }

    await target.query('commit');
  } catch (error) {
    await target.query('rollback');
    throw error;
  }
}

const env = parseEnv(await readFile(path.join(root, '.env.local'), 'utf8'));
if (!env.SOURCE_DATABASE_URL || !env.DATABASE_URL) throw new Error('SOURCE_DATABASE_URL and DATABASE_URL are required');

// Supabase's shared pooler presents a provider-managed certificate chain that
// is not in Node's local CA bundle. The connection remains TLS-encrypted.
const source = client(env.SOURCE_DATABASE_URL, false);
const target = client(env.DATABASE_URL, true);

try {
  await source.connect();
  await target.connect();
  const snapshot = await sourceSnapshot(source);
  await assertEmptyTarget(target);
  console.log(`Source ready: ${snapshot.users.length} users, ${snapshot.trucks.length} trucks, ${snapshot.entries.length} entries.`);

  if (!apply) {
    console.log('Neon target is empty. Dry run passed; no data was written.');
  } else {
    const backup = await writeBackup(snapshot);
    const schemaSql = await readFile(path.join(root, 'db/migrations/0001_neon_schema.sql'), 'utf8');
    await importSnapshot(target, snapshot, schemaSql);
    console.log(`TLS transport was used; local permission-restricted backup created at ${backup}.`);
    console.log('Neon import committed and row counts verified.');
  }
} finally {
  await Promise.allSettled([source.end(), target.end()]);
}
