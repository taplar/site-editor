var AjaxService = {
	getInstance: function() {
		var $body = $( "body" );
		var fnChangeCursorToBusy = function() {
			$body.addClass( "busy" );
		};

		var fnChangeCursorToDefault = function() {
			$body.removeClass( "busy" );
		};

		var request = function( type, args ) {
			if ( type === "GET") {
				Require.all( args, "url", "fnSuccess", "fnFailure" );
			} else {
				Require.all( args, "url", "input", "fnSuccess", "fnFailure" );
			}

			var params = {
				type: type
				, url: args.url
				, success: function( data ) {
					fnChangeCursorToDefault();
					args.fnSuccess( data );
				}
				, error: function( data ) {
					fnChangeCursorToDefault();
					args.fnFailure(data);
				}
			};

			if ( type === "POST" ) {
				params.data = args.input;
			}

			fnChangeCursorToBusy();
			$.ajax( params );
		};

		return {
			GET: function( args ) {
				request( "GET", args );
			}
			, POST: function( args ) {
				request( "POST", args );
			}
		};
	}
};
