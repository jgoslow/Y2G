$(function(){
	var location = localStorage.getItem('location'),
			radius = localStorage.getItem('radius');
	if (location) {
		if (!radius) { radius = 5; }
		location = JSON.parse(location);
		//console.log(location, radius);
		var latLng = {}; // Save Location for next visit
		latLng.lat = location.k;
		latLng.lng = location.D;
		map.setLocation(latLng, radius*1000);
		listings.get(location, radius, '', listings.display);
	} else {
		locationToolOpen();
	}

	$('#logo').click(function(){
		localStorage.clear();
	});


	// Tools

	// Show Listings
	$('#show_listings').click(function(){
		showHideListings();
	});

	function showHideListings() {
		var l = $('#listings_wrap');
		if (l.height() == '0') {
			$("#show_listings .fa").html('&#xf102;');
			$('#show_listings .text').html('Hide Listings');
			TweenLite.to($('#show_listings'), .5, {right:317});
			if ($('#location_tool .tools').is(':visible')) {
				TweenLite.to($('#location_tool'), .5, {right:'70%'});
				setTimeout(function(){
					var h = $('#map_wrap').height() - 20;
					TweenLite.to(l, .5, {height:h});
				}, 500);
			} else {
				TweenLite.to($('#location_tool'), .5, {right:431});
				setTimeout(function(){
					var h = $('#map_wrap').height() - 20;
					TweenLite.to(l, .5, {height:h});
				}, 500);
			}
		} else {
			TweenLite.to(l, .5, {height:0});
			setTimeout(function(){
				$("#show_listings .fa").html('&#xf103;');
				$('#show_listings .text').html('Show Listings');
				TweenLite.to($('#show_listings'), .5, {right:10});
				if ($('#location_tool .tools').is(':visible')) {
					TweenLite.to($('#location_tool'), .5, {right:'50%'});
				} else {
					TweenLite.to($('#location_tool'), .5, {right:132});
				}
			}, 500);
		}
	}
	// Expand Map
	$('#expand_map').click(function(){
		var mw = $('#map_wrap, #map_canvas');
		var h = $(window).height();
		var w = $(window).width();
		var mh = h - 120;
		var mtt = $('#map_tools_top');
		if (h > 430) {
			if (mw.height() == 350) {
				var w = mtt.width();
				var w2 = $(window).width();
				TweenLite.to(mw, .5, {height: mh});
				$(this).html('&#xf102;');
				TweenLite.set(mtt, {width: w, maxWidth: '100%'})
				TweenLite.to(mtt, .5, {width: w2});
				mtt.data('max-width', w).data('map','expanded');
			} else {
				var w = mtt.data('max-width');
				mtt.data('map','reduced');
				TweenLite.to(mw, .5, {height: 350});
				$(this).html('&#xf103;');
				TweenLite.to(mtt, .5, {width: w});
				setTimeout(function(){
					mtt.css('max-width', w).css('width','100%');
				}, 500);
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

	$('#location_tool .icon').click(function(){
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
	    if (e.keyCode == 70) {
	    	if (!($(document.activeElement).is('input') || $(document.activeElement).is('textarea'))) {
					if ($('#location_tool').width() == '330') {
						locationToolClose();
					} else {
						locationToolOpen();
					}
	    	}
	    }
	    if (e.keyCode == 76) {
	    	if (!($(document.activeElement).is('input') || $(document.activeElement).is('textarea'))) {
				showHideListings();
	    	}
	    }
			if (e.keyCode == 67) {
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


		getLocation(address, radius, 'getListings').done(function(){ //
			locationToolClose();
		});

		return false;
	});


});

function updateRadius(radius) {
	document.querySelector('#radius_input').value = radius;
	localStorage.setItem('radius', radius);
}
