var AjaxService = new function() {
	var instance = null;

	var buildApi = function() {
		var functions = {
			changeCursorToBusy: function() {
				$( "body" ).addClass( "busy" );
			}
			, changeCursorToDefault: function() {
				$( "body" ).removeClass( "busy" );
			}
			, request: function( requestType, args ) {
				if ( requestType === "GET") {
					Require.all( args, "url", "fnSuccess", "fnFailure" );
				} else {
					Require.all( args, "url", "input", "fnSuccess", "fnFailure" );
				}

				var params = {
					type: requestType
					, url: args.url
					, success: function( data ) {
						functions.changeCursorToDefault();
						args.fnSuccess( data );
					}
					, error: function( data ) {
						functions.changeCursorToDefault();
						args.fnFailure( data );
					}
				};

				if ( requestType === "POST" ) {
					params.data = args.input;
				}

				functions.changeCursorToBusy();
				$.ajax( params );
			}
		};

		return {
			privateFunctions: functions
			,GET: function( args ) {
				functions.request( "GET", args );
			}
			, POST: function( args ) {
				functions.request( "POST", args );
			}
		};
	};

	return {
		getInstance: function() {
			if ( instance == null ) {
				instance = buildApi();

				delete instance.privateFunctions;
			}

			return instance;
		}
		, getTestInstance: function() {
			return buildApi();
		}
	};
}();
