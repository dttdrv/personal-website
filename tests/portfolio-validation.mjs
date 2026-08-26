import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const ROOT = process.cwd();

console.log('Running portfolio validation tests...');

// 1. Validate translations.js
const translationsPath = path.join(ROOT, 'translations.js');
assert.ok(fs.existsSync(translationsPath), 'translations.js must exist');
const translationsFile = fs.readFileSync(translationsPath, 'utf8');

const context = {};
const evalFn = new Function('context', translationsFile + '; context.TRANSLATIONS = TRANSLATIONS;');
evalFn(context);
const { TRANSLATIONS } = context;
assert.ok(TRANSLATIONS, 'TRANSLATIONS object must be defined');
assert.ok(TRANSLATIONS.en, 'English translations must be present');
assert.ok(TRANSLATIONS.bg, 'Bulgarian translations must be present');

const requiredKeys = [
  'nav.top',
  'nav.about',
  'nav.misul',
  'nav.projects',
  'nav.contact',
  'about.role',
  'about.statement',
  'misul.heading',
  'misul.role',
  'misul.intro',
  'misul.laplace.title',
  'misul.laplace.brief',
  'misul.laplace.desc',
  'misul.agent.title',
  'misul.agent.brief',
  'misul.agent.desc',
  'misul.todorov.title',
  'misul.todorov.brief',
  'misul.todorov.desc',
  'misul.monodratic.title',
  'misul.monodratic.brief',
  'misul.monodratic.desc',
  'misul.transformerov.title',
  'misul.transformerov.brief',
  'misul.transformerov.desc',
  'projects.heading',
  'projects.phonecode.title',
  'projects.phonecode.brief',
  'projects.phonecode.desc',
  'projects.optisys.title',
  'projects.optisys.brief',
  'projects.optisys.desc',
  'projects.dzipobel.title',
  'projects.dzipobel.brief',
  'projects.dzipobel.desc',
  'projects.schoolmap.title',
  'projects.schoolmap.brief',
  'projects.schoolmap.desc'
];

function getNested(obj, keyPath) {
  return keyPath.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), obj);
}

for (const lang of ['en', 'bg']) {
  for (const key of requiredKeys) {
    const val = getNested(TRANSLATIONS[lang], key);
    assert.ok(
      typeof val === 'string' && val.trim().length > 0,
      `Missing translation key "${key}" for language "${lang}"`
    );
  }
}
console.log('✔ Translations validation passed (all keys present in en & bg).');

// 2. Validate llms.txt & llms-full.txt
const llmsPath = path.join(ROOT, 'llms.txt');
assert.ok(fs.existsSync(llmsPath), 'llms.txt must exist');
const llmsContent = fs.readFileSync(llmsPath, 'utf8');
assert.ok(llmsContent.includes('Misul Computing'), 'llms.txt must mention Misul Computing');
assert.ok(llmsContent.includes('Laplace'), 'llms.txt must mention Laplace');
assert.ok(llmsContent.includes('Monodratic'), 'llms.txt must mention Monodratic');
assert.ok(llmsContent.includes('llms-full.txt'), 'llms.txt must reference llms-full.txt');

const llmsFullPath = path.join(ROOT, 'llms-full.txt');
assert.ok(fs.existsSync(llmsFullPath), 'llms-full.txt must exist');
const llmsFullContent = fs.readFileSync(llmsFullPath, 'utf8');
assert.ok(llmsFullContent.includes('LaplaceKV'), 'llms-full.txt must describe LaplaceKV');
assert.ok(llmsFullContent.includes('Transformerov'), 'llms-full.txt must describe Transformerov');
assert.ok(llmsFullContent.includes('PhoneCode'), 'llms-full.txt must describe PhoneCode');
console.log('✔ LLM documentation files validation passed.');

// 3. Validate robots.txt and sitemap.xml
const robotsPath = path.join(ROOT, 'robots.txt');
assert.ok(fs.existsSync(robotsPath), 'robots.txt must exist');
const robotsContent = fs.readFileSync(robotsPath, 'utf8');
assert.ok(robotsContent.includes('sitemap.xml'), 'robots.txt must declare sitemap location');

const sitemapPath = path.join(ROOT, 'sitemap.xml');
assert.ok(fs.existsSync(sitemapPath), 'sitemap.xml must exist');
const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
assert.ok(sitemapContent.includes('<loc>https://dttdrv.xyz/</loc>'), 'sitemap.xml must include root');
assert.ok(sitemapContent.includes('<loc>https://dttdrv.xyz/phonecode.html</loc>'), 'sitemap.xml must include phonecode.html');
console.log('✔ SEO & discoverability files validation passed.');

// 4. Validate index.html Schema.org JSON-LD and Markup
const indexPath = path.join(ROOT, 'index.html');
assert.ok(fs.existsSync(indexPath), 'index.html must exist');
const indexHtml = fs.readFileSync(indexPath, 'utf8');

// Extract JSON-LD script
const jsonLdMatch = indexHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
assert.ok(jsonLdMatch, 'index.html must contain a JSON-LD script block');
const jsonLd = JSON.parse(jsonLdMatch[1]);
assert.ok(jsonLd['@graph'], 'JSON-LD must have a @graph');

const graphTypes = jsonLd['@graph'].map(item => Array.isArray(item['@type']) ? item['@type'].join(',') : item['@type']);
assert.ok(graphTypes.some(t => t.includes('Person')), 'JSON-LD must define Person');
assert.ok(graphTypes.some(t => t.includes('ResearchOrganization')), 'JSON-LD must define ResearchOrganization');
assert.ok(graphTypes.some(t => t.includes('ItemList')), 'JSON-LD must define ItemList');

// Verify all 9 project drawers exist in index.html
const drawerIds = [
  'drawer-item-laplace',
  'drawer-item-agent',
  'drawer-item-todorov',
  'drawer-item-monodratic',
  'drawer-item-transformerov',
  'drawer-item-phonecode',
  'drawer-item-optisys',
  'drawer-item-dzipobel',
  'drawer-item-schoolmap'
];

for (const id of drawerIds) {
  assert.ok(indexHtml.includes(`id="${id}"`), `index.html must contain drawer with id="${id}"`);
}

// Verify accessibility attributes are present
assert.ok(indexHtml.includes('aria-expanded="false"'), 'index.html must include aria-expanded on drawer triggers');
assert.ok(indexHtml.includes('role="region"'), 'index.html must include role="region" on drawer expandables');

console.log('✔ HTML & Schema.org JSON-LD graph validation passed.');
