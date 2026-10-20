import { readFile } from 'node:fs/promises';
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL?.trim()) {
  console.error('Defina DATABASE_URL em .env.local antes de preparar o banco.');
  process.exit(1);
}
try {
  const sql = neon(process.env.DATABASE_URL.trim());
  const statements = (await readFile(new URL('../database/001-votes.sql', import.meta.url), 'utf8'))
    .split(';').map(value => value.trim()).filter(Boolean);
  await sql.transaction([
    sql.query('SELECT pg_advisory_xact_lock(113235980)'),
    ...statements.map(statement => sql.query(statement)),
  ]);
  console.log('Banco GPU Legends preparado. Nenhum voto de exemplo foi inserido.');
} catch {
  console.error('Não foi possível preparar o banco. Confira a conexão e a permissão de criação de tabelas no Neon.');
  process.exit(1);
}
