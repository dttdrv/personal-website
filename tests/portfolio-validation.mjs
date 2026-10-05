import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const ROOT = process.cwd();

console.log('Running portfolio validation tests...');

// 1. Validate the home page strings
const { STRINGS } = await import('../home/strings.js');
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
assert.deepEqual(Object.keys(STRINGS.bg), Object.keys(STRINGS.en), 'en and bg must define the same keys in the same order');
for (const lang of ['en', 'bg']) {
  for (const [key, value] of Object.entries(STRINGS[lang])) {
    assert.ok(typeof value === 'string' && value.trim().length > 0, `Empty string "${key}" for language "${lang}"`);
  }
}
// the markup is the English source for crawlers and no-script readers, so it must not drift from the strings
const inline = [...indexHtml.matchAll(/data-i18n="([^"]+)">([^<]*)</g)];
assert.ok(inline.length > 20, 'index.html must carry its text inline');
for (const [, key, text] of inline) {
  assert.equal(text.replaceAll('&amp;', '&'), STRINGS.en[key], `index.html text for "${key}" must match STRINGS.en`);
}
console.log('✔ Home strings validation passed (en and bg aligned with the markup).');

// 2. Validate llms.txt & llms-full.txt
const llmsPath = path.join(ROOT, 'llms.txt');
assert.ok(fs.existsSync(llmsPath), 'llms.txt must exist');
const llmsContent = fs.readFileSync(llmsPath, 'utf8');
assert.ok(llmsContent.includes('Misul'), 'llms.txt must mention Misul');
assert.ok(llmsContent.includes('Laplace'), 'llms.txt must mention Laplace');
assert.ok(llmsContent.includes('Interlace'), 'llms.txt must mention Interlace');
assert.ok(llmsContent.includes('Monodratic'), 'llms.txt must mention Monodratic');
assert.ok(llmsContent.includes('github.com/MisulOrg'), 'llms.txt must use the MisulOrg GitHub org');
assert.ok(llmsContent.includes('native Metal'), 'llms.txt must describe current Laplace Metal compilation');
assert.ok(!llmsContent.includes('LaplaceKV'), 'llms.txt must not present retired LaplaceKV as current');
assert.ok(!llmsContent.includes('23.3x'), 'llms.txt must not cite retired LaplaceKV compression figures');
assert.ok(!llmsContent.includes('without cloud dependencies'), 'llms.txt must not claim PhoneCode has no cloud model path');
assert.ok(llmsContent.includes('Khronos MoltenVK'), 'llms.txt must name Khronos MoltenVK');
assert.ok(llmsContent.includes('Vulkan ray tracing'), 'llms.txt must state the MoltenVK Vulkan ray tracing port');
assert.ok(llmsContent.includes('macOS'), 'llms.txt must mention macOS for the MoltenVK ray tracing port');
assert.ok(llmsContent.includes('pull/2771'), 'llms.txt must link MoltenVK pull request 2771');
assert.ok(llmsContent.includes('pull/2776'), 'llms.txt must link MoltenVK pull request 2776');
assert.ok(llmsContent.includes('pull/2788'), 'llms.txt must link MoltenVK pull request 2788');
assert.ok(llmsContent.includes('pull/2790'), 'llms.txt must link MoltenVK pull request 2790');
assert.ok(!llmsContent.includes('Misul Agent'), 'llms.txt must not mention Misul Agent');
assert.ok(!llmsContent.includes('misul.org/agent'), 'llms.txt must not link misul.org/agent');
assert.ok(llmsContent.includes('github.com/dttdrv/epigenesis'), 'llms.txt must link Epigenesis');
assert.ok(llmsContent.includes('llms-full.txt'), 'llms.txt must reference llms-full.txt');

const llmsFullPath = path.join(ROOT, 'llms-full.txt');
assert.ok(fs.existsSync(llmsFullPath), 'llms-full.txt must exist');
const llmsFullContent = fs.readFileSync(llmsFullPath, 'utf8');
assert.ok(llmsFullContent.includes('native Metal'), 'llms-full.txt must describe current Laplace Metal execution');
assert.ok(llmsFullContent.includes('research/'), 'llms-full.txt must mark earlier Laplace runtimes as historical');
assert.ok(llmsFullContent.includes('LaplaceKV'), 'llms-full.txt must name LaplaceKV only as historical research');
assert.ok(!llmsFullContent.includes('23.3x'), 'llms-full.txt must not cite retired LaplaceKV compression figures as current');
assert.ok(!llmsFullContent.includes('Gemma 4'), 'llms-full.txt must not list retired Laplace model-family claims as current');
assert.ok(!llmsFullContent.includes('431 passed'), 'llms-full.txt must not cite a stale Monodratic test count');
assert.ok(llmsFullContent.includes('99.35%'), 'llms-full.txt must use the published Monodratic recall mean');
assert.ok(!llmsFullContent.includes('OpenAPI'), 'llms-full.txt must not claim an OpenAPI document that does not exist');
assert.ok(llmsFullContent.includes('Epigenesis'), 'llms-full.txt must describe Epigenesis');
assert.ok(llmsFullContent.includes('failed their scientific acceptance criteria'), 'llms-full.txt must keep the Epigenesis failed-predictor statement');
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
const jsonLdMatch = indexHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
assert.ok(jsonLdMatch, 'index.html must contain a JSON-LD script block');
const jsonLd = JSON.parse(jsonLdMatch[1]);
assert.ok(jsonLd['@graph'], 'JSON-LD must have a @graph');

