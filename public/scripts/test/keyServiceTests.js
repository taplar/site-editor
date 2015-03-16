describe ( 'KeyService', function () {
	beforeEach( function () {
		keyService = KeyService.getTestInstance();
	} );

	describe ( 'API', function () {
		beforeEach( function () {
			spyOn( keyService.privateFunctions, 'keyTriggeredEvent' ).and.returnValue( 'invoked' );
		} );

		describe ( 'Character S', function () {
			it ( 'Should use private function', function () {
				var event = { };

				expect( keyService.s( event ) ).toEqual( 'invoked' );
				expect( keyService.privateFunctions.keyTriggeredEvent ).toHaveBeenCalled();

				var args = keyService.privateFunctions.keyTriggeredEvent.calls.first().args;
				expect( args[ 0 ] ).toEqual( 83, event );
			} );
		} );

		describe ( 'Control', function () {
			it ( 'Should use private function', function () {
				var event = { };

				expect( keyService.control( event ) ).toEqual( 'invoked' );
				expect( keyService.privateFunctions.keyTriggeredEvent ).toHaveBeenCalled();

				var args = keyService.privateFunctions.keyTriggeredEvent.calls.first().args;
				expect( args[ 0 ] ).toEqual( 17, event );
			} );
		} );

		describe ( 'Enter', function () {
			it ( 'Should use private function', function () {
				var event = { };

				expect( keyService.enter( event ) ).toEqual( 'invoked' );
				expect( keyService.privateFunctions.keyTriggeredEvent ).toHaveBeenCalled();

				var args = keyService.privateFunctions.keyTriggeredEvent.calls.first().args;
				expect( args[ 0 ] ).toEqual( 13, event );
			} );
		} );

		describe ( 'Tab', function () {
			it ( 'Should use private function', function () {
				var event = { };

				expect( keyService.tab( event ) ).toEqual( 'invoked' );
				expect( keyService.privateFunctions.keyTriggeredEvent ).toHaveBeenCalled();

				var args = keyService.privateFunctions.keyTriggeredEvent.calls.first().args;
				expect( args[ 0 ] ).toEqual( 9, event );
			} );
		} );
	} );

	describe ( 'PrivateFunctions', function () {
		describe ( 'KeyTriggeredEvent', function () {
			it ( 'Should equal which if exists', function () {
				var keyCode = 5;
				var event = { which: keyCode };

				expect( keyService.privateFunctions.keyTriggeredEvent( keyCode, event ) ).toBe( true );
			} );

			it ( 'Should not equal which if exists', function () {
				var keyCode = 5;
				var event = { which: 6 };

				expect( keyService.privateFunctions.keyTriggeredEvent( keyCode, event ) ).toBe( false );
			} );

			it ( 'Should equal keyCode if which does not exists', function () {
				var keyCode = 5;
				var event = { keyCode: keyCode };

				expect( keyService.privateFunctions.keyTriggeredEvent( keyCode, event ) ).toBe( true );
			} );

			it ( 'Should not equal keyCode if which does not exists', function () {
				var keyCode = 5;
				var event = { keyCode: 6 };

				expect( keyService.privateFunctions.keyTriggeredEvent( keyCode, event ) ).toBe( false );
			} );
		} );
	} );
} );
