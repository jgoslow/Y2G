jQuery(function($){

  var html = $('#listings .listing').html()
  $('#listings').data('listingRow',html)

  bindLocationConfirm()

})

window.ParsleyConfig = {
  validators: {
    location: {
      fn: function () {
        if (this.hassClass('valid')) return true
      },
      priority: 32
    }
  }
};

function submitBulkListings() {
  var listings = $('#listings')
    , url = '/listings/'
    , rows = $('#listings > li.listing')
  console.log(rows)
  listings.parsley().validate()
  if (listings.parsley().isValid()) {
    $.each(rows, function(i){
      var row = $(rows[i])
      $.get('/listings/add', row.find("select,textarea,input").serialize(), function(data){
        console.log(data)
      })
      .done(function(data) {
        console.log('success:' + data)
        row.css('opacity','.2').css('pointer-events', 'none').after('<p>success!</p>')
      })
      .fail(function(XMLHttpRequest, textStatus, errorThrown){
        row.after('<p>failed!</p>')
        console.log('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText);
      })
    })
  }
}

function addRow(item) {
  li = $(item).parent('.listing')
  li.after('<li class="listing">'+$('#listings').data('listingRow')+'</li>')
  bindLocationConfirm()
}
function addToLastRow() {
  $('#listings .listing:last-child .add-more').click();
  bindLocationConfirm()
}

function finishLocation(results) {
  if (results.length > 1) {

  } else {

  }
}

function bindLocationConfirm() {
  $('#listings input.location').unbind('blur').on('blur', function(){
    var confirmStatus = $(this).siblings('.confirmLocation')
      , latLngField = $(this).siblings('.latLng')
      , locationField = $(this)
      , location = locationField.val()
      confirmStatus.removeClass('fa-thumbs-up').removeClass('fa-exclamation').addClass('fa-spinner')
    geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': location }, function(results, status) {
      console.log(status)
      if (status == google.maps.GeocoderStatus.OK) {
        if (results.length > 1) {
          latLngField.val('')
          confirmStatus.removeClass('fa-spinner').addClass('fa-exclamation').on('mouseover',function(event){
            $(this).qtip({
              style: { classes: 'qtip-bootstrap' },
              content: 'This location returned multiple results, please use more specific information (address and postal code usually works)',
              show: {
                  event: event.type, // Use the same show event as triggered event handler
                  ready: true // Show the tooltip immediately upon creation
              }
            }, event)
          })
        } else {
          var latLng = results[0].geometry.location
          confirmStatus.removeClass('fa-spinner').addClass('fa-thumbs-up')
          locationField.val(results[0].formatted_address)
          latLngField.val(latLng)
        }
        latLng = results[0].geometry.location;
      } else if (status == google.maps.GeocoderStatus.ZERO_RESULTS) {
        confirmStatus.removeClass('fa-spinner')
      }
    });
  })
}
