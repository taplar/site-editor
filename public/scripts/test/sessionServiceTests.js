describe ( 'SessionService', function () {
	beforeEach ( function () {
		ajaxService = AjaxService.getInstance();
		keyService = KeyService.getInstance();
		loggingService = LoggingService.getInstance();
		workspaceService = WorkspaceService.getInstance();

		spyOn( AjaxService, 'getInstance' ).and.returnValue( ajaxService );
		spyOn( KeyService, 'getInstance' ).and.returnValue( keyService );
		spyOn( LoggingService, 'getInstance' ).and.returnValue( loggingService );
		spyOn( WorkspaceService, 'getInstance' ).and.returnValue( workspaceService );

		sessionService = SessionService.getTestInstance();

		$( '<div>', { class: 'container' } ).appendTo( $( 'body' ) );
	} );

	afterEach ( function () {
		$( '.container' ).remove();
	} );

	describe ( 'API', function () {
		describe ( 'DisplayLogin', function () {
			it ( 'Should try to get login view', function () {
				spyOn( ajaxService, 'GET' );
				spyOn( loggingService, 'logNotFound' );
				spyOn( loggingService, 'logInternalError' );
				spyOn( sessionService.privateFunctions, 'buildLoginForm' );

				sessionService.displayLogin();

				expect( ajaxService.GET ).toHaveBeenCalled();

				var args = ajaxService.GET.calls.argsFor( 0 );

				expect( args[ 0 ].url ).toEqual( './public/views/login.view' );
				expect( args[ 0 ].success ).toEqual( sessionService.privateFunctions.buildLoginForm );
				expect( args[ 0 ][ 404 ] ).toEqual( loggingService.logNotFound );
				expect( args[ 0 ][ 500 ] ).toEqual( loggingService.logInternalError );
			} );
		} );

		describe ( 'Logout', function () {
			it ( 'Should call DELETE for the session', function () {
				spyOn( ajaxService, "DELETE" );

				sessionService.logout();

				expect( ajaxService.DELETE ).toHaveBeenCalled();

				var args = ajaxService.DELETE.calls.argsFor( 0 );

				expect( args[ 0 ].url ).toEqual( './private/?sessions' );
				expect( args[ 0 ].success ).toEqual( sessionService.privateFunctions.logoutSuccess );
				expect( args[ 0 ].failure ).toEqual( sessionService.displayLogin );
			} );
		} );

		describe ( 'ValidateActiveSession', function () {
			it ( 'Should try to get session', function () {
				spyOn( ajaxService, 'GET' );

				sessionService.validateActiveSession();

				expect( ajaxService.GET ).toHaveBeenCalled();

				var args = ajaxService.GET.calls.argsFor( 0 );

				expect( args[ 0 ].url ).toEqual( './private/?sessions' );
				expect( args[ 0 ].success ).toEqual( workspaceService.displayWorkspace );
				expect( args[ 0 ][ 401 ] ).toEqual( sessionService.displayLogin );
				expect( args[ 0 ][ 500 ] ).toEqual( loggingService.logInternalError );
			} );
		} );
	} );

	describe ( 'PrivateFunctions', function () {
		describe ( 'BuildLoginForm', function () {
			it ( 'Should set container html to data, bind form submit to inputs, and focus on userid', function () {
				var htmlData = '<input id="userid" type="text"><input id="password" type="password">';

				spyOn( sessionService.privateFunctions, "submitLoginOnEnter" ).and.returnValue( 'Keyup Value' );

				sessionService.privateFunctions.buildLoginForm( htmlData );

				expect( $( '.container' ).html() ).toEqual( htmlData );
				expect( $( '#userid' ).is( ':focus') ).toBe( true );
			} );
		} );

		describe ( 'LoginFailure', function () {
			it ( 'Should display Invalid Credentials message', function () {
				spyOn( loggingService, 'displayError' );

				sessionService.privateFunctions.loginFailure();

				expect( loggingService.displayError ).toHaveBeenCalled();

				var args = loggingService.displayError.calls.argsFor( 0 );

				expect ( args[ 0 ] ).toEqual( 'Invalid Credentials' );
			} );
		} );

		describe ( 'LogoutSuccess', function () {
			it ( 'Should display success message and display login', function () {
				spyOn( loggingService, 'displaySuccess' );
				spyOn( sessionService, 'displayLogin' );

				var data = { somedata: 'yeah' };

				sessionService.privateFunctions.logoutSuccess( data );

				expect( loggingService.displaySuccess ).toHaveBeenCalled();
				expect( sessionService.displayLogin ).toHaveBeenCalled();

				var logArgs = loggingService.displaySuccess.calls.argsFor( 0 );
				var sessionArgs = sessionService.displayLogin.calls.argsFor( 0 );

				expect( logArgs[ 0 ] ).toEqual( 'Logged Out' );
				expect( sessionArgs[ 0 ] ).toEqual( data );
			} );
		} );

		describe ( 'SubmitLoginOnEnter', function () {
			beforeEach ( function () {
				$( '.container' ).html( '<input id="userid" value="admin"><input id="password" value="pass">' );
			} );

			it ( 'Should submit POST request if enter is pressed', function () {
				spyOn( ajaxService, 'DELETE' );
				spyOn( ajaxService, 'GET' );
				spyOn( ajaxService, 'POST' );
				spyOn( ajaxService, 'PUT' );
				spyOn( keyService, 'enter' ).and.returnValue( true );

				var e = $.Event( 'keypress' );

				sessionService.privateFunctions.submitLoginOnEnter( e );

				expect( ajaxService.DELETE ).not.toHaveBeenCalled();
				expect( ajaxService.GET ).not.toHaveBeenCalled();
				expect( ajaxService.PUT ).not.toHaveBeenCalled();
				
				expect( ajaxService.POST ).toHaveBeenCalled();

				var args = ajaxService.POST.calls.argsFor( 0 );

				expect( args[ 0 ].url ).toEqual( './private/?sessions' );
				expect( args[ 0 ].input ).toEqual( {
					userid: 'admin'
					, password: 'pass'
				} );
				expect( args[ 0 ].success ).toEqual( workspaceService.displayWorkspace );
				expect( args[ 0 ][ 401 ] ).toEqual( sessionService.privateFunctions.loginFailure );
				expect( args[ 0 ][ 500 ] ).toEqual( loggingService.logInternalError );
			} );
		} );
	} );
} );
