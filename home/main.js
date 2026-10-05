import { STRINGS } from './strings.js';
import { readName } from './name.js';
import { createStrand, shimmer } from './strand.js';

const lang = (navigator.language || 'en').toLowerCase().startsWith('bg') ? 'bg' : 'en';
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.querySelector('.strand');
const bar = document.querySelector('.bar');

// === One page of the strand: everything set up here is torn down by close() ===
function open() {
  const life = new AbortController(), { signal } = life;

  // the markup carries the English text, so only other languages are applied
  document.documentElement.lang = lang;
  if (lang !== 'en') for (const el of document.querySelectorAll('[data-i18n]')) el.textContent = STRINGS[lang][el.dataset.i18n] ?? el.textContent;

  readName(root.querySelector('.name'), still);

  // the strand is built after translation, from whatever text the page now holds
  const strand = createStrand(root, still, signal);

  // a different width means a different number of letters per line
  const sizes = new ResizeObserver(() => strand.rebuild());
  sizes.observe(root);

  // download links point at the newest release's file once GitHub answers
  for (const repo of new Set([...root.querySelectorAll('[data-release]')].map(el => el.dataset.release))) {
    fetch(`https://api.github.com/repos/${repo}/releases/latest`, { signal }).then(r => r.ok ? r.json() : null).then(release => {
      if (!release) return;
      for (const el of root.querySelectorAll(`[data-release="${repo}"]`)) {
        const asset = release.assets?.find(a => a.name.endsWith(el.dataset.asset));
        if (asset && el.matches('a')) el.href = asset.browser_download_url;
        if (el.dataset.version && release.tag_name) strand.set(el, el.dataset.version.replace('{version}', release.tag_name.replace(/^v/, '')));
      }
    }).catch(() => { /* the links already lead to the releases page */ });
  }

  return {
    close() {
      life.abort();
      sizes.disconnect();
    },
  };
}

let page = open();

// === Moving between pages: the strand recomputes itself into the next one ===
const TICK = 55;
const LEAST_TICKS = 5;

async function go(url, push) {
  // revalidate, so a page deployed a minute ago is not swapped in from an old copy
  const arriving = fetch(url, { cache: 'no-cache' }).then(r => r.text()).then(text => new DOMParser().parseFromString(text, 'text/html'));
  page.close();
  root.classList.add('leaving');
  let ticks = 0, next = null;
  arriving.then(doc => { next = doc; }, () => { next = false; });
  // keep recomputing until the next page has arrived, and at least long enough to be seen
  await new Promise(done => {
    const timer = setInterval(() => {
      if (!still) shimmer(root);
      if (++ticks >= LEAST_TICKS && next !== null) { clearInterval(timer); done(); }
    }, TICK);
  });
  const incoming = next && next.querySelector('main.strand');
  // anything that is not a strand page is an ordinary visit
  if (!incoming) { location.href = url; return; }
  if (push) history.pushState(null, '', url);
  here = url.pathname;
  document.title = next.title;
  bar.replaceChildren(...document.adoptNode(next.querySelector('.bar')).children);
  root.replaceChildren(...document.adoptNode(incoming).children);
  scrollTo({ top: 0, behavior: 'instant' });
  root.classList.remove('leaving');
  page = open();
  if (url.hash) document.getElementById(url.hash.slice(1))?.scrollIntoView({ behavior: 'instant' });
}

document.addEventListener('click', event => {
  const a = event.target.closest('a[href]');
  if (!a || a.target || a.hasAttribute('download') || event.defaultPrevented || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const url = new URL(a.href);
  // other sites, other files and jumps within this page are left to the browser
  if (url.origin !== location.origin || url.pathname === location.pathname || !/(\/|\.html)$/.test(url.pathname)) return;
  event.preventDefault();
  go(url, true);
});
// going back or forward between pages takes the same road; within a page it is only a jump
let here = location.pathname;
addEventListener('popstate', () => {
  if (location.pathname === here) return;
  here = location.pathname;
  go(new URL(location.href), false);
});
