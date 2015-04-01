$(function(){

  _gaq.push(['_trackPageview','/listings/edit-single']) // Analytics

  /*var editListingType = $('.edit-listing-form').data('type');
  $('.edit-listing-form .choose-type .'+editListingType).addClass('active');
  $('.edit-listing-form .choose-type a').click(function(){
    var type = $(this).data('type');
    $('.edit-listing-form').data('type', type).removeClass('gardener space organic tools').addClass(type);
    $(this).siblings().removeClass('active');
    $(this).addClass('active');
    return false;
  });*/

  $('.edit-listing-form input, .edit-listing-form textarea').on('input', function(){
    $('.edit-listing-form input[type="submit"]').prop('disabled', false)
  })






})
