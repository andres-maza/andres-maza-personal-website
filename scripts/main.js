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

  // init Flickity when image in carousel has loaded, toggle 'fd' CSS fade transition class.
  // Also some handling for if caroursel is in view or not.
  $('.main-carousel').each(function(i, item) {
    let parentElement = $(this);
    let isImageInViewPort = false;

    $(parentElement[0].children).each(function(i, item) {
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

        if(isElementXPercentInViewport(parentElement[0], 30)) {
          parentElement.flickity('playPlayer');
        }
        else {
          parentElement.flickity('stopPlayer');
        }
      })
    })
  });

  // Play/plause Flickity on scroll.
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

  // Force resume Flickity after mouseleave.
  // Fixes indefinite pause from Flickity on user click.
  $(`.main-carousel`).on('mouseleave', function() {
    console.log($(this));
    $(this).flickity('stopPlayer');

    setTimeout( () => {
      $(this).flickity('playPlayer');
    }, 1000)
  });

  // Force resume Flickity after user ends touch.
  $(`.main-carousel`).on('touchend', function() {
    console.log($(this));
    $(this).flickity('stopPlayer');

    setTimeout( () => {
      $(this).flickity('playPlayer');
    }, 1000)
  });

  // Flickity expand container for carousels that use "Expand Button".
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
