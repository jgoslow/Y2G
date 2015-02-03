jQuery(function($){

  var password = $('input[name="newPassword"]')
    , form = $('form.new-password')
    , submit = form.find('button[type=submit]')

  form.parsley()

  $('#newPassword-confirm').bind("propertychange change keyup input paste", function(){
    if (form.parsley().isValid()) {
      form.addClass('ready')
      $('.new-password .btn-update').removeClass('disabled')
    } else {
      form.removeClass('ready')
      $('.new-password .btn-update').addClass('disabled')
    }
  })

  submit.click(function(){
    submit.addClass('disabled')
  })

})

function newPass() {
  $('.field.editing .fa-remove').click()
  $('a.password').hide()
  $('.updatePassField').addClass('editing')
  TweenMax.to($('.new-password'), .5, {opacity: 1, height:150})
}
