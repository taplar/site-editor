var AjaxService = new function() {
	var instance = null;

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

			var parent = this;

			var params = {
				type: requestType
				, url: args.url
				, success: function( data ) {
					parent.changeCursorToDefault();
					args.fnSuccess( data );
				}
				, error: function( data ) {
					parent.changeCursorToDefault();
					args.fnFailure( data );
				}
			};

			if ( requestType === "POST" ) {
				params.data = args.input;
			}

			this.changeCursorToBusy();
			$.ajax( params );
		}
	};
	
	var buildApi = function( functions ) {
		return {
			GET: function( args ) {
				functions.request( "GET", args );
			}
			, POST: function( args ) {
				functions.request( "POST", args );
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
			var functionsClone = Require.clone( functions );
			var instance = buildApi( functionsClone );

			instance.privateFunctions = functionsClone;
			
			return instance;
		}
	};
}();