const graphTypes = jsonLd['@graph'].map(item => Array.isArray(item['@type']) ? item['@type'].join(',') : item['@type']);
assert.ok(graphTypes.some(t => t.includes('Person')), 'JSON-LD must define Person');
assert.ok(graphTypes.some(t => t.includes('ResearchOrganization')), 'JSON-LD must define ResearchOrganization');
assert.ok(graphTypes.some(t => t.includes('ItemList')), 'JSON-LD must define ItemList');

// the strand is drawn by script; the words themselves must already be in the markup
for (const id of ['epigenesis', 'research', 'projects', 'opensource', 'contact']) {
  assert.match(indexHtml, new RegExp(`<section class="gene" id="${id}">\\s*<h2`), `gene ${id} must open with its heading`);
}
for (const [, href] of indexHtml.matchAll(/(?:href|src)="((?!https?:|mailto:|#)[^"]+)"/g)) {
  assert.ok(fs.existsSync(path.join(ROOT, href)), `index.html references missing file ${href}`);
}

assert.ok(indexHtml.includes('https://github.com/dttdrv/epigenesis'), 'index.html must link the Epigenesis repository');
assert.ok(indexHtml.includes('Two of my own predictors failed their tests'), 'index.html must own up to the Epigenesis predictors that failed');
assert.ok(!/artificial intelligence|digital brain|AGI/i.test(indexHtml.split('</head>')[1]), 'the page must not pitch Epigenesis as building an intelligence');
assert.ok(indexHtml.includes('https://misul.org/Interlace'), 'index.html must link Interlace report at misul.org/Interlace');
assert.ok(indexHtml.includes('https://misul.org/monodratic/'), 'index.html must link the Monodratic report');
assert.ok(indexHtml.includes('https://github.com/MisulOrg/Laplace'), 'index.html must link Laplace');
assert.ok(!indexHtml.includes('Misul-Computing'), 'index.html must not use the retired Misul-Computing GitHub org');
assert.ok(!indexHtml.includes('misul.org/agent'), 'index.html must not link misul.org/agent');
assert.ok(indexHtml.includes('Vulkan ray tracing on macOS'), 'index.html must name the MoltenVK ray tracing port');
for (const pr of [2771, 2776, 2788, 2790, 2819, 2820, 2837, 2842, 2843]) {
  assert.ok(indexHtml.includes(`https://github.com/KhronosGroup/MoltenVK/pull/${pr}`), `index.html must link MoltenVK pull request ${pr}`);
}
assert.ok(!indexHtml.includes('href="https://github.com/KhronosGroup/MoltenVK"'), 'index.html must not link the MoltenVK repo itself');
assert.ok(indexHtml.includes('I contribute to Khronos MoltenVK'), 'index.html must name Khronos MoltenVK as contributor work');
assert.ok(indexHtml.includes('Four of my patches are merged'), 'index.html must state how many MoltenVK patches are merged');
assert.ok(!indexHtml.includes('LaplaceKV'), 'index.html must not present retired LaplaceKV as current');
assert.ok(!indexHtml.includes('SIMD kernels'), 'index.html must not describe current Laplace as a SIMD kernel engine');
assert.ok(indexHtml.includes('inference engine for Apple Silicon'), 'index.html must describe Laplace as an inference engine');

for (const product of ['phonecode.html', 'optisys.html']) {
  assert.ok(!fs.readFileSync(path.join(ROOT, product), 'utf8').includes('<img'), `${product} must not show pictures`);
}
// in-site links swap one strand page for another, so every page they lead to must be one
for (const [, href] of indexHtml.matchAll(/href="((?!https?:|mailto:|#)[^"]+\.html)"/g)) {
  const target = fs.readFileSync(path.join(ROOT, href), 'utf8');
  assert.ok(target.includes('<main class="strand">') && target.includes('<header class="bar">'), `${href} must be a strand page`);
  assert.ok(target.includes('href="index.html"'), `${href} must link back home`);
}
assert.ok(indexHtml.indexOf('about.statement') < indexHtml.indexOf('id="epigenesis"'), 'the statement must come straight after the name');
assert.ok(indexHtml.lastIndexOf('mailto:deyan@misul.org') > indexHtml.indexOf('id="contact"'), 'contact links must close the page');

console.log('✔ HTML & Schema.org JSON-LD graph validation passed.');
