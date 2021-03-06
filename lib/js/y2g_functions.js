
function getLocation(address, radius, callback) {
  //console.log('getLocation:',address, radius, callback);
  var r = $.Deferred();
  geocoder = new google.maps.Geocoder();
  geocoder.geocode({ 'address': address }, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      latLng = results[0].geometry.location;
      if (radius !== null) {
        map.setLocation(latLng, radius);
      }
      if (callback == 'getListings') {
        console.log('get listings')
        Listings.get(latLng, parseFloat(radius/1000).toFixed(1), '', Listings.display);
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
  //if ($('#map_tools_top').data('map') != 'expanded') $('#expand_map').click();
  this.setCenter(latLng);
  if (radius) {
    var circleOptions = {
        center: latLng,
        fillOpacity: 0,
        strokeOpacity:0, // .05
        map: this,
        radius: radius
    };
    var circle = new google.maps.Circle(circleOptions);
    google.maps.event.addListener(circle, "click", function () {
      //infoWindow.close();
    });
    y2gBounds(this, circle.getBounds());
  }
};
map.showListing = function(listingId) {
  var id = listingId
    , map = this

  $.get('/listings/single?id='+listingId, function(data){
    var listing = data
      , latLng = new google.maps.LatLng(listing.displayLatLng.lat, listing.displayLatLng.lng)

      map.setLocation(listing.displayLatLng, 10000)
      Listings.get(latLng, 10, '', Listings.display)
      document.getElementById('header_wrap').scrollIntoView();
      google.maps.event.addListenerOnce(map, 'idle', function(){
          $('#listings #listing-'+listing._id+' a').click()
      });
  })
};


var Listings = function(location, user) {
  var _location = location,
      _radius = options.radius
      _type = options.type;

  /*  METHODS
  - testListings
  - get *db
    - by location (/get)
     - radius
    - by user (/edit)
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
};
  Listings.get = function(location, radius, user, callback) {
    var latLng = JSON.stringify(location);
      console.log(latLng, location, radius)

    //console.log(document.location+'listings/?lat='+location.k+'&lng='+location.D+'&radius='+radius);
    $.getJSON('/listings/?lat='+location.A+'&lng='+location.F+'&radius='+radius, function(data){
      console.log(data);
      if ((data.length === 0) && (localStorage.getItem('location') != latLng)) {
        y2g.message('There are no listings in your area.<br><br> Y2G would love your help destroying the lawns in your area.  Since we don\'t have any alien megaships, we need you to start changing yards and changing minds..<br><br> <a href="/listings/new" onclick="openModal( \'new-listing\', \'/listings/new/\', \'new-listing\'); return false;" value="new-listing" data-modaltype="new-listing openmodal">Create the first listing!</a>', 'error', null);
      } else {
        localStorage.setItem('location', latLng);
        if(typeof callback == "function") return callback(data);
      }
    });

    if (user != null) {

    } else {

    }
  };
  Listings.test = function(number) {
    db = connect("localhost:27017/y2g");
    y2g = new Mongo().getDB("y2g");
  };

  Listings.display = function(listings) {
		console.log(listings)
    console.log('Listings.display', listings);
    currentListings = listings
    clearMap()
    $("#listings").html('')
    infoWindow = new InfoBubble({
        map: map
      , maxWidth: 280
      , minWidth: 280
      , maxHeight: 280
      , minHeight: 240
      , closeImage: ''
      , shadowStyle: 0
      , padding: 0
      , backgroundColor: '#fff'
      , borderRadius: 0
      , borderWidth: 0
      , borderColor: '#000'
      , disableAutoPan: false
      , hideCloseButton: false
      , backgroundClassName: 'info-window-wrap'
      , arrowStyle: false
      , arrowSize: 0
      , arrowPosition: 80
    })

    listings.forEach(function(listing, i){
      if (!listing.displayLatLng) listing.displayLatLng = listing.latLng
      var id = listing._id
        , created = moment(listing.created, 'YYYY-MM-DDTHH:mm:ssZ').format('MMM DD YYYY')
        , lat = listing.displayLatLng.lat
        , lng = listing.displayLatLng.lng
        , desc = listing.description
        , owner = listing.owner
        , ownerName = listing.ownerName
        , title = listing.title
        , type = listing.type
        , typeInfo = listing.typeInfo
        , typeHTML = ''
        , publicClass = ''
      //console.log(id, lat, lng, desc, owner, title, type);
      if (typeInfo.length > 0) {
        //console.log(typeInfo)
        if (type == 'space') {
          typeHTML = '<span class="square-meters"><strong>Space: </strong><br>Roughly '+typeInfo[0].squareMeters+' sq. meters</span>'
        } else if (type == 'gardener') {
          typeHTML = '<span class="gardener-bio"><strong>Bio: </strong><br>'+typeInfo[0].gardenerBio+'</span>'
        }
      }

      if (listing.publicListing == true) {
        publicClass = ' public'
      }
      /*li.garden
        a
          .title
          .desc (20 chars?)
          .date*/

      var image_html = ''
        , latlngset = new google.maps.LatLng(lat, lng)
        , fullIcon = new typeIcon(type)
      titleStrip = title.replace(/\x27/g, "");
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
        //infoWindow.close();
      });
      markersArray.push(marker);
      var contactModal = 'onclick="openModal(this, \'/messages/send?owner='+owner+'&ownerName='+ownerName+'&listingId='+id+'&listingTitle='+titleStrip+'\', \'message\'); return false;" href="/messages/send?to='+owner+'" data-modal-type="message"'
        , profileViewModal = 'onclick="openModal(this, \'/account/profile-view?user='+owner+'&userName='+ownerName+'&listingId='+id+'&listingTitle='+titleStrip+'\', \'profile-view\'); return false;" href="/account/profile-view?user='+owner+'&userName='+ownerName+'&listingId='+id+'" data-modal-type="profile-view"'
        , content = ''
        , listItem = ''
        , buttonsHTML = ''

      if (listing.publicListing != true) {
        buttonsHTML = '<a '+contactModal+' class="contact openmodal" title="Contact '+name+'"><span class="fa">&#xf003;</span> Send a Note</a>' +
                      '<a href="#'+id+'" onclick="Listings.flag(\''+id+'\', \''+titleStrip+'\'); return false;" class="flag" title="flag this post">flag this post</a>'
      } else {
        buttonsHTML = '<p class="publicMessage">This is a ' +
                      '<a href="/about-public-listings" target="_blank">public listing</a>.</p>' +
                      '<a href="#'+id+'" style="left: 20px;" onclick="Listings.flag(\''+id+'\', \''+titleStrip+'\'); return false;" class="flag" title="flag this post">flag this post</a>'
        //messageHTML = '<a '+contactModal+' class="contact openmodal" title="Contact Listing Creator"><span class="fa">&#xf003;</span> Send a Note</a>'
      }

      content += '<div id="window-'+id+'" class="info-window'+publicClass+' '+type+'">'+
                  '<div class="info-window_inner_wrap"><h4>'+title+'</h4>'+
                  '<div class="info">'+image_html+
                  '<span class="author"><strong>BY: </strong> '+
                  '<a href="#" '+profileViewModal+'>'+ownerName+'</a></span>'+
                  '<span class="date"><strong>DATE: </strong> '+created+'</span>'+
                  '<span class="type"><strong>TYPE: </strong> '+type+'</span></div>'+
                  '<div class="description">'+desc+'</div>'+
                  typeHTML +
                  buttonsHTML +
                  '</div></div>'
      listItem += '<li class="listing '+type+'" id="listing-'+id+'"><a href="#" onclick="Listing.openMarker('+i+'); return false;">'+
                  '<span class="title">'+title.trunc(35)+'</span>'+
                  '<span class="desc">'+desc.trunc(50)+'</span>'+
                  '<span class="date">'+created+'</span>'+
                  '</a></li>'

      $('#listings').append(listItem)

      google.maps.event.addListener(marker, 'click', function() {
        _gaq.push(['_trackEvent', 'Listing', 'clicked', '"title:'+title.replace(/\x27/g, "")+', type: '+type+', id:'+id+'"', 0]); // Analytics
        $("#listings li.current").removeClass('current')
        $('#listings li').eq(i).addClass("current")
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
  };

  function clearMap(){
    //console.log('clear listings');
    if (markersArray) {
      for (var i in markersArray) {
        markersArray[i].setMap(null);
      }
      markersArray.length = 0;
    }
  }
  Listings.create = function(form){
    Listings = this
    _gaq.push(['_trackPageview','/listings/create-submit']) // Analytics
    form = $(form)
    if ( form.parsley().isValid() ) {
      $.get('/listings/add', form.serialize(), function(data){
        console.log(data)
      })
      .done(function(data) {
        closeModal('new-listing')
        // Set map to area with listing
        setTimeout(function(){
          $('#address_input').attr('value', data.location)
          $('#location_filter').submit()
          /*map.setLocation(data.latLng, 20000)
          Listings.get(data.latLng, 20, '', Listings.display)*/
        }, 2000)
        setTimeout(function(){
          $('#listing-'+data.id+' a').click()
        }, 3000)
        y2g.message('Your listing has been created!', 'success', 5);
        $('.modal-new-listing').remove();
        _gaq.push(['_trackEvent', 'Listing', 'created', form.find('input[name=type]').val(), 0]); // Analytics
        _gaq.push(['_trackPageview','/listings/create-success']) // Analytics
        form.find("input[type='text']").val('')
        form.find('textarea').html('')
      })
      .fail(function(XMLHttpRequest, textStatus, errorThrown){
        alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText);
      })
      .always(function() {

      });
    }
    return false;
  }

  Listings.flag = function(listing, listingTitle) {
    openModal('', '/listings/flag?id='+listing+'&title='+listingTitle,'flag');
  }
  Listings.submitFlag = function(form) {
    form = $(form);
    if ( form.parsley().isValid() ) {
      $.post('/listings/flag', form.serialize(), function(data){
      })
      .done(function(data) {
        if(data == 'duplicate') {
          closeModal('flag');
          y2g.message('You have already flagged this listing', 'error', 3);
          $('.modal-flag').remove();
        } else {
          closeModal('flag');
          y2g.message('this listing has been flagged!', 'success', 3);
          $('.modal-flag').remove();
          _gaq.push(['_trackEvent', 'Listing', 'flag', form.find('input[name=listing]').val(), 0]); // Analytics
        }
      })
      .fail(function(XMLHttpRequest, textStatus, errorThrown){
        alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText);
      })
      .always(function() {

      });
    }
    return false;
  }
  Listings.showHideBar = function() {
    var l = $('#listings_wrap');
    if (l.height() == '0') {
      $("#show_listings .fa").html('&#xf102;');
      $('#show_listings .text').html('Hide Listings');
      $(".map_wrap").addClass("show-listings")
      setTimeout(function(){
        var h = $('#map_wrap').height() - 40;
        TweenLite.to(l, 0.5, {height:h});
      }, 500);
    } else {
      TweenLite.to(l, 0.5, {height:0});
      setTimeout(function(){
        $("#show_listings .fa").html('&#xf103;');
        $('#show_listings .text').html('Show Listings');
        $(".map_wrap").removeClass("show-listings")
      }, 1000);
    }
  }

var Listing = function(id, type, location) {

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
  Listing.update = function(form) {
    form = $(form);
    if ( form.parsley().isValid() ) {
      $.post('/listings/single/update', form.serialize(), function(data){
      })
      .done(function(data) {
        y2g.message('this listing has been updated!', 'success', 2);
        _gaq.push(['_trackEvent', 'Listing', 'updated', form.find('input[name=id]').val(), 0]); // Analytics
      })
      .fail(function(XMLHttpRequest, textStatus, errorThrown){
        y2g.message('There was an error updating your listing, please make sure you are logged in', 'err', null);
      })
      .always(function() { });
    }
    return false;
  }
  Listing.openMarker = function(i){
    var w = $(window).width()
    google.maps.event.trigger( markersArray[i], 'click' )
    $('#listings .listing.current').removeClass('current')
    $('#listing-'+i).addClass('current')
    if (w < 650) { Listings.showHideBar(); console.log()}
  }
  Listing.removeSurvey = function(listingId, listingType) {
    console.log('remove Survey')

    var removeSurvey = '<p>How did it go?</p>' +
      '<form action="/listings/single/remove" method="post" class="delete-listing" onsubmit="Listing.remove($(this)); return false;">' +
      '<p class="note">(Select all that are true)</p>' +
      '<div class="field checkboxes">' +
      '<label><input type="checkbox" name="foundgardener" value="I found a gardener for my space">I found a gardener for my space</label>' +
      '<label><input type="checkbox" name="foundspace" value="I found a space to garden in">I found a space to garden in</label><br>' +
      '<label><input type="checkbox" name="foundtools" value="I shared or found gardening tools">I shared or found gardening tools</label><br>' +
      '<label><input type="checkbox" name="foundorganic" value="I found or shared organic materials">I found or shared organic materials</label><br>' +
      '<label><input type="checkbox" name="metsomeone" value="I met someone in my neighborhood">I met someone in my neighborhood</label>' +
      '</div>' +
      '<div class="field" style="margin-top: -15px;"><p>If you started a new garden, about how big is it?<br>' +
      '<input type="text" name="gardenSize" placeholder="total" class="short" title="multiply the width by length.">' +
      '<span class="select-short fa-angle-down fa"><select name="unit" class="short"><option value="meters">Sq. M.</option><option value="feet">Sq. Ft.</option></select></span><br>' +
      '</p></div><br>' +
      '<input type="hidden" name="id" value="'+listingId+'">' +
      '<input type="submit" value="Remove this listing" class="btn">' +
      '</form>'

    y2g.message(removeSurvey, 'info', null)
    return false
  }
  Listing.remove = function(form) {
    form = $(form)
    $.post('/listings/single/remove', form.serialize(), function(data){
    })
    .done(function(data) {
      y2g.message('this listing has been removed.', 'success', 2);
      openModal('', '/listings/edit', 'edit-listings')
      _gaq.push(['_trackEvent', 'Listing', 'removed', form.find('input[name=id]').val(), 0]); // Analytics
    })
    .fail(function(XMLHttpRequest, textStatus, errorThrown){
      y2g.message('There was an error removing your listing, please make sure you are logged in', 'err', null);
    })
    return false;
  }

var User = function(id) {
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
  return kilometers*0.6250;
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

// Function for custom map search results zoom
function getExtraZoom(projection, expectedBounds, actualBounds) {
    // in: LatLngBounds bounds -> out: height and width as a Point
    function getSizeInPixels(bounds) {
        var sw = projection.fromLatLngToContainerPixel(bounds.getSouthWest());
        var ne = projection.fromLatLngToContainerPixel(bounds.getNorthEast());
        return new google.maps.Point(Math.abs(sw.y - ne.y), Math.abs(sw.x - ne.x));
    }
    var expectedSize = getSizeInPixels(expectedBounds),
        actualSize = getSizeInPixels(actualBounds);
    if (Math.floor(expectedSize.x) === 0 || Math.floor(expectedSize.y) === 0) {
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
  $('#location_tool').removeClass('closed')
  var r
    , h = $('#listings_wrap').height()
  if ( h > 10 ) {
    r = '70%'
  } else {
    r = '50%'
  }
  TweenLite.to($('#location_tool'), 0.5, {top: 100, right: r, marginRight: -165, width: 330, height: 30})
  setTimeout(function(){
    $('#location_tool .tools').show()
    TweenLite.to($('#location_tool .tools'), 0.5, {width: 285, marginLeft: -153, height: 100})
  }, 500)
  setTimeout(function(){
    $('#location_tool .tools .wrap').fadeIn()
    if (!window.mobilecheck()) $('#address_input').focus()
  }, 1500)
  $('.map_modal_bg').fadeIn().click(function(){
    locationToolClose()
  });
}
function locationToolClose() {
  $('#location_tool').addClass('closed')
  var search = ''
    , storedSearch = localStorage.getItem('search')
  if (storedSearch) search = storedSearch
  $('#current_location .location').html(search.trunc(15))
  var r;
  var r1 = $('#show_listings').css('right');
  if ( r1 == '317px') { r = 431; }
  else { r = 132; }
  $('#location_tool .tools .wrap').hide();
  TweenLite.to($('#location_tool .tools'), 0.5, {height: 30, marginLeft: 0, width: 23});
  setTimeout(function(){
    $('#location_tool .tools').hide();
    TweenLite.to($('#location_tool'), 0.5, {top: 0, right: r, marginRight: 0, width: 30});
  }, 500);
  $('.map_modal_bg').fadeOut();
}

function updateRadius(radius) {
  document.querySelector('#radius_input').value = radius;
  localStorage.setItem('radius', radius);
}


//console.log('mapfuncs loaded');
//loadScript([{url:'/javascripts/map_interface.js'}]);


function offsetCenter(latlng,offsetx,offsety) {
  // latlng is the apparent centre-point
  // offsetx is the distance you want that point to move to the right, in pixels
  // offsety is the distance you want that point to move upwards, in pixels
  // offset can be negative
  // offsetx and offsety are both optional

  var scale = Math.pow(2, map.getZoom());
  var nw = new google.maps.LatLng(
    map.getBounds().getNorthEast().lat(),
    map.getBounds().getSouthWest().lng()
  );

  var worldCoordinateCenter = map.getProjection().fromLatLngToPoint(latlng);
  var pixelOffset = new google.maps.Point((offsetx/scale) || 0,(offsety/scale) ||0)

  var worldCoordinateNewCenter = new google.maps.Point(
    worldCoordinateCenter.x - pixelOffset.x,
    worldCoordinateCenter.y + pixelOffset.y
  );

  var newCenter = map.getProjection().fromPointToLatLng(worldCoordinateNewCenter);

  map.setCenter(newCenter);

}

google.maps.Map.prototype.panToWithOffset = function(latlng, offsetX, offsetY) {
  var map = this;
  var ov = new google.maps.OverlayView();
  ov.onAdd = function() {
    var proj = this.getProjection();
    var aPoint = proj.fromLatLngToContainerPixel(latlng);
    aPoint.x = aPoint.x+offsetX;
    aPoint.y = aPoint.y+offsetY;
    map.panTo(proj.fromContainerPixelToLatLng(aPoint));
  };
  ov.draw = function() {};
  ov.setMap(this);
};
