describe( "AjaxService", function() {
	var expectations = function( jsonObject ) {
		expect( jsonObject.errors[ 0 ].message ).toEqual( jsonObject.message );
	};

	var fail = function () {
		expect( false ).toBe( true );
	};

	beforeEach(function() {
		ajaxService = AjaxService.getTestInstance();
	});

	it( "TestInstance should affect calls", function() {
		spyOn( ajaxService.privateFunctions, "request" ).and.callFake( function() {
			throw [new Error( "Magic" )];
		} );

		try {
			ajaxService.GET();
			fail();
		} catch ( e ) {
			expectations({
				errors: e
				, message: "Magic"
			});
		}
	} );

	it( "TestInstance should not affect real instance", function() {
		var realAjaxService = AjaxService.getInstance();

		spyOn( ajaxService.privateFunctions, "request" ).and.callFake( function() {
			throw [ new Error( "Magic" ) ];
		} );

		try {
			ajaxService.GET();
			fail();
		} catch ( e ) {
			expectations({
				errors: e
				, message: "Magic"
			});
		}

		try {
			realAjaxService.GET();
		} catch ( e ) {
			expectations({
				errors: e
				, message: "Argument 'args' is undefined"
			});
		}
	} );

	describe( "GET", function() {
		it( "Should throw error if missing arguments", function() {
			try {
				ajaxService.GET();
				fail();
			} catch ( e ) {
				expectations({
					errors: e
					, message: "Argument 'args' is undefined"
				});
			}
		} );

		it( "Should throw error if missing url", function() {
			try {
				ajaxService.GET({
					fnSuccess: null
					, fnFailure: null
				});
				fail();
			} catch ( e ) {
				expectations({
					errors: e
					, message: "Missing Property: url"
				});
			}
		} );

		it( "Should throw error if missing success callback", function() {
			try {
				ajaxService.GET({
					url: "about:blank"
					, fnFailure: null
				});
				fail();
			} catch ( e ) {
				expectations({
					errors: e
					, message: "Missing Property: fnSuccess"
				});
			}
		} );

		it( "Should throw error if missing failure callback", function() {
			try {
				ajaxService.GET({
					url: "about:blank"
					, fnSuccess: null
				});
				fail();
			} catch ( e ) {
				expectations({
					errors: e
					, message: "Missing Property: fnFailure"
				});
			}
		} );

		it( "Should execute failure callback", function() {
			var obj = {
				url: ""
				, fnSuccess: jasmine.createSpy()
				, fnFailure: jasmine.createSpy()
			};

			spyOn( $, "ajax" ).and.callFake( function( args ) {
				args.error();
			} );

			ajaxService.GET( obj );

			expect( obj.fnSuccess.calls.any() ).toBe( false );
			expect( obj.fnFailure.calls.any() ).toBe( true );
		} );

		it( "Should execute success callback", function() {
			var obj = {
				url: ""
				, fnSuccess: jasmine.createSpy()
				, fnFailure: jasmine.createSpy()
			};

			spyOn( $, "ajax" ).and.callFake( function( args ) {
				args.success();
			} );

			ajaxService.GET( obj );

			expect( obj.fnSuccess.calls.any() ).toBe( true );
			expect( obj.fnFailure.calls.any() ).toBe( false );
		} );
	} );

	describe( "POST", function() {
		it( "Should throw error if missing arguments", function() {
			try {
				ajaxService.POST();
				fail();
			} catch ( e ) {
				expectations({
					errors: e
					, message: "Argument 'args' is undefined"
				});
			}
		} );

		it( "Should throw error if missing url", function() {
			try {
				ajaxService.POST({
					input: null
					, fnSuccess: null
					, fnFailure: null
				});
				fail();
			} catch ( e ) {
				expectations({
					errors: e
					, message: "Missing Property: url"
				});
			}
		} );

		it( "Should throw error if missing input", function() {
			try {
				ajaxService.POST({
					url: null
					, fnSuccess: null
					, fnFailure: null
				});
				fail();
			} catch ( e ) {
				expectations({
					errors: e
					, message: "Missing Property: input"
				});
			}
		} );

		it( "Should throw error if missing success callback", function() {
			try {
				ajaxService.POST({
					url: "about:blank"
					, input: null
					, fnFailure: null
				});
				fail();
			} catch ( e ) {
				expectations({
					errors: e, message: "Missing Property: fnSuccess"
				});
			}
		} );

		it( "Should throw error if missing failure callback", function() {
			try {
				ajaxService.POST({
					url: "about:blank"
					, input: null
					, fnSuccess: null
				});
				fail();
			} catch ( e ) {
				expectations({
					errors: e, message: "Missing Property: fnFailure"
				});
			}
		} );

		it( "Should execute failure callback", function() {
			var obj = {
				url: ""
				, input: ""
				, fnSuccess: jasmine.createSpy()
				, fnFailure: jasmine.createSpy()
			};

			spyOn( $, "ajax" ).and.callFake( function( args ) {
				args.error();
			} );

			ajaxService.POST( obj );

			expect( obj.fnSuccess.calls.any() ).toBe( false );
			expect( obj.fnFailure.calls.any() ).toBe( true );
		} );

		it( "Should execute success callback", function() {
			var obj = {
				url: ""
				, input: ""
				, fnSuccess: jasmine.createSpy()
				, fnFailure: jasmine.createSpy()
			};

			spyOn( $, "ajax" ).and.callFake( function( args ) {
				args.success();
			} );

			ajaxService.POST( obj );

			expect( obj.fnSuccess.calls.any() ).toBe( true );
			expect( obj.fnFailure.calls.any() ).toBe( false );
		});
	});
});
