import { STRINGS } from './strings.js?v=61e52d776b';

const lang = (navigator.language || 'en').toLowerCase().startsWith('bg') ? 'bg' : 'en';
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

// the markup carries the English text, so only other languages are applied
if (lang !== 'en' && document.querySelector('[data-i18n]')) {
  document.documentElement.lang = lang;
  for (const el of document.querySelectorAll('[data-i18n]')) el.textContent = STRINGS[lang][el.dataset.i18n] ?? el.textContent;
}

// the name rises letter by letter; the heading keeps the whole name for screen readers
const name = document.querySelector('.name');
if (name && !still) {
  name.setAttribute('aria-label', name.textContent.replace(/\s+/g, ' ').trim());
  let i = 0;
  for (const part of name.querySelectorAll('.line > span')) {
    part.setAttribute('aria-hidden', 'true');
    part.replaceChildren(...[...part.textContent].map(ch => Object.assign(document.createElement('span'), { className: 'ch', textContent: ch, style: `--i: ${i++}` })));
  }
  name.classList.add('split');
}

// the parts of each section rise into place the first time it comes into view
if (!still) {
  document.documentElement.classList.add('armed');
  for (const list of document.querySelectorAll('[data-reveal] ul, [data-reveal] .table')) [...list.children].forEach((el, i) => el.style.setProperty('--i', i));
  const entering = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('in'); entering.unobserve(entry.target); }
  }, { rootMargin: '0px 0px -12% 0px' });
  for (const el of document.querySelectorAll('[data-reveal], .band, .about, .showcase, .ledger, .lineup')) entering.observe(el);
}

// pictures are printed by Paper Shaders as they come near
const prints = document.querySelectorAll('[data-shader]');
if (prints.length) {
  const near = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      near.unobserve(entry.target);
      import('./plates.js?v=61e52d776b').then(m => m.print(entry.target, still));
    }
  }, { rootMargin: '50% 0px' });
  for (const el of prints) near.observe(el);
}

// download links point at the newest release's file once GitHub answers
for (const repo of new Set([...document.querySelectorAll('[data-release]')].map(el => el.dataset.release))) {
  fetch(`https://api.github.com/repos/${repo}/releases/latest`).then(r => r.ok ? r.json() : null).then(release => {
    if (!release) return;
    for (const el of document.querySelectorAll(`[data-release="${repo}"]`)) {
      const asset = release.assets?.find(a => a.name.endsWith(el.dataset.asset));
      if (asset && el.matches('a')) el.href = asset.browser_download_url;
      if (el.dataset.version && release.tag_name) el.textContent = el.dataset.version.replace('{version}', release.tag_name.replace(/^v/, ''));
    }
  }).catch(() => { /* the links already lead to the releases page */ });
}
