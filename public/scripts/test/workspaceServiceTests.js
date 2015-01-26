describe ( 'WorkspaceService', function () {
	beforeEach ( function () {
		ajaxService = AjaxService.getInstance();
		keyService = KeyService.getInstance();
		loggingService = LoggingService.getInstance();
		sessionService = SessionService.getInstance();

		spyOn( AjaxService, 'getInstance' ).and.returnValue( ajaxService );
		spyOn( KeyService, 'getInstance' ).and.returnValue( keyService );
		spyOn( LoggingService, 'getInstance' ).and.returnValue( loggingService );

		workspaceService = WorkspaceService.getTestInstance();

		$( '<div>', { class: 'container'} ).appendTo( $( 'body' ) );
	} );

	afterEach ( function () {
		$( '.container' ).remove();
	} );

	describe ( 'API', function () {
		describe ( 'DisplayWorkspace', function () {
			it ( 'Should call GET to retrieve workspace view', function () {
				spyOn( ajaxService, 'GET' );

				workspaceService.displayWorkspace();

				expect( ajaxService.GET ).toHaveBeenCalled();

				var args = ajaxService.GET.calls.argsFor( 0 );

				expect( args[ 0 ].url ).toEqual( './public/views/workspace.view' );
				expect( args[ 0 ].success ).toEqual( workspaceService.privateFunctions.buildWorkspace );
				expect( args[ 0 ][ 404 ] ).toEqual( loggingService.logNotFound );
				expect( args[ 0 ][ 500 ] ).toEqual( loggingService.logInternalError );
			} );
		} );
	} );

	describe ( 'PrivateFunctions', function () {
		describe ( 'BuildDeleteDirectory', function () {
			it ( 'Should build delete directory prompt and bind actions', function () {
				var data = [
					'<div class="prompt-container">'
						, '<div class="existing-directory"></div>'
						, '<button class="prompt-yes" />'
						, '<button class="prompt-no" />'
					, '</div>'
				];
				var fileTreeArray = [ 'dir1', 'dir2', 'dir3' ];

				spyOn( workspaceService.privateFunctions, 'closePromptContainer' );
				spyOn( workspaceService.privateFunctions, 'deleteDirectory' );

				workspaceService.privateFunctions.buildDeleteDirectory( data.join( '' ), fileTreeArray );

				expect( $( '.container .prompt-container' ).length ).toEqual( 1 );
				expect( $( '.existing-directory' ).html() ).toEqual( fileTreeArray.join( '/') );
				expect( $( '.prompt-container' ).prop( 'fileTree' ) ).toEqual( fileTreeArray );
				expect( workspaceService.privateFunctions.closePromptContainer.calls.count() ).toEqual( 1 );

				expect( workspaceService.privateFunctions.deleteDirectory ).not.toHaveBeenCalled();
				$( '.prompt-container .prompt-yes' ).trigger( 'click' );
				expect( workspaceService.privateFunctions.deleteDirectory ).toHaveBeenCalled();

				$( '.prompt-container .prompt-no' ).trigger( 'click' );
				expect( workspaceService.privateFunctions.closePromptContainer.calls.count() ).toEqual( 2 );
			} );
		} );

		describe ( 'BuildFilesystem', function () {
			it ( 'Should remove existing ul and insert new one', function () {
				spyOn( workspaceService.privateFunctions, 'displayFilesInDirectory' );

				$( '<div>', { class: 'root' } ).appendTo( $( '.container' ) );
				$( '<ul>', { class: 'existingUL' } ).appendTo( $( '.root' ) );

				var data = { key1: 'value1', key2: 'value2' };

				workspaceService.privateFunctions.buildFilesystem( JSON.stringify( data ) );

				expect( $( '.root ul' ).hasClass( 'existingURL' ) ).toBe( false );
				expect( workspaceService.privateFunctions.displayFilesInDirectory ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.displayFilesInDirectory.calls.argsFor( 0 );

				expect( args[ 0 ][ 0 ] ).toEqual( $( '.root ul' )[ 0 ] );
				expect( args[ 1 ] ).toEqual( data );
			} );
		} );

		describe ( 'BuildFileTreeArray', function () {
			it ( 'Should build file tree for child element', function () {
				var data = [
					'<ul>'
						,'<li>'
							,'<span class="file-name">directory1</span>'
							,'<ul>'
								,'<li>'
									,'<span class="file-name">directory1.1</span>'
									,'<ul>'
										,'<li><span class="file-name">file1.1.1</span></li>'
										,'<li><span class="file-name testFile">file1.1.2</span></li>'
									,'</ul>'
								,'</li>'
								,'<li><span class="file-name">file1.1</span></li>'
							,'</ul>'
						,'</li><li>'
							,'<span class="file-name">directory2</span>'
							,'<ul>'
								,'<li>'
									,'<span class="file-name">directory2.1</span>'
									,'<ul>'
										,'<li><span class="file-name">file2.1.1</span></li>'
										,'<li><span class="file-name">file2.1.2</span></li>'
									,'</ul>'
								,'</li>'
								,'<li><span class="file-name">file2.1</span></li>'
							,'</ul>'
						,'</li>'
						,'<li><span class="file-name">file2</span></li>'
					,'</ul>'
				];

				var $completeDirectory = $( data.join( '' ) );
				var $targetDirectory = $completeDirectory.find( '.testFile' );

				expect( workspaceService.privateFunctions.buildFileTreeArray( $targetDirectory ) ).toEqual( [ 'directory1', 'directory1.1', 'file1.1.2' ] );
			} );
		} );

		describe ( 'BuildMenu', function () {
			it ( 'Should replace existing menu with new data and remove when control is activated', function () {
				$( '<div>', { class: 'menu old' } ).appendTo( $( '.container' ) );

				spyOn( workspaceService.privateFunctions, 'displayFilesystem' );
				spyOn( workspaceService.privateFunctions, 'toggleSearchTips' );
				spyOn( workspaceService.privateFunctions, 'filterMenu' );

				var data = '<div class="menu new"><div class="search"><input class="pattern" type="text"></div><i class="control" /></div>'

				workspaceService.privateFunctions.buildMenu( data );

				expect( $( '.menu' ).hasClass( 'old' ) ).toBe( false );
				expect( $( '.menu' ).hasClass( 'new' ) ).toBe( true );
				expect( workspaceService.privateFunctions.displayFilesystem ).toHaveBeenCalled();
				expect( workspaceService.privateFunctions.toggleSearchTips ).toHaveBeenCalled();

				expect( workspaceService.privateFunctions.filterMenu ).not.toHaveBeenCalled();
				$( '.search .pattern' ).trigger( 'keyup' );
				expect( workspaceService.privateFunctions.filterMenu ).toHaveBeenCalled();

				$( '.control' ).click();
				expect( $( '.menu' ).length ).toEqual( 0 );
			} );
		} );

		describe ( 'BuildNewDirectory', function () {
			it ( 'Should build prompt and bind close and submit actions', function () {
				var data = [
					'<div class="prompt-container">'
						,'<div class="existing-directory"></div>'
						,'<div><i class="close" /></div>'
						,'<div><input type="text" id="newdirectory" /></div>'
					,'</div>'
				];
				var fileTreeArray = [ 'dir1', 'dir2', 'file1' ];

				spyOn( workspaceService.privateFunctions, 'submitNewDirectoryOnEnter' );

				workspaceService.privateFunctions.buildNewDirectory( data.join( '' ), fileTreeArray );

				var $container = $( '.container' );

				expect( $( '.container > .prompt-container' ).length ).toEqual( 1 );
				expect( $( '.existing-directory' ).html() ).toEqual( fileTreeArray.join( '/' ) +'/' );

				expect( workspaceService.privateFunctions.submitNewDirectoryOnEnter ).not.toHaveBeenCalled();
				$( '#newdirectory' ).trigger( 'keyup' );
				expect( workspaceService.privateFunctions.submitNewDirectoryOnEnter ).toHaveBeenCalled();

				$( '.close' ).click();
				expect( $( '.container > .prompt-container' ).length ).toEqual( 0 );
			} );
		} );

		describe ( 'BuildWorkspace', function () {
			it ( 'Should replace container html and bind events', function () {
				spyOn( sessionService, 'logout' );
				spyOn( workspaceService.privateFunctions, 'displayMenu' );

				$( '.container' ).html( 'existing data to be replaced' );
				workspaceService.privateFunctions.buildWorkspace( '<i class="menuIndicator" /><i class="logout" />' );
				expect( $( '.container' ).html() ).not.toEqual( 'existing data to be replaced' );

				expect( workspaceService.privateFunctions.displayMenu ).not.toHaveBeenCalled();
				$( '.menuIndicator' ).mouseover();
				expect( workspaceService.privateFunctions.displayMenu ).toHaveBeenCalled();

				expect( sessionService.logout ).not.toHaveBeenCalled();
				$( '.logout' ).click();
				expect( sessionService.logout ).toHaveBeenCalled();
			} );
		} );

		describe ( 'ClosePromptContainer', function () {
			it ( 'Should remove the prompt container', function () {
				$( '<div class="prompt-container">' ).appendTo( $( '.container' ) );
				expect( $( '.container .prompt-container' ).length ).toEqual( 1 );
				workspaceService.privateFunctions.closePromptContainer();
				expect( $( '.container .prompt-container' ).length ).toEqual( 0 );
			} );
		} );

		describe ( 'DisplayDeleteDirectory', function () {
			it ( 'Should call GET to retrieve delete directory view', function () {
				spyOn( ajaxService, 'GET' );
				spyOn( workspaceService.privateFunctions, 'buildFileTreeArray' ).and.returnValue( [ 'root', 'site-editor' ] );
				spyOn( workspaceService.privateFunctions, 'buildDeleteDirectory' );

				workspaceService.privateFunctions.displayDeleteDirectory();

				expect( ajaxService.GET ).toHaveBeenCalled();

				var args = ajaxService.GET.calls.argsFor( 0 );

				expect( args[ 0 ].url ).toEqual( './public/views/deleteDirectory.view' );
				expect( args[ 0 ][ 404 ] ).toEqual( loggingService.logNotFound );
				expect( args[ 0 ][ 500 ] ).toEqual( loggingService.logInternalError );

				args[ 0 ].success( 'myData' );

				var args = workspaceService.privateFunctions.buildDeleteDirectory.calls.argsFor( 0 );

				expect( args[ 0 ] ).toEqual( 'myData' );
				expect( args[ 1 ] ).toEqual( [ 'root', 'site-editor' ] );
			} );
		} );

		describe ( 'DisplayFileInDirectory', function () {
			it ( 'Should add directory to directory listing', function () {
				var $ul = $( '<ul>' );

				workspaceService.privateFunctions.displayFileInDirectory( 'fileForSale', $ul );

				expect( $ul.html() ).toEqual(
					'<li>'
						+ '<i class="fa fa-file"></i>'
						+ '<span class="file-name">fileForSale</span>'
					+ '</li>'
				);
			} );
		} );

		describe ( 'DisplayFilesInDirectory', function () {
			it ( 'Should process directories and files', function () {
				spyOn( workspaceService.privateFunctions, 'displaySubdirectory' );
				spyOn( workspaceService.privateFunctions, 'displayFileInDirectory' );

				var data = {
					'0': 'file1.html'
					, 'directory1': { '0': 'file1.1.html' }
					, '1': 'file2.html'
					, 'directory2': { '0': 'file2.1.html' }
				}
			} );
		} );

		describe ( 'DisplayFilesystem', function () {
			it ( 'Should call GET to retreive directory structure', function () {
				spyOn( ajaxService, 'GET' );

				workspaceService.privateFunctions.displayFilesystem();

				expect( ajaxService.GET ).toHaveBeenCalled();

				var args = ajaxService.GET.calls.argsFor( 0 );

				expect( args[ 0 ].url ).toEqual( './private/?files' );
				expect( args[ 0 ].success ).toEqual( workspaceService.privateFunctions.buildFilesystem );
				expect( args[ 0 ][ 401 ] ).toEqual( sessionService.displayLogin );
				expect( args[ 0 ][ 500 ] ).toEqual( loggingService.logInternalError );
			} );
		} );

		describe ( 'DisplaySubdirectory', function () {
			it ( 'Should add directory to directory listing', function () {
				spyOn( workspaceService.privateFunctions, 'displayFilesInDirectory' );
				spyOn( workspaceService.privateFunctions, 'displayNewDirectory' );
				spyOn( workspaceService.privateFunctions, 'displayDeleteDirectory' );

				var $ul = $( '<ul>' );
				var $subfiles = { 'file': 'blah' };

				workspaceService.privateFunctions.displaySubdirectory( 'directoryForPurchase', $ul, $subfiles );

				expect( $ul.html() ).toEqual(
					'<li>'
						+ '<i class="fa fa-folder subdirectory"></i>'
						+ '<span class="file-name">directoryForPurchase</span>'
						+ '<span class="new-directory">'
							+ '<i class="fa fa-folder actionable"></i>'
							+ '<i class="fa fa-plus actionable"></i>'
						+ '</span>'
						+ '<i class="fa fa-times delete delete-directory actionable"></i>'
						+ '<ul></ul>'
					+ '</li>'
				);

				expect( workspaceService.privateFunctions.displayFilesInDirectory ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.displayFilesInDirectory.calls.argsFor( 0 );

				expect( args[ 0 ][ 0 ] ).toEqual( $ul.find( 'li ul' )[ 0 ] );
				expect( args[ 1 ] ).toEqual( $subfiles );

				expect( workspaceService.privateFunctions.displayNewDirectory ).not.toHaveBeenCalled();
				$ul.find( '.new-directory' ).trigger( 'click' );
				expect( workspaceService.privateFunctions.displayNewDirectory ).toHaveBeenCalled();

				expect( workspaceService.privateFunctions.displayDeleteDirectory ).not.toHaveBeenCalled();
				$ul.find( '.delete-directory' ).trigger( 'click' );
				expect( workspaceService.privateFunctions.displayDeleteDirectory ).toHaveBeenCalled();
			} );
		} );

		describe ( 'DisplayMenu', function () {
			it ( 'Should call GET to retrieve menu view', function () {
				spyOn( ajaxService, 'GET' );

				workspaceService.privateFunctions.displayMenu();

				expect( ajaxService.GET ).toHaveBeenCalled();

				var args = ajaxService.GET.calls.argsFor( 0 );

				expect( args[ 0 ].url ).toEqual( './public/views/menu.view' );
				expect( args[ 0 ].success ).toEqual( workspaceService.privateFunctions.buildMenu );
				expect( args[ 0 ][ 404 ] ).toEqual( loggingService.logNotFound );
				expect( args[ 0 ][ 500 ] ).toEqual( loggingService.logInternalError );
			} );
		} );

		describe ( 'DisplayNewDirectory', function () {
			it ( 'Should call GET to retrieve new directory view', function () {
				spyOn( ajaxService, 'GET' );
				spyOn( workspaceService.privateFunctions, 'buildFileTreeArray' ).and.returnValue( [ 'root' ] );
				spyOn( workspaceService.privateFunctions, 'buildNewDirectory' );

				workspaceService.privateFunctions.displayNewDirectory();

				expect( ajaxService.GET ).toHaveBeenCalled();

				var args = ajaxService.GET.calls.argsFor( 0 );

				expect( args[ 0 ].url ).toEqual( './public/views/newDirectory.view' );
				expect( args[ 0 ][ 404 ] ).toEqual( loggingService.logNotFound );
				expect( args[ 0 ][ 500 ] ).toEqual( loggingService.logInternalError );

				args[ 0 ].success( 'myData' );

				var args = workspaceService.privateFunctions.buildNewDirectory.calls.argsFor( 0 );

				expect( args[ 0 ] ).toEqual( 'myData' );
				expect( args[ 1 ] ).toEqual( [ 'root' ] );
			} );
		} );

		describe ( 'FilterMenu', function () {
			var menuData = [
				'<div class="menu">'
					,'<div class="search">'
						,'<div class="search-container">'
							,'<i class="fa-search" />'
						,'</div>'
						,'<div class="pattern-container" />'
						,'<input type="text" class="pattern" />'
					,'</div>'
					,'<div class="content">'
						,'<ul class="directory-structure">'
							,'<li class="root">'
								,'<i class="fa-folder" />'
								,'<span class="file-name">root</span>'
								,'<span class="new-directory">'
									,'<i class="fa-folder" />'
									,'<i class="fa-plus" />'
								,'</span>'
								,'<ul></ul>'
							,'</li>'
						,'</ul>'
					,'</div>'
					,'<div class="control"><i class="fa-angle-double-up" /></div>'
				,'</div>'
			];

			var fileData = {
				"site-editor":{
					"0":"LICENSE",
					"1":"README.md",
					"2":"index.html",
					"private":{
						"0":"README.md",
						"1":"config.php",
						"controllers":[
							"filesController.php",
							"sessionsController.php"
						],
						"2":"http.php",
						"3":"index.php",
						"4":"router.php",
						"services":[
							"filesService.php",
							"sessionService.php"
						]
					},
					"public":{
						"scripts":{
							"src":[
								"ajaxService.js",
								"index.js",
								"keyService.js",
								"loggingService.js",
								"require.js",
								"sessionService.js",
								"workspaceService.js"
							],
							"test":[
								"ajaxServiceTests.js",
								"keyServiceTests.js",
								"sessionServiceTests.js",
								"workspaceServiceTests.js"
							],
							"vendor":{
								"jasmine":[
									"boot.js",
									"console.js",
									"jasmine-html.js",
									"jasmine.js"
								]
							}
						},
						"styles":{
							"0":"flexbox.css",
							"1":"index.css",
							"vendor":{
								"font-awesome":{
									"4.2.0":{
										"css":[ "font-awesome.min.css" ],
										"fonts":[
											"FontAwesome.otf",
											"fontawesome-webfont.eot",
											"fontawesome-webfont.svg",
											"fontawesome-webfont.ttf",
											"fontawesome-webfont.woff"
										]
									}
								},
								"jasmine":[ "jasmine.css" ]
							}
						},
						"views":[
							"login.view",
							"menu.view",
							"prompt.view",
							"workspace.view"
						]
					},
					"3":"tests.html"
				}
			};

			beforeEach ( function () {
				spyOn( workspaceService.privateFunctions, 'toggleSearchTips' );
				spyOn( workspaceService.privateFunctions, 'displayFilesystem' );
				workspaceService.privateFunctions.buildMenu( menuData.join( '' ) );
				workspaceService.privateFunctions.buildFilesystem( JSON.stringify( fileData ) );

				$liElements = $( '.directory-structure .file-name' ).parent().filter( ':not(.root)' )
			} );

			afterEach ( function () {
				$( '.container .menu' ).remove();
			} );

			it ( 'Should default all files to visible', function () {
				expect( $liElements.filter( ':hidden' ).length ).toEqual( 0 );
			} );

			it ( 'Should hide all files if no match', function () {
				$( '.container .pattern' ).val( 'xyz' );
				$( '.container .pattern' ).trigger( 'keyup' );

				expect( $liElements.filter( ':visible' ).length ).toEqual( 0 );
			} );

			it ( 'Should filter specific file', function () {
				$( '.container .pattern' ).val( 'index.css' );
				$( '.container .pattern' ).trigger( 'keyup' );

				$liElements.find( '.file-name' ).each( function () {
					var $this = $( this );

					if ( $this.html() == 'index.css' ) {
						expect( $this.parent().is( ':visible' ) ).toBe( true );
					}
				});
			} );

			it ( 'Should filter with leading wildcard', function () {
				$( '.container .pattern' ).val( '%.css' );
				$( '.container .pattern' ).trigger( 'keyup' );

				var matcher = new RegExp( '[\\S]*.css' );

				$liElements.find( '.file-name' ).each( function () {
					var $this = $( this );

					if ( matcher.test( $this.html() ) ) {
						expect( $this.parent().is( ':visible' ) ).toBe( true );
					}
				});
			} );

			it ( 'Should filter with following wildcard', function () {
				$( '.container .pattern' ).val( 'index%' );
				$( '.container .pattern' ).trigger( 'keyup' );

				var matcher = new RegExp( 'index[\\S]*' );

				$liElements.find( '.file-name' ).each( function () {
					var $this = $( this );

					if ( matcher.test( $this.html() ) ) {
						expect( $this.parent().is( ':visible' ) ).toBe( true );
					}
				});
			} );

			it ( 'Should filter with leading and following wildcard', function () {
				$( '.container .pattern' ).val( '%dex%' );
				$( '.container .pattern' ).trigger( 'keyup' );

				var matcher = new RegExp( '[\\S]*dex[\\S]*' );

				$liElements.find( '.file-name' ).each( function () {
					var $this = $( this );

					if ( matcher.test( $this.html() ) ) {
						expect( $this.parent().is( ':visible' ) ).toBe( true );
					}
				});
			} );

			it ( 'Should filter with leading, middle, and following wildcard', function () {
				$( '.container .pattern' ).val( '%Con%.p%' );
				$( '.container .pattern' ).trigger( 'keyup' );

				var matcher = new RegExp( '[\\S]*Con[\\S]*.p[\\S]*' );

				$liElements.find( '.file-name' ).each( function () {
					var $this = $( this );

					if ( matcher.test( $this.html() ) ) {
						expect( $this.parent().is( ':visible' ) ).toBe( true );
					}
				});
			} );

			it ( 'Should filter with single leading wildcard', function () {
				$( '.container .pattern' ).val( '_ndex.css' );
				$( '.container .pattern' ).trigger( 'keyup' );

				var matcher = new RegExp( '[\\S]ndex.css' );

				$liElements.find( '.file-name' ).each( function () {
					var $this = $( this );

					if ( matcher.test( $this.html() ) ) {
						expect( $this.parent().is( ':visible' ) ).toBe( true );
					}
				});
			} );

			it ( 'Should filter with single following wildcard', function () {
				$( '.container .pattern' ).val( 'index.htm_' );
				$( '.container .pattern' ).trigger( 'keyup' );

				var matcher = new RegExp( 'index.htm[\\S]' );

				$liElements.find( '.file-name' ).each( function () {
					var $this = $( this );

					if ( matcher.test( $this.html() ) ) {
						expect( $this.parent().is( ':visible' ) ).toBe( true );
					}
				});
			} );

			it ( 'Should filter with leading and following wildcard', function () {
				$( '.container .pattern' ).val( '_ndex.htm_' );
				$( '.container .pattern' ).trigger( 'keyup' );

				var matcher = new RegExp( '[\\S]ndex.htm[\\S]' );

				$liElements.find( '.file-name' ).each( function () {
					var $this = $( this );

					if ( matcher.test( $this.html() ) ) {
						expect( $this.parent().is( ':visible' ) ).toBe( true );
					}
				});
			} );

			it ( 'Should filter with leading, middle, and following wildcard', function () {
				$( '.container .pattern' ).val( '_nde_.htm_' );
				$( '.container .pattern' ).trigger( 'keyup' );

				var matcher = new RegExp( '[\\S]nde[\\S].htm[\\S]' );

				$liElements.find( '.file-name' ).each( function () {
					var $this = $( this );

					if ( matcher.test( $this.html() ) ) {
						expect( $this.parent().is( ':visible' ) ).toBe( true );
					}
				});
			} );
		} );

		describe ( 'InvalidReference', function () {
			it ( 'Should display error message, close prompt, and reload menu', function () {
				spyOn( loggingService, 'displayError' );
				spyOn( workspaceService.privateFunctions, 'displayFilesystem' );

				$( '<div class="prompt-container" />' ).appendTo( $( '.container' ) );

				workspaceService.privateFunctions.invalidReference();

				expect( $( '.prompt-container' ).length ).toEqual( 0 );
				expect( workspaceService.privateFunctions.displayFilesystem );
				expect( loggingService.displayError ).toHaveBeenCalled();

				var args = loggingService.displayError.calls.argsFor( 0 );

				expect( args[ 0 ] ).toEqual( 'Parent directory no longer exists' );
			} );
		} );

		describe ( 'NewDirectoryFailure', function () {
			it ( 'Should display error message', function () {
				spyOn( loggingService, 'displayError' );

				$( '<div class="prompt-container" />' ).appendTo( $( '.container' ) );

				workspaceService.privateFunctions.newDirectoryFailure();

				expect( $( '.prompt-container' ).length ).toEqual( 1 );
				expect( loggingService.displayError ).toHaveBeenCalled();

				var args = loggingService.displayError.calls.argsFor( 0 );

				expect( args[ 0 ] ).toEqual( 'New directory already exists or is invalid syntax' );
			} );
		} );

		describe ( 'NewDirectorySuccess', function () {
			it ( 'Should display success message, close prompt, and reload menu', function () {
				spyOn( loggingService, 'displaySuccess' );
				spyOn( workspaceService.privateFunctions, 'displayFilesystem' );

				$( '<div class="prompt-container" />' ).appendTo( $( '.container' ) );

				workspaceService.privateFunctions.newDirectorySuccess();

				expect( $( '.prompt-container' ).length ).toEqual( 0 );
				expect( workspaceService.privateFunctions.displayFilesystem );
				expect( loggingService.displaySuccess ).toHaveBeenCalled();

				var args = loggingService.displaySuccess.calls.argsFor( 0 );

				expect( args[ 0 ] ).toEqual( 'Directory created' );
			} );
		} );

		describe ( 'SubmitNewDirectoryOnEnter', function () {
			it ( 'Should POST new directory request on enter', function () {
				var $prompt = $( '<div class="prompt-container"><input type="text" id="newdirectory" /></div>' );
				var fileTree = [ 'dir1', 'dir2' ];
				var newDirectoryName = 'dir777';

				$prompt.prop( 'fileTree', fileTree );
				$prompt.find( '#newdirectory' ).val( newDirectoryName );
				$prompt.find( '#newdirectory' ).keyup( workspaceService.privateFunctions.submitNewDirectoryOnEnter );
				$prompt.appendTo( $( '.container' ) );

				spyOn( ajaxService, 'POST' );
				spyOn( keyService, 'enter' ).and.returnValue( true );

				$prompt.find( '#newdirectory' ).trigger( 'keyup' );

				expect( ajaxService.POST ).toHaveBeenCalled();

				var args = ajaxService.POST.calls.argsFor( 0 );

				expect( args[ 0 ].url ).toEqual( './private/?files/directories/dir1/dir2/dir777' );
				expect( args[ 0 ].input ).toEqual( { } );
				expect( args[ 0 ].success ).toEqual( workspaceService.privateFunctions.newDirectorySuccess );
				expect( args[ 0 ][ 401 ] ).toEqual( workspaceService.privateFunctions.displayLogin );
				expect( args[ 0 ][ 498 ] ).toEqual( workspaceService.privateFunctions.newDirectoryFailure );
				expect( args[ 0 ][ 499 ] ).toEqual( workspaceService.privateFunctions.invalidReference );
				expect( args[ 0 ][ 500 ] ).toEqual( ajaxService.logInternalError );
			} );

			it ( 'Should not POST new directory request on non-enter', function () {
				var $prompt = $( '<div class="prompt-container"><input type="text" id="newdirectory" /></div>' );
				var fileTree = [ 'dir1', 'dir2' ];
				var newDirectoryName = 'dir777';

				$prompt.prop( 'fileTree', fileTree );
				$prompt.find( '#newdirectory' ).val( newDirectoryName );
				$prompt.find( '#newdirectory' ).keyup( workspaceService.privateFunctions.submitNewDirectoryOnEnter );
				$prompt.appendTo( $( '.container' ) );

				spyOn( ajaxService, 'POST' );
				spyOn( keyService, 'enter' ).and.returnValue( false );

				$prompt.find( '#newdirectory' ).trigger( 'keyup' );

				expect( ajaxService.POST ).not.toHaveBeenCalled();
			} );
		} );
	} );
} );
