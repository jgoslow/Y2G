// Perform AJAX login on form submit
$(function(){
	$('form#login').on('submit', function(e){
		console.log('Logging In..');
	    $('form#login p.status').show().text(ajax_login_object.loadingmessage);
	    $.ajax({
	        type: 'POST',
	        dataType: 'json',
	        url: ajax_login_object.ajaxurl,
	        data: { 
	            'action': 'ajaxlogin', //calls wp_ajax_nopriv_ajaxlogin
	            'username': $('form#login #username').val(), 
	            'password': $('form#login #password').val(), 
	            'security': $('form#login #security').val() },
	        success: function(data){
				console.log('logged in');
	            $('form#login p.status').text(data.message);
	            if (data.loggedin == true){
	                document.location.href = ajax_login_object.redirecturl;
	            }
	        },
			error: function(msg){
				console.error(msg);
			} 
	    });
	    e.preventDefault();
	});
	
	$('#um_form_create_account').on('submit', function(e){
		console.log('Creating a new account');
	    $('form#login p.status').show().text('Creating New Account..');
		$.ajax({
			type: 'POST',
			dataType: 'json',
			url: umInsertUser(this),
			data: {
	            'action': 'ajaxlogin', //calls wp_ajax_nopriv_ajaxlogin
	            'username': $('form#login #username').val(), 
	            'password': $('form#login #password').val(), 
	            'security': $('form#login #security').val() },
	        success: function(data){
				console.log('logged in');
	            $('form#login p.status').text(data.message);
	            if (data.loggedin == true){
	                document.location.href = ajax_login_object.redirecturl;
	            }
	        },
			error: function(msg){
				console.error(msg);
			
			}
		});
		e.preventDefault();
	});
});