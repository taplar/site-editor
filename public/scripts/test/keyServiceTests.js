describe ( 'KeyService', function () {
	beforeEach( function () {
		keyService = KeyService.getInstance();
	} );

	describe ( 'API', function () {
		describe ( 'Enter', function () {
			it ( 'Should return true', function () {
				var e = $.Event( 'keyup', { keyCode: 13 } );

				expect( keyService.enter( e ) ).toBe( true );
			} );

			it ( 'Should return false', function () {
				var e = $.Event( 'keyup', { keyCode: 12 } );

				expect( keyService.enter( e ) ).toBe( false );
			} );
		} );
	} );
} );