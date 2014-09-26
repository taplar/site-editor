describe( "KeyService", function() {
	beforeEach( function() {
		keyService = KeyService.getInstance();
	} );

	describe( "IsEnterPressed", function() {
		it( "Should return true", function() {
			expect( keyService.isEnterPressed({ keyCode: 13 }) ).toBe( true );
		} );

		it( "Should return false", function() {
			expect( keyService.isEnterPressed({ keyCode: 12 }) ).toBe( false );
			expect( keyService.isEnterPressed({ keyCode: 14 }) ).toBe( false );
		} );
	} );
} );
