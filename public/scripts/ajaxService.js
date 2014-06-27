var AjaxService = {
	getInstance: function(){
		var $body = $('body');
		var changeCursorToBusy = function(){ $body.addClass('busy'); };
		var changeCursorToDefault = function(){ $body.removeClass('busy'); };

		return {
			GET: function(url, args){
				Require.all(args, 'fnSuccess', 'fnFailure');

				changeCursorToBusy();

				$.get(url, function(data){
					changeCursorToDefault();
					args.fnSuccess(data);
				}).fail(function(){
					changeCursorToDefault();
					args.fnFailure();
				});
			}
			,POST: function(url, input, args){
				Require.all(args, 'fnSuccess', 'fnFailure');

				changeCursorToBusy();

				$.post(url, input, function(data){
					changeCursorToDefault();
					args.fnSuccess(data);
				}).fail(function(){
					changeCursorToDefault();
					args.fnFailure();
				});
			}
		};
	}
};
