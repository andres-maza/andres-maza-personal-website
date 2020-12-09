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

  $('.main-carousel').each(function(i, item) {
    let parentElement = $(this);
    let numImageLoaded = 0;

    // Init Flickity Once All Images in Cell Done Loading
    function myFunction () {
      if(numImageLoaded >= parentElement[0].children.length) {
        parentElement.flickity({
          cellAlign: 'left',
          contain: true,
          freeScroll: true,
          prevNextButtons: false,
          pageDots: false,
          imagesLoaded: true,
          adaptiveHeight: true,
          autoPlay: 2000
        });

        if(isElementXPercentInViewport(parentElement[0], 30)) {
          parentElement.flickity('playPlayer');
        }
        else {
          parentElement.flickity('stopPlayer');
        }
      }
    }
    // Load Images in Cell
    $(parentElement[0].children).each(function(i, item) {
      // console.log(i);
      $($(this)[0].children).on('load', function() {
        numImageLoaded++;
        $(this).fadeIn('slow');
        $(this).toggleClass('fd');

        myFunction();
      })
    });

    //Change Slide Scroll Top
    parentElement.on('change.flickity', function(event, index) {
      parentElement[0].scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    })
  });

  $('.main-carousel').on('ready.flickity', function () {
    $(this).removeClass('ld');
    //Pause on Scroll
    $(this).on('scroll', function () {
      $(this).flickity('pausePlayer');
    });

    //Resume on Mouse Leave
    $(this).on('mouseleave', function() {
      setTimeout( () => {
        $(this).flickity('playPlayer');
      }, 2000)
    });

    //Pause on Touch Start
    $(this).on('touchstart', function() {
      $(this).flickity('pausePlayer');
    });

    //Pause on Touch Move
    $(this).on('touchmove', function() {
      $(this).flickity('pausePlayer');
    });

    //Resume on Touch End
    $(this).on('touchend', function() {
      setTimeout( () => {
        $(this).flickity('playPlayer');
      }, 2000)
    })

  });

  // If Flickity on ViewPort then PlayPlayer, else PausePlayer
  $(document).on('scroll', function() {
    $('.main-carousel').each(function(i, item) {
      if(isElementXPercentInViewport(item, 30)) {
        $(this).flickity('playPlayer')
        return;
      } else {
        $(this).flickity('pausePlayer');
      }
    });
  });
});
