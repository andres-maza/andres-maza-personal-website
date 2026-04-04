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
  let timeIndex = 0;
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

  function startInterval() {
    if (intervalId) clearInterval(intervalId);
    const ms = isMobile() ? 300 : 100;
    intervalId = setInterval(function () {
      if (isMobile()) {
        timeIndex = (timeIndex + 1) % colors.length;
        applyColors(timeIndex);
      } else {
        const scrollProgress = window.scrollY / (document.body.scrollHeight - window.innerHeight) || 0;
        const base = Math.floor((mouseX + scrollProgress) * colors.length) % colors.length;
        applyColors(base);
      }
    }, ms);
  }

  // Start immediately on mobile, wait for interaction on desktop
  if (isMobile()) {
    startInterval();
  }

  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX / window.innerWidth;
    if (!intervalId) startInterval();
  });

  window.addEventListener('scroll', function () {
    if (!intervalId) startInterval();
  });

  // Restart with correct timing when crossing the breakpoint
  window.addEventListener('resize', function () {
    if (intervalId) startInterval();
  });
})();
