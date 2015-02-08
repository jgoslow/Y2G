/*! Lyra Include.js v1.2 lyradesigns.com © Lyra Designs 2013 */

jQuery(document).ready(function($) {
	var h = $(window).height();
	var w = $(window).width();

	// External Links JS
	$('a.outside_link, a.external').click( function() {
    	window.open(this.href);
    	return false;
	});

	$('.modal_bg, .modal:after, .modal_close').click(function(){
		//$('.modal, .modal_bg, .fullscreen_gallery').fadeOut();
		closeModal();
	});

	$('a.modal_img').click(function(){
		var url = $(this).attr('href');
		var html = '<img src="'+url+'" style="max-width:100%;max-height:100%;width:auto;height:auto;">';
		$('#modal').css('width','80%').css('height','').css('left','10%').html(html);
		$('#modal, .modal_bg').fadeIn();
		return false;
	});

});

function openModal(obj, target, type) {
	if (type == 'message') { $('.modal-message').remove(); }
	if (type == 'login') {
		_gaq.push(['_trackEvent', 'Login', 'login form', data, 1]); // Analytics
		_gaq.push(['_trackPageview','/account/login-form']) // Analytics
	}

	$('#modal').data('modal-type', type);
	$('html, body').css('overflow', 'hidden')

	var others = $('.modal').not('.modal-'+type);// Select other modals
	TweenMax.to( others , .8,  { top: -1000, ease: Back.easeOut.config(.8) });

	var modal = $('.modal-'+type);
	if (!modal[0]) {
		$('body').append('<div class="modal modal-'+type+'"><div class="modal_content_wrap"><div class="modal_content"></div></div><div class="modal_close"></div></div>');
		y2g_resize();
		$.ajax({ url: target,
			data: {/*action: action, distance: distance*/},
			type: 'get',
			success: function(output) {
				$('.modal_bg, .modal-'+type).addClass('open').fadeIn();
				$('.modal-'+type+' .modal_content').html(output);
				bindJS();
			},
			error: function(output) {
				alert(output);
				return false;
			},
		});
	} else {
		if (type == 'new-listing') {
			var listingType = obj.data('listingtype')
			$('#new-listing-form .'+listingType).click()
		}
		$('.modal_bg, .modal-'+type).fadeIn();
	}

	setTimeout(function(){
		var w = $(window).width(),
			h = $(window).height(),
			h2 = $('#header_wrap').height();
		if (w < 650) { t = 55; } else { t = 95; }
    TweenMax.to($('.modal-'+type), .8, { height: h - 100 - h2, top: t, ease: Back.easeOut.config(.8) });
	}, 500);


	return false;
}

function closeModal(element) {
	$('html, body').css('overflow', 'auto')

	var mtl = new TimelineMax({repeat:0});
	mtl.to('.modal', .5, { top:'-1500', ease: Back.easeIn.config(.5) });
	setTimeout(function(){
		$('.modal, .modal_bg, .fullscreen_gallery').fadeOut();
	}, 500);
	return false;
}


function loginSetup() {

}

$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

function executeFunctionByName(functionName, context /*, args */) {
  var args = [].slice.call(arguments).splice(2);
  var namespaces = functionName.split(".");
  var func = namespaces.pop();
  for(var i = 0; i < namespaces.length; i++) {
    context = context[namespaces[i]];
  }
  return context[func].apply(this, args);
}

// HoverIntent
(function(a){a.fn.hoverIntent=function(l,j){var m={sensitivity:7,interval:100,timeout:0};m=a.extend(m,j?{over:l,out:j}:l);var o,n,h,d;var e=function(f){o=f.pageX;n=f.pageY};var c=function(g,f){f.hoverIntent_t=clearTimeout(f.hoverIntent_t);if((Math.abs(h-o)+Math.abs(d-n))<m.sensitivity){a(f).unbind("mousemove",e);f.hoverIntent_s=1;return m.over.apply(f,[g])}else{h=o;d=n;f.hoverIntent_t=setTimeout(function(){c(g,f)},m.interval)}};var i=function(g,f){f.hoverIntent_t=clearTimeout(f.hoverIntent_t);f.hoverIntent_s=0;return m.out.apply(f,[g])};var b=function(q){var f=this;var g=(q.type=="mouseover"?q.fromElement:q.toElement)||q.relatedTarget;while(g&&g!=this){try{g=g.parentNode}catch(q){g=this}}if(g==this){if(a.browser.mozilla){if(q.type=="mouseout"){f.mtout=setTimeout(function(){k(q,f)},30)}else{if(f.mtout){f.mtout=clearTimeout(f.mtout)}}}return}else{if(f.mtout){f.mtout=clearTimeout(f.mtout)}k(q,f)}};var k=function(p,f){var g=jQuery.extend({},p);if(f.hoverIntent_t){f.hoverIntent_t=clearTimeout(f.hoverIntent_t)}if(p.type=="mouseover"){h=g.pageX;d=g.pageY;a(f).bind("mousemove",e);if(f.hoverIntent_s!=1){f.hoverIntent_t=setTimeout(function(){c(g,f)},m.interval)}}else{a(f).unbind("mousemove",e);if(f.hoverIntent_s==1){f.hoverIntent_t=setTimeout(function(){i(g,f)},m.timeout)}}};return this.mouseover(b).mouseout(b)}})(jQuery);


