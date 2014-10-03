var AjaxService = new function() {
	var instance = null;
	var cloneFunctions = function() {
		var result = {};

		for (key in functions) {
			result[ key ] = functions[ key ];
		}

		return result;
	};
	var functions = {
		changeCursorToBusy: function() {
			$( "body" ).addClass( "busy" );
		}
		, changeCursorToDefault: function() {
			$( "body" ).removeClass( "busy" );
		}
		, request: function( requestType, args, functions ) {
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
	var buildApi = function( functionsReference ) {
		var functions = functionsReference;

		return {
			GET: function( args ) {
				functions.request( "GET", args, functions );
			}
			, POST: function( args ) {
				functions.request( "POST", args, functions );
			}
		};
	};

	return {
		getInstance: function() {
			if ( instance != null ) {
				return instance;
			}

			instance = buildApi( functions );

			return instance;
		}
		, getTestInstance: function() {
			var functions = cloneFunctions();
			var instance = buildApi( functions );

			instance.privateFunctions = functions;
			
			return instance;
		}
	};
}();
