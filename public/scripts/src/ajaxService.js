var AjaxService = {
	getInstance: function(){
		var $body = $('body');
		var changeCursorToBusy = function(){ $body.addClass('busy'); };
		var changeCursorToDefault = function(){ $body.removeClass('busy'); };
		var request = function(type, args){
			if (type === 'GET'){
				Require.all(args, 'url', 'fnSuccess', 'fnFailure');
			} else {
				Require.all(args, 'url', 'input', 'fnSuccess', 'fnFailure');
			}

			var params = {
				type: type
				,url: args.url
				,success: function(data){
					changeCursorToDefault();
					args.fnSuccess(data);
				}
				,error: function(data){
					changeCursorToDefault();
					args.fnFailure(data);
				}
			};

			if (type === 'POST'){
				params.data = args.input;
			}

			changeCursorToBusy();
			$.ajax(params);
		};

		return {
			GET: function(args){ request('GET', args); }
			,POST: function(args){ request('POST', args); }
		};
	}
};
