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

function deleteConfirm(form) {
  var deleteForm = '<div class="deleteForm steps">' +
    '<div class="step" data-step="1">' +
    '<h4>Are you sure you want to Delete your account?</h4>'+
    '<a class="btn-option" href="/account/delete">DELETE</a>'+
    '<a class="btn-option grey" onclick="$(\'#message\').fadeOut()">Not Yet</a>'+
    '</div>'+
    '</div>'
  y2g.message(deleteForm, 'info')
}

function deleteAccount() {

  y2g.message()
  if (confirm('All of your listings will be removed from the map. Are you sure you want to delete your account?')) {
    window.location.href = '/account/remove';
    return true;
  } else {
    return false;
  }
}

function gotoStep(step) {

}
