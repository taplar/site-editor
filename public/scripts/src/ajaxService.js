var AjaxService = new function() {
	var instance = null;

	var buildApi = function() {
		var functions = {
			addBusyCursorClassToBody: function() {
				$( "body" ).addClass( "busy" );
			}
			, buildRequestParameters: function( requestType, args ) {
				var params = {
					type: requestType
					, url: args.url
					, success: function( data ) {
						functions.removeBusyCursorClassFromBody();
						args.fnSuccess( data );
					}
					, error: function( data ) {
						functions.removeBusyCursorClassFromBody();
						args.fnFailure( data );
					}
				};

				if ( requestType === "POST" ) {
					params.data = args.input;
				}

				return params;
			}
			, genericAjaxRequest: function( requestType, args ) {
				functions.requireInputsBasedOffOfRequestType( requestType, args );
				functions.addBusyCursorClassToBody();

				$.ajax( functions.buildRequestParameters( requestType, args ) );
			}
			, removeBusyCursorClassFromBody: function() {
				$( "body" ).removeClass( "busy" );
			}
			, requireInputsBasedOffOfRequestType: function( requestType, args ) {
				if ( requestType === "GET") {
					Require.all( args, "url", "fnSuccess", "fnFailure" );
				} else {
					Require.all( args, "url", "input", "fnSuccess", "fnFailure" );
				}
			}
		};

		return {
			privateFunctions: functions
			,GET: function( args ) {
				functions.genericAjaxRequest( "GET", args );
			}
			, POST: function( args ) {
				functions.genericAjaxRequest( "POST", args );
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
