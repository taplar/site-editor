describe( "KeyService", function() {
	beforeEach( function() {
		keyService = KeyService.getTestInstance();
	} );

	describe( "IsEnter", function() {
		it( "Should return true", function() {
			expect( keyService.isEnter({ keyCode: 13 }) ).toBe( true );
		} );

		it( "Should return false", function() {
			expect( keyService.isEnter({ keyCode: 12 }) ).toBe( false );
			expect( keyService.isEnter({ keyCode: 14 }) ).toBe( false );
		} );
	} );
} );
