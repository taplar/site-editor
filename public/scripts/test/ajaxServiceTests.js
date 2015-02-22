describe ( 'AjaxService', function () {
	beforeEach ( function () {
		$body = $( 'body' );
		loggingService = LoggingService.getInstance();

		spyOn( LoggingService, 'getInstance' ).and.returnValue( loggingService );

		ajaxService = AjaxService.getTestInstance();
	} );

	afterEach( function () {
		$body.find( '.message' ).remove();
	} );

	describe ( 'API', function () {
		var genericApiRequestTest = function ( requestMethod, apiMethod ) {
			var requestArgs = { something: 'blah' };

			spyOn( ajaxService.privateFunctions, 'generateAjaxRequest' );

			apiMethod( requestArgs );

			expect( ajaxService.privateFunctions.generateAjaxRequest ).toHaveBeenCalled();
			expect( ajaxService.privateFunctions.generateAjaxRequest.calls.argsFor( 0 ) )
				.toEqual( [ requestMethod, requestArgs ] );
		};

		describe ( 'DELETE', function () {
			it ( 'Should generate ajax request for DELETE', function () {
				genericApiRequestTest( 'DELETE', ajaxService.DELETE );
			} );
		} );

		describe ( 'GET', function () {
			it ( 'Should generate ajax request for GET', function () {
				genericApiRequestTest( 'GET', ajaxService.GET );
			} );
		} );

		describe ( 'POST', function () {
			it ( 'Should generate ajax request for POST', function () {
				genericApiRequestTest( 'POST', ajaxService.POST );
			} );
		} );

		describe ( 'PUT', function () {
			it ( 'Should generate ajax request for PUT', function () {
				genericApiRequestTest( 'PUT', ajaxService.PUT );
			} );
		} );
	} );

	describe ( 'PrivateFunctions', function () {
		describe ( 'BuildContentType', function () {
			beforeEach ( function () {
				params = { };
				jsonArgs = { };
			} );

			it ( 'Should do nothing for DELETE', function () {
				spyOn( Utilities, 'defined' ).and.callThrough();

				ajaxService.privateFunctions.buildContentType( 'DELETE', jsonArgs, params );

				expect( Utilities.defined ).not.toHaveBeenCalled();
				expect( Utilities.defined( params.contentType ) ).toBe( false );
			} );

			it ( 'Should do nothing for GET', function () {
				spyOn( Utilities, 'defined' ).and.callThrough();

				ajaxService.privateFunctions.buildContentType( 'GET', jsonArgs, params );

				expect( Utilities.defined ).not.toHaveBeenCalled();
				expect( Utilities.defined( params.contentType ) ).toBe( false );
			} );

			it ( 'Should handle json for POST', function () {
				jsonArgs.contentType = 'json';

				spyOn( Utilities, 'defined' ).and.callThrough();

				ajaxService.privateFunctions.buildContentType( 'POST', jsonArgs, params );

				expect( Utilities.defined ).toHaveBeenCalled();
				expect( params.contentType ).toBe( 'application/json' );
			} );

			it ( 'Should handle false for POST', function () {
				jsonArgs.contentType = false;

				spyOn( Utilities, 'defined' ).and.callThrough();

				ajaxService.privateFunctions.buildContentType( 'POST', jsonArgs, params );

				expect( Utilities.defined ).toHaveBeenCalled();
				expect( params.contentType ).toBe( false );
			} );

			it ( 'Should handle json for PUT', function () {
				jsonArgs.contentType = 'json';

				spyOn( Utilities, 'defined' ).and.callThrough();

				ajaxService.privateFunctions.buildContentType( 'PUT', jsonArgs, params );

				expect( Utilities.defined ).toHaveBeenCalled();
				expect( params.contentType ).toBe( 'application/json' );
			} );

			it ( 'Should handle false for PUT', function () {
				jsonArgs.contentType = false;

				spyOn( Utilities, 'defined' ).and.callThrough();

				ajaxService.privateFunctions.buildContentType( 'PUT', jsonArgs, params );

				expect( Utilities.defined ).toHaveBeenCalled();
				expect( params.contentType ).toBe( false );
			} );
		} );

		describe ( 'BuildErrorCallback', function () {
			beforeEach ( function () {
				spyOn( loggingService, 'displayError' );
				spyOn( console, 'log' );

				jsonArgs = { };
				params = { statusCode: { } };
				xhr = { status: 200 };
			} );

			var genericShouldLog = function ( status ) {
				xhr.status = status;

				ajaxService.privateFunctions.buildErrorCallback( params, jsonArgs );
				params.error( xhr, "error" );

				expect( loggingService.displayError ).toHaveBeenCalled();
				expect( console.log ).toHaveBeenCalled();
			};

			var genericShouldNotLog = function ( status ) {
				xhr.status = status;
				params.statusCode[ status ] = function () {};

				ajaxService.privateFunctions.buildErrorCallback( params, jsonArgs );
				params.error( xhr, "error" );

				expect( loggingService.displayError ).not.toHaveBeenCalled();
				expect( console.log ).not.toHaveBeenCalled();
			};

			it ( 'Should log 401 if callback does not exists', function () {
				genericShouldLog( 401 );
			} );

			it ( 'Should not log 401 if callback does exist', function () {
				genericShouldNotLog( 401 );
			} );

			it ( 'Should log 404 if callback does not exists', function () {
				genericShouldLog( 404 );
			} );

			it ( 'Should not log 404 if callback does exist', function () {
				genericShouldNotLog( 404 );
			} );

			it ( 'Should log 496 if callback does not exists', function () {
				genericShouldLog( 496 );
			} );

			it ( 'Should not log 496 if callback does exist', function () {
				genericShouldNotLog( 496 );
			} );

			it ( 'Should log 497 if callback does not exists', function () {
				genericShouldLog( 497 );
			} );

			it ( 'Should not log 497 if callback does exist', function () {
				genericShouldNotLog( 497 );
			} );

			it ( 'Should log 498 if callback does not exists', function () {
				genericShouldLog( 498 );
			} );

			it ( 'Should not log 498 if callback does exist', function () {
				genericShouldNotLog( 498 );
			} );

			it ( 'Should log 499 if callback does not exists', function () {
				genericShouldLog( 499 );
			} );

			it ( 'Should not log 499 if callback does exist', function () {
				genericShouldNotLog( 499 );
			} );

			it ( 'Should log 500 if callback does not exists', function () {
				genericShouldLog( 500 );
			} );

			it ( 'Should not log 500 if callback does exist', function () {
				genericShouldNotLog( 500 );
			} );

			it ( 'Should call failure if callback does not exist', function () {
				jsonArgs.failure = function ( xhr, error ) { };

				spyOn( jsonArgs, 'failure' );

				genericShouldLog( 500 );
				expect( jsonArgs.failure ).toHaveBeenCalled();
			} );

			it ( 'Should call failure if callback does exist', function () {
				jsonArgs.failure = function ( xhr, error ) { };

				spyOn( jsonArgs, 'failure' );

				genericShouldNotLog( 500 );
				expect( jsonArgs.failure ).toHaveBeenCalled();
			} );
		} );

		describe ( 'BuildRequestParameters', function () {
			var expectations = function ( requestType, jsonArgs, params, assumptions ) {
				expect( params.type ).toEqual( requestType );
				expect( params.url ).toEqual( jsonArgs.url );
				expect( params.success ).toEqual( jsonArgs.success );
				expect( params.complete ).toEqual( ajaxService.privateFunctions.changeMouseStateToDefault );

				if ( assumptions.valueInList ) {
					expect( params.data ).toEqual( jsonArgs.input );
				} else {
					expect( Utilities.defined( params.data ) ).toBe( false );
				}

				if ( assumptions.processData ) {
					expect( params.processData ).toEqual( jsonArgs.processData );
				} else {
					expect( Utilities.defined( params.processData ) ).toBe( false );
				}

				expect( ajaxService.privateFunctions.buildContentType ).toHaveBeenCalled();
				expect( ajaxService.privateFunctions.buildErrorCallback ).toHaveBeenCalled();

				var args = ajaxService.privateFunctions.buildContentType.calls.first().args;
				
				expect( args[ 0 ] ).toEqual( requestType );
				expect( args[ 1 ] ).toEqual( jsonArgs );
				expect( args[ 2 ] ).toEqual( params );

				args = ajaxService.privateFunctions.buildErrorCallback.calls.first().args;
				expect( args[ 0 ] ).toEqual( params );
				expect( args[ 1 ] ).toEqual( jsonArgs );
			};

			beforeEach ( function () {
				requestArgs = {
					url: '?someurl'
					, success: function ( data ) { }
				};

				spyOn( ajaxService.privateFunctions, 'buildContentType' );
				spyOn( ajaxService.privateFunctions, 'buildErrorCallback' );
			} );

			it ( 'Should not set data', function () {
				var requestType = 'IRREVELANT';
				var assumptions = {
					valueInList: false
					, processData: false
				};

				spyOn( Utilities, 'valueInList' ).and.returnValue( false );

				var params = ajaxService.privateFunctions.buildRequestParameters( requestType, requestArgs );

				expectations( requestType, requestArgs, params, assumptions );
			});

			it ( 'Should set data', function () {
				var requestType = 'IRREVELANT';
				var assumptions = {
					valueInList: true
					, processData: false
				};

				spyOn( Utilities, 'valueInList' ).and.returnValue( true );

				var params = ajaxService.privateFunctions.buildRequestParameters( requestType, requestArgs );

				expectations( requestType, requestArgs, params, assumptions );
			});

			it ( 'Should not set processData', function () {
				var requestType = 'IRREVELANT';
				var assumptions = {
					valueInList: false
					, processData: false
				};

				spyOn( Utilities, 'valueInList' ).and.returnValue( false );

				var params = ajaxService.privateFunctions.buildRequestParameters( requestType, requestArgs );

				expectations( requestType, requestArgs, params, assumptions );
			});

			it ( 'Should set processData', function () {
				var requestType = 'IRREVELANT';
				var assumptions = {
					valueInList: false
					, processData: true
				};

				requestArgs.processData = 'process that data';

				spyOn( Utilities, 'valueInList' ).and.returnValue( false );

				var params = ajaxService.privateFunctions.buildRequestParameters( requestType, requestArgs );

				expectations( requestType, requestArgs, params, assumptions );
			});

			var genericStatusCodeHandlerTest = function ( statusCode ) {
				requestArgs[ statusCode ] = function () { };

				var params = ajaxService.privateFunctions.buildRequestParameters( 'IRREVELANT', requestArgs );

				expect( params.statusCode[ statusCode ] ).toEqual( requestArgs[ statusCode ] );
			};

			it ( 'Should allow handler for 301', function () {
				genericStatusCodeHandlerTest( 301 );
			} );

			it ( 'Should allow handler for 401', function () {
				genericStatusCodeHandlerTest( 401 );
			} );

			it ( 'Should allow handler for 404', function () {
				genericStatusCodeHandlerTest( 404 );
			} );

			it ( 'Should allow handler for 496', function () {
				genericStatusCodeHandlerTest( 496 );
			} );

			it ( 'Should allow handler for 497', function () {
				genericStatusCodeHandlerTest( 497 );
			} );

			it ( 'Should allow handler for 498', function () {
				genericStatusCodeHandlerTest( 498 );
			} );

			it ( 'Should allow handler for 499', function () {
				genericStatusCodeHandlerTest( 499 );
			} );

			it ( 'Should allow handler for 500', function () {
				genericStatusCodeHandlerTest( 500 );
			} );
		} );

		describe ( 'ChangeMouseStateToBusy', function () {
			afterEach ( function () {
				$body.removeClass( 'busy' );
			} );

			it ( 'Should add the busy class to the body', function () {
				expect( $body.hasClass( 'busy' ) ).toBe( false );
				ajaxService.privateFunctions.changeMouseStateToBusy();
				expect( $body.hasClass( 'busy' ) ).toBe( true );
			} );
		} );

		describe ( 'ChangeMouseStateToDefault', function () {
			beforeEach ( function () {
				$body.addClass( 'busy' );
			} );

			afterEach ( function () {
				$body.removeClass( 'busy' );
			} );

			it ( 'Should remove the busy class from the body', function () {
				expect( $body.hasClass( 'busy' ) ).toBe( true );
				ajaxService.privateFunctions.changeMouseStateToDefault();
				expect( $body.hasClass( 'busy' ) ).toBe( false );
			} );
		} );

		describe ( 'GenerateAjaxRequest', function () {
			it ( 'Should validate the input, change mouse to busy, and call ajax with request', function () {
				spyOn( ajaxService.privateFunctions, 'requireRequestTypeInputs' );
				spyOn( ajaxService.privateFunctions, 'changeMouseStateToBusy' );
				spyOn( ajaxService.privateFunctions, 'buildRequestParameters' ).and.returnValue( 'fakeRequestParams' );
				spyOn( $, 'ajax' );

				var requestArgs = { key: 'value' };
				var requestType = 'IRREVELANT';

				ajaxService.privateFunctions.generateAjaxRequest( requestType, requestArgs );

				expect( ajaxService.privateFunctions.requireRequestTypeInputs ).toHaveBeenCalled();
				expect( ajaxService.privateFunctions.requireRequestTypeInputs.calls.first().args )
					.toEqual( [ requestType, requestArgs ] );
				
				expect( ajaxService.privateFunctions.changeMouseStateToBusy ).toHaveBeenCalled();
				expect( ajaxService.privateFunctions.buildRequestParameters ).toHaveBeenCalled();
				expect( ajaxService.privateFunctions.buildRequestParameters.calls.first().args )
					.toEqual( [ requestType, requestArgs ] );

				expect( $.ajax ).toHaveBeenCalled();
				expect( $.ajax.calls.first().args ).toEqual( [ 'fakeRequestParams' ] );
			} );
		} );

		describe ( 'RequireRequestTypeInputs', function () {
			beforeEach ( function () {
				jsonArgs = { };

				spyOn( Require, 'all' );
				spyOn( Require, 'valueInArray' );
			} );

			var genericRequireTest = function ( requestMethod, expectedArgs ) {
				ajaxService.privateFunctions.requireRequestTypeInputs( requestMethod, jsonArgs );

				expect( Require.valueInArray ).toHaveBeenCalled();
				expect( Require.valueInArray.calls.first().args ).toEqual( [ requestMethod, ['DELETE', 'GET', 'POST', 'PUT'] ] );
				
				expect( Require.all ).toHaveBeenCalled();
				expect( Require.all.calls.first().args ).toEqual( expectedArgs );
			};

			it ( 'Should require only url, and success for DELETE', function () {
				genericRequireTest( 'DELETE',  [ jsonArgs, 'url', 'success' ]);
			} );

			it ( 'Should require only url, and success for GET', function () {
				genericRequireTest( 'GET',  [ jsonArgs, 'url', 'success' ]);
			} );

			it ( 'Should require only url, input, and success for POST', function () {
				genericRequireTest( 'POST',  [ jsonArgs, 'url', 'input', 'success' ]);
			} );

			it ( 'Should require only url, input, and success for PUT', function () {
				genericRequireTest( 'PUT',  [ jsonArgs, 'url', 'input', 'success' ]);
			} );
		} );
	} );
} );
