// The name is the first thing read out of the strand. Each letter starts as a
// base that keeps changing, and settles into itself in order, once.

const BASES = 'ACGT';
const FIRST = 260;   // ms before the first letter settles
const EACH = 75;     // ms between one letter settling and the next
const FLICKER = 60;  // ms a letter shows one base before trying another

export function readName(heading, still) {
  const lines = [...heading.children];
  heading.setAttribute('aria-label', lines.map(line => line.textContent).join(' '));
  if (still) return;

  const letters = [];
  for (const line of lines) {
    const text = line.textContent;
    line.textContent = '';
    for (const char of text) {
      const node = Object.assign(document.createElement('span'), { textContent: char, className: 'letter' });
      node.setAttribute('aria-hidden', 'true');
      line.append(node);
      letters.push({ node, char });
    }
  }

  document.fonts.ready.then(() => {
    // each letter keeps its own width, so the bases passing through cannot shift the line
    for (const letter of letters) letter.node.style.width = `${letter.node.getBoundingClientRect().width}px`;
    for (const letter of letters) letter.node.classList.add('unread');
    const started = performance.now();
    let shown = -1;
    (function step(now) {
      const elapsed = now - started, settled = Math.floor((elapsed - FIRST) / EACH) + 1;
      const tick = Math.floor(elapsed / FLICKER);
      letters.forEach((letter, i) => {
        if (i < settled) {
          if (letter.node.classList.contains('unread')) { letter.node.classList.remove('unread'); letter.node.textContent = letter.char; }
        } else if (tick !== shown) letter.node.textContent = BASES[Math.floor(Math.random() * 4)];
      });
      shown = tick;
      if (settled < letters.length) requestAnimationFrame(step);
    })(started);
  });
}
