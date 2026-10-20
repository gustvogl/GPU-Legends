import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Both the client and worker receive the same version for this exact build.
const version = '5.0.0-' + randomBytes(8).toString('hex');
const root = new URL('../', import.meta.url);
const template = await readFile(new URL('../pwa/sw.template.js', import.meta.url), 'utf8');
await writeFile(new URL('../public/sw.js', import.meta.url), template.replaceAll('__GPU_SW_VERSION__', version));
const env = { ...process.env, NEXT_PUBLIC_SW_VERSION: version };
for (const args of [
  [fileURLToPath(new URL('../node_modules/next/dist/bin/next', import.meta.url)), 'build', '--webpack'],
  [fileURLToPath(new URL('./generate-precache.mjs', import.meta.url))],
]) {
  const result = spawnSync(process.execPath, args, { cwd: fileURLToPath(root), env, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
