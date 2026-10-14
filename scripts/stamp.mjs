// Stamps every local stylesheet and script URL with ?v=<hash of the site's code>.
// Cloudflare tells browsers to keep these files for hours, so a new deploy has to change their URLs.
// node scripts/stamp.mjs rewrites the references; --check only reports whether they are current.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const STAMP = /\?v=[0-9a-f]+/g;
// vendored code carries its version in its folder name, so its own imports never need a stamp
const walk = dir => readdirSync(join(ROOT, dir), { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? (e.name === 'vendor' ? [] : walk(join(dir, e.name))) : [join(dir, e.name)]);

const code = ['fonts.css', 'styles.css', ...walk('home')].filter(f => /\.(css|js)$/.test(f)).sort();
const pages = readdirSync(ROOT).filter(f => f.endsWith('.html'));

const hash = createHash('sha256');
for (const file of code) hash.update(file).update(readFileSync(join(ROOT, file), 'utf8').replace(STAMP, ''));
const v = `?v=${hash.digest('hex').slice(0, 10)}`;

const stamp = (text, pattern) => text.replace(pattern, (_, before, url) => `${before}${url}${v}`);
const rewrites = {
  // href="fonts.css" src="home/main.js" in pages
  html: [/((?:href|src)=")((?!https?:|\/\/)[^"?#]+\.(?:css|js))(?:\?v=[0-9a-f]+)?(?=")/g],
  // import ... from './strings.js' and import('./plates.js') in the site's own modules
  js: [/((?:from |import\()['"])(\.\/(?!vendor\/)[^'"?]+\.js)(?:\?v=[0-9a-f]+)?(?=['"])/g],
};

let stale = [];
for (const file of [...pages, ...code.filter(f => f.endsWith('.js'))]) {
  const before = readFileSync(join(ROOT, file), 'utf8');
  const after = rewrites[file.endsWith('.html') ? 'html' : 'js'].reduce(stamp, before);
  if (after === before) continue;
  stale.push(relative(ROOT, join(ROOT, file)));
  if (!process.argv.includes('--check')) writeFileSync(join(ROOT, file), after);
}

if (process.argv.includes('--check')) {
  if (stale.length) { console.error(`stale asset stamps in ${stale.join(', ')}; run node scripts/stamp.mjs`); process.exit(1); }
} else console.log(stale.length ? `stamped ${v} in ${stale.join(', ')}` : `stamps already ${v}`);
