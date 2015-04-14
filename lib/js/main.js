jQuery(function($){

	//Interpret URL
	if (params.modal) {
		var modal = params.modal
			,	url
		if (params.modal == 'profile') url = '/account/profile'
		else if (params.modal == 'new-listing') url = '/listings/new'
		else if (params.modal == 'edit-listings') url = '/listings/edit'
		openModal('', url, params.modal)
		newUrl = window.location.protocol+"//"+window.location.host
		window.location.origin = window.location.protocol+"//"+window.location.host
		window.history.pushState( '', '', newUrl);
	}

	bindJS();


	// Window Width Functions
	var w = $(window).width();


	 window.onresize = function() {

		y2g_resize();

	}

	y2g_resize();
	if (w < 481) {mobileFuncs()}



});


// Bind Function (to initialize later)
function bindJS() {

	// Add Tooltips
	$('[data-tooltip!=""]').qtip({ // Grab all elements with a non-blank data-tooltip attr.
			style: { classes: 'qtip-bootstrap' }
		,	content: { attr: 'data-tooltip' }
		, show: { event: 'click' }
		, hide: { event: 'unfocus', delay: 1000 }
		,	position: {
				viewport: $(window)
			,	adjust: {
					method: 'shift none'
			}
		}
	})


	// Modal Windows
	$('.openmodal').click(function(){
		var type = '', url = '';
		if ($(this).attr('href') != '') { url = $(this).attr('href'); }
		if ($(this).attr('data-modal') != '') { type = $(this).attr('data-modaltype'); }
		openModal($(this), url, type);
		return false;
	});
	$('.modal_close').click(function(){ closeModal(); });

}



