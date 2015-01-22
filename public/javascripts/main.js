//SETUP VARIABLES

var loggedin;


jQuery(function($){


	// Modal Windows
	$('.openmodal').click(function(){
		var type = '', url = '';
		if ($(this).attr('href') != '') { url = $(this).attr('href'); }
		if ($(this).attr('data-modal') != '') { type = $(this).attr('data-modaltype'); }
		openModal($(this), url, type);
		return false;
	});

	// if Logged In
	if (localStorage.getItem('login') == 'true') {
		$('body').addClass('logged-in');
	}




	// Window Width Functions
	var w = $(window).width();


	 window.onresize = function() {

		y2g_resize();

	}

	y2g_resize();
	if (w < 481) {mobileFuncs()}



});

function y2g_resize() {
	var w = $(window).width();
	var h = $(window).height();

	if (w < 481) {

		mobileFuncs();

	} else {
		var m = $('.modal'),
				mW = m.width(),
				cmh = h; // Container Min Height
		console.log(mW);

		m.css('margin-left',-20-mW/2);
		if (w < 960) {
			m.css('width',w-40);
		} else { m.css('width', 940)}
		$('#container').css('min-height', cmh);

		mobileOff();
	}
}

function mobileFuncs() {
	// Functions to start when on mobile sized screen

}

function mobileOff() {
	// Deactivate mobileFuncs()

}

// Page Functions
var y2g = function(location, user) {

}
y2g.message = function(text, type, time) {
	var color, duration;
	if (time != '') { duration = time*1000; } else { duration = '2000'; }
	if (type == 'error') { color = '#ef533b'; } else if (type == "success") { color = '#83c344'; } else { color = 'black'; }
	$('#message').find('.content').html(text).css('color', color);
	$('#message').fadeIn();
	if (time) { setTimeout(function(){ $('#message').fadeOut(); }, duration); }
}
$('#message .close').click(function(){
	$('#message').fadeOut();
});
$('body > .alert').append('<a class="close">').fadeIn();
$('.alert .close').click(function(){
	$('.alert').fadeOut();
});
setTimeout(function(){ $('body > .alert').fadeOut(); }, 5000);


// Login & Signup Functions
var account = function() {
}
account.signup = function(form) {
	var form = $(form),
			email = form.find('.email').val(),
			submit =form.find('input[type="submit"]');

	submit.attr('disabled','disabled');
	if ( form.parsley().isValid() ) {
		$.post('/account/sign-up', form.serialize(), function(data){
			if (data == 'email exists') {

			} else if (data == 'username exists') {

			} else {
				y2g.message('SUCCESS!<br><br>An email has been sent to '+data+'.<br><br>Please check your email and click the confirmation link.<br><br>If you do not receive an email, check your spam folder or contact <a href="support@y2g.org">support</a>.', 'success', 6);
				closeModal('sign-up');
				$('#sign-up-form input:not([type="submit"])').val('');
			}
		})
		.done(function(data) {
			//closeModal('sign-up');
		})
		.fail(function(XMLHttpRequest, textStatus, errorThrown){
			if (XMLHttpRequest.status == '409') {
				y2g.message('That email is already in use, please use a different email or <a data-modaltype="login" href="/account/login" onclick="$(\'#message\').fadeOut(); openModal(\'\', \'/account/login\', \'login\'); return false;" class="openmodal">login</a>.', 'error', null);
			}
			//console.log('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText);
			//alert('There has been an error, please contact Y2G support or try again later.');
		})
		.always(function() {
			setTimeout(function(){ submit.removeAttr('disabled'); }, 5000);
		});
	}
	return false;
}
account.login = function(form) {
	var form = $(form);

	if ( form.parsley().isValid() ) {
		$.post('/account/login', form.serialize(), function(data){
			console.log(data);
			if (data == 'Wrong Username or Password') {

			}
			/*if (data == 'email exists') {

			} else if (data == 'username exists') {

			} else {
				closeModal('login');
				y2g.message('You are now logged in. =)<br><br>reloading..', 'success', 2);
				setTimeout(function(){
					setTimeout(function(){location.reload();},500);
				},1000);
			}*/
		})
		.done(function(data) {
			closeModal('login');
			y2g.message('You are now logged in. =)<br><br>reloading..', 'success', 2);
			setTimeout(function(){
				setTimeout(function(){location.reload();},500);
			},1000);
		})
		.fail(function(XMLHttpRequest, textStatus, errorThrown){
			y2g.message('Wrong Username or Password', 'error', 2)
		})
		.always(function() {

		});
	}
	return false;
}

