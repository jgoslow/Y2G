jQuery(function($){

  var w = $(window).width(),
    h = $(window).height();

  resizePage(w);


  $(window).on('scroll', function() { // Add scroll class when
    $('header').removeClass('menu-open');
    if ($(window).scrollTop() > 20) {
      $('body').addClass('scroll');
    } else {
      $('body').removeClass('scroll');
    }
  });
  $('.mobile-menu-bg').click(function(){
    $('header').removeClass('menu-open');
  });


  var oldWindowWidth = $(window).width();
  $(window).bind('resize', function(e) {
    var newWindowWidth = $(window).width();
    window.resizeEvt;
    $(window).resize(function(windowWidth) {
      var currentWindowWidth = $(window).width();
      clearTimeout(window.resizeEvt);
      window.resizeEvt = setTimeout(function() {
        // Fire on Resize
        resizePage(currentWindowWidth, oldWindowWidth);
        oldWindowWidth = currentWindowWidth;
      }, 250);
    });
  });

  function resizePage(newW, oldW) {
    replaceImages(newW);
    if (newW < 769) {
      mobileBind();
    } else {
      mobileUnbind();
    }
  }

  function replaceImages(newW) {
    $('img.respond').each(function(){
      var src
      if (newW < 415) {
        src = $(this).attr('data-mobile');
        if (src == undefined) { src = $(this).attr('src'); }
        $(this).attr('src', src);
      } else if (newW < 650) {
        src = $(this).attr('data-medium');
        if (src == undefined) { src = $(this).attr('data-tablet'); }
        $(this).attr('src', src);
      } else if (newW < 769) {
        src = $(this).attr('data-tablet');
        if (src == undefined) { src = $(this).attr('data-default'); }
        $(this).attr('src', src);
      } else {
        src = $(this).attr('data-default');
        if (src == undefined) { src = $(this).attr('src'); }
        $(this).attr('src', src);
      }
      //console.log('replace images: ' + newW, src);
    });
  }

  function mobileBind() {
    //console.log('mobileBind()');
    $('.mobile-menu-btn').unbind().click(function(){
      $('header').toggleClass('menu-open');
    });
  }
  function mobileUnbind() {
    //console.log('mobileUnbind()');
    $('.mobile-menu-btn').unbind();
  }


});
