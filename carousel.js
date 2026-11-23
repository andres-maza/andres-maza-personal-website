// Work reel: a sideways strip of slides that scrolls freely by hand, with the next slide
// peeking in from the right, and no ends: it loops forever in both directions.
//
// The loop: the slides are set out three times (the copies hidden from screen readers)
// and the strip starts on the middle set. Whenever it drifts more than half a set away
// from the middle, it jumps back by exactly one set, instantly; the copies are identical,
// so the jump can't be seen. Previous / Next / arrow keys step one slide; clicking a slide
// brings it to the front (clicking the front one goes to the next). The caption names
// the project of the slide at the front.
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
  const before = copy(), after = copy();
  frame.prepend.apply(frame, before);
  frame.append.apply(frame, after);
  const slides = before.concat(originals, after);

  const step = function () { return slides[1].offsetLeft - slides[0].offsetLeft; };
  const setWidth = function () { return n * step(); };
  const jump = function (left) {                      // instant, whatever the CSS says
    frame.style.scrollBehavior = 'auto';
    frame.scrollLeft = left;
    frame.style.scrollBehavior = '';
  };
  const index = function () { return Math.round(frame.scrollLeft / step()); };   // in the whole strip
  let front = n;   // strip index of the slide at the front
  const label = function () {
    front = index();
    const i = ((front % n) + n) % n;
    caption.textContent = originals[i].dataset.name;
  };

  // Keep the strip near the middle set (unless a programmed step is still gliding).
  let gliding = false, glideTimer = null;
  const recentre = function () {
    if (gliding) return;
    const w = setWidth();
    if (frame.scrollLeft < w * 0.5) jump(frame.scrollLeft + w);
    else if (frame.scrollLeft > w * 1.5) jump(frame.scrollLeft - w);
  };

  // Bring strip slide i (any copy) to the front, smoothly.
  const go = function (i) {
    const w = setWidth(), s = step();
    // Recentre first, so the glide never needs a jump half way.
    if (i * s < w * 0.5) { jump(frame.scrollLeft + w); i += n; }
    else if (i * s > w * 1.5) { jump(frame.scrollLeft - w); i -= n; }
    gliding = true;
    clearTimeout(glideTimer);
    glideTimer = setTimeout(function () { gliding = false; recentre(); }, 900);   // fallback for browsers without scrollend
    frame.scrollTo({ left: i * s });
  };
  frame.addEventListener('scrollend', function () { gliding = false; clearTimeout(glideTimer); recentre(); });

  document.querySelectorAll('.reel-bar a').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); go(index() + Number(a.dataset.step)); });
  });
  slides.forEach(function (img, i) {
    img.addEventListener('click', function () { go(i === index() ? i + 1 : i); });
  });
  frame.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(index() + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(index() - 1); }
  });

  let queued = false;
  frame.addEventListener('scroll', function () {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; recentre(); label(); });
  }, { passive: true });
  addEventListener('resize', function () { jump(front * step()); });   // keep the front slide in place

  jump(setWidth());   // start on the middle set's first slide
  label();
})();
