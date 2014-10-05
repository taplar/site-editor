describe( "WorkspaceService", function() {
	beforeEach( function() {
		ajaxService = AjaxService.getInstance();
		authService = AuthService.getInstance();
		keyService = KeyService.getInstance();
		loggingService = LoggingService.getInstance();

		spyOn( loggingService, "unrecoverableError" );
		spyOn( AjaxService, "getInstance" ).and.returnValue( ajaxService );
		spyOn( AuthService, "getInstance" ).and.returnValue( authService );
		spyOn( KeyService, "getInstance" ).and.returnValue( keyService );
		spyOn( LoggingService, "getInstance" ).and.returnValue( loggingService );

		workspaceService = WorkspaceService.getTestInstance();
	} );

	describe( "DisplayWorkspace", function() {
		var expectations = function( jsonObject ) {
			expect( loggingService.unrecoverableError.calls.any() ).toBe( jsonObject.unrecoverableError );
			expect( workspaceService.privateFunctions.processDisplayWorkspace.calls.any() ).toBe( jsonObject.processDisplayWorkspace );

			var arguments = ajaxService.GET.calls.argsFor( 0 )[ 0 ];

			expect( arguments.url ).toEqual( "public/views/workspace.html" );
		};

		beforeEach( function() {
			spyOn( workspaceService.privateFunctions, "processDisplayWorkspace" );
		} );

		it( "Should log unrecoverable error on failure", function() {
			spyOn( ajaxService, "GET" ).and.callFake( function(args) {
				args.fnFailure();
			} );

			workspaceService.displayWorkspace();

			expectations({
				unrecoverableError: true,
				processDisplayWorkspace: false
			});
		} );

		it( "Should process response on success", function() {
			spyOn( ajaxService, "GET" ).and.callFake( function( args ) {
				args.fnSuccess();
			} );

			workspaceService.displayWorkspace();

			expectations({
				unrecoverableError: false,
				processDisplayWorkspace: true
			});
		} );
	} );

	describe( "ProcessDisplayWorkspace", function() {
		var expectations = function( jsonObject ) {
			expect( loggingService.unrecoverableError.calls.any() ).toBe( jsonObject.unrecoverableError );
			expect( $( ".container" ).html() ).toEqual( jsonObject.containerHtml );
		};

		beforeEach( function() {
			$( "body" ).append($( "<div>", { class: "container" } ) );
		} );

		afterEach( function() {
			$( ".container" ).remove();
		} );

		it( "Should throw error if missing data", function() {
			workspaceService.privateFunctions.processDisplayWorkspace();

			expectations({
				unrecoverableError: true,
				containerHtml: ""
			});
		});

		it( "Should clear page and build menu and logout options", function() {
			var minimalWorkspace = $( "<span>" )
				.append( $( "<i>", { class: "menuIndicator" } ) )
				.append( $( "<i>", { class: "logout"} ) ).html();

			spyOn( authService, "logout" );
			spyOn( workspaceService.privateFunctions, "displayMenu" );

			workspaceService.privateFunctions.processDisplayWorkspace( minimalWorkspace );

			expectations({
				unrecoverableError: false,
				containerHtml: minimalWorkspace
			});

			expect( workspaceService.privateFunctions.displayMenu.calls.any() ).toBe( false );
			$( ".container .menuIndicator" ).mouseover();
			expect( workspaceService.privateFunctions.displayMenu.calls.any() ).toBe( true );

			expect( authService.logout.calls.any() ).toBe( false );
			$( ".container .logout" ).click();
			expect( authService.logout.calls.any() ).toBe( true );
		} );
	} );

	describe( "DisplayMenu", function() {
		var expectations = function( jsonObject ) {
			expect( loggingService.unrecoverableError.calls.any() ).toBe( false );
			expect( loggingService.recoverableError.calls.any() ).toBe( jsonObject.recoverableError );
			expect( workspaceService.privateFunctions.processDisplayMenu.calls.any() ).toBe( jsonObject.processDisplayMenu );
		};

		beforeEach( function() {
			spyOn( loggingService, "recoverableError" );
			spyOn( workspaceService.privateFunctions, "processDisplayMenu" );
		} );

		it( "Should log recoverable error on failure", function() {
			spyOn( ajaxService, "GET" ).and.callFake( function( args ) {
				args.fnFailure();
			} );

			workspaceService.privateFunctions.displayMenu();

			expectations({
				recoverableError: true,
				processDisplayMenu: false
			});
		} );

		it( "Should process response on success", function() {
			spyOn( ajaxService, "GET" ).and.callFake( function( args ) {
				args.fnSuccess();
			} );

			workspaceService.privateFunctions.displayMenu();

			expectations({
				recoverableError: false,
				processDisplayMenu: true
			});
		} );
	} );

	describe( "ProcessDisplayMenu", function() {
		var expectations = function( jsonObject ) {
			expect( loggingService.unrecoverableError.calls.any() ).toBe( false );
			expect( loggingService.recoverableError.calls.any() ).toBe( jsonObject.recoverableError );
			expect( authService.displayLogin.calls.any() ).toBe( jsonObject.displayLogin );

			if ( jsonObject.displayLogin ) {
				var arguments = loggingService.displayInfo.calls.argsFor( 0 );

				expect( arguments[ 0 ] ).toEqual( "Session Expired" );
			}

			expect( workspaceService.privateFunctions.buildMenu.calls.any() ).toBe( jsonObject.buildMenu );
		};

		beforeEach( function() {
			spyOn( authService, "displayLogin" );
			spyOn( loggingService, "displayInfo" );
			spyOn( loggingService, "recoverableError" );
			spyOn( workspaceService.privateFunctions, "buildMenu" );
			jsonObject = { files: [] };
		} );

		it( "Should throw error if data is missing", function() {
			workspaceService.privateFunctions.processDisplayMenu();

			expectations({
				recoverableError: true,
				displayLogin: false,
				buildMenu: false
			});
		} );

		it( "Should throw error if data is not json parsable", function() {
			workspaceService.privateFunctions.processDisplayMenu( "not json" );

			expectations({
				recoverableError: true,
				displayLogin: false,
				buildMenu: false
			});
		} );

		it( "Should throw error if response code not returned", function() {
			workspaceService.privateFunctions.processDisplayMenu( JSON.stringify( jsonObject ) );

			expectations({
				recoverableError: true,
				displayLogin: false,
				buildMenu: false
			});
		} );

		it( "Should throw error if internal error occured", function() {
			jsonObject.responseCode = "INTERNAL_ERROR";

			workspaceService.privateFunctions.processDisplayMenu( JSON.stringify( jsonObject ) );

			expectations({
				recoverableError: true,
				displayLogin: false,
				buildMenu: false
			});
		} );

		it( "Should throw error if invalid request occured", function() {
			jsonObject.responseCode = "INVALID_REQUEST";

			workspaceService.privateFunctions.processDisplayMenu( JSON.stringify( jsonObject ) );

			expectations({
				recoverableError: true,
				displayLogin: false,
				buildMenu: false
			});
		} );

		it( "Should throw error if unexpected response code returned", function() {
			jsonObject.responseCode = "CHUMBAWUMBA";

			workspaceService.privateFunctions.processDisplayMenu( JSON.stringify( jsonObject ) );

			expectations({
				recoverableError: true,
				displayLogin: false,
				buildMenu: false
			});
		} );

		it( "Should display login if unauthorized", function() {
			jsonObject.responseCode = "UNAUTHORIZED";

			workspaceService.privateFunctions.processDisplayMenu( JSON.stringify( jsonObject ) );

			expectations({
				recoverableError: false,
				displayLogin: true,
				buildMenu: false
			});
		} );

		it( "Should build menu if authorized", function() {
			jsonObject.responseCode = "AUTHORIZED";

			workspaceService.privateFunctions.processDisplayMenu( JSON.stringify( jsonObject ) );

			expectations({
				recoverableError: false,
				displayLogin: false,
				buildMenu: true
			});
		} );
	} );

	describe( "BuildMenu", function() {
		beforeEach( function() {
			$( "body" ).append($( "<div>", { class: "container" } ) );
			spyOn( workspaceService.privateFunctions, "addFolderToMenu" );
		} );

		afterEach( function() {
			$( ".container" ).remove();
		} );

		it( "Should display menu", function() {
			var minimalWorkspace = $( "<span>" )
				.append( $( "<i>", { class: "menuIndicator" } ) )
				.append( $( "<i>", { class: "logout"} ) ).html();

			var response = {
				"responseCode": "AUTHORIZED"
				,"files": {
					"0": "file0.1"
					,"1": "file0.2"
					,"folder1": {
						"0": "file1.1"
						,"1": "file1.2"
					}
					,"folder2": {
						"0": "file2.1"
						,"1": "file2.2"
						,"folder3": {
							"0": "file3.1"
						}
					}
				}
			};

			workspaceService.privateFunctions.processDisplayWorkspace( minimalWorkspace );
			workspaceService.privateFunctions.processDisplayMenu( JSON.stringify( response ) );

			var $node = $( ".container .menu" );

			$node = $node.find( ".search" );
			expect( $node.find( "div > div > .fa-search" ).length > 0 ).toBe( true );
			expect( $node.find( "div > div > .pattern" ).length > 0 ).toBe( true );
			$node = $node.parent().find( ".control" );
			expect( $node.hasClass( "center" ) ).toBe( true );
			expect( $node.children().first().hasClass( "fa-angle-double-up" ) ).toBe( true );
			$node = $node.parent().find( ".content" );
			$node = $node.children().first();
			expect( $node.hasClass( "directoryStructure" ) ).toBe( true );
			$node = $node.children().first();
			$node = $node.children().first();
			expect( $node.hasClass( "fa-folder" ) ).toBe( true );
			expect( $node.next().html() ).toBe( "root" );

			expect( workspaceService.privateFunctions.addFolderToMenu.calls.any() ).toBe( true );
		} );

		it( "Close indicator should remove menu", function() {
			var minimalWorkspace = $( "<span>" )
				.append( $( "<i>", { class: "menuIndicator" } ) )
				.append( $( "<i>", { class: "logout"} ) ).html();

			var response = {
				"responseCode": "AUTHORIZED"
				,"files": {
					"0": "file0.1"
					,"1": "file0.2"
				}
			};

			workspaceService.privateFunctions.processDisplayWorkspace( minimalWorkspace );
			workspaceService.privateFunctions.processDisplayMenu( JSON.stringify( response ) );

			var $node = $( ".container .menu" );

			expect( $node.length ).toBe( 1 );

			$node.find( ".control" ).click();

			expect( $( ".container .menu" ).length ).toBe( 0 );
		} );
	} );

	describe( "AddFolderToMenu", function() {
		beforeEach( function() {
			jsonObject = {};
		} );

		it( "Should add a single file", function() {
			var $list = $( "<ul>" );
			jsonObject[ "0" ] = "file1";

			workspaceService.privateFunctions.addFolderToMenu( jsonObject, $list );

			expect( $list.find( "li:first" ).children().length ).toBe( 2 );
			expect( $list.find( "li:first i.fa-file" ).length ).toBe( 1 );
			expect( $list.find( "li:first span" ).html() ).toBe( "file1" );
		} );

		it( "Should add a single folder", function() {
			var $list = $( "<ul>" );
			jsonObject[ "folder1" ] = {};

			spyOn( workspaceService.privateFunctions, "addFolderToMenu" ).and.callThrough();

			workspaceService.privateFunctions.addFolderToMenu( jsonObject, $list );

			expect( $list.find( "li:first" ).children().length ).toBe( 4 );
			expect( $list.find( "li:first i.fa-folder" ).length ).toBe( 2 );
			expect( $list.find( "li:first i.fa-folder:first" ).hasClass( "subfolder" ) ).toBe( true );
			expect( $list.find( "li:first span" ).html() ).toBe( "folder1" );
			expect( $list.find( "li:first ul" ).length ).toBe( 1 );

			var secondCallArguments = workspaceService.privateFunctions.addFolderToMenu.calls.argsFor( 1 );

			expect( secondCallArguments[0][0] ).toEqual( jsonObject["folder1"][0] );
			expect( secondCallArguments[1][0] ).toEqual( $list.find( "li:first ul" )[0] );
		} );

		it( "Should add files below folders", function() {
			var $list = $( "<ul>" );
			jsonObject[ "folder1" ] = {};
			jsonObject[ "0" ] = "file0";
			jsonObject[ "1" ] = "file1";

			workspaceService.privateFunctions.addFolderToMenu( jsonObject, $list );

			expect( $list.find( "li:first" ).children().length ).toBe( 4 );
			expect( $list.find( "li:first i.fa-folder" ).length ).toBe( 2 );
			expect( $list.find( "li:first span" ).html() ).toBe( "folder1" );
			expect( $list.find( "li:first ul" ).length ).toBe( 1 );

			expect( $list.find( "li:nth(1)" ).children().length ).toBe( 2 );
			expect( $list.find( "li:nth(1) i.fa-file" ).length ).toBe( 1 );
			expect( $list.find( "li:nth(1) span" ).html() ).toBe( "file0" );

			expect( $list.find( "li:nth(2)" ).children().length ).toBe( 2 );
			expect( $list.find( "li:nth(2) i.fa-file" ).length ).toBe( 1 );
			expect( $list.find( "li:nth(2) span" ).html() ).toBe( "file1" );
		} );
	} );

	describe( "FilterMenu", function() {
		beforeEach( function() {
			$( "body" ).append($( "<div>", { class: "container" } ) );

			var minimalWorkspace = $( "<span>" )
				.append( $( "<i>", { class: "menuIndicator" } ) )
				.append( $( "<i>", { class: "logout"} ) ).html();

			var response = {
				"responseCode": "AUTHORIZED"
				,"files": {
					"0": "index.php"
					,"1": "menu.php"
					,"scripts": {
						"0": "index.js"
						,"1": "menu.js"
						,"2": "menu2.js"
						,"vendor": {
							"0": "blah.js"
						}
					}
					,"styles": {
						"0": "index.css"
						,"1": "menu.css"
						,"2": "menu2.css"
					}
				}
			};

			workspaceService.privateFunctions.processDisplayWorkspace( minimalWorkspace );
			workspaceService.privateFunctions.processDisplayMenu( JSON.stringify( response ) );
		} );

		afterEach( function() {
			$( ".container" ).remove();
		} );

		it( "Should hide all but specific file", function() {
			var $input = $( ".container .menu .search input" );
			var $menu = $( ".container .menu .content .directoryStructure" );

			$input.val( "   menu.php   " );
			$input.keyup();

			expect( $menu.find( "> li > ul > li:nth(0)" ).is( ":visible" ) ).toBe( false );
			expect( $menu.find( "> li > ul > li:nth(1)" ).is( ":visible" ) ).toBe( false );
			expect( $menu.find( "> li > ul > li:nth(2)" ).is( ":visible" ) ).toBe( false );
			expect( $menu.find( "> li > ul > li:nth(3)" ).is( ":visible" ) ).toBe( true );
		} );

		it( "Should hide all but file with wildcarded name", function() {
			var $input = $( ".container .menu .search input" );
			var $menu = $( ".container .menu .content .directoryStructure" );

			$input.val( "   %.php   " );
			$input.keyup();

			expect( $menu.find( "> li > ul > li:nth(0)" ).is( ":visible" ) ).toBe( false );
			expect( $menu.find( "> li > ul > li:nth(1)" ).is( ":visible" ) ).toBe( false );
			expect( $menu.find( "> li > ul > li:nth(2)" ).is( ":visible" ) ).toBe( true );
			expect( $menu.find( "> li > ul > li:nth(3)" ).is( ":visible" ) ).toBe( true );
		} );

		it( "Should hide all but file with partially wildcarded name", function() {
			var $input = $( ".container .menu .search input" );
			var $menu = $( ".container .menu .content .directoryStructure" );

			$input.val( "   _enu.php   " );
			$input.keyup();

			expect( $menu.find( "> li > ul > li:nth(0)" ).is( ":visible" ) ).toBe( false );
			expect( $menu.find( "> li > ul > li:nth(1)" ).is( ":visible" ) ).toBe( false );
			expect( $menu.find( "> li > ul > li:nth(2)" ).is( ":visible" ) ).toBe( false );
			expect( $menu.find( "> li > ul > li:nth(3)" ).is( ":visible" ) ).toBe( true );
		} );

		it( "Should hide all but file with wildcarded extension", function() {
			var $input = $( ".container .menu .search input" );
			var $menu = $( ".container .menu .content .directoryStructure" );

			$input.val( "   index.p%   " );
			$input.keyup();

			expect( $menu.find( "> li > ul > li:nth(0)" ).is( ":visible" ) ).toBe( false );
			expect( $menu.find( "> li > ul > li:nth(1)" ).is( ":visible" ) ).toBe( false );
			expect( $menu.find( "> li > ul > li:nth(2)" ).is( ":visible" ) ).toBe( true );
			expect( $menu.find( "> li > ul > li:nth(3)" ).is( ":visible" ) ).toBe( false );
		} );

		it( "Should hide all but file with partially wildcarded extension", function() {
			var $input = $( ".container .menu .search input" );
			var $menu = $( ".container .menu .content .directoryStructure" );

			$input.val( "   index.p%   " );
			$input.keyup();

			expect( $menu.find( "> li > ul > li:nth(0)" ).is( ":visible" ) ).toBe( false );
			expect( $menu.find( "> li > ul > li:nth(1)" ).is( ":visible" ) ).toBe( false );
			expect( $menu.find( "> li > ul > li:nth(2)" ).is( ":visible" ) ).toBe( true );
			expect( $menu.find( "> li > ul > li:nth(3)" ).is( ":visible" ) ).toBe( false );
		} );

		it( "Should not hide wildcarded nested file", function() {
			var $input = $( ".container .menu .search input" );
			var $menu = $( ".container .menu .content .directoryStructure" );

			$input.val( "   _enu%.%   " );
			$input.keyup();

			expect( $menu.find( "> li > ul > li:nth(0)" ).is( ":visible" ) ).toBe( true );
			expect( $menu.find( "> li > ul > li:nth(0) > ul > li:nth(0)" ).is( ":visible" ) ).toBe( false );
			expect( $menu.find( "> li > ul > li:nth(0) > ul > li:nth(1)" ).is( ":visible" ) ).toBe( false );
			expect( $menu.find( "> li > ul > li:nth(0) > ul > li:nth(2)" ).is( ":visible" ) ).toBe( true );
			expect( $menu.find( "> li > ul > li:nth(0) > ul > li:nth(3)" ).is( ":visible" ) ).toBe( true );
			expect( $menu.find( "> li > ul > li:nth(1)" ).is( ":visible" ) ).toBe( true );
			expect( $menu.find( "> li > ul > li:nth(1) > ul > li:nth(0)" ).is( ":visible" ) ).toBe( false );
			expect( $menu.find( "> li > ul > li:nth(1) > ul > li:nth(1)" ).is( ":visible" ) ).toBe( true );
			expect( $menu.find( "> li > ul > li:nth(1) > ul > li:nth(2)" ).is( ":visible" ) ).toBe( true );
			expect( $menu.find( "> li > ul > li:nth(2)" ).is( ":visible" ) ).toBe( false );
			expect( $menu.find( "> li > ul > li:nth(3)" ).is( ":visible" ) ).toBe( true );
		} );

		it( "Should hide all but wildcarded folder and nested files and folders", function() {
			var $input = $( ".container .menu .search input" );
			var $menu = $( ".container .menu .content .directoryStructure" );

			$input.val( "   vendor   " );
			$input.keyup();

			expect( $menu.find( "> li > ul > li:nth(0)" ).is( ":visible" ) ).toBe( true );
			expect( $menu.find( "> li > ul > li:nth(0) > ul > li:nth(0)" ).is( ":visible" ) ).toBe( true );
			expect( $menu.find( "> li > ul > li:nth(0) > ul > li:nth(0) > ul > li" ).is( ":visible" ) ).toBe( true );
			expect( $menu.find( "> li > ul > li:nth(0) > ul > li:nth(1)" ).is( ":visible" ) ).toBe( false );
			expect( $menu.find( "> li > ul > li:nth(0) > ul > li:nth(2)" ).is( ":visible" ) ).toBe( false );
			expect( $menu.find( "> li > ul > li:nth(0) > ul > li:nth(3)" ).is( ":visible" ) ).toBe( false );
			expect( $menu.find( "> li > ul > li:nth(1)" ).is( ":visible" ) ).toBe( false );
			expect( $menu.find( "> li > ul > li:nth(2)" ).is( ":visible" ) ).toBe( false );
			expect( $menu.find( "> li > ul > li:nth(3)" ).is( ":visible" ) ).toBe( false );
		} );

		it( "Should hide nothing if blank", function() {
			var $input = $( ".container .menu .search input" );
			var $menu = $( ".container .menu .content .directoryStructure" );

			$input.val( "blah.dat" );
			$input.keyup();

			expect( $menu.find( "> li > ul > li:nth(0)" ).is( ":visible" ) ).toBe( false );
			expect( $menu.find( "> li > ul > li:nth(1)" ).is( ":visible" ) ).toBe( false );
			expect( $menu.find( "> li > ul > li:nth(2)" ).is( ":visible" ) ).toBe( false );
			expect( $menu.find( "> li > ul > li:nth(3)" ).is( ":visible" ) ).toBe( false );

			$input.val( "" );
			$input.keyup();

			expect( $menu.find( "> li > ul > li:nth(0)" ).is( ":visible" ) ).toBe( true );
			expect( $menu.find( "> li > ul > li:nth(1)" ).is( ":visible" ) ).toBe( true );
			expect( $menu.find( "> li > ul > li:nth(2)" ).is( ":visible" ) ).toBe( true );
			expect( $menu.find( "> li > ul > li:nth(3)" ).is( ":visible" ) ).toBe( true );
		} );

		it( "Should hide everything if invalid RegExp", function() {
			var $input = $( ".container .menu .search input" );
			var $menu = $( ".container .menu .content .directoryStructure" );

			$input.val( "\\" );
			$input.keyup();

			expect( $menu.find( "> li > ul > li:nth(0)" ).is( ":visible" ) ).toBe( false );
			expect( $menu.find( "> li > ul > li:nth(1)" ).is( ":visible" ) ).toBe( false );
			expect( $menu.find( "> li > ul > li:nth(2)" ).is( ":visible" ) ).toBe( false );
			expect( $menu.find( "> li > ul > li:nth(3)" ).is( ":visible" ) ).toBe( false );
		} );
	} );
} );
