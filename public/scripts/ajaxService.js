var AjaxService = {
	getInstance: function(){
		var $body = $('body');
		var changeCursorToBusy = function(){ $body.addClass('busy'); };
		var changeCursorToDefault = function(){ $body.removeClass('busy'); };

		return {
			GET: function(url, args){
				Require.all(args, 'fnSuccess');

				changeCursorToBusy();

				$.get(url, function(data){
					changeCursorToDefault();
					args.fnSuccess(data);
				}).fail(function(){
					changeCursorToDefault();
					console.log('Fail call');
				}).always(function(){
					console.log('Always call');
				});
			}
		};
	}
};
