(function () {
  const viewport = document.querySelector('.carousel-viewport');
  const track = document.getElementById('carousel-track');
  const cards = Array.from(track.querySelectorAll('.carousel-card'));
  let index = 0;

  function getStep() {
    return viewport.offsetWidth;
  }

  function advance() {
    index = (index + 1) % cards.length;
    track.style.transform = `translateX(-${index * getStep()}px)`;
  }

  // Reset position on resize so cards stay aligned
  window.addEventListener('resize', function () {
    index = 0;
    track.style.transform = 'translateX(0)';
  });

  setInterval(advance, 3000);
})();
