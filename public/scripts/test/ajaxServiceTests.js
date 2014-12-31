describe ( 'AjaxService', function () {
	beforeEach ( function () {
		loggingService = LoggingService.getInstance();

		spyOn( LoggingService, 'getInstance' ).and.returnValue( loggingService );

		ajaxService = AjaxService.getTestInstance();
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
			var expectations = function ( jsonArgs, requestMethod ) {
				expect( jsonArgs.type ).toEqual( requestMethod );

				if ( requestMethod === 'PUT' || requestMethod === 'POST' ) {
					expect( jsonArgs.data ).toEqual( requestArgs.input );
				}

				expect( jsonArgs.url ).toEqual( requestArgs.url );

				expect( ajaxService.privateFunctions.changeMouseStateToDefault ).not.toHaveBeenCalled();
				expect( requestArgs.success ).not.toHaveBeenCalled();
				jsonArgs.success();
				jsonArgs.complete();
				expect( ajaxService.privateFunctions.changeMouseStateToDefault ).toHaveBeenCalled();
				expect( requestArgs.success ).toHaveBeenCalled();

				ajaxService.privateFunctions.changeMouseStateToDefault.calls.reset();

				expect( ajaxService.privateFunctions.changeMouseStateToDefault ).not.toHaveBeenCalled();
				expect( requestArgs.failure ).not.toHaveBeenCalled();
				jsonArgs.error( { status: 500 } );
				jsonArgs.complete();
				expect( ajaxService.privateFunctions.changeMouseStateToDefault ).toHaveBeenCalled();
				expect( requestArgs.failure ).toHaveBeenCalled();
			};

			beforeEach ( function () {
				requestArgs = {
					url: '?someurl'
					, input: {
						userid: 'id',
						password: 'password'
					}
					, success: function ( data ) { }
					, failure: function ( data ) { }
				};

				spyOn( ajaxService.privateFunctions, 'changeMouseStateToDefault' );
				spyOn( requestArgs, 'success' );
				spyOn( requestArgs, 'failure' );
			} );

			var genericBuildTest = function ( requestMethod ) {
				var request = ajaxService.privateFunctions.buildRequestParameters( requestMethod, requestArgs );

				expectations( request, requestMethod );
			};

			it ( 'Should build DELETE request', function () {
				genericBuildTest( 'DELETE' );
			} );

			it ( 'Should build GET request', function () {
				genericBuildTest( 'GET' );
			} );

			it ( 'Should build POST request', function () {
				genericBuildTest( 'POST' );
			} );

			it ( 'Should build PUT request', function () {
				genericBuildTest( 'PUT' );
			} );

			it ( 'Should build request with unauthorized handler', function () {
				requestArgs[ 401 ] = function () { return 'Unauthorized handler'; };

				var request = ajaxService.privateFunctions.buildRequestParameters( 'GET', requestArgs );
				
				expect( request.statusCode[ 401 ]() ).toEqual( 'Unauthorized handler' );
			} );

			it ( 'Should build request with not found handler', function () {
				requestArgs[ 404 ] = function () { return 'Not Found handler'; };

				var request = ajaxService.privateFunctions.buildRequestParameters( 'POST', requestArgs );
				
				expect( request.statusCode[ 404 ]() ).toEqual( 'Not Found handler' );
			} );

			it ( 'Should build request with internal error handler', function () {
				requestArgs[ 500 ] = function () { return 'Internal Error handler'; };

				var request = ajaxService.privateFunctions.buildRequestParameters( 'PUT', requestArgs );
				
				expect( request.statusCode[ 500 ]() ).toEqual( 'Internal Error handler' );
			} );
		} );

		describe ( 'ChangeMouseStateToBusy', function () {
			afterEach ( function () {
				$( 'body' ).removeClass( 'busy' );
			} );

			it ( 'Should add the busy class to the body', function () {
				expect( $( 'body' ).hasClass( 'busy' ) ).toBe( false );
				ajaxService.privateFunctions.changeMouseStateToBusy();
				expect( $( 'body' ).hasClass( 'busy' ) ).toBe( true );
			} );
		} );

		describe ( 'ChangeMouseStateToDefault', function () {
			beforeEach ( function () {
				$( 'body' ).addClass( 'busy' );
			} );

			it ( 'Should remove the busy class from the body', function () {
				expect( $( 'body' ).hasClass( 'busy' ) ).toBe( true );
				ajaxService.privateFunctions.changeMouseStateToDefault();
				expect( $( 'body' ).hasClass( 'busy' ) ).toBe( false );
			} );
		} );

		describe ( 'GenerateAjaxRequest', function () {
			it ( 'Should validate the input, change mouse to busy, and call ajax with request', function () {
				spyOn( ajaxService.privateFunctions, 'requireRequestTypeInputs' );
				spyOn( ajaxService.privateFunctions, 'changeMouseStateToBusy' );
				spyOn( ajaxService.privateFunctions, 'buildRequestParameters' ).and.returnValue( 'fakeRequestParams' );
				spyOn( $, 'ajax' );

				var requestArgs = { key: 'value' };

				ajaxService.privateFunctions.generateAjaxRequest( 'GET', requestArgs );

				expect( ajaxService.privateFunctions.requireRequestTypeInputs ).toHaveBeenCalled();
				expect( ajaxService.privateFunctions.requireRequestTypeInputs.calls.argsFor( 0 ) )
					.toEqual( [ 'GET', requestArgs ] );
				
				expect( ajaxService.privateFunctions.changeMouseStateToBusy ).toHaveBeenCalled();
				expect( ajaxService.privateFunctions.buildRequestParameters ).toHaveBeenCalled();
				expect( ajaxService.privateFunctions.buildRequestParameters.calls.argsFor( 0 ) )
					.toEqual( [ 'GET', requestArgs ] );

				expect( $.ajax ).toHaveBeenCalled();
				expect( $.ajax.calls.argsFor( 0 ) ).toEqual( [ 'fakeRequestParams' ] );
			} );
		} );

		describe ( 'RequireRequestTypeInputs', function () {
			beforeEach ( function () {
				jsonArgs = {
					url: '?someurl'
					, input : { iGotChaInputRightHea: 'pwned!' }
					, success: function ( data ) { }
					, failure: function ( data ) { }
				};

				spyOn( Require, 'all' );
				valueInArraySpy = spyOn( Require, 'valueInArray' );
			} );

			it ( 'Should validate that the requestType is valid', function () {
				valueInArraySpy.and.callFake( function () {
					throw [ new Error( 'Missing Value' ) ];
				} );

				try {
					ajaxService.privateFunctions.requireRequestTypeInputs( 'HEADER', jsonArgs );
					fail();
				} catch ( e ) {
					expect( e[ 0 ].message ).toEqual( 'Missing Value' );
				}
			} );

			var genericRequireTest = function ( requestMethod, expectedArgs ) {
				ajaxService.privateFunctions.requireRequestTypeInputs( requestMethod, jsonArgs );

				expect( Require.valueInArray ).toHaveBeenCalled();
				expect( Require.all ).toHaveBeenCalled();
				expect( Require.all.calls.argsFor( 0 ) ).toEqual( expectedArgs );
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
