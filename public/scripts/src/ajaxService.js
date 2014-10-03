var AjaxService = {
	getInstance: function() {
		var $body = $( "body" );
		
		var fnChangeCursorToBusy = function() {
			$body.addClass( "busy" );
		};

		var fnChangeCursorToDefault = function() {
			$body.removeClass( "busy" );
		};

		var request = function( requestType, args ) {
			if ( requestType === "GET") {
				Require.all( args, "url", "fnSuccess", "fnFailure" );
			} else {
				Require.all( args, "url", "input", "fnSuccess", "fnFailure" );
			}

			var params = {
				type: requestType
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

			if ( requestType === "POST" ) {
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