// escape quotes on string
function addslashes(str) {
	return (str + '')
	.replace(/[\\"']/g, '\\$&')
	.replace(/\u0000/g, '\\0');
}

/**
 * jQuery Plugin to obtain touch gestures from iPhone, iPod Touch and iPad, should also work with Android mobile phones (not tested yet!)
 * Common usage: wipe images (left and right to show the previous or next image)
 *
 * @author Andreas Waltl, netCU Internetagentur (http://www.netcu.de)
 * @version 1.1.1 (9th December 2010) - fix bug (older IE's had problems)
 * @version 1.1 (1st September 2010) - support wipe up and wipe down
 * @version 1.0 (15th July 2010)
 */
(function($){$.fn.touchwipe=function(settings){var config={min_move_x:20,min_move_y:20,wipeLeft:function(){},wipeRight:function(){},wipeUp:function(){},wipeDown:function(){},preventDefaultEvents:true};if(settings)$.extend(config,settings);this.each(function(){var startX;var startY;var isMoving=false;function cancelTouch(){this.removeEventListener('touchmove',onTouchMove);startX=null;isMoving=false}function onTouchMove(e){if(config.preventDefaultEvents){e.preventDefault()}if(isMoving){var x=e.touches[0].pageX;var y=e.touches[0].pageY;var dx=startX-x;var dy=startY-y;if(Math.abs(dx)>=config.min_move_x){cancelTouch();if(dx>0){config.wipeLeft()}else{config.wipeRight()}}else if(Math.abs(dy)>=config.min_move_y){cancelTouch();if(dy>0){config.wipeDown()}else{config.wipeUp()}}}}function onTouchStart(e){if(e.touches.length==1){startX=e.touches[0].pageX;startY=e.touches[0].pageY;isMoving=true;this.addEventListener('touchmove',onTouchMove,false)}}if('ontouchstart'in document.documentElement){this.addEventListener('touchstart',onTouchStart,false)}});return this}})(jQuery);


String.prototype.trunc = String.prototype.trunc ||
function(n){
	return this.length>n ? this.substr(0,n-1)+'&hellip;' : this;
};


// Browser Detect (adds style to body for browser)

var BrowserDetect={init:function(){this.browser=this.searchString(this.dataBrowser)||"An unknown browser";this.version=this.searchVersion(navigator.userAgent)||this.searchVersion(navigator.appVersion)||"an unknown version";this.OS=this.searchString(this.dataOS)||"an unknown OS";},searchString:function(data){for(var i=0;i<data.length;i++){var dataString=data[i].string;var dataProp=data[i].prop;this.versionSearchString=data[i].versionSearch||data[i].identity;if(dataString){if(dataString.indexOf(data[i].subString)!=-1)
return data[i].identity;}
else if(dataProp)
return data[i].identity;}},searchVersion:function(dataString){var index=dataString.indexOf(this.versionSearchString);if(index==-1)return;return parseFloat(dataString.substring(index+this.versionSearchString.length+1));},dataBrowser:[{string:navigator.userAgent,subString:"Chrome",identity:"Chrome"},{string:navigator.userAgent,subString:"OmniWeb",versionSearch:"OmniWeb/",identity:"OmniWeb"},{string:navigator.vendor,subString:"Apple",identity:"Safari",versionSearch:"Version"},{prop:window.opera,identity:"Opera",versionSearch:"Version"},{string:navigator.vendor,subString:"iCab",identity:"iCab"},{string:navigator.vendor,subString:"KDE",identity:"Konqueror"},{string:navigator.userAgent,subString:"Firefox",identity:"Firefox"},{string:navigator.vendor,subString:"Camino",identity:"Camino"},{string:navigator.userAgent,subString:"Netscape",identity:"Netscape"},{string:navigator.userAgent,subString:"MSIE",identity:"Explorer",versionSearch:"MSIE"},{string:navigator.userAgent,subString:"Gecko",identity:"Mozilla",versionSearch:"rv"},{string:navigator.userAgent,subString:"Mozilla",identity:"Netscape",versionSearch:"Mozilla"}],dataOS:[{string:navigator.platform,subString:"Win",identity:"Windows"},{string:navigator.platform,subString:"Mac",identity:"Mac"},{string:navigator.userAgent,subString:"iPhone",identity:"iPhone/iPod"},{string:navigator.platform,subString:"Linux",identity:"Linux"}]};BrowserDetect.init();

$(function(){
	var browser = BrowserDetect.browser.toLowerCase();
	var version = BrowserDetect.version;
	$('body').addClass(browser).addClass(browser+version);
});
