var AjaxService = {
	getInstance: function(){
		var $body = $('body');
		var changeCursorToBusy = function(){ $body.addClass('busy'); };
		var changeCursorToDefault = function(){ $body.removeClass('busy'); };

		return {
			GET: function(url, args){
				changeCursorToBusy();

				$.get(url, function(data){
					console.log('Success call');
				}).fail(function(){
					console.log('Fail call');
				}).always(function(){
					changeCursorToDefault();
					console.log('Always call');
				});
			}
		};
	}
};
