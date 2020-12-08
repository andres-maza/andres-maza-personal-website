document.addEventListener('DOMContentLoaded', function() {

  // https://stackoverflow.com/a/51121566 (Check % of Element in Viewport is True or False)
  const isElementXPercentInViewport = function(el, percentVisible) {
    let rect = el.getBoundingClientRect(),
      windowHeight = (window.innerHeight || document.documentElement.clientHeight);

    return !(
      Math.floor(100 - (((rect.top >= 0 ? 0 : rect.top) / +-(rect.height / 1)) * 100)) < percentVisible ||
      Math.floor(100 - ((rect.bottom - windowHeight) / rect.height) * 100) < percentVisible
    )
  };

  // https://stackoverflow.com/a/7717572 Smooht Scrolling w/ URL update
  $('a[href^="#"]').click(function () {
    $('html, body').animate({
        scrollTop: $('[name="' + $.attr(this, 'href').substr(1) + '"]').offset().top
    }, 500);

    return false;
  });

  // $('img').each(function(i, item) {
  //   $(this).on('load', function() {
  //     $(this).fadeIn('slow');
  //     $(this).toggleClass('fd')
  //   });
  // });

  // jQuery rather than Vanilla JS :'(
  // $('.main-carousel').flickity({
  //   cellAlign: 'left',
  //   contain: true,
  //   freeScroll: true,
  //   prevNextButtons: false,
  //   pageDots: false,
  //   imagesLoaded: true,
  //   autoPlay: 2000
  // });

  $('.main-carousel').each(function(i, item) {
    let parentElement = $(this);
    // console.log(parentElement[0].children);
    $(parentElement[0].children).each(function(i, item) {
      // console.log($(this)[0].children);
      $($(this)[0].children).on('load', function() {
        parentElement.flickity({
          cellAlign: 'left',
          contain: true,
          freeScroll: true,
          prevNextButtons: false,
          pageDots: false,
          imagesLoaded: true,
          autoPlay: 2000
        });

        $(this).fadeIn('slow');
        $(this).toggleClass('fd');
      })
    })
  });

  $('.main-carousel').each(function(i, item) {
    if(isElementXPercentInViewport(item, 30)) {
      $(this).flickity('playPlayer')
      return;
    } else {
      $(this).flickity('pausePlayer');
    }
  });

  $(document).on('scroll', function() {
    $('.main-carousel').each(function(i, item) {
      if(isElementXPercentInViewport(item, 30)) {
        $(this).flickity('unpausePlayer')
        return;
      } else {
        $(this).flickity('pausePlayer');
      }
    });
  });

  $(`.main-carousel`).on('mouseleave', function() {
    console.log($(this));
    $(this).flickity('stopPlayer');

    setTimeout( () => {
      $(this).flickity('playPlayer');
    }, 1000)
  });

  $(`.main-carousel`).on('touchend', function() {
    console.log($(this));
    $(this).flickity('stopPlayer');

    setTimeout( () => {
      $(this).flickity('playPlayer');
    }, 1000)
  });

  $('.expand_btn').on('click', function() {
    let targetElementId= `#${$(this)[0].parentElement.parentElement.id}`;
    let targetText = $(this)[0].children[0].innerText;

    $(`${targetElementId} .main-carousel`).toggleClass('is-expanded').flickity('resize');

    if(targetText == 'Expand Screen') {
      $(this)[0].children[0].innerText = 'Collapse Screen';
    }
    else if (targetText == 'Collapse Screen') {
      $(this)[0].children[0].innerText = 'Expand Screen';
    }
  });

});
