// Work reel: a sideways strip of slides that scrolls freely by hand, with the next slide
// peeking in from the right, and no ends: it loops forever in both directions.
//
// The loop: the slides are set out five times (the copies hidden from screen readers) and
// the strip rests in the middle set. When it comes to rest in another set it jumps back by
// whole sets, instantly; the copies are identical, so the jump can't be seen. It never
// jumps during a glide or a touch flick (phones fight it: the strip runs backwards or stops
// dead); two spare sets on each side are the runway. Previous / Next / arrow keys step one
// slide from wherever the strip is heading, so quick presses all count; clicking a slide
// brings it to the front (the front one's halves step back and on). The caption names the
// project of the slide at the front.
(function () {
  const frame = document.querySelector('.reel-frame');
  const originals = frame ? Array.from(frame.querySelectorAll('img')) : [];
  const caption = document.querySelector('.reel .caption');
  const n = originals.length;
  if (!n) return;

  // Copies before and after the originals.
  const copy = function () {
    return originals.map(function (img) {
      const c = img.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      c.alt = '';
      return c;
    });
  };
  const SPARE = 2;                // sets on each side of the middle one
  const before = [], after = [];
  for (let k = 0; k < SPARE; k++) { before.push.apply(before, copy()); after.push.apply(after, copy()); }
  frame.prepend.apply(frame, before);
  frame.append.apply(frame, after);
  const slides = before.concat(originals, after);
  const HOME = SPARE * n;         // strip index of the middle set's first slide

  // Off-screen slides load, and decode, once the page has, so a quick flick never meets an
  // empty one. (decoding="sync" in the page: never shown empty while decoding, either.)
  const loadAll = function () {
    slides.forEach(function (img) { img.loading = 'eager'; });
    originals.reduce(function (p, img) {
      return p.then(function () { return img.decode && img.decode().catch(function () {}); });
    }, Promise.resolve());
  };
  if (document.readyState === 'complete') loadAll(); else addEventListener('load', loadAll);

  const step = function () { return slides[1].getBoundingClientRect().left - slides[0].getBoundingClientRect().left; };   // unrounded, so it doesn't drift over many slides
  const setWidth = function () { return n * step(); };
  const jump = function (left) {                      // instant, whatever the CSS says
    frame.style.scrollBehavior = 'auto';
    frame.scrollLeft = left;
    frame.style.scrollBehavior = '';
  };
  const index = function () { return Math.round(frame.scrollLeft / step()); };   // in the whole strip
  let front = HOME, lit = -1;   // strip index of the slide at the front
  const label = function () {
    front = index();
    if (front === lit) return;       // nothing to change until another slide reaches the front
    lit = front;
    // Mark every copy of the front slide (it has its own cursors, styles.css).
    slides.forEach(function (img, k) { img.classList.toggle('is-front', (k - front) % n === 0); });
    const i = ((front % n) + n) % n;
    const name = originals[i].dataset.name;
    if (caption.textContent !== name) caption.textContent = name;
  };

  // Coming to rest: no scrolling for REST ms and no finger down. Only then is the strip
  // brought back to the middle set.
  const REST = 160;
  let goal = HOME;           // strip index the glide is heading for
  let gliding = false, restTimer = null;
  let touching = false, touch = false;   // a finger is down; the last scroll was by touch
  const recentre = function () {
    const sets = Math.floor((index() - HOME) / n);
    if (sets) jump(frame.scrollLeft - sets * setWidth());
  };
  const restIn = function (ms) {
    clearTimeout(restTimer);
    restTimer = setTimeout(function () {
      if (touching) return;                 // lifting the finger starts the wait again
      gliding = false;
      recentre();
    }, ms);
  };
  frame.addEventListener('touchstart', function () { touching = touch = true; gliding = false; }, { passive: true });
  ['touchend', 'touchcancel'].forEach(function (t) {
    frame.addEventListener(t, function (e) { touching = e.touches.length > 0; restIn(REST); }, { passive: true });
  });
  frame.addEventListener('wheel', function () { touch = false; gliding = false; }, { passive: true });
  // A long wheel scroll or drag may reach the end of the runway without resting. (A touch
  // flick or a glide is left alone.)
  const runway = function () {
    if (gliding || touch) return;
    const s = step(), end = frame.scrollWidth - frame.clientWidth;
    if (frame.scrollLeft < 2 * s) jump(frame.scrollLeft + SPARE * setWidth());
    else if (frame.scrollLeft > end - 2 * s) jump(frame.scrollLeft - SPARE * setWidth());
  };

  // Bring strip slide i (any copy) to the front, smoothly.
  let offAt = null;      // where the mouse was when the strip landed
  let leanOff = false;   // after a step the strip lands square: and stays put while the mouse is at that edge of it (moving onto another slide, to the middle or away brings the lean back)
  const go = function (i) {
    stopCoast();
    leanOff = true;
    offAt = null;
    lean();
    const s = step();
    if (i < 0 || i * s > frame.scrollWidth - frame.clientWidth) {   // off the runway (a long run of presses without a pause)
      goal = HOME + ((i % n) + n) % n;
      gliding = false;
      jump(goal * s);
      return;
    }
    goal = i;
    gliding = true;
    restIn(400);            // in case it's already there and nothing scrolls
    frame.scrollTo({ left: i * s });
  };
  const by = function (d) { go((gliding ? goal : index()) + d); };   // from where it's heading

  document.querySelectorAll('.reel-bar a').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); by(Number(a.dataset.step)); });
  });
  // Clicking the front slide: its left half goes back, its right half goes on.
  // Clicking any other slide brings that one to the front.
  const sideOf = function (img, x) {
    const r = img.getBoundingClientRect();
    return x < r.left + r.width / 2 ? -1 : 1;
  };
  slides.forEach(function (img, i) {
    img.addEventListener('click', function (e) {
      if (i === index()) by(sideOf(img, e.clientX)); else go(i);
    });
  });

  // Dragging with a mouse: the strip follows the hand, then coasts to a stop. A press that
  // moves less than DRAG_MIN px is still a click. (Touch already scrolls natively.)
  const DRAG_MIN = 5, COAST = 0.995, COAST_END = 0.1;   // COAST: share of speed kept per ms; COAST_END: px per ms, below which single-pixel steps would show
  let press = null, dragged = false, coasting = 0, carry = 0;
  const slide = function (d) {         // scroll by d px, keeping the fraction for next time
    carry += d;
    const whole = Math.trunc(carry);
    carry -= whole;
    if (whole) { frame.style.scrollBehavior = 'auto'; frame.scrollLeft += whole; frame.style.scrollBehavior = ''; }
  };
  const stopCoast = function () { cancelAnimationFrame(coasting); coasting = 0; carry = 0; };
  const coast = function (v) {
    let last = performance.now();
    const tick = function (now) {
      const dt = Math.max(0, now - last);
      last = now;
      slide(v * dt);
      v *= Math.pow(COAST, dt);
      coasting = Math.abs(v) > COAST_END ? requestAnimationFrame(tick) : 0;
    };
    coasting = requestAnimationFrame(tick);
  };
  frame.addEventListener('dragstart', function (e) { e.preventDefault(); });   // never pick up the image itself
  frame.addEventListener('pointerdown', function (e) {
    dragged = false;
    stopCoast();
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    press = { id: e.pointerId, x0: e.clientX, x: e.clientX, t: e.timeStamp, v: 0 };
  });
  frame.addEventListener('pointermove', function (e) {
    if (!press || e.pointerId !== press.id) return;
    if (!(e.buttons & 1)) { release(e); return; }        // let go outside the window
    if (!dragged) {
      if (Math.abs(e.clientX - press.x0) < DRAG_MIN) return;
      dragged = true;
      gliding = touch = false;
      frame.setPointerCapture(press.id);
      frame.classList.add('is-dragging');
    }
    const d = press.x - e.clientX, dt = e.timeStamp - press.t;
    slide(d);
    if (dt > 0) press.v = press.v * 0.6 + (d / dt) * 0.4;
    press.x = e.clientX; press.t = e.timeStamp;
  });
  const release = function (e) {
    if (!press || e.pointerId !== press.id) return;
    const p = press;
    press = null;
    frame.classList.remove('is-dragging');
    if (dragged && e.type === 'pointerup' && e.timeStamp - p.t < 80 && !still.matches) coast(p.v);
    lean();
  };
  frame.addEventListener('pointerup', release);
  frame.addEventListener('pointercancel', release);
  frame.addEventListener('wheel', stopCoast, { passive: true });
  frame.addEventListener('click', function (e) {          // the end of a drag isn't a click
    if (dragged) { e.stopPropagation(); e.preventDefault(); dragged = false; }
  }, true);

  // A leaning strip can slide the gap between two slides under the pointer: a click there
  // steps the way it leans.
  frame.addEventListener('click', function (e) {
    if (e.target === frame) by(sideOf(slides[index()], e.clientX));
  });

  // Leaning: as a mouse nears either side of the place where the front slide rests, the
  // strip drifts up to two lines (--unit × 2) that way (so on the left a sliver of the
  // slide before shows). The zones are fixed in the window, not tied to the moving slides,
  // so scrolling by hand never changes the lean, and it holds still during a drag. Off for touch and reduced motion.
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  let pointerX = null;
  const lean = function () {
    if (press && dragged) return;
    const img = slides[index()];
    if (pointerX === null || still.matches || !img) { leanOff = false; frame.style.setProperty('--lean', '0px'); return; }
    const t = (pointerX - frame.getBoundingClientRect().left - parseFloat(getComputedStyle(frame).paddingLeft)) / img.offsetWidth;   // 0 and 1: the resting slide's edges
    const unit = 2 * (parseFloat(getComputedStyle(frame).columnGap) || 28);   // the gap is one --unit
    let k = 0;
    if (t < 0.25) k = Math.min(1, (0.25 - t) / 0.25);     // left quarter: lean back
    else if (t > 0.75) k = -Math.min(1, (t - 0.75) / 0.25);   // right quarter and beyond: lean on
    if (k === 0) leanOff = false;
    frame.style.setProperty('--lean', (leanOff ? 0 : k * unit).toFixed(1) + 'px');
    frame.dataset.side = k === 0 ? '' : sideOf(img, pointerX) < 0 ? 'prev' : 'next';   // arrow cursors near the edges, a hand in the middle
  };
  const track = function (e) {
    if (e.pointerType !== 'mouse') return;
    pointerX = e.clientX;
    if (leanOff) {
      // Only moving on another slide counts, once the strip has landed. A resting hand
      // jitters, so it takes half a line (--unit / 2) of travel.
      const slack = (parseFloat(getComputedStyle(frame).columnGap) || 28) / 2;
      if (gliding || !offAt) offAt = { x: e.clientX, y: e.clientY };
      else if (Math.hypot(e.clientX - offAt.x, e.clientY - offAt.y) >= slack && slides.indexOf(e.target) > -1 && !e.target.classList.contains('is-front')) leanOff = false;
    }
    lean();
  };
  frame.addEventListener('pointermove', track);
  frame.addEventListener('pointerdown', track);
  frame.addEventListener('pointerleave', function () { pointerX = null; lean(); });
  frame.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); by(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); by(-1); }
  });

  let queued = false;
  frame.addEventListener('scroll', function () {
    restIn(REST);
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; runway(); label(); lean(); });
  }, { passive: true });
  addEventListener('resize', function () { jump(front * step()); });   // keep the front slide in place

  jump(HOME * step());   // start on the middle set's first slide
  label();
})();
