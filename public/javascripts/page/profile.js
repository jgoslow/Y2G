jQuery(function($){

  if (localStorage.getItem('login') == 'true') {

    if (localStorage.getItem('y2g-name')) {$('.y2g-name').html(localStorage.getItem('y2g-name'));}
    if (localStorage.getItem('y2g-location')) {$('.y2g-location').html(localStorage.getItem('y2g-location'));}
    if (localStorage.getItem('y2g-bio')) {$('.y2g-bio').html(localStorage.getItem('y2g-bio'));}
    if (localStorage.getItem('y2g-reasons')) {$('.y2g-reasons').html(localStorage.getItem('y2g-reasons'));}
    if (localStorage.getItem('y2g-name')) {$('.y2g-name').html(localStorage.getItem('y2g-name'));}

  } else {
    // If Not logged in - load login form and hide profile
    $.ajax({ url: '/login.html',
      data: {/*action: action, distance: distance*/},
      type: 'post',
      success: function(output) {
        $('#profile').hide();
        $('#login_profile').html(output);
        setTimeout(function(){
          $('#login_form .submit').click(function(){
            $('#login_profile').fadeOut();
            setTimeout(function(){ $('#profile').fadeIn(); login(); return false; }, 500 );
          });
        }, 500);
      },
      error: function(output) {
        alert(output);
        return false;
      },
    });

  }

  showListings();

});
