// The page is one strand of bases. Everything written here is a gene inside
// it: until the visitor scrolls a line up to the reading height it shows as
// A, C, G, T, and then it is read out, left to right, into text.

const BASES = 'ACGT';
const READ_AT = '-13%';        // lines are read once they clear the bottom 13% of the screen
const SETTLE_MS = 420;         // how long a line takes to come out of the strand
const FLICKER_MS = 45;         // how long an unsettled letter shows one base
const NAME_COLUMN = 15;        // width kept for a project's name beside its description
const SPACER = 3;              // bases between two links on one line
const MEASURE = 60;            // longest line of text, in letters

// one continuous, repeatable sequence for the whole page
let cursor = 1;
function bases(count) {
  let out = '';
  for (let i = 0; i < count; i++) {
    cursor = Math.imul(cursor, 1103515245) + 12345 & 0x7fffffff;
    out += BASES[cursor >> 16 & 3];
  }
  return out;
}

function wrap(text, width) {
  const lines = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    if (line && line.length + 1 + word.length > width) { lines.push(line); line = word; }
    else line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(line);
  return lines;
}

const span = (className, text) => Object.assign(document.createElement('span'), { className, textContent: text });

export function createStrand(root, still, signal) {
  // the written content, lifted once out of the markup
  const blocks = [];
  for (const el of root.querySelectorAll('.gene h2, .gene p, .gene figcaption')) {
    const kind = el.matches('h2') ? 'title' : el.matches('.links') ? 'links' : el.matches('.entry') ? 'entry' : 'text';
    // an entry opens with its name, a link or a plain bold word; link lines hold only links
    const names = kind === 'entry' ? [el.firstElementChild] : kind === 'links' ? [...el.querySelectorAll('a')] : [];
    for (const node of names) {
      node.dataset.label = node.textContent.trim();
      if (node.matches('a')) node.setAttribute('aria-label', node.dataset.label);
      node.remove();
    }
    blocks.push({ el, kind, names, text: el.textContent.trim().replace(/\s+/g, ' '), read: false });
  }
  const fills = [...root.querySelectorAll('.fill')];
  const grid = { columns: 0, char: 0, line: 0, indent: 0, measure: 0 };

  // a stretch of text hidden in the strand; `node` may be a link
  function gene(node, text, block) {
    node.classList.add('g');
    node.dataset.text = text;
    node.dataset.mask = bases(text.length);
    node.textContent = block.read ? text : node.dataset.mask;
    return node;
  }

  function row(block, pieces) {
    const node = span('row c', '');
    let used = grid.indent;
    node.append(span('b', bases(grid.indent)));
    for (const piece of pieces) {
      node.append(piece);
      used += (piece.dataset.text ?? piece.textContent).length;
    }
    node.append(span('b', bases(Math.max(0, grid.columns - used))));
    node.setAttribute('aria-hidden', !node.querySelector('a'));
    node.classList.toggle('read', block.read);
    block.rows.push(node);
    return node;
  }

  function write(block) {
    const { el, kind, names, text } = block;
    el.textContent = '';
    block.rows = [];
    // assistive technology reads the sentence once; the lines are decoration
    if (kind !== 'links') el.append(span('sr', text));
    if (kind === 'entry' && !names[0].matches('a')) names[0].className = 'n';
    const plain = t => gene(span('', ''), t, block);

    if (kind === 'title') el.append(row(block, [gene(span('t', ''), `>${text.toUpperCase()}`, block)]));
    else if (kind === 'text') for (const line of wrap(text, grid.measure)) el.append(row(block, [plain(line)]));
    else if (kind === 'links') {
      let pieces = [], used = 0;
      for (const a of names) {
        const width = a.dataset.label.length + (pieces.length ? SPACER : 0);
        if (pieces.length && used + width > grid.measure) { el.append(row(block, pieces)); pieces = []; used = 0; }
        if (pieces.length) pieces.push(span('b', bases(SPACER)));
        pieces.push(gene(a, a.dataset.label, block));
        used += width;
      }
      el.append(row(block, pieces));
    } else {
      // a project: its name, then what it is; side by side when there is room
      const [name] = names, label = name.dataset.label;
      // a plain name is part of the sentence a screen reader hears; a link speaks for itself
      if (!name.matches('a')) el.querySelector('.sr').prepend(`${label}. `);
      const beside = grid.measure >= NAME_COLUMN + 28;
      if (!beside) el.append(row(block, [gene(name, label, block)]));
      wrap(text, beside ? grid.measure - NAME_COLUMN : grid.measure).forEach((line, i) => {
        const lead = !beside ? [] : i ? [span('b', bases(NAME_COLUMN))] : [gene(name, label, block), span('b', bases(Math.max(1, NAME_COLUMN - label.length)))];
        el.append(row(block, [...lead, plain(line)]));
      });
    }
    // one unread line of strand separates a block from the next
    const gap = span('row b', bases(grid.columns));
    gap.setAttribute('aria-hidden', 'true');
    el.append(gap);
    for (const node of block.rows) reader.observe(node);
  }

  // reads one line out of the strand
  function read(node) {
    const block = blocks.find(b => b.rows.includes(node));
    if (node.classList.contains('read')) return;
    node.classList.add('read');
    const genes = [...node.querySelectorAll('.g')];
    const finish = () => {
      for (const g of genes) g.textContent = g.dataset.text;
      block.read = block.rows.every(r => r.classList.contains('read'));
    };
    if (still) return finish();
    // every letter of the line gets its own moment to settle; until then it keeps changing base
    const moments = genes.map(g => Array.from(g.dataset.text, () => Math.random() * SETTLE_MS));
    const started = performance.now();
    let shown = -1;
    (function step(now) {
      const elapsed = now - started, tick = Math.floor(elapsed / FLICKER_MS);
      if (elapsed >= SETTLE_MS) return finish();
      if (tick !== shown) {
        shown = tick;
        genes.forEach((g, n) => {
          g.textContent = Array.from(g.dataset.text, (char, i) => elapsed >= moments[n][i] ? char : BASES[Math.floor(Math.random() * 4)]).join('');
        });
      }
      requestAnimationFrame(step);
    })(started);
  }

  const reader = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) read(entry.target);
  }, { rootMargin: `0px 0px ${READ_AT} 0px` });
  // a link reached by keyboard is read at once, wherever it is
  root.addEventListener('focusin', event => { const node = event.target.closest('.row'); if (node) read(node); }, { signal });

  function build() {
    // an inline run of letters, so its width is the letters' own
    const probe = span('', 'A'.repeat(50));
    probe.style.cssText = 'display: inline-block; white-space: pre';
    root.prepend(probe);
    const box = probe.getBoundingClientRect();
    probe.remove();
    const columns = Math.floor(root.clientWidth / (box.width / 50));
    if (columns === grid.columns) return false;
    Object.assign(grid, { columns, char: box.width / 50, line: box.height });
    grid.indent = columns >= 100 ? Math.floor(columns * 0.16) : columns >= 60 ? 6 : 2;
    grid.measure = Math.min(MEASURE, columns - grid.indent - 2);
    // blocks that are not text, such as pictures, line up with the text column
    root.style.setProperty('--indent', `${grid.indent * grid.char}px`);
    cursor = 1;
    reader.disconnect();
    for (const fill of fills) {
      // a fill is given in lines, or as a share of the screen's height
      const lines = fill.dataset.lines ? Number(fill.dataset.lines) : Math.ceil(innerHeight * Number(fill.dataset.screen) / grid.line);
      fill.textContent = Array.from({ length: lines }, () => bases(columns)).join('\n');
    }
    for (const block of blocks) write(block);
    return true;
  }

  signal.addEventListener('abort', () => reader.disconnect());

  build();
  return {
    grid,
    rebuild: build,
    // replaces the words of one block, for text that arrives after the page
    set(el, text) {
      const block = blocks.find(b => b.el === el);
      block.text = text;
      write(block);
    },
  };
}

// one tick of the strand recomputing itself: every letter on the page, read or
// not, is drawn again from the four bases
export function shimmer(root) {
  for (const node of root.querySelectorAll('.fill, .b, .g')) {
    node.textContent = node.textContent.replace(/[^\n]/g, () => BASES[Math.floor(Math.random() * 4)]);
  }
}
