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
  'nav.opensource',
  'nav.contact',
  'about.role',
  'about.statement',
  'misul.heading',
  'misul.role',
  'misul.intro',
  'misul.laplace.title',
  'misul.laplace.brief',
  'misul.laplace.desc',
  'misul.interlace.title',
  'misul.interlace.brief',
  'misul.interlace.desc',
  'misul.monodratic.title',
  'misul.monodratic.brief',
  'misul.monodratic.desc',
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
  'projects.schoolmap.desc',
  'opensource.heading',
  'opensource.intro',
  'opensource.moltenvk.title',
  'opensource.moltenvk.brief',
  'opensource.moltenvk.desc',
  'opensource.moltenvk.pr2771',
  'opensource.moltenvk.pr2776',
  'opensource.moltenvk.pr2788',
  'opensource.moltenvk.pr2790'
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
assert.ok(llmsContent.includes('Misul'), 'llms.txt must mention Misul');
assert.ok(llmsContent.includes('Laplace'), 'llms.txt must mention Laplace');
assert.ok(llmsContent.includes('Interlace'), 'llms.txt must mention Interlace');
assert.ok(llmsContent.includes('Monodratic'), 'llms.txt must mention Monodratic');
assert.ok(llmsContent.includes('github.com/MisulOrg'), 'llms.txt must use the MisulOrg GitHub org');
assert.ok(llmsContent.includes('Khronos MoltenVK'), 'llms.txt must name Khronos MoltenVK');
assert.ok(llmsContent.includes('Vulkan ray tracing'), 'llms.txt must state the MoltenVK Vulkan ray tracing port');
assert.ok(llmsContent.includes('macOS'), 'llms.txt must mention macOS for the MoltenVK ray tracing port');
assert.ok(llmsContent.includes('pull/2771'), 'llms.txt must link MoltenVK pull request 2771');
assert.ok(llmsContent.includes('pull/2776'), 'llms.txt must link MoltenVK pull request 2776');
assert.ok(llmsContent.includes('pull/2788'), 'llms.txt must link MoltenVK pull request 2788');
assert.ok(llmsContent.includes('pull/2790'), 'llms.txt must link MoltenVK pull request 2790');
assert.ok(!llmsContent.includes('Misul Agent'), 'llms.txt must not mention Misul Agent');
assert.ok(!llmsContent.includes('misul.org/agent'), 'llms.txt must not link misul.org/agent');
assert.ok(llmsContent.includes('llms-full.txt'), 'llms.txt must reference llms-full.txt');

const llmsFullPath = path.join(ROOT, 'llms-full.txt');
assert.ok(fs.existsSync(llmsFullPath), 'llms-full.txt must exist');
const llmsFullContent = fs.readFileSync(llmsFullPath, 'utf8');
assert.ok(llmsFullContent.includes('LaplaceKV'), 'llms-full.txt must describe LaplaceKV');
assert.ok(llmsFullContent.includes('Interlace'), 'llms-full.txt must describe Interlace');
assert.ok(llmsFullContent.includes('MoltenVK'), 'llms-full.txt must describe MoltenVK');
assert.ok(llmsFullContent.includes('Vulkan ray tracing'), 'llms-full.txt must describe the Vulkan ray tracing port');
assert.ok(llmsFullContent.includes('#2771'), 'llms-full.txt must lead MoltenVK with pull request 2771');
assert.ok(llmsFullContent.includes('PhoneCode'), 'llms-full.txt must describe PhoneCode');
assert.ok(!llmsFullContent.includes('Misul Agent'), 'llms-full.txt must not mention Misul Agent');
assert.ok(!llmsFullContent.includes('MisulOrg/Terminal'), 'llms-full.txt must not mention the Terminal agent repo');
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

// Verify remaining project drawers exist in index.html
const drawerIds = [
  'drawer-item-laplace',
  'drawer-item-interlace',
  'drawer-item-monodratic',
  'drawer-item-phonecode',
  'drawer-item-optisys',
  'drawer-item-dzipobel',
  'drawer-item-schoolmap',
  'drawer-item-moltenvk'
];

for (const id of drawerIds) {
  assert.ok(indexHtml.includes(`id="${id}"`), `index.html must contain drawer with id="${id}"`);
}

// Verify accessibility attributes are present
assert.ok(indexHtml.includes('aria-expanded="false"'), 'index.html must include aria-expanded on drawer triggers');
assert.ok(indexHtml.includes('role="region"'), 'index.html must include role="region" on drawer expandables');
assert.ok(indexHtml.includes('https://misul.org/Interlace'), 'index.html must link Interlace report at misul.org/Interlace');
assert.ok(indexHtml.includes('https://github.com/MisulOrg/Interlace/blob/main/paper/interlace.pdf'), 'index.html must link the Interlace PDF paper');
assert.ok(indexHtml.includes('https://github.com/MisulOrg/Interlace"'), 'index.html must link the Interlace GitHub repo');
assert.ok(!indexHtml.includes('Misul-Computing'), 'index.html must not use the retired Misul-Computing GitHub org');
assert.ok(!indexHtml.includes('drawer-item-todorov'), 'index.html must not include the Todorov drawer');
assert.ok(!indexHtml.includes('drawer-item-transformerov'), 'index.html must not include the Transformerov drawer');
assert.ok(!indexHtml.includes('drawer-item-agent'), 'index.html must not include the Misul Agent drawer');
assert.ok(!indexHtml.includes('misul.org/agent'), 'index.html must not link misul.org/agent');
assert.ok(indexHtml.includes('Porting Vulkan ray tracing to macOS'), 'index.html must headline the MoltenVK ray tracing port');
assert.ok(indexHtml.includes('https://github.com/KhronosGroup/MoltenVK/pull/2771'), 'index.html must link MoltenVK pull request 2771');
assert.ok(indexHtml.includes('https://github.com/KhronosGroup/MoltenVK/pull/2776'), 'index.html must link MoltenVK pull request 2776');
assert.ok(indexHtml.includes('https://github.com/KhronosGroup/MoltenVK/pull/2788'), 'index.html must link MoltenVK pull request 2788');
assert.ok(indexHtml.includes('https://github.com/KhronosGroup/MoltenVK/pull/2790'), 'index.html must link MoltenVK pull request 2790');
assert.ok(!indexHtml.includes('href="https://github.com/KhronosGroup/MoltenVK"'), 'index.html must not link the MoltenVK repo from the drawer');
assert.ok(indexHtml.includes('opensource.moltenvk.pr2771'), 'index.html must expose the MoltenVK ray tracing PR action');
assert.ok(indexHtml.includes('Contributor to Khronos MoltenVK'), 'index.html must name Khronos MoltenVK as contributor work');

console.log('✔ HTML & Schema.org JSON-LD graph validation passed.');
