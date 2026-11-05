// Fails if an em dash or en dash appears in source or built output. House style: no dashes in copy.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const roots = ['src', 'dist'];
const exts = new Set(['.astro', '.ts', '.css', '.html', '.md', '.json', '.js', '.mjs']);
const bad = /[–—]/;
let hits = 0;
const walk = (dir) => {
  let entries;
  try { entries = readdirSync(dir); } catch { return; }
  for (const name of entries) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (exts.has(extname(p))) {
      readFileSync(p, 'utf8').split('\n').forEach((line, i) => {
        if (bad.test(line)) { hits++; console.log(`${p}:${i + 1}: ${line.trim().slice(0, 120)}`); }
      });
    }
  }
};
roots.forEach(walk);
if (hits) { console.error(`\n${hits} line(s) contain an em or en dash.`); process.exit(1); }
console.log('No em or en dashes found.');
