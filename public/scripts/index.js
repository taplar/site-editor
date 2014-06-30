var EDITOR = {
	KeyTest: {
		isCode: function(e, keyCode){ return (e.keyCode == keyCode); }
		,isCtrl: function(e){ return EDITOR.KeyTest.isCode(e, 17); }
		,isEnter: function(e){ return EDITOR.KeyTest.isCode(e, 13); }
		,isS: function(e){ return EDITOR.KeyTest.isCode(e, 83); }
		,isTab: function(e){ return EDITOR.KeyTest.isCode(e, 9); }
	}
	,actionSubmitLogin: function(e, ajaxService){
		if (EDITOR.KeyTest.isEnter(e)){
			ajaxService.POST('?auth/validate', {
				userid: $('#userid').val()
				,password: $('#password').val()
			}, {
				fnSuccess: function(data){ EDITOR.processLoginSubmit(data, ajaxService); }
				,fnFailure: function(){}
			});
		}
	}
	,displayError: function(message){ EDITOR.displayMessage(message, 'error'); }
	,displayInfo: function(message){ EDITOR.displayMessage(message, 'info'); }
	,displayLogin: function(ajaxService){
		ajaxService.GET('public/views/login.html', {
			fnSuccess: function(data){ EDITOR.processLoginDisplay(data, ajaxService); }
			,fnFailure: EDITOR.unrecoverableError
		});		
	}
	,displayMessage: function(message, clazz){
		var $msg = $('<div class="'+ clazz +'">'+ message +'</div>');
		
		$('body').append($msg);
		
		setTimeout(function(){
			$msg.css('top', '7px');
			$msg.css('right', '125px');
			
			setTimeout(function(){
				$msg.css('top', '-50px');
				
				setTimeout(function(){
					$msg.remove();
				}, 4000);
			}, 4000);
		}, 1000);
	}
	,displaySuccess: function(message){ EDITOR.displayMessage(message, 'success'); }
	,displayWorkspace: function(ajaxService){
		ajaxService.GET('public/views/workspace.html', {
			fnSuccess: function(data){ EDITOR.processWorkspaceDisplay(data, ajaxService); }
			,fnFailure: EDITOR.recoverableError
		});		
	}
	,initialize: function(ajaxService){
		ajaxService.GET('?auth/validate', {
			fnSuccess: function(data){ EDITOR.processApplicationEntry(data, ajaxService); }
			,fnFailure: EDITOR.unrecoverableError
		});
	}
	,processApplicationEntry: function(jsonString, ajaxService){
		try {
			var response = $.parseJSON(jsonString);

			Require.all(response, 'responseCode');

			if (response.responseCode == 'UNAUTHORIZED'){
				EDITOR.displayLogin(ajaxService);
			} else if (response.responseCode == 'AUTHORIZED'){
				EDITOR.displayWorkspace(ajaxService);
			} else {
				EDITOR.unrecoverableError();
			}
		} catch (e){
			console.log(e);
			EDITOR.unrecoverableError();
		}
	}
	,processLoginDisplay: function(data, ajaxService){
		$('.container').html(data);
		$('.login .input input').keyup(function(e){ EDITOR.actionSubmitLogin(e, ajaxService); });
	}
	,processLoginSubmit: function(jsonString, ajaxService){
		try {
			var response = $.parseJSON(jsonString);

			Require.all(response, 'responseCode');

			if (response.responseCode == 'UNAUTHORIZED'){
				EDITOR.displayInfo('Authorization Failed.');
			} else if (response.responseCode == 'AUTHORIZED'){
				EDITOR.displayWorkspace(ajaxService);
			} else {
				EDITOR.unrecoverableError();
			}
		} catch (e){
			console.log(e);
			EDITOR.recoverableError();
		}
	}
	,processWorkspaceDisplay: function(data, ajaxService){
		$('.container').html(data);
	}
	,recoverableError: function(){ EDITOR.displayError('Error occured.  Please try again.'); }
	,unrecoverableError: function(){
		console.log('Unrecoverable error occured.  If this does not resolve itself, contact the site administrator for further assistance.');
		EDITOR.displayError('Error occured.  Check console for more information.');
	}
};

EDITOR.initialize(AjaxService.getInstance());
