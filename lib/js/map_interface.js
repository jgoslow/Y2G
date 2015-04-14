$(function(){


	// Parse URL Params for listing
	if (params.listing) {
		var listing = params.listing

	}

	// Set Location
	var location = JSON.parse(localStorage.getItem('location'))
		,	radius = localStorage.getItem('radius')
		,	search = localStorage.getItem('search')
	//console.log(location)
	if (location && !params.listing) {
		if (!radius) {
			radius = 5
		}
		//console.log(location, radius)
		var latLng = {} // Save Location for next visit
		latLng.lat = location.k
		latLng.lng = location.D
		map.setLocation(latLng, radius*1000)
		Listings.get(location, radius, '', Listings.display)
		$('#location_tool').addClass('closed')
		//console.log(location)
		if (search) $('#current_location .location').html(search.trunc(15))
	} else if (params.listing) {
		map.showListing(params.listing)
	} else {
		locationToolOpen()
	}

	$('#logo').click(function(){
		localStorage.clear()
	})


	// Tools

	// Show Listings
	$('#show_listings').click(function(){
		Listings.showHideBar()
	})
	$('#map_wrap:not(#location_tool)').click(function(){
		if (!$(this).hasClass("fullsize")) $('#expand_map').click()
	})


	// Expand Map
	$('#expand_map').click(function(){
		var mw = $('#map_wrap, #map_canvas')
			, h = $(window).height()
			, w = $(window).width()
			, mh = h - 120
			, mtt = $('#map_tools_top')
		if (h > 430) {
			if (mw.height() == 350) {
				$('#map_wrap').addClass('fullsize')
				if (h < 737) mh = h - 85
				TweenLite.to(mw, 0.5, {height: mh});
				$(this).html('&#xf102;');
			} else {
				$('#map_wrap').removeClass('fullsize')
				TweenLite.to(mw, 0.5, {height: 350});
				$(this).html('&#xf103;');
				if ($('.map_modal_bg').css('display') == 'block') {
					$('.map_modal_bg').fadeOut();
					setTimeout(function(){
						$('.map_modal_bg').css('opacity','.2');
					}, 500);
				}
			}
		}
		mapResize();
		return false;
	});

	$('#location_tool .icon, #current_location').click(function(){
		var w = $('#location_tool').width();
		if (w < 40) {
			locationToolOpen();
		} else {
			locationToolClose();
		}
	});
	$('#location_tool .tools .close').click(function(){
		locationToolClose();
	});


	// Keyboard Add Shortcuts to interface
	$(document).keydown(function(e){
	    if (event.shiftKey && e.keyCode == 70) {
	    	if (!($(document.activeElement).is('input') || $(document.activeElement).is('textarea'))) {
					if ($('#location_tool').width() == '330') {
						locationToolClose();
					} else {
						locationToolOpen();
					}
	    	}
	    }
	    if (event.shiftKey && e.keyCode == 76) {
	    	if (!($(document.activeElement).is('input') || $(document.activeElement).is('textarea'))) {
					Listings.showHideBar();
	    	}
	    }
			if (event.shiftKey && e.keyCode == 67) {
				if (!($(document.activeElement).is('input') || $(document.activeElement).is('textarea'))) {
					$('#map_new_listing').click();
				}
			}
	});
	$('.address_field').focus(function(){
		$(this).attr('placeholder', '');
	});


	var area = $('#listings_wrap');
	if (!area.is(':visible')) {
  		/*area.show('slide', {direction: 'right'}, 1000);
  		$('#map_canvas, #map_canvas > div, #map_canvas > div > div:first-child').each(function(){
  			var w = $(this).width();
  			$(this). animate({
  				width: w - 300
  			}, 1000);
  		});*/
  	}


	// Location Tool
	$('#location_filter').on('submit', function(){
		var radius = mToK($('#radius_input').val()) * 1000,
			address = $('#address_input').val(),
			latLng;
		localStorage.setItem('search', $('#address_input').val());
		localStorage.setItem('radius', $('#radius_input').val());
		if (window.mobilecheck()) window.scrollTo(0,0)

		getLocation(address, radius, 'getListings').done(function(){ //
			locationToolClose();
			_gaq.push(['_trackEvent', 'Search Location', 'submit', localStorage.getItem('search'), 1]); // Analytics
		});

		analytics.location() // Analytics

		return false;
	});


});
