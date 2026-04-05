(function () {
  const rects = document.querySelectorAll('.logo-sidebar svg rect');

  const colors = [
    // Bright
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
    // Slightly muted
    '#CC3333', '#CC6633', '#CC9933', '#99CC33', '#33CC66', '#33CCAA',
    '#3399CC', '#3366CC', '#6633CC', '#9933CC', '#CC33AA', '#CC3366',
    '#B35900', '#669900', '#007A7A', '#004DB3', '#6600AA', '#AA0055',
    '#E05C5C', '#E08C5C', '#E0C45C', '#A8E05C', '#5CE09E', '#5CC4E0',
    '#5C82E0', '#845CE0', '#C45CE0', '#E05CB8', '#B87A3D', '#7AB83D',
    '#3DB87A', '#3D7AB8', '#7A3DB8', '#B83D7A', '#8C5E3C', '#5E8C3C',
    // Dark
    '#7A0000', '#7A3300', '#7A6600', '#4D7A00', '#007A33', '#007A66',
    '#004D7A', '#00007A', '#33007A', '#66007A', '#7A0066', '#7A0033',
    '#4A1A00', '#1A4A00', '#00401A', '#001A4A', '#1A004A', '#4A001A',
    '#3D2B1F', '#2B3D1F', '#1F3D2B', '#1F2B3D', '#2B1F3D', '#3D1F2B',
  ];

  const SPREAD = Math.floor(colors.length / rects.length);
  let mouseX = 0;
  let intervalId = null;

  function isMobile() {
    return window.innerWidth <= 600;
  }

  function applyColors(base) {
    rects.forEach(function (rect, i) {
      const index = (base + i * SPREAD) % colors.length;
      rect.setAttribute('fill', colors[index]);
    });
  }

  // ── Mobile: scroll only ──────────────────────────────────────────
  function handleMobileScroll() {
    if (!isMobile()) return;
    const scrollProgress = window.scrollY / (document.body.scrollHeight - window.innerHeight) || 0;
    applyColors(Math.floor(scrollProgress * colors.length) % colors.length);
  }

  function setupMobile() {
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
