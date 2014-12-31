var AjaxService = function () {
	var instance = null;

	var buildApi = function () {
		var validRequestTypes = ['DELETE', 'GET', 'POST', 'PUT'];

		var functions = {
			buildErrorCallback: function ( params, jsonArgs ) {
				params.error = function ( xhr, error ) {
					var statusDoesNotHaveACallback =
						   ( typeof params.statusCode[ 401 ] == 'undefined' || xhr.status != 401 )
						&& ( typeof params.statusCode[ 404 ] == 'undefined' || xhr.status != 404 )
						&& ( typeof params.statusCode[ 500 ] == 'undefined' || xhr.status != 500 );

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
				}

				if ( typeof jsonArgs[ 401 ] != 'undefined' ) {
					params.statusCode[ 401 ] = jsonArgs[ 401 ];
				}

				if ( typeof jsonArgs[ 404 ] != 'undefined' ) {
					params.statusCode[ 404 ] = jsonArgs[ 404 ];
				}

				if ( typeof jsonArgs[ 500 ] != 'undefined' ) {
					params.statusCode[ 500 ] = jsonArgs[ 500 ];
				}

				functions.buildErrorCallback( params, jsonArgs );

				return params;
			}
			, changeMouseStateToBusy: function () {
				$( 'body' ).addClass( 'busy' );
			}
			, changeMouseStateToDefault: function () {
				$( 'body' ).removeClass( 'busy' );
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
