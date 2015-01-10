jQuery(function($){

  $('.show-gardener-profile-signup').click(function(){
    $(this).slideUp();
    $('.gardener-profile-signup').slideDown();
  });

  /*console.log('hello');
  $('input.watch, textarea.watch').each(function(this){
    checkLocal(this.val('name'), this);
  }).keyup(function(){
    storeLocal($(this).val('name'), $(this).val());
  });*/

  /*$('input[name="username"]').parsley()
  .addAsyncValidator('username', function (xhr) {
    console.log(this.$element); // jQuery Object[ input[name="q"] ]
    return 404 === xhr.status;
  }, '/account/username-check/');

  $('input[name="email"]').parsley()
  .addAsyncValidator('email', function (xhr) {
    console.log(this.$element); // jQuery Object[ input[name="q"] ]
    return 404 === xhr.status;
  }, '/account/email-check/');*/


  /*$('#UserLogin').parsley().addAsyncValidator(
    'validateUsername', function (xhr) {
      var UserLogin = $('#UserLogin').parsley();
      window.ParsleyUI.removeError(UserLogin,'errorUsername');
      console.log(xhr);
      if(xhr.responseText == 'false') {
        return 200;
      } else {
          window.ParsleyUI.addError(UserLogin,'errorUsername','This username is already taken');
      }
    }, '/account/username-check/');
  $('#UserEmail').parsley().addAsyncValidator(
    'validateEmail', function (xhr) {
      var UserEmail = $('#UserEmail').parsley();
      window.ParsleyUI.removeError(UserEmail,'errorEmail');
      console.log(xhr);
      if(xhr.responseText == 'false') {
        return 200;
      } else {
        window.ParsleyUI.addError(UserEmail,'errorEmail','That email is already in use. Please use a different email, or <a href="#">reset your password</a>.');
      }
    }, '/account/username-check/');*/


});
