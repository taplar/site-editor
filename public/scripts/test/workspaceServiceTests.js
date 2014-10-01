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

		workspaceService = WorkspaceService.getInstance();
	} );

	describe( "DisplayWorkspace", function() {
		var expectations = function( jsonObject ) {
			expect( loggingService.unrecoverableError.calls.any() ).toBe( jsonObject.unrecoverableError );
			expect( workspaceService.processDisplayWorkspace.calls.any() ).toBe( jsonObject.processDisplayWorkspace );

			var arguments = ajaxService.GET.calls.argsFor( 0 )[ 0 ];

			expect( arguments.url ).toEqual( "public/views/workspace.html" );
		};

		beforeEach( function() {
			spyOn( workspaceService, "processDisplayWorkspace" );
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
			workspaceService.processDisplayWorkspace();

			expectations({
				unrecoverableError: true,
				containerHtml: ""
			});
		});

		it( "Should clear page and build menu and logout options", function() {
			var minimalWorkspace = $( "<span>" )
				.append( $( "<i>", { class: "menuIndicator" } ) )
				.append( $( "<i>", { class: "logout"} ) ).html();

			spyOn( authService, "actionLogout" );
			spyOn( workspaceService, "displayMenu" );

			workspaceService.processDisplayWorkspace( minimalWorkspace );

			expectations({
				unrecoverableError: false,
				containerHtml: minimalWorkspace
			});

			expect( workspaceService.displayMenu.calls.any() ).toBe( false );
			$( ".container .menuIndicator" ).mouseover();
			expect( workspaceService.displayMenu.calls.any() ).toBe( true );

			expect( authService.actionLogout.calls.any() ).toBe( false );
			$( ".container .logout" ).click();
			expect( authService.actionLogout.calls.any() ).toBe( true );
		} );
	} );

	describe( "DisplayMenu", function() {
		var expectations = function( jsonObject ) {
			expect( loggingService.unrecoverableError.calls.any() ).toBe( false );
			expect( loggingService.recoverableError.calls.any() ).toBe( jsonObject.recoverableError );
			expect( workspaceService.processDisplayMenu.calls.any() ).toBe( jsonObject.processDisplayMenu );
		};

		beforeEach( function() {
			spyOn( loggingService, "recoverableError" );
			spyOn( workspaceService, "processDisplayMenu" );
		} );

		it( "Should log recoverable error on failure", function() {
			spyOn( ajaxService, "GET" ).and.callFake( function( args ) {
				args.fnFailure();
			} );

			workspaceService.displayMenu();

			expectations({
				recoverableError: true,
				processDisplayMenu: false
			});
		} );

		it( "Should process response on success", function() {
			spyOn( ajaxService, "GET" ).and.callFake( function( args ) {
				args.fnSuccess();
			} );

			workspaceService.displayMenu();

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

			expect( workspaceService.buildMenu.calls.any() ).toBe( jsonObject.buildMenu );
		};

		beforeEach( function() {
			spyOn( authService, "displayLogin" );
			spyOn( loggingService, "displayInfo" );
			spyOn( loggingService, "recoverableError" );
			spyOn( workspaceService, "buildMenu" );
			jsonObject = { files: [] };
		} );

		it( "Should throw error if data is missing", function() {
			workspaceService.processDisplayMenu();

			expectations({
				recoverableError: true,
				displayLogin: false,
				buildMenu: false
			});
		} );

		it( "Should throw error if data is not json parsable", function() {
			workspaceService.processDisplayMenu( "not json" );

			expectations({
				recoverableError: true,
				displayLogin: false,
				buildMenu: false
			});
		} );

		it( "Should throw error if response code not returned", function() {
			workspaceService.processDisplayMenu( JSON.stringify( jsonObject ) );

			expectations({
				recoverableError: true,
				displayLogin: false,
				buildMenu: false
			});
		} );

		it( "Should throw error if internal error occured", function() {
			jsonObject.responseCode = "INTERNAL_ERROR";

			workspaceService.processDisplayMenu( JSON.stringify( jsonObject ) );

			expectations({
				recoverableError: true,
				displayLogin: false,
				buildMenu: false
			});
		} );

		it( "Should throw error if invalid request occured", function() {
			jsonObject.responseCode = "INVALID_REQUEST";

			workspaceService.processDisplayMenu( JSON.stringify( jsonObject ) );

			expectations({
				recoverableError: true,
				displayLogin: false,
				buildMenu: false
			});
		} );

		it( "Should throw error if unexpected response code returned", function() {
			jsonObject.responseCode = "CHUMBAWUMBA";

			workspaceService.processDisplayMenu( JSON.stringify( jsonObject ) );

			expectations({
				recoverableError: true,
				displayLogin: false,
				buildMenu: false
			});
		} );

		it( "Should display login if unauthorized", function() {
			jsonObject.responseCode = "UNAUTHORIZED";

			workspaceService.processDisplayMenu( JSON.stringify( jsonObject ) );

			expectations({
				recoverableError: false,
				displayLogin: true,
				buildMenu: false
			});
		} );

		it( "Should build menu if authorized", function() {
			jsonObject.responseCode = "AUTHORIZED";

			workspaceService.processDisplayMenu( JSON.stringify( jsonObject ) );

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
			spyOn( workspaceService, "addFolderToMenu" );
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

			workspaceService.processDisplayWorkspace( minimalWorkspace );
			workspaceService.processDisplayMenu( JSON.stringify( response ) );

			var $node = $( ".container .menu" );

			expect( $node.length ).toBe( 1 );
			expect( $node.children().length ).toBe( 2 );
			$node = $node.children().last();
			expect( $node.hasClass( "control" ) ).toBe( true );
			expect( $node.hasClass( "center" ) ).toBe( true );
			expect( $node.children().length ).toBe( 1 );
			expect( $node.children().first().hasClass( "fa-angle-double-up" ) ).toBe( true );
			$node = $node.parent().children().first();
			expect( $node.hasClass( "content" ) ).toBe( true );
			$node = $node.children().first();
			expect( $node.length ).toBe( 1 );
			expect( $node.hasClass( "directoryStructure" ) ).toBe( true );
			expect( $node.children().length ).toBe( 1 );
			$node = $node.children().first();
			expect( $node.children().length ).toBe( 3 );
			$node = $node.children().first();
			expect( $node.hasClass( "fa-folder" ) ).toBe( true );
			expect( $node.next().html() ).toBe( "root" );

			expect( workspaceService.addFolderToMenu.calls.any() ).toBe( true );
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

			workspaceService.processDisplayWorkspace( minimalWorkspace );
			workspaceService.processDisplayMenu( JSON.stringify( response ) );

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

			workspaceService.addFolderToMenu( jsonObject, $list );

			expect( $list.find( "li:first" ).children().length ).toBe( 2 );
			expect( $list.find( "li:first i.fa-file" ).length ).toBe( 1 );
			expect( $list.find( "li:first span" ).html() ).toBe( "file1" );
		} );

		it( "Should add a single folder", function() {
			var $list = $( "<ul>" );
			jsonObject[ "folder1" ] = {};

			spyOn( workspaceService, "addFolderToMenu" ).and.callThrough();

			workspaceService.addFolderToMenu( jsonObject, $list );

			expect( $list.find( "li:first" ).children().length ).toBe( 3 );
			expect( $list.find( "li:first i.fa-folder" ).length ).toBe( 1 );
			expect( $list.find( "li:first i.fa-folder" ).hasClass( "subfolder" ) ).toBe( true );
			expect( $list.find( "li:first span" ).html() ).toBe( "folder1" );
			expect( $list.find( "li:first ul" ).length ).toBe( 1 );

			var secondCallArguments = workspaceService.addFolderToMenu.calls.argsFor( 1 );

			expect( secondCallArguments[0][0] ).toEqual( jsonObject["folder1"][0] );
			expect( secondCallArguments[1][0] ).toEqual( $list.find( "li:first ul" )[0] );
		} );

		it( "Should add files below folders", function() {
			var $list = $( "<ul>" );
			jsonObject[ "folder1" ] = {};
			jsonObject[ "0" ] = "file0";
			jsonObject[ "1" ] = "file1";

			workspaceService.addFolderToMenu( jsonObject, $list );

			expect( $list.find( "li:first" ).children().length ).toBe( 3 );
			expect( $list.find( "li:first i.fa-folder" ).length ).toBe( 1 );
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
} );



/*

### Retrieve list of files and directories

Purpose: Retrieve file tree for menu.

##### Request
```
Method: GET
URL: ~/?menu/list
```
##### Response
```
{
	files: <array(key => <string|object>)>
	,responseCode: "AUTHORIZED"|"INTERNAL_ERROR"|"INVALID_REQUEST"|"UNAUTHORIZED"
}
```
* files - Array of objects
	* Numeric keys - Object is a string representing a filename
	* Non-numeric keys - Key is a string representing a directory and the Object is an array representing the directory contents in the same [key, object] relationship
* responseCode
	* AUTHORIZED - Expected when user is recognised; request successful
	* INTERNAL_ERROR - Expected when unexpected exception occurs
	* INVALID_REQUEST - Expected when exception occurs regarding processing of request
	* UNAUTHORIZED - Expected when user is not recognised


*/