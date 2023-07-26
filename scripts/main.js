document.addEventListener('DOMContentLoaded', function() {


  $(document).on('scroll', function() {
    let scrollValue = $(this).scrollTop();
    let windowWidth = $(window).width();

    if (windowWidth > 430) {
      if (scrollValue > 175) {
        $('#intro').css({
          'opacity': '0.1'
        })
      } else if (scrollValue < 175) {
        $('#intro').css({
          'opacity': '1'
        })
      }
    }
  });

  // https://stackoverflow.com/a/45822037
  $("body").children().each(function() {
      document.body.innerHTML = document.body.innerHTML.replace(/\u2028/g, ' ');
  });

  // https://stackoverflow.com/a/51121566 (Check % of Element in Viewport is True or False)
  const isElementXPercentInViewport = function(el, percentVisible) {
    let rect = el.getBoundingClientRect(),
      windowHeight = (window.innerHeight || document.documentElement.clientHeight);

    return !(
      Math.floor(100 - (((rect.top >= 0 ? 0 : rect.top) / +-(rect.height / 1)) * 100)) < percentVisible ||
      Math.floor(100 - ((rect.bottom - windowHeight) / rect.height) * 100) < percentVisible
    )
  };

  // https://stackoverflow.com/a/7717572 Smooth Scrolling w/ URL update
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

      //On Change Visible Overflow then 500ms Back to Hidden
      $(parentElement[0].children[0].children[0].children).each(function(i, item) {
        if (item.className === 'carousel-cell mobile is-selected') {
          $(parentElement).addClass('is-overflow-visible');
          $(parentElement).removeClass('is-scroll');

          setTimeout(() => {
            $(parentElement).removeClass('is-overflow-visible');
            $(parentElement).addClass('is-scroll');
          }, 2000)
        }
      })
    })
  });

  $('.main-carousel').on('ready.flickity', function () {
    $(this).removeClass('ld');
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
      }, 1000)
    });

    //Resume on Mouse Leave
    $(this).on('mouseleave', function() {
      setTimeout( () => {
        $(this).flickity('playPlayer');
      }, 1000)
    });

    //Pause on Scroll Resume After 3s
    $(this).on('scroll', function () {
      $(this).flickity('pausePlayer');

      setTimeout( () => {
        $(this).flickity('playPlayer');
      }, 3000)
    });
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
