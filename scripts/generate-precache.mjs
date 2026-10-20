import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const urls = new Set([
  '/', '/offline.html', '/storage.js', '/manifest.webmanifest',
  '/favicon.svg', '/icons/icon-192.png', '/icons/icon-512.png',
]);
async function walk(directory, prefix) {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const url = prefix + '/' + entry.name;
    if (entry.isDirectory()) found.push(...await walk(path.join(directory, entry.name), url));
    else if (/\.(?:js|css|woff2?|ttf|svg|png|webp|webmanifest)$/.test(entry.name)) found.push(url);
  }
  return found;
}
for (const url of await walk(path.join(root, '.next/static'), '/_next/static')) urls.add(url);
const images = (await walk(path.join(root, 'public/images'), '/images')).sort();
if (images.length !== 23) throw new Error(`Esperadas 23 imagens locais; encontradas ${images.length}.`);
await writeFile(path.join(root, 'public/precache.json'), JSON.stringify({
  version: process.env.NEXT_PUBLIC_SW_VERSION || '5.0.0-development', urls: [...urls].sort(), images,
}, null, 2) + '\n');
console.log(`Precache Vercel: ${urls.size} recursos de núcleo e ${images.length} imagens locais.`);
