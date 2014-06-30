var EDITOR = {
	displayLogin: function(ajaxService){
		ajaxService.GET('public/views/login.html', {
			fnSuccess: function(data){ $('.container').html(data); }
			,fnFailure: EDITOR.unrecoverableError
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
			} else {
				EDITOR.unrecoverableError();
			}
		} catch (e){
			console.log(e);
			EDITOR.unrecoverableError();
		}
	}
	,unrecoverableError: function(){
		console.log('Unrecoverable error occured.  If this does not resolve itself, contact the site administrator for further assistance.');
	}
};

EDITOR.initialize(AjaxService.getInstance());