function y2g_resize() {
	var w = $(window).width();
	var h = $(window).height();

	if (w < 481) {

		mobileFuncs();

	} else {
		var m = $('.modal'),
				mW = m.width(),
				cmh = h; // Container Min Height=

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
y2g.message = function(text, type, time, width) {
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
var Account = function() {
}

Account.signup = function(form) {
	form = $(form)
	var email = form.find('.email').val(),
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
				_gaq.push(['_trackEvent', 'Account', 'Create', 'Form Submitted', 0]); // Analytics
				_gaq.push(['_trackPageview','/account/create-form-submitted']) // Analytics
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
Account.login = function(form) {
	form = $(form);

	if ( form.parsley().isValid() ) {
		$.post('/account/login', form.serialize(), function(data){
			console.log(data);
			var formData = data
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
				if ($('input[name="redirect"]').length) {
					setTimeout(function(){window.location.href = $('input[name="redirect"]').val();},500);
				} else {
					setTimeout(function(){location.reload();},500);
				}

			},1000);
			_gaq.push(['_trackEvent', 'Login', 'success', data, 1]); // Analytics
			_gaq.push(['_trackPageview','/account/login-success']) // Analytics
		})
		.fail(function(XMLHttpRequest, textStatus, errorThrown){
			y2g.message('Wrong Username or Password', 'error', 2)
		})
		.always(function() {

		});
	}
	return false;
}

Account.editItem = function(name) {
	$('.field.editing .fa-remove').click()
	var container = $('.field.'+name)
		,	target = $('span.editable[name='+name+']')
		, val = target.html()
		, inputType = target.data('input-type')
		, inputHTML = ''
		, editBtn = container.find('.fa-edit')
		, saveBtn = container.find('.fa-save')
		, cancelBtn = container.find('.fa-remove')
		, parsley = ''

	if (name == 'name') {
		parsley = ' data-parsley-minlength="3" required';
	}
	inputHTML = '<input id="field-'+name+'" class="editable" name="'+name+'" value="'+val+'" data-initial-value="'+val+'"'+parsley+'>'
	if (inputType == 'textarea') {
		inputHTML = '<textarea id="field-'+name+'" class="editable" name="'+name+'" data-initial-value="'+val+'">'+val+'</textarea>'
	}
	container.addClass('editing')
	target.after(inputHTML).remove()
	return false
}
Account.saveItem = function(name) {
	var container = $('.field.'+name)
		,	input = container.find('[name='+name+']')
		, type = 'input'
		, val = input.val()
		, initial = input.data('initial-value')
		, editBtn = container.find('.fa-edit')
		, saveBtn = container.find('.fa-save')
		, cancelBtn = container.find('.fa-remove')
		, data = {}
	if (input.is('textarea')) type = 'textarea'

	$('#field-'+name).parsley().validate()
	if (!$('#field-'+name).parsley().isValid()) return false

	var cancelHTML = '<span name="'+name+'" data-input-type="'+type+'" class="editable">'+initial+'</span>'
		,	saveHTML = '<span name="'+name+'" data-input-type="'+type+'" class="editable">'+val+'</span>'
	data.field = name
	data.val = val
	$.post('/account/updateItem', data, function(response){

	})
	.fail(function(){
		container.removeClass('editing')
		input.after(cancelHTML).remove()
		editBtn.addClass('fa-thumbs-down').removeClass('fa-edit')
		setTimeout(function(){
			editBtn.removeClass('fa-thumbs-down').addClass('fa-edit')
		}, 2000)
	})
	.done(function(){
		container.find('.parsley-errors-list').remove()
		container.addClass('saved').removeClass('editing')
		if (val == '') container.removeClass('saved')
		input.after(saveHTML).remove()
		editBtn.addClass('fa-thumbs-up').removeClass('fa-edit')
		setTimeout(function(){
			editBtn.removeClass('fa-thumbs-up').addClass('fa-edit')
		}, 2000)
	});

}
Account.saveCheckBox = function(name) {
	var container = $('.field.'+name)
		,	input = container.find('[name='+name+']')
		, type = 'checkbox'
		, val = false
		, data = {}
	if (input.is(':checked')) val = true
	data.field = name
	data.val = val
	container.addClass('editing')
	$.post('/account/updateItem', data, function(response){

	})
	.fail(function(){
		y2g.message('there has been an error.  Please try again later.', 'error', 3)
		container.removeClass('editing').addClass('failed')
		setTimeout(function(){
			container.removeClass('failed')
		}, 2000)
	})
	.done(function(){
		container.removeClass('editing').addClass('saved')
		setTimeout(function(){
			container.removeClass('saved')
		}, 2000)
	});
}
Account.cancelEditItem = function(name) {
	var container = $('.field.'+name)
		,	input = container.find('[name='+name+']')
		, type = 'input'
		, initial = input.data('initial-value')
		, editBtn = container.find('.fa-edit')
		, saveBtn = container.find('.fa-save')
		, cancelBtn = container.find('.fa-remove')
		, val = input.val()
	if (input.is('textarea')) {
		type = 'textarea'
	}
	if (name == 'updatePassField') {
		TweenMax.to($('.new-password'), 0.25, {height: 0})
		setTimeout(function(){
			$('.updatePassField a.password').show()
		}, 250)
	} else {
		if (!val) val = ''
		var cancelHTML = '<span name="'+name+'" class="editable" data-input-type="'+type+'">'+initial+'</span>'
		input.after(cancelHTML).remove()
	}

	container.removeClass('editing')
}
Account.updateItem = function(item) {

}
Account.updatePass = function(form) {
	form = $(form)
	var pass = form.find('#newPassword-confirm').val()
		, data = {}
		, thumb = $('.updatePassField .fa-thumbs-up')
	data.newPass = pass
	$.post('/account/updatePass', data, function(response){  })
	.fail(function(){
		y2g.message('There has been an error.  Please try again.', 'error', 5)
	})
	.done(function(){
		form.removeClass('ready')
		form.find('input').val('')
		form.find('button[type=submit]').removeClass('disabled')
		TweenMax.to(form, 0.5, {height: 0})
		setTimeout(function(){
			form.siblings('a.password').show();
			TweenMax.to(thumb, 0.5, {opacity: 1})
		}, 500)
		setTimeout(function(){
			TweenMax.to(thumb, 0.5, {opacity: 0})
		}, 3000)
	})
	return false;
}

Account.forgot = function(form){
	form = $(form)
	var email = form.find('input[type=email]').val()
		, data = {}
	data.email = email
	$.post('/account/forgot', data, function(response){  })
	.fail(function(err){
		y2g.message(err, 'error', 5)
	})
	.done(function(email){
		closeModal('forgot-pass')
		y2g.message('A password-reset link has been sent to '+email+'.  The link will expire in 1 hour.  <br><br>If no email arrives within several minutes, check your spam folder.', 'success', null)
		form.find('input[type=email]').val('')
	})
	return false
}

// Keyboard Add Shortcuts to Forms
function formKeyCodes() {
	$(document).keydown(function(e){
		if (e.keyCode == 13) {
			console.log('enter!')
			if ($(document.activeElement).hasClass('editable')) {
				var field = $(document.activeElement)
				,	save = field.siblings('.fa-save')
				console.log(field,save)
				save.click()
			}
		}
	})
} formKeyCodes()

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
var Messages = function(){};

Messages.send = function(form){
	form = $(form);
	if ( form.parsley().isValid() ) {
		$.post('/messages/send', form.serialize(), function(data){
			console.log(data);
			$('body').append('<audio id="heidi" style="opacity: 0;"><source src="http://www.y2g.org/assets/public/heidi.mp3" type="audio/mpeg"></audio>');
			closeModal('message');
			setTimeout(function(){
				y2g.message('Success!<br><br> Your message has been sent to ' + data + '. What are you gonna do now?<br><br> Go Plant something...', 'success', 4);
			}, 1000);
			_gaq.push(['_trackEvent', 'Message', 'send', 'listing', 2]); // Analytics
			_gaq.push(['_trackPageview','/messages/sent-success']) // Analytics
		})
		.done(function(data) {
			//closeModal('sign-up');
		})
		.fail(function(XMLHttpRequest, textStatus, errorThrown){
			console.log('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText);
			if ( XMLHttpRequest.responseText == "You failed the captcha, please reload the page and try again"){
				y2g.message('Please click "I am not a Robot"..', 'error', 2)
			} else {
				alert('There has been an error, please contact Y2G support or try again later.');
			}
		})
		.always(function() {

		});
	}
	return false;
}


// Get URL Params
var params = {};
if (location.search) {
	var parts = location.search.substring(1).split('&');
	for (var i = 0; i < parts.length; i++) {
		var nv = parts[i].split('=');
		if (!nv[0]) continue;
		params[nv[0]] = nv[1] || true;
	}
}
