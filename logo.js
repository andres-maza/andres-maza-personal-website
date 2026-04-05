(function () {
  const rects = document.querySelectorAll('.logo-sidebar svg rect');

  const colors = [
    '#FF0000', '#FF3300', '#FF6600', '#FF9900', '#FFCC00', '#FFFF00',
    '#CCFF00', '#99FF00', '#66FF00', '#33FF00', '#00FF00', '#00FF33',
    '#00FF66', '#00FF99', '#00FFCC', '#00FFFF', '#00CCFF', '#0099FF',
    '#0066FF', '#0033FF', '#0000FF', '#3300FF', '#6600FF', '#9900FF',
    '#CC00FF', '#FF00FF', '#FF00CC', '#FF0099', '#FF0066', '#FF0033',
    '#FF3366', '#FF6699', '#FF6633', '#FF9966', '#FFCC33', '#FFFF33',
    '#CCFF33', '#66FF33', '#33FFCC', '#33CCFF', '#3366FF', '#9933FF',
    '#FF33CC', '#FF3399', '#00CCCC', '#CC00CC', '#CCCC00', '#00CC66',
    '#6600CC', '#CC6600', '#0066CC', '#CC0066', '#66CC00', '#00CC99',
    '#FF4500', '#FF1493', '#00BFFF', '#7FFF00', '#FF69B4', '#1E90FF',
    '#ADFF2F', '#FF6347', '#40E0D0', '#EE82EE', '#F4A460', '#00FA9A',
  ];

  const SPREAD = Math.floor(colors.length / rects.length);
  let mouseX = 0;
  let intervalId = null;
  let lastOrientationUpdate = 0;

  function isMobile() {
    return window.innerWidth <= 600;
  }

  function applyColors(base) {
    rects.forEach(function (rect, i) {
      const index = (base + i * SPREAD) % colors.length;
      rect.setAttribute('fill', colors[index]);
    });
  }

  // ── Mobile: orientation ──────────────────────────────────────────
  function handleOrientation(e) {
    if (!isMobile()) return;
    const now = Date.now();
    if (now - lastOrientationUpdate < 100) return;
    lastOrientationUpdate = now;

    const x = ((e.gamma || 0) + 90)  / 180;
    const y = ((e.beta  || 0) + 180) / 360;
    applyColors(Math.floor((x + y) * colors.length) % colors.length);
  }

  function handleMobileScroll() {
    if (!isMobile()) return;
    const scrollProgress = window.scrollY / (document.body.scrollHeight - window.innerHeight) || 0;
    applyColors(Math.floor(scrollProgress * colors.length) % colors.length);
  }

  function setupMobile() {
    if (typeof DeviceOrientationEvent === 'undefined') return;

    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      // iOS 13+ — request on first tap
      document.addEventListener('touchstart', function askPermission() {
        DeviceOrientationEvent.requestPermission()
          .then(function (state) {
            if (state === 'granted') {
              window.addEventListener('deviceorientation', handleOrientation);
            }
          })
          .catch(function () {});
      }, { once: true });
    } else {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    window.addEventListener('scroll', handleMobileScroll);
  }

  // ── Desktop: mouse + scroll via interval ────────────────────────
  function startDesktopInterval() {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(function () {
      if (isMobile()) return;
      const scrollProgress = window.scrollY / (document.body.scrollHeight - window.innerHeight) || 0;
      const base = Math.floor((mouseX + scrollProgress) * colors.length) % colors.length;
      applyColors(base);
    }, 100);
  }

  document.addEventListener('mousemove', function (e) {
    if (isMobile()) return;
    mouseX = e.clientX / window.innerWidth;
    if (!intervalId) startDesktopInterval();
  });

  window.addEventListener('scroll', function () {
    if (!isMobile() && !intervalId) startDesktopInterval();
  });

  // ── Init ─────────────────────────────────────────────────────────
  if (isMobile()) {
    setupMobile();
  }

  window.addEventListener('resize', function () {
    if (isMobile()) {
      if (intervalId) { clearInterval(intervalId); intervalId = null; }
      setupMobile();
    } else {
      if (intervalId) startDesktopInterval();
    }
  });
})();
