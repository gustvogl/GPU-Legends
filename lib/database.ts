import 'server-only';
import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { schemaStatements } from './schema';

let connection: string | undefined;
let client: NeonQueryFunction<false, false> | undefined;
let preparation: Promise<void> | undefined;

export async function database() {
  const configured = process.env.DATABASE_URL?.trim();
  if (!configured) throw new Error('GPU_DATABASE_NOT_CONFIGURED');
  if (!client || connection !== configured) {
    client = neon(configured);
    connection = configured;
    preparation = undefined;
  }
  const sql = client;
  // Serialize idempotent schema setup across serverless cold starts.
  if (!preparation) {
    preparation = sql.transaction([
      sql.query('SELECT pg_advisory_xact_lock(113235980)'),
      ...schemaStatements.map(statement => sql.query(statement)),
    ]).then(() => undefined).catch(error => {
      preparation = undefined;
      throw error;
    });
  }
  await preparation;
  return sql;
}
