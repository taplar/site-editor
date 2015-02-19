var AjaxService = function () {
	var instance = null;

	var buildApi = function () {
		var errorStatusCodes = [ 301, 401, 404, 496, 497, 498, 499, 500 ];
		var validRequestTypes = ['DELETE', 'GET', 'POST', 'PUT'];
		var $body = $( 'body' );

		var functions = {
			buildErrorCallback: function ( params, jsonArgs ) {
				params.error = function ( xhr, error ) {
					var statusDoesNotHaveACallback = true;

					for ( var i = 0; i < errorStatusCodes.length; i++ ) {
						statusDoesNotHaveACallback = statusDoesNotHaveACallback
							&& ( typeof params.statusCode[ errorStatusCodes[ i ] ] == 'undefined'
							     || xhr.status != errorStatusCodes[ i ] );
					}

					if ( statusDoesNotHaveACallback ) {
						LoggingService.getInstance().displayError( 'Unexpected response code returned from service.  Please see console for more details.' );
						console.log( 'Service returned an unexpected response code of: '+ xhr.status );
					}

					if ( typeof jsonArgs.failure != 'undefined' ) {
						jsonArgs.failure( xhr, error );
					}
				};
			}
			, buildRequestParameters: function ( requestType, jsonArgs ) {
				var params = {
					type: requestType
					, url: jsonArgs.url
					, success: jsonArgs.success
					, complete: functions.changeMouseStateToDefault
					, statusCode: {}
				};

				if ( requestType === 'POST' || requestType === 'PUT' ) {
					params.data = jsonArgs.input;

					if ( typeof jsonArgs.contentType !== 'undefined' ) {
						if ( jsonArgs.contentType === 'json' ) {
							params.contentType = 'application/json';
						} else if ( jsonArgs.contentType === false ) {
							params.contentType = false;
						}
					}
				}

				for ( var i = 0; i < errorStatusCodes.length; i++ ) {
					if ( typeof jsonArgs[ errorStatusCodes[ i ] ] != 'undefined' ) {
						params.statusCode[ errorStatusCodes[ i ] ] = jsonArgs[ errorStatusCodes[ i ] ];
					}
				}

				if ( typeof jsonArgs.processData !== 'undefined' ) {
					params.processData = jsonArgs.processData;
				}

				functions.buildErrorCallback( params, jsonArgs );

				return params;
			}
			, changeMouseStateToBusy: function () {
				$body.addClass( 'busy' );
			}
			, changeMouseStateToDefault: function () {
				$body.removeClass( 'busy' );
			}
			, generateAjaxRequest: function ( requestType, jsonArgs ) {
				functions.requireRequestTypeInputs( requestType, jsonArgs );
				functions.changeMouseStateToBusy();

				$.ajax( functions.buildRequestParameters( requestType, jsonArgs ) );
			}
			, requireRequestTypeInputs: function ( requestType, jsonArgs ) {
				Require.valueInArray( requestType, validRequestTypes );

				switch ( requestType ) {
					case 'POST':
					case 'PUT':
						Require.all( jsonArgs, 'url', 'input', 'success' );
						break;
					default:
						Require.all( jsonArgs, 'url', 'success' );
						break;
				}
			}
		};

		var api = {
			privateFunctions: functions
			, DELETE: function ( jsonArgs ) {
				functions.generateAjaxRequest( 'DELETE', jsonArgs );
			}
			, GET: function ( jsonArgs ) {
				functions.generateAjaxRequest( 'GET', jsonArgs );
			}
			, POST: function ( jsonArgs ) {
				functions.generateAjaxRequest( 'POST', jsonArgs );
			}
			, PUT: function ( jsonArgs ) {
				functions.generateAjaxRequest( 'PUT', jsonArgs );
			}
		};

		return api;
	};

	return {
		getInstance: function () {
			if ( instance == null ) {
				instance = buildApi();

				delete instance.privateFunctions;
			}

			return instance;
		}
		, getTestInstance: function () {
			return buildApi();
		}
	};
}();