account.editItem = function(name) {
	var container = $('.field.'+name)
		,	target = $('span.editable[name='+name+']')
		, val = target.html()
		, inputType = target.data('input-type')
		, inputHTML = '<input class="editable" name="'+val+'" value='+val+'>'
		, editBtn = container.find('.fa-edit')
		, saveBtn = container.find('.fa-save')
		, cancelBtn = container.find('.fa-remove')
	if (inputType == 'textarea') {
		inputHTML = '<textarea class="editable" name="'+name+'" value="'+val+'"></textarea>'
	}
	container.addClass('editing')
	target.after(inputHTML).remove()
	return false
}
account.saveItem = function(name) {

}
account.cancelEditItem = function(name) {
	var container = $('.field.'+name)
		,	input = container.find('[name='+name+']')
		, editBtn = container.find('.fa-edit')
		, saveBtn = container.find('.fa-save')
		, cancelBtn = container.find('.fa-remove')
		, cancelHTML = '<span name="'+name+'" class="editable">'+input.attr('value')+'</span>'
	console.log(input)
	debugger
	container.removeClass('editing')
	input.after(cancelHTML).remove()
}
account.updateItem = function(item) {

}


function login() {
	localStorage.setItem('login', true);
	$('body').addClass('logged-in');
	closeModal();
	$('header').removeClass('menu-open');
	y2g.message("You are now logged in!", 'success', 2);
	return false;
}
function logout() {
	console.log("Logged Out");
	localStorage.removeItem('login', true);
}
function signup() {
	$('#signup input, #signup textarea').each(function(){
		storeLocal($(this).attr('name'), $(this).val());
		console.log($(this).attr('name') + ' has been stored as: ' + $(this).val());
	});
	y2g.message("Thanks for signing up! We've logged you in.", 'success', 2);
}

// Message Functions
var messages = function(){};

messages.send = function(form){
	var form = $(form);
	if ( form.parsley().isValid() ) {
		$.post('/messages/send', form.serialize(), function(data){
			console.log(data);
			$('body').append('<audio id="heidi" style="opacity: 0;"><source src="http://www.y2g.org/assets/public/heidi.mp3" type="audio/mpeg"></audio>');
			closeModal('message');
			setTimeout(function(){
				y2g.message('Success!<br><br> Your message has been sent to ' + data + '. What are you gonna do now?<br><br> Go Plant something...', 'success', 4);
			}, 1000);
			setTimeout(function(){
				document.getElementById('heidi').play();
				y2g.message('Or else...', 'error', 5);
			}, 6000);
		})
		.done(function(data) {
			//closeModal('sign-up');
		})
		.fail(function(XMLHttpRequest, textStatus, errorThrown){
			console.log('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText);
			alert('There has been an error, please contact Y2G support or try again later.');
		})
		.always(function() {

		});
	}
	return false;
}

// Create Listing
function createListing() {
	storeListing($('#newlisting').serializeObject());
}
function addListings() {
	var listings = JSON.parse(localStorage.getItem('y2g-listings'));
	var listings = [];
	listings.push(JSON.parse( 'listingstring' ));
	localStorage.setItem('y2g-listings', JSON.stringify(listings));
}

// Storage Functions
function storeLocal(name, val) {
	localStorage.setItem('y2g-' + name, val);
}
function checkLocal(name, obj) {
	check = localStorage.getItem('y2g-' + name);
	if (check != null) {
		obj.val(check);
	}
	alert('checked ' + check);
}

function storeListing(newListing) { //listingTitle, listingType, listingLocation, listingDescription, listingPic, listingAlt
	var listings = JSON.parse(localStorage.getItem('y2g-listings'));
	console.log('storing - current listings string:'+JSON.stringify(listings));
	console.log(listings);
	if (listings == null) {
		var listings = [];
		listings.push(newListing);
		localStorage.setItem('y2g-listings', JSON.stringify(listings));
	} else {
		listings.push(newListing);
		localStorage.setItem('y2g-listings', JSON.stringify(listings));
	}
	console.log(listings);
	return false;
}

function showListings() {
	listings = JSON.parse(localStorage.getItem('y2g-listings'));
	$.each(listings, function(){
		var listing = '<li data-listing="'+JSON.stringify(this)+'"><a href="#">'+this.title+'</a> <span class="date">posted '+this.date+'</span> <a href="#" class="edit">edit</a> <a href="#" class="delete">delete</a> </li>';
		$('#my_listings').append(listing);
	});
}
