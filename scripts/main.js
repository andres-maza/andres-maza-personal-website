document.addEventListener('DOMContentLoaded', function() {
  console.log('Hello World!');
  // https://stackoverflow.com/a/51121566 (Check % of Element in Viewport is True or False)
  const isElementXPercentInViewport = function(el, percentVisible) {
    let rect = el.getBoundingClientRect(),
      windowHeight = (window.innerHeight || document.documentElement.clientHeight);

    return !(
      Math.floor(100 - (((rect.top >= 0 ? 0 : rect.top) / +-(rect.height / 1)) * 100)) < percentVisible ||
      Math.floor(100 - ((rect.bottom - windowHeight) / rect.height) * 100) < percentVisible
    )
  };

  // element argument can be a selector string
  // for an individual element

  var caseStudyCarousels = document.querySelectorAll('.main-carousel');

  // for (let i = 0; i < caseStudyCarousels.length; i++) {
  //   var flkty = new Flickity (caseStudyCarousels[i], {
  //     //options
  //     cellAlign: 'left',
  //     contain: true,
  //     freeScroll: true,
  //     contain: true,
  //     prevNextButtons: false,
  //     pageDots: false,
  //     autoPlay: 1500
  //   });
  // };

  $('.main-carousel').flickity({
    // options
    cellAlign: 'left',
    contain: true,
    freeScroll: true,
    autoPlay: 1500
  });

  document.addEventListener('scroll', function() {
    $('.main-carousel').each(function(i, item) {
      if(isElementXPercentInViewport(item, 50)) {
        $(this).flickity('unpausePlayer')
        return;
      } else {
        $(this).flickity('pausePlayer');
      }
    });

    // $('.main-carousel').each(function() {
    //   if(isElementXPercentInViewport(this, 50)){
    //     $('.main-carousel').flickity('pausePlayer');
    //   }
    //   else {
    //   }
    // })
    // for (let i = 0; i < caseStudyCarousels.length; i++) {
    //   let isHalfVisible = isElementXPercentInViewport(caseStudyCarousels[i], 50);
    //
    //   if (isHalfVisible) {
    //     console.log(flkty.getCellElements());
    //
    //   }
    // };
  })


  // let containsClass = console.log(caseStudyCarousels[i].classList.contains('flickity-enabled'));
  //
  // // If in viewport and does not contain Flickity class, then set a new Flickity slider to element.
  // if (singleCaseStudy && !containsClass) {
  //   console.log(caseStudyCarousels[i]);
  //
  //   var flkty = new Flickity (caseStudyCarousels[i], {
  //     cellAlign: 'left',
  //     contain: true,
  //     freeScroll: true,
  //     contain: true,
  //     prevNextButtons: false,
  //     pageDots: false,
  //     autoPlay: 1500
  //   })
  //
  //   if (singleCaseStudy && containsClass) {
  //     flkty.options.autoPlay = false;
  //   }
  //
  // } else {
  //   return
  // }


  // document.addEventListener('scroll', function() {
  //
  //   for (let i = 0; i < caseStudyCarousels.length; i++) {
  //     let singleCaseStudyCarousel = caseStudyCarousels[i]
  //
  //     let isInWindow = isElementXPercentInViewport(singleCaseStudyCarousel, 50);
  //
  //     if (isInWindow) {
  //       console.log('True');
  //     } else {
  //       console.log('False');
  //     }
  //   }
  //   //
  //   // let isInWindow = isElementXPercentInViewport(singleCaseStudyCarousel, 50);
  //   //
  //   // if (isInWindow) {
  //   //   console.log('True');
  //   // }
  //   // else {
  //   //   console.log('False');
  //   // }
  // });


});
