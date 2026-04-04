(function () {
  const imgs = document.querySelectorAll('.carousel-card img');

  imgs.forEach(function (img) {
    if (img.complete && img.naturalWidth > 0) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', function () {
        img.classList.add('loaded');
      });
    }
  });
})();
