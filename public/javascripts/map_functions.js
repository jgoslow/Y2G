
function getLocation(address, radius, callback) {
  //console.log('getLocation:',address, radius, callback);
  var r = $.Deferred();
  geocoder = new google.maps.Geocoder();
  geocoder.geocode({ 'address': address }, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      latLng = results[0].geometry.location;
      if (radius != null) {
        map.setLocation(latLng, radius);
      }
      if (callback == 'getListings') {
        listings.get(latLng, parseFloat(radius/1000).toFixed(1), '', listings.display);
      } else {
        if(typeof callback == "function") return callback(results);
      }
      r.resolve();
    }
  });
  return r;
}

map.setLocation = function(latLng, radius) {
  //console.log('setLocation:',latLng, radius);
  if ($('#map_tools_top').data('map') != 'expanded') $('#expand_map').click();
  this.setCenter(latLng);
  if (radius) {
    var circleOptions = {
        center: latLng,
        fillOpacity: 0,
        strokeOpacity:.05,
        map: this,
        radius: radius
    }
    var circle = new google.maps.Circle(circleOptions);
    google.maps.event.addListener(circle, "click", function () {
      infoWindow.close();
    });
    y2gBounds(this, circle.getBounds());
  }
}


var listings = function(location, user) {
  var _location = location,
      _radius = options.radius
      _type = options.type;

  /*  METHODS
  - testListings
  - get *db
    - by location
     - radius
    - by user
  - display
    - map
      - resize
      - zoomIn/zoomOut
    - list
  - filter
    - radius (zoom in filters, zoom out is a get call *db)
    - type
    - property
    - searchTerm '
  */
}
  listings.get = function(location, radius, user, callback) {
    /*var latLng = {}; // Save Location for next visit
    latLng.lat = location.k;
    latLng.lng = location.D;*/
    latLng = JSON.stringify(location);
    localStorage.setItem('location', latLng);

    console.log(document.location+'listings/?lat='+location.k+'&lng='+location.D+'&radius='+radius);
    $.getJSON('/listings/?lat='+location.k+'&lng='+location.D+'&radius='+radius, function(data){
      console.log(data.length);
      if (data.length == 0) {
        y2g.message('There are no listings in your area.<br><br> Y2G would love your help destroying the lawns in your area.  Since we don\'t have any alien megaships, we put together this little <br><a href="#">Y2G - SheepNoMore Guide</a><br>Check it out.<br><br> Also, <a href="/listings/new" onclick="openModal( \'new-listing\', \'/listings/new/\', \'new-listing\'); return false;" value="new-listing" data-modaltype="new-listing openmodal">create the first listing!</a>', 'error', null);
      } else {
        if(typeof callback == "function") return callback(data);
      }
    });

    if (user != null) {

    } else {

    }
  }
  listings.test = function(number) {
    db = connect("localhost:27017/y2g");
    y2g = new Mongo().getDB("y2g");
  }

  listings.display = function(listings) {
    console.log('listings.display', listings);
    clearMap();
    infoWindow = new InfoBubble({
      map: map,
      maxWidth: 300,
      maxHeight: 300,
      closeImage: 'google.com',
      shadowStyle: 0,
      padding: 0,
      backgroundColor: '#fff',
      borderRadius: 0,
      borderWidth: 0,
      borderColor: '#000',
      disableAutoPan: false,
      hideCloseButton: false,
      backgroundClassName: 'info-window-wrap',
      arrowStyle: false,
      arrowSize: 0,
      arrowPosition: 0
    });

    listings.forEach(function(listing){
      var id = listing._id,
          created = moment(listing.created, 'YYYY-MM-DDTHH:mm:ssZ').format('MMM DD YYYY'),
          lat = listing.latLng.lat,
          lng = listing.latLng.lng,
          desc = listing.description,
          owner = listing.owner,
          ownerName = listing.ownerName,
          title = listing.title,
          type = listing.type;
      //console.log(id, lat, lng, desc, owner, title, type);

      /*li.garden
        a
          .title
          .desc (20 chars?)
          .date*/

      if (!listing.imgData) { var image_html = ''; }
      var image_html = '';
      var latlngset = new google.maps.LatLng(lat, lng);
      var fullIcon = new typeIcon(type);
      //console.log(type, fullIcon.shadow);
      var marker = new google.maps.Marker({
          map: map,
          position: latlngset,
          id: id,
          type: type,
          title: title,
          owner: owner,
          ownerName: ownerName,
          description: desc,
          icon: fullIcon.main,
          shadow: fullIcon.shadow,
          draggable: false,
      });

      google.maps.event.addListener(map, "click", function () {
        infoWindow.close();
      });
      markersArray.push(marker);
      var contactModal = 'onclick="openModal(this, \'/messages/send?owner='+owner+'&ownerName='+ownerName+'&listingId='+id+'&listingTitle='+title+'\', \'message\'); return false;" href="/messages/send?to='+owner+'" data-modal-type="message"',
          content = '<div id="window-'+id+'" class="info-window"><div class="info-window_inner_wrap"><h4>'+title+'</h4><div class="info">'+image_html+'<span class="author"><strong>BY:</strong><a href="#" '+contactModal+'>'+ownerName+'</a></span><span class="date"><strong>DATE:</strong> '+created+'</span><span class="date"><strong>TYPE:</strong> '+type+'</span></div><div class="description">'+desc+'</div><a '+contactModal+' class="contact openmodal" title="Contact '+name+'"><span class="fa">&#xf003;</span> Send a Note</a><a href="#'+id+'" onclick="listings.flag('+id+'); return false;" class="flag" title="flag this post">flag this post</a></div></div>';

      google.maps.event.addListener(marker, 'click', function() {
        console.log($('#window-'+id));
        infoWindow.setContent(content); // Set content for infowindow
        setTimeout(function(){
          var map_wrap = $('#window-'+id).parent().parent();
          map_wrap.css("overflow", 'visible');
          map_wrap.siblings('img').addClass('info-window-close-img').attr('src', '/images/svg/infowindow.close.svg');
          map_wrap.parent().addClass('info-window-parent');
        }, 200);
        infoWindow.open(map, this); // Open the info window
        this.setIcon(fullIcon.visited); // Set the icon to visited
        //checkVisitedListings(); // Check to see which listings have been visited
        //setListingData(this.id); // save listings viewed to data
        //setY2GCookie('visited_listings',$('body').data('visited_listings')); // Add listing to visited
        //sidebarItems(this.id); // Add "current visited" classes to sidebar item
      });
    });
  }

  function clearMap(){
    console.log('clear listings');
    if (markersArray) {
      for (i in markersArray) {
        markersArray[i].setMap(null);
      }
      markersArray.length = 0;
    }
  }
  listings.create = function(form){
    var form = $(form);
    if ( form.parsley().isValid() ) {
      $.get('/listings/add', form.serialize(), function(data){
        console.log(data);
      })
      .done(function() {
        closeModal('new-listing');
        y2g.message('Your listing has been created!<br><br> Click "View Listings" or search in your area to see it!', 'success', 5);
      })
      .fail(function(XMLHttpRequest, textStatus, errorThrown){
        alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText);
      })
      .always(function() {

      });
    }
    return false;
  }

