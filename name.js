// Name scramble, the site's wordmark: as the pointer moves (or the page, or the work reel,
// scrolls), the letters of each [data-scramble] element swap, one at a time, to a random
// font family, case and now and then a lookalike glyph. When movement stops they settle back to the
// plain name, left to right. Each also scrambles by itself once, fast at first and
// slowing down like a slot machine, then settles:
//   data-scramble="load" – on page load (the name in the bio)
//   data-scramble="bottom" – each time the visitor reaches the bottom of the page (the
//                            one in the footer; ~3s); re-arms once they scroll away
//
// Each letter keeps its own width as set in the page's font (the scramble never reflows
// the line) and has zero line height (other fonts' taller metrics can't push the line
// down). Screen readers get the plain name. Off for reduced motion.
(function () {
  const names = Array.from(document.querySelectorAll('[data-scramble]'));
  if (!names.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const STYLES = [
    { family: "'Geist', 'Helvetica Neue', Arial, sans-serif" },   // [0] = the page's own
    { family: "'Geist Mono', ui-monospace, Menlo, monospace" },
    { family: "'Geist Mono', ui-monospace, Menlo, monospace", italic: true },
    { family: "'Instrument Serif', Georgia, serif" },
    { family: "'Instrument Serif', Georgia, serif", italic: true },
    { family: "'Pixelify Sans', ui-monospace, monospace" },
  ];
  // Lookalikes, used now and then instead of the letter itself.
  const ALT = { a: ['4', '@', 'Λ'], n: ['И', 'ŋ'], d: ['ð', 'Ð'], r: ['Я', 'ʀ'], e: ['3', 'ə', '€'], s: ['5', '$', 'ʃ'] };
  const STEP = 26;          // px of pointer travel (or scroll) per change
  const MIN_MS = 45;        // at most one change this often, however fast the pointer
  const REST_MS = 320;      // stillness before settling
  const SETTLE_MS = 60;     // between letters as they settle, left to right
  const ALT_CHANCE = 0.2;
  const INTRO_MS = 1600;    // the scramble on its own (page load)
  const BOTTOM_MS = 3000;   // … and on reaching the bottom of the page
  const BOTTOM_SLACK = 4;   // px from the very bottom that still counts as there
  const INTRO_FAST = 60, INTRO_SLOW = 240;   // ms between changes, at the start and the end

  // Load the extra faces up front (they're subset to these few characters), so the
  // first scramble doesn't flash a fallback.
  const loading = document.fonts ? STYLES.map(function (s) {
    return document.fonts.load((s.italic ? 'italic ' : '') + '400 16px ' + s.family, 'AaNnDdRrEeSs').catch(function () {});
  }) : [];
  const ready = Promise.race([Promise.all(loading), new Promise(function (r) { setTimeout(r, 600); })]);

  const scrambler = function (host) {
    // Each letter's own advance, in em, measured from the name as set (works for
    // monospaced and proportional faces alike).
    const word = host.textContent.trim();
    const text = host.firstChild;
    const size = parseFloat(getComputedStyle(host).fontSize);
    const offset = host.textContent.indexOf(word);
    const advances = Array.from(word).map(function (_, i) {
      const r = document.createRange();
      r.setStart(text, offset + i); r.setEnd(text, offset + i + 1);
      return r.getBoundingClientRect().width / size;
    });

    host.textContent = '';
    const sr = document.createElement('span');
    sr.className = 'visually-hidden';
    sr.textContent = word;
    const shown = document.createElement('span');
    shown.setAttribute('aria-hidden', 'true');
    host.append(sr, shown);
    const letters = Array.from(word).map(function (ch, i) {
      const el = document.createElement('span');
      el.className = 'name-ch';
      el.style.width = advances[i].toFixed(4) + 'em';
      el.textContent = ch;
      shown.appendChild(el);
      return { el: el, ch: ch };
    });

    const set = function (l, style, text) {
      l.el.style.fontFamily = STYLES[style].family;
      l.el.style.fontStyle = STYLES[style].italic ? 'italic' : '';
      l.el.textContent = text;
    };
    const reset = function (l) { l.el.style.fontFamily = ''; l.el.style.fontStyle = ''; l.el.textContent = l.ch; };

    let last = -1;
    const scramble = function () {
      let i;
      do { i = Math.floor(Math.random() * letters.length); } while (i === last && letters.length > 1);
      last = i;
      const l = letters[i];
      const alts = ALT[l.ch.toLowerCase()];
      let style, text;
      do {
        style = Math.floor(Math.random() * STYLES.length);
        text = alts && Math.random() < ALT_CHANCE ? alts[Math.floor(Math.random() * alts.length)]
             : Math.random() < 0.5 ? l.ch.toUpperCase() : l.ch.toLowerCase();
      } while (style === 0 && text === l.ch);   // always a visible change
      set(l, style, text);
    };

    let travelled = 0, lastChange = 0, restTimer = null, settling = [];
    const settle = function () {
      letters.forEach(function (l, i) {
        settling.push(setTimeout(function () { reset(l); }, i * SETTLE_MS));
      });
    };
    const moved = function (distance) {
      settling.forEach(clearTimeout); settling = [];
      travelled += distance;
      const now = performance.now();
      if (travelled >= STEP && now - lastChange >= MIN_MS) {
        travelled = 0; lastChange = now;
        scramble();
      }
      clearTimeout(restTimer);
      restTimer = setTimeout(function () { restTimer = null; settle(); }, REST_MS);
    };

    // Scramble by itself, slowing down, then settle.
    let running = false;
    const intro = function (duration) {
      if (running) return;
      running = true;
      const start = performance.now();
      const tick = function () {
        const u = (performance.now() - start) / duration;
        if (u >= 1) { running = false; if (!restTimer) settle(); return; }   // unless the pointer is busy scrambling it
        scramble();
        setTimeout(tick, INTRO_FAST + (INTRO_SLOW - INTRO_FAST) * u * u);   // eases out
      };
      tick();
    };
    if (host.dataset.scramble === 'bottom') {
      let armed = true;
      const atBottom = function () {
        return scrollY + innerHeight >= document.documentElement.scrollHeight - BOTTOM_SLACK;
      };
      const check = function () {
        if (!atBottom()) { armed = true; return; }        // scrolled away: next arrival plays again
        if (!armed) return;
        armed = false;
        ready.then(function () { intro(BOTTOM_MS); });
      };
      addEventListener('scroll', check, { passive: true });
      addEventListener('resize', check, { passive: true });
      ready.then(check);                                   // a page short enough to start at the bottom
    } else {
      ready.then(function () { intro(INTRO_MS); });
    }

    return moved;
  };

  const movers = names.map(scrambler);
  const moved = function (d) { movers.forEach(function (m) { m(d); }); };

  let lx = null, ly = null, lastScroll = scrollY;
  addEventListener('pointermove', function (e) {
    if (lx !== null) moved(Math.hypot(e.clientX - lx, e.clientY - ly));
    lx = e.clientX; ly = e.clientY;
  }, { passive: true });
  addEventListener('scroll', function () {
    moved(Math.abs(scrollY - lastScroll));
    lastScroll = scrollY;
  }, { passive: true });
  // Scrolling inside anything else (the work reel, sideways) scrambles it too. Scroll
  // events don't bubble, so listen in the capture phase. Each step counts at most
  // MAX_JUMP px, so the reel's instant loop jumps don't count as travel.
  const MAX_JUMP = 200;
  const lastPos = new WeakMap();
  document.addEventListener('scroll', function (e) {
    const el = e.target;
    if (!el || el === document || el === document.documentElement) return;
    const prev = lastPos.get(el);
    const pos = { x: el.scrollLeft, y: el.scrollTop };
    lastPos.set(el, pos);
    if (prev) moved(Math.min(MAX_JUMP, Math.hypot(pos.x - prev.x, pos.y - prev.y)));
  }, { capture: true, passive: true });
})();
