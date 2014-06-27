$(document).ready(function(){
	var ajaxService = AjaxService.getInstance();

	ajaxService.GET('?auth/validate', {
		fnSuccess: function(data){ console.log(data); }
	});
});
