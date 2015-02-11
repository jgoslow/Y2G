
_gaq.push(['_trackPageview','/listings/create-type']) // Analytics

var listingType = $('#new-listing').data('type');
console.log('.choose-type .'+listingType);
$('.choose-type .'+listingType).addClass('active');
$('.new-listing .choose-type a').click(function(){
  var type = $(this).data('type');
  $('#new-listing').data('type', type).removeClass('gardener space organic tools').addClass(type);
  $(this).siblings().removeClass('active');
  $(this).addClass('active');
  $('#listingType').val(type);
  return false;
});

$('.new-listing .goto').click(function(){
  if ($(this).hasClass('disabled')) {
    var msg = $(this).data('error');
    y2g.message(msg, 'error', 2);
    return false;
  }
  var goto = $(this).data('goto');
  if (goto == 2) {
    _gaq.push(['_trackPageview','/listings/create-type-chosen']) // Analytics
      _gaq.push(['_trackPageview','/listings/create-location']) // Analytics
  }
  else if (goto == 3) {
    _gaq.push(['_trackPageview','/listings/create-profile']) // Analytics
  }
  if (goto !== $('.new-listing').data('current-step')) {
    TweenLite.to($('.new-listing .steps-container'), .5, {marginLeft: -100*(goto-1)+'%'});
    $('.new-listing .steps .current, .new-listing .step.current').removeClass('current');
    $('.new-listing .steps li:nth-child('+goto+'), .new-listing .step:nth-child('+goto+')').addClass('current');
    $('.new-listing').data('current-step', goto);
  }
  return false;
});

$(document).keydown(function(e){
  if (e.keyCode == 13) {
    if ($(document.activeElement).is('.location')) {
      var address = $('.new-listing input.location').val();
      getLocation(address, null, selectLocation);
      $('.location-results div').remove();
      $('#location-results').addClass('searching');
      return false;
    }
  }
});
$('.new-listing .get-location').click(function(){
  _gaq.push(['_trackPageview','/listings/create-location-search']) // Analytics
  var address = $('.new-listing input.location').val();
  getLocation(address, null, selectLocation);
  $('.location-results div').remove();
  $('#location-results').addClass('searching');
  return false;
});

function selectLocation(results) {
  _gaq.push(['_trackPageview','/listings/create-location-selected']) // Analytics
  $('#location-results').removeClass('searching')
  var locations = results
  form.disableNext(3)
  results.forEach(function(result){
    var div = document.createElement('div')
      , html = '<a href="#">'+result.formatted_address+'</a>'
    $(div).addClass("loc").html(html).appendTo($('.location-results'))
  })
  $('.step.location').addClass('results')
  setTimeout(function(){
    $('#location-results').focus();
  }, 1500)
  setTimeout(function(){
    TweenMax.staggerTo($('.location-results .loc'), .5, {opacity: 1}, .05)
    $('.location-results .loc').click(function(){
      var n = $(this).index()
      $('.location-results .loc.active').removeClass('active')
      $(this).addClass('active')
      form.enableNext(3)
      form.setLocation(locations[n])
      setTimeout(function(){
        $('button[data-goto="3"]').click()
      }, 500)
      return false
    })
  }, 500)
  setTimeout(function(){
    if (results.length == 1) {
      console.log('just 1'); $('.location-results .loc:first-child').click()
    }
    else if (results.length == null) {
      y2g.message('There were no results for that address.  Try again!', 'error', 2)
    }
  }, 1000)
}

var form = function(){};
form.enableNext = function(num) {
  $('.goto[data-goto='+num+']').removeClass('disabled');
  $('.step.location').addClass("chosen");
}
form.disableNext = function(num) {
  $('.goto[data-goto='+num+']').addClass('disabled');
  $('.step.location').removeClass("chosen");
}
form.setLocation = function(loc) {
  var address = loc.formatted_address
    , city
    , state
    , zip
    , country
    , latLng = {lat:'', lng:''}
  if (loc.types[0] == 'street_address') {
    city = loc.address_components[3].long_name
    state = loc.address_components[5].short_name
    country = loc.address_components[5].long_name
    zip = loc.address_components[6].long_name
  }
  else if (loc.types[0] == "locality") {
    city = loc.address_components[0].long_name
    state = loc.address_components[2].short_name
    country = loc.address_components[3].long_name
    zip = '';
  }

  latLng.lat = loc.geometry.location.k
  latLng.lng = loc.geometry.location.D
  latLng = JSON.stringify(latLng)
  console.log(loc)
  //console.log(address, city, state, zip, country, latLng)
  $('#location-address').attr('value',address)
  $('#location-city').attr('value',city)
  $('#location-state').attr('value',state)
  $('#location-zip').val(zip)
  $('#location-country').val(country)
  $('#location-latLng').val(latLng)
}

/*$('#new-listing-form').parsley().subscribe('parsley:form:validate', function (formInstance) {
  debugger;
  if (($('#new-listing').data('type') !== 'gardener') && (formInstance.isValid('gardener', false))) {
    $('.invalid-form-error-message').html('');
    return;
  } else {
    $('#new-listing-form').parsley().validate();
    // else stop form submission
    formInstance.submitEvent.preventDefault();
  }
  return;
});*/

$('#new-listings-form').submit(function(e){
  _gaq.push(['_trackPageview','/listings/create-submit']) // Analytics
  e.preventDefault();
  if ( $(this).parsley().isValid() ) {
    $.post('/listings/add', $(this).serialize());
  }
  return false;
});

$('#bio-checkbox').click(function(){
  var check = $(this).find('input[type=checkbox]')
    , bio = $(this).data('bio')
    , textarea = $('textarea[name=bio]')
  if (check.is(":checked")) {
    textarea.val(bio)
  } else {
    textarea.val('')
  }
})
