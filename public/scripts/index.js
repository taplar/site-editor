var EDITOR = {
	initialize: function(ajaxService){
		ajaxService.GET('?auth/validate', {
			fnSuccess: EDITOR.processApplicationEntry
			,fnFailure: EDITOR.unrecoverableError
		});
	}
	,processApplicationEntry: function(jsonString){
		console.log(jsonString);
	}
	,unrecoverableError: function(){
		console.log('Unrecoverable error occured.  If this does not resolve itself, contact the site administrator for further assistance.');
	}
};

EDITOR.initialize(AjaxService.getInstance());
EDITOR = null;