var listing = function(id, type, location) {
  var type

  /*  METHODS
  - getInfo *db
  - displayInfo
  - update *db
  - delete *db
  - getOwner *db
  - flag/report *db
  - save *db
  */
}

var user = function(id) {
  /*  METHODS
  - get *db
  - update *db
  - delete *db
  - login?
  - logout
  - getlistings *db
  - getProfile *db
  - updateProfile *db
  - contact
  */
}

function mapResize() {
  setTimeout(function(){
    google.maps.event.trigger(map, "resize");
    map.setZoom( map.getZoom() );
  }, 600)
}

function mToK(miles) {
  return miles*1.6;
}
function kToM(kilometers) {
  return kilometers*.625;
}


function y2gBounds(myMap, bounds) {
    myMap.fitBounds(bounds); // calling fitBounds() here to center the map for the bounds

    var overlayHelper = new google.maps.OverlayView();
    overlayHelper.draw = function () {
        if (!this.ready) {
            var extraZoom = getExtraZoom(this.getProjection(), bounds, myMap.getBounds());
            if (extraZoom > 0) {
                myMap.setZoom(myMap.getZoom() + extraZoom);
            }
            this.ready = true;
            google.maps.event.trigger(this, 'ready');
        }
    };
    overlayHelper.setMap(myMap);
}

function getExtraZoom(projection, expectedBounds, actualBounds) {

    // in: LatLngBounds bounds -> out: height and width as a Point
    function getSizeInPixels(bounds) {
        var sw = projection.fromLatLngToContainerPixel(bounds.getSouthWest());
        var ne = projection.fromLatLngToContainerPixel(bounds.getNorthEast());
        return new google.maps.Point(Math.abs(sw.y - ne.y), Math.abs(sw.x - ne.x));
    }

    var expectedSize = getSizeInPixels(expectedBounds),
        actualSize = getSizeInPixels(actualBounds);

    if (Math.floor(expectedSize.x) == 0 || Math.floor(expectedSize.y) == 0) {
        return 0;
    }

    var qx = actualSize.x / expectedSize.x;
    var qy = actualSize.y / expectedSize.y;
    var min = Math.max(qx, qy);

    if (min < 1) {
        return 0;
    }

    return Math.floor(Math.log(min) / Math.LN2 /* = log2(min) */);
}


function locationToolOpen() {
  var r,
    h = $('#listings_wrap').height();
  if ( h > 10 ) {
    r = '70%';
  } else {r = '50%';}
  TweenLite.to($('#location_tool'), .5, {top: 100, right: r, marginRight: -165, width: 330, height: 30});
  setTimeout(function(){
    $('#location_tool .tools').show()
    TweenLite.to($('#location_tool .tools'), .5, {width: 330, marginLeft: -165, height: 100});
    setTimeout(function(){
      $('#location_tool .tools .wrap').fadeIn();
      $('#address_input').focus();
    }, 500);
  }, 500);
  $('.map_modal_bg').fadeIn().click(function(){
    locationToolClose();
  });
}
function locationToolClose() {
  var r;
  var r1 = $('#show_listings').css('right');
  if ( r1 == '317px') { r = 431; }
  else { r = 132; }
  $('#location_tool .tools .wrap').hide();
  TweenLite.to($('#location_tool .tools'), .5, {height: 30, marginLeft: 0, width: 23});
  setTimeout(function(){
    $('#location_tool .tools').hide();
    TweenLite.to($('#location_tool'), .5, {top: 0, right: r, marginRight: 0, width: 30});
  }, 500);
  $('.map_modal_bg').fadeOut();
}

console.log('mapfuncs loaded');
loadScript([{url:'/javascripts/map_interface.js'}]);
