describe ( 'WorkspaceService', function () {
	beforeEach ( function () {
		$body = $( 'body' );
		$container = $( '<div>', { class: 'container'} );
		$container.appendTo( $body );

		ajaxService = AjaxService.getInstance();
		keyService = KeyService.getInstance();
		loggingService = LoggingService.getInstance();
		sessionService = SessionService.getInstance();

		spyOn( AjaxService, 'getInstance' ).and.returnValue( ajaxService );
		spyOn( KeyService, 'getInstance' ).and.returnValue( keyService );
		spyOn( LoggingService, 'getInstance' ).and.returnValue( loggingService );

		workspaceService = WorkspaceService.getTestInstance();
	} );

	afterEach ( function () {
		$container.remove();
	} );

	describe ( 'API', function () {
		describe ( 'DisplayWorkspace', function () {
			it ( 'Should retrieve workspace view', function () {
				spyOn( workspaceService.privateFunctions, 'displayStaticResource' );

				workspaceService.displayWorkspace();

				expect( workspaceService.privateFunctions.displayStaticResource ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.displayStaticResource.calls.argsFor( 0 );

				expect( args[ 0 ] ).toEqual( './public/views/workspace.view' );
				expect( args[ 1 ] ).toEqual( workspaceService.privateFunctions.buildWorkspace );
			} );
		} );
	} );

	describe ( 'PrivateFunctions', function () {
		describe ( 'BuildDelete', function () {
			it ( 'Should build delete prompt and bind actions', function () {
				var data = [
					'<div class="prompt-container">'
						, '<div class="content">'
							, '<div class="file-path"></div>'
							, '<button class="prompt-yes"></button>'
							, '<button class="prompt-no"></button>'
						, '</div>'
					, '</div>'
				];
				var fileTreeArray = [ 'dir1', 'dir2', 'dir3' ];
				workspaceService.privateFunctions.someRandomConfirmationCallback = function() {};

				spyOn( workspaceService.privateFunctions, 'closePromptContainer' );
				spyOn( workspaceService.privateFunctions, 'someRandomConfirmationCallback' );

				workspaceService.privateFunctions.buildDelete( data.join( '' ), fileTreeArray, workspaceService.privateFunctions.someRandomConfirmationCallback );

				expect( $container.find( '.prompt-container' ).length ).toEqual( 1 );
				expect( $container.find( '.file-path' ).html() ).toEqual( fileTreeArray.join( '/') );
				expect( $container.find( '.prompt-container' ).prop( 'fileTree' ) ).toEqual( fileTreeArray );
				expect( workspaceService.privateFunctions.closePromptContainer.calls.count() ).toEqual( 1 );

				expect( workspaceService.privateFunctions.someRandomConfirmationCallback ).not.toHaveBeenCalled();
				$container.find( '.prompt-container .prompt-yes' ).trigger( 'click' );
				expect( workspaceService.privateFunctions.someRandomConfirmationCallback ).toHaveBeenCalled();

				$container.find( '.prompt-container .prompt-no' ).trigger( 'click' );
				expect( workspaceService.privateFunctions.closePromptContainer.calls.count() ).toEqual( 2 );
			} );
		} );

		describe ( 'BuildDeleteDirectory', function () {
			it ( 'Should use build delete', function () {
				var data = { somekey: 'somevalue' };
				var fileTreeArray = [ 'dir1', 'dir2', 'dir3' ];

				spyOn( workspaceService.privateFunctions, 'buildDelete' );

				workspaceService.privateFunctions.buildDeleteDirectory( data, fileTreeArray );

				expect( workspaceService.privateFunctions.buildDelete ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.buildDelete.calls.argsFor( 0 );

				expect( args[ 0 ] ).toEqual( data );
				expect( args[ 1 ] ).toEqual( fileTreeArray );
				expect( args[ 2 ] ).toEqual( workspaceService.privateFunctions.deleteDirectory );
			} );
		} );

		describe ( 'BuildDeleteFile', function () {
			it ( 'Should use build delete', function () {
				var data = { somekey: 'somevalue' };
				var fileTreeArray = [ 'dir1', 'dir2', 'dir3' ];

				spyOn( workspaceService.privateFunctions, 'buildDelete' );

				workspaceService.privateFunctions.buildDeleteFile( data, fileTreeArray );

				expect( workspaceService.privateFunctions.buildDelete ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.buildDelete.calls.argsFor( 0 );

				expect( args[ 0 ] ).toEqual( data );
				expect( args[ 1 ] ).toEqual( fileTreeArray );
				expect( args[ 2 ] ).toEqual( workspaceService.privateFunctions.deleteFile );
			} );
		} );

		describe ( 'BuildFilesystem', function () {
			it ( 'Should remove existing ul and insert new one', function () {
				spyOn( workspaceService.privateFunctions, 'displayFilesInDirectory' );

				$( '<div>', { class: 'root' } ).appendTo( $container );
				$( '<ul>', { class: 'existingUL' } ).appendTo( $container.find( '.root' ) );

				var data = { key1: 'value1', key2: 'value2' };

				workspaceService.privateFunctions.buildFilesystem( JSON.stringify( data ) );

				expect( $container.find( '.root ul' ).hasClass( 'existingURL' ) ).toBe( false );
				expect( workspaceService.privateFunctions.displayFilesInDirectory ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.displayFilesInDirectory.calls.argsFor( 0 );

				expect( args[ 0 ][ 0 ] ).toEqual( $container.find( '.root ul' )[ 0 ] );
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
				$( '<div>', { class: 'menu old' } ).appendTo( $container );

				spyOn( workspaceService.privateFunctions, 'displayFilesystem' );
				spyOn( workspaceService.privateFunctions, 'toggleSearchTips' );
				spyOn( workspaceService.privateFunctions, 'filterMenu' );

				var data = [
					'<div class="menu new">'
						, '<div class="search-container"><input class="pattern" type="text"></input></div>'
						, '<div class="control-container"><i class="control"></i></div>'
					, '</div>'
				];

				workspaceService.privateFunctions.buildMenu( data.join( '' ) );

				expect( $container.find( '.menu' ).hasClass( 'old' ) ).toBe( false );
				expect( $container.find( '.menu' ).hasClass( 'new' ) ).toBe( true );
				expect( workspaceService.privateFunctions.displayFilesystem ).toHaveBeenCalled();
				expect( workspaceService.privateFunctions.toggleSearchTips ).toHaveBeenCalled();

				expect( workspaceService.privateFunctions.filterMenu ).not.toHaveBeenCalled();
				$container.find( '.search-container .pattern' ).trigger( 'keyup' );
				expect( workspaceService.privateFunctions.filterMenu ).toHaveBeenCalled();

				$container.find( '.control-container .control' ).click();
				expect( $container.find( '.menu' ).length ).toEqual( 0 );
			} );
		} );

		describe ( 'BuildNew', function () {
			it ( 'Should build prompt and bind close and submit actions', function () {
				var data = [
					'<div class="prompt-container">'
						,'<div class="file-path"></div>'
						,'<div><i class="close"></i></div>'
						,'<div><input type="text" id="newentry"></input></div>'
					,'</div>'
				];
				var fileTreeArray = [ 'dir1', 'dir2', 'file1' ];
				workspaceService.privateFunctions.someRandomConfirmationCallback = function() {};

				spyOn( workspaceService.privateFunctions, 'someRandomConfirmationCallback' );

				workspaceService.privateFunctions.buildNew( data.join( '' )
					, fileTreeArray, '#newentry', workspaceService.privateFunctions.someRandomConfirmationCallback );

				expect( $container.find( '> .prompt-container' ).length ).toEqual( 1 );
				expect( $container.find( '.file-path' ).html() ).toEqual( fileTreeArray.join( '/' ) +'/' );

				expect( workspaceService.privateFunctions.someRandomConfirmationCallback ).not.toHaveBeenCalled();
				$container.find( '#newentry' ).trigger( 'keyup' );
				expect( workspaceService.privateFunctions.someRandomConfirmationCallback ).toHaveBeenCalled();

				$container.find( '.close' ).click();
				expect( $container.find( '> .prompt-container' ).length ).toEqual( 0 );
			} );
		} );

		describe ( 'BuildNewDirectory', function () {
			it ( 'Should use build new', function () {
				var data = { somekey: "somevalue" };
				var fileTreeArray = [ 'dir1', 'dir2', 'file1' ];

				spyOn( workspaceService.privateFunctions, 'buildNew' );

				workspaceService.privateFunctions.buildNewDirectory( data, fileTreeArray );

				expect( workspaceService.privateFunctions.buildNew ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.buildNew.calls.argsFor( 0 );

				expect( args[ 0 ] ).toEqual( data );
				expect( args[ 1 ] ).toEqual( fileTreeArray );
				expect( args[ 2 ] ).toEqual( '#newdirectory' );
				expect( args[ 3 ] ).toEqual( workspaceService.privateFunctions.submitNewDirectoryOnEnter );
			} );
		} );

		describe ( 'BuildNewFile', function () {
			it ( 'Should use build new', function () {
				var data = { somekey: "somevalue" };
				var fileTreeArray = [ 'dir1', 'dir2', 'file1' ];

				spyOn( workspaceService.privateFunctions, 'buildNew' );

				workspaceService.privateFunctions.buildNewFile( data, fileTreeArray );

				expect( workspaceService.privateFunctions.buildNew ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.buildNew.calls.argsFor( 0 );

				expect( args[ 0 ] ).toEqual( data );
				expect( args[ 1 ] ).toEqual( fileTreeArray );
				expect( args[ 2 ] ).toEqual( '#newfile' );
				expect( args[ 3 ] ).toEqual( workspaceService.privateFunctions.submitNewFileOnEnter );
			} );
		} );
















		describe ( 'BuildRenameDirectory', function () {
			it ( 'Should build prompt and bind close and submit actions', function () {
				var data = [
					'<div class="prompt-container">'
						,'<div class="file-path"></div>'
						,'<div class="new-file-path"></div>'
						,'<div><i class="close" /></div>'
						,'<div><input type="text" id="newdirectory" /></div>'
					,'</div>'
				];
				var fileTreeArray = [ 'dir1', 'dir2', 'file1' ];

				spyOn( workspaceService.privateFunctions, 'submitRenameDirectoryOnEnter' );

				workspaceService.privateFunctions.buildRenameDirectory( data.join( '' ), fileTreeArray );

				expect( $container.find( '> .prompt-container' ).length ).toEqual( 1 );
				expect( $container.find( '.file-path' ).html() ).toEqual( fileTreeArray.join( '/' ) );
				expect( $container.find( '.new-file-path' ).html() ).toEqual( fileTreeArray.slice(0, -1).join( '/' ) +'/' );

				expect( workspaceService.privateFunctions.submitRenameDirectoryOnEnter ).not.toHaveBeenCalled();
				$container.find( '#newdirectory' ).trigger( 'keyup' );
				expect( workspaceService.privateFunctions.submitRenameDirectoryOnEnter ).toHaveBeenCalled();

				$container.find( '.close' ).click();
				expect( $container.find( '> .prompt-container' ).length ).toEqual( 0 );
			} );
		} );

		describe ( 'BuildWorkspace', function () {
			it ( 'Should replace container html and bind events', function () {
				spyOn( sessionService, 'logout' );
				spyOn( workspaceService.privateFunctions, 'displayMenu' );

				$container.html( 'existing data to be replaced' );
				workspaceService.privateFunctions.buildWorkspace( '<i class="menuIndicator" /><i class="logout" />' );
				expect( $container.html() ).not.toEqual( 'existing data to be replaced' );

				expect( workspaceService.privateFunctions.displayMenu ).not.toHaveBeenCalled();
				$container.find( '.menuIndicator' ).mouseover();
				expect( workspaceService.privateFunctions.displayMenu ).toHaveBeenCalled();

				expect( sessionService.logout ).not.toHaveBeenCalled();
				$container.find( '.logout' ).click();
				expect( sessionService.logout ).toHaveBeenCalled();
			} );
		} );

		describe ( 'ClosePromptContainer', function () {
			it ( 'Should remove the prompt container', function () {
				$( '<div class="prompt-container">' ).appendTo( $container );
				expect( $container.find( '.prompt-container' ).length ).toEqual( 1 );
				workspaceService.privateFunctions.closePromptContainer();
				expect( $container.find( '.prompt-container' ).length ).toEqual( 0 );
			} );
		} );

		describe ( 'DeleteDirectory', function () {
			it ( 'Should DELETE directory', function () {
				var $prompt = $( '<div class="prompt-container" />' );
				var fileTree = [ 'root', 'dir1', 'dir2' ];

				$prompt.prop( 'fileTree', fileTree );
				$prompt.appendTo( $container );

				spyOn( ajaxService, 'DELETE' );

				workspaceService.privateFunctions.deleteDirectory();

				expect( ajaxService.DELETE ).toHaveBeenCalled();

				var args = ajaxService.DELETE.calls.argsFor( 0 );

				expect( args[ 0 ].url ).toEqual( './private/?p=files/directories/root/dir1/dir2' );
				expect( args[ 0 ].input ).toEqual( { } );
				expect( args[ 0 ].success ).toEqual( workspaceService.privateFunctions.deleteDirectorySuccess );
				expect( args[ 0 ][ 401 ] ).toEqual( workspaceService.privateFunctions.displayLogin );
				expect( args[ 0 ][ 497 ] ).toEqual( workspaceService.privateFunctions.deleteDirectoryFailure );
				expect( args[ 0 ][ 499 ] ).toEqual( workspaceService.privateFunctions.invalidReference );
				expect( args[ 0 ][ 500 ] ).toEqual( ajaxService.logInternalError );
			} );
		} );

		describe ( 'DeleteDirectoryFailure', function () {
			it ( 'Should display error, close prompt, and refresh menu', function () {
				spyOn( loggingService, 'displayError' );
				spyOn( workspaceService.privateFunctions, 'closePromptContainer' );
				spyOn( workspaceService.privateFunctions, 'displayFilesystem' );

				workspaceService.privateFunctions.deleteDirectoryFailure();

				expect( loggingService.displayError ).toHaveBeenCalled();
				expect( loggingService.displayError.calls.argsFor( 0 )[ 0 ] ).toEqual( 'Directory not deleted' );
				expect( workspaceService.privateFunctions.closePromptContainer ).toHaveBeenCalled();
				expect( workspaceService.privateFunctions.displayFilesystem ).toHaveBeenCalled();
			} );
		} );

		describe ( 'DeleteDirectorySuccess', function () {
			it ( 'Should display success, close prompt, and refresh menu', function () {
				spyOn( loggingService, 'displaySuccess' );
				spyOn( workspaceService.privateFunctions, 'closePromptContainer' );
				spyOn( workspaceService.privateFunctions, 'displayFilesystem' );

				workspaceService.privateFunctions.deleteDirectorySuccess();

				expect( loggingService.displaySuccess ).toHaveBeenCalled();
				expect( loggingService.displaySuccess.calls.argsFor( 0 )[ 0 ] ).toEqual( 'Directory deleted' );
				expect( workspaceService.privateFunctions.closePromptContainer ).toHaveBeenCalled();
				expect( workspaceService.privateFunctions.displayFilesystem ).toHaveBeenCalled();
			} );
		} );

		describe ( 'DeleteFile', function () {
			it ( 'Should DELETE file', function () {
				var $prompt = $( '<div class="prompt-container" />' );
				var fileTree = [ 'root', 'dir1', 'dir2' ];

				$prompt.prop( 'fileTree', fileTree );
				$prompt.appendTo( $container );

				spyOn( ajaxService, 'DELETE' );

				workspaceService.privateFunctions.deleteFile();

				expect( ajaxService.DELETE ).toHaveBeenCalled();

				var args = ajaxService.DELETE.calls.argsFor( 0 );

				expect( args[ 0 ].url ).toEqual( './private/?p=files/root/dir1/dir2' );
				expect( args[ 0 ].input ).toEqual( { } );
				expect( args[ 0 ].success ).toEqual( workspaceService.privateFunctions.deleteFileSuccess );
				expect( args[ 0 ][ 401 ] ).toEqual( workspaceService.privateFunctions.displayLogin );
				expect( args[ 0 ][ 497 ] ).toEqual( workspaceService.privateFunctions.deleteFileFailure );
				expect( args[ 0 ][ 499 ] ).toEqual( workspaceService.privateFunctions.invalidReference );
				expect( args[ 0 ][ 500 ] ).toEqual( ajaxService.logInternalError );
			} );
		} );

		describe ( 'DeleteFileFailure', function () {
			it ( 'Should display error, close prompt, and refresh menu', function () {
				spyOn( loggingService, 'displayError' );
				spyOn( workspaceService.privateFunctions, 'closePromptContainer' );
				spyOn( workspaceService.privateFunctions, 'displayFilesystem' );

				workspaceService.privateFunctions.deleteFileFailure();

				expect( loggingService.displayError ).toHaveBeenCalled();
				expect( loggingService.displayError.calls.argsFor( 0 )[ 0 ] ).toEqual( 'File not deleted' );
				expect( workspaceService.privateFunctions.closePromptContainer ).toHaveBeenCalled();
				expect( workspaceService.privateFunctions.displayFilesystem ).toHaveBeenCalled();
			} );
		} );

		describe ( 'DeleteFileSuccess', function () {
			it ( 'Should display success, close prompt, and refresh menu', function () {
				spyOn( loggingService, 'displaySuccess' );
				spyOn( workspaceService.privateFunctions, 'closePromptContainer' );
				spyOn( workspaceService.privateFunctions, 'displayFilesystem' );

				workspaceService.privateFunctions.deleteFileSuccess();

				expect( loggingService.displaySuccess ).toHaveBeenCalled();
				expect( loggingService.displaySuccess.calls.argsFor( 0 )[ 0 ] ).toEqual( 'File deleted' );
				expect( workspaceService.privateFunctions.closePromptContainer ).toHaveBeenCalled();
				expect( workspaceService.privateFunctions.displayFilesystem ).toHaveBeenCalled();
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

		describe ( 'DisplayDeleteFile', function () {
			it ( 'Should call GET to retrieve delete file view', function () {
				spyOn( ajaxService, 'GET' );
				spyOn( workspaceService.privateFunctions, 'buildFileTreeArray' ).and.returnValue( [ 'root', 'site-editor' ] );
				spyOn( workspaceService.privateFunctions, 'buildDeleteFile' );

				workspaceService.privateFunctions.displayDeleteFile();

				expect( ajaxService.GET ).toHaveBeenCalled();

				var args = ajaxService.GET.calls.argsFor( 0 );

				expect( args[ 0 ].url ).toEqual( './public/views/deleteFile.view' );
				expect( args[ 0 ][ 404 ] ).toEqual( loggingService.logNotFound );
				expect( args[ 0 ][ 500 ] ).toEqual( loggingService.logInternalError );

				args[ 0 ].success( 'myData' );

				var args = workspaceService.privateFunctions.buildDeleteFile.calls.argsFor( 0 );

				expect( args[ 0 ] ).toEqual( 'myData' );
				expect( args[ 1 ] ).toEqual( [ 'root', 'site-editor' ] );
			} );
		} );

		describe ( 'DisplayFileInDirectory', function () {
			it ( 'Should add directory to directory listing', function () {
				spyOn( workspaceService.privateFunctions, 'displayDeleteFile' );
				var $ul = $( '<ul>' );

				workspaceService.privateFunctions.displayFileInDirectory( 'fileForSale', $ul );

				expect( $ul.html() ).toEqual(
					'<li>'
						+ '<i class="fa fa-file"></i>'
						+ '<span class="file-name">fileForSale</span>'
						+ '<i class="fa fa-times delete delete-file actionable" title="Delete"></i>'
					+ '</li>'
				);

				expect( workspaceService.privateFunctions.displayDeleteFile ).not.toHaveBeenCalled();
				$ul.find( '.delete-file' ).trigger( 'click' );
				expect( workspaceService.privateFunctions.displayDeleteFile ).toHaveBeenCalled();
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

				expect( args[ 0 ].url ).toEqual( './private/?p=files' );
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
				spyOn( workspaceService.privateFunctions, 'displayNewFile' );
				spyOn( workspaceService.privateFunctions, 'displayRenameDirectory' );

				var $ul = $( '<ul>' );
				var $subfiles = { 'file': 'blah' };

				workspaceService.privateFunctions.displaySubdirectory( 'directoryForPurchase', $ul, $subfiles );

				expect( $ul.html() ).toEqual(
					'<li>'
						+ '<i class="fa fa-folder subdirectory"></i>'
						+ '<span class="file-name">directoryForPurchase</span>'
						+ '<i class="fa fa-pencil-square-o rename rename-directory actionable" title="Rename"></i>'
						+ '<span class="new-directory" title="New Directory">'
							+ '<i class="fa fa-folder actionable"></i>'
							+ '<i class="fa fa-plus actionable"></i>'
						+ '</span>'
						+ '<span class="new-file" title="New File">'
							+ '<i class="fa fa-file actionable"></i>'
							+ '<i class="fa fa-plus actionable"></i>'
						+ '</span>'
						+ '<i class="fa fa-times delete delete-directory actionable" title="Delete"></i>'
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

				expect( workspaceService.privateFunctions.displayNewFile ).not.toHaveBeenCalled();
				$ul.find( '.new-file' ).trigger( 'click' );
				expect( workspaceService.privateFunctions.displayNewFile ).toHaveBeenCalled();

				expect( workspaceService.privateFunctions.displayRenameDirectory ).not.toHaveBeenCalled();
				$ul.find( '.rename-directory' ).trigger( 'click' );
				expect( workspaceService.privateFunctions.displayRenameDirectory ).toHaveBeenCalled();
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

		describe ( 'DisplayNewFile', function () {
			it ( 'Should call GET to retrieve new file view', function () {
				spyOn( ajaxService, 'GET' );
				spyOn( workspaceService.privateFunctions, 'buildFileTreeArray' ).and.returnValue( [ 'root' ] );
				spyOn( workspaceService.privateFunctions, 'buildNewFile' );

				workspaceService.privateFunctions.displayNewFile();

				expect( ajaxService.GET ).toHaveBeenCalled();

				var args = ajaxService.GET.calls.argsFor( 0 );

				expect( args[ 0 ].url ).toEqual( './public/views/newFile.view' );
				expect( args[ 0 ][ 404 ] ).toEqual( loggingService.logNotFound );
				expect( args[ 0 ][ 500 ] ).toEqual( loggingService.logInternalError );

				args[ 0 ].success( 'myData' );

				var args = workspaceService.privateFunctions.buildNewFile.calls.argsFor( 0 );

				expect( args[ 0 ] ).toEqual( 'myData' );
				expect( args[ 1 ] ).toEqual( [ 'root' ] );
			} );
		} );

		describe ( 'DisplayRenameDirectory', function () {
			it ( 'Should call GET to retrieve rename directory view', function () {
				spyOn( ajaxService, 'GET' );
				spyOn( workspaceService.privateFunctions, 'buildFileTreeArray' ).and.returnValue( [ 'root' ] );
				spyOn( workspaceService.privateFunctions, 'buildRenameDirectory' );

				workspaceService.privateFunctions.displayRenameDirectory();

				expect( ajaxService.GET ).toHaveBeenCalled();

				var args = ajaxService.GET.calls.argsFor( 0 );

				expect( args[ 0 ].url ).toEqual( './public/views/renameDirectory.view' );
				expect( args[ 0 ][ 404 ] ).toEqual( loggingService.logNotFound );
				expect( args[ 0 ][ 500 ] ).toEqual( loggingService.logInternalError );

				args[ 0 ].success( 'myData' );

				var args = workspaceService.privateFunctions.buildRenameDirectory.calls.argsFor( 0 );

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

				$liElements = $container.find( '.directory-structure .file-name' ).parent().filter( ':not(.root)' )
			} );

			afterEach ( function () {
				$container.find( '.menu' ).remove();
			} );

			it ( 'Should default all files to visible', function () {
				expect( $liElements.filter( ':hidden' ).length ).toEqual( 0 );
			} );

			it ( 'Should hide all files if no match', function () {
				$container.find( '.pattern' ).val( 'xyz' );
				$container.find( '.pattern' ).trigger( 'keyup' );

				expect( $liElements.filter( ':visible' ).length ).toEqual( 0 );
			} );

			it ( 'Should filter specific file', function () {
				$container.find( '.pattern' ).val( 'index.css' );
				$container.find( '.pattern' ).trigger( 'keyup' );

				$liElements.find( '.file-name' ).each( function () {
					var $this = $( this );

					if ( $this.html() == 'index.css' ) {
						expect( $this.parent().is( ':visible' ) ).toBe( true );
					}
				});
			} );

			it ( 'Should filter with leading wildcard', function () {
				$container.find( '.pattern' ).val( '%.css' );
				$container.find( '.pattern' ).trigger( 'keyup' );

				var matcher = new RegExp( '[\\S]*.css' );

				$liElements.find( '.file-name' ).each( function () {
					var $this = $( this );

					if ( matcher.test( $this.html() ) ) {
						expect( $this.parent().is( ':visible' ) ).toBe( true );
					}
				});
			} );

			it ( 'Should filter with following wildcard', function () {
				$container.find( '.pattern' ).val( 'index%' );
				$container.find( '.pattern' ).trigger( 'keyup' );

				var matcher = new RegExp( 'index[\\S]*' );

				$liElements.find( '.file-name' ).each( function () {
					var $this = $( this );

					if ( matcher.test( $this.html() ) ) {
						expect( $this.parent().is( ':visible' ) ).toBe( true );
					}
				});
			} );

			it ( 'Should filter with leading and following wildcard', function () {
				$container.find( '.pattern' ).val( '%dex%' );
				$container.find( '.pattern' ).trigger( 'keyup' );

				var matcher = new RegExp( '[\\S]*dex[\\S]*' );

				$liElements.find( '.file-name' ).each( function () {
					var $this = $( this );

					if ( matcher.test( $this.html() ) ) {
						expect( $this.parent().is( ':visible' ) ).toBe( true );
					}
				});
			} );

			it ( 'Should filter with leading, middle, and following wildcard', function () {
				$container.find( '.pattern' ).val( '%Con%.p%' );
				$container.find( '.pattern' ).trigger( 'keyup' );

				var matcher = new RegExp( '[\\S]*Con[\\S]*.p[\\S]*' );

				$liElements.find( '.file-name' ).each( function () {
					var $this = $( this );

					if ( matcher.test( $this.html() ) ) {
						expect( $this.parent().is( ':visible' ) ).toBe( true );
					}
				});
			} );

			it ( 'Should filter with single leading wildcard', function () {
				$container.find( '.pattern' ).val( '_ndex.css' );
				$container.find( '.pattern' ).trigger( 'keyup' );

				var matcher = new RegExp( '[\\S]ndex.css' );

				$liElements.find( '.file-name' ).each( function () {
					var $this = $( this );

					if ( matcher.test( $this.html() ) ) {
						expect( $this.parent().is( ':visible' ) ).toBe( true );
					}
				});
			} );

			it ( 'Should filter with single following wildcard', function () {
				$container.find( '.pattern' ).val( 'index.htm_' );
				$container.find( '.pattern' ).trigger( 'keyup' );

				var matcher = new RegExp( 'index.htm[\\S]' );

				$liElements.find( '.file-name' ).each( function () {
					var $this = $( this );

					if ( matcher.test( $this.html() ) ) {
						expect( $this.parent().is( ':visible' ) ).toBe( true );
					}
				});
			} );

			it ( 'Should filter with leading and following wildcard', function () {
				$container.find( '.pattern' ).val( '_ndex.htm_' );
				$container.find( '.pattern' ).trigger( 'keyup' );

				var matcher = new RegExp( '[\\S]ndex.htm[\\S]' );

				$liElements.find( '.file-name' ).each( function () {
					var $this = $( this );

					if ( matcher.test( $this.html() ) ) {
						expect( $this.parent().is( ':visible' ) ).toBe( true );
					}
				});
			} );

			it ( 'Should filter with leading, middle, and following wildcard', function () {
				$container.find( '.pattern' ).val( '_nde_.htm_' );
				$container.find( '.pattern' ).trigger( 'keyup' );

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

				$( '<div class="prompt-container" />' ).appendTo( $container );

				workspaceService.privateFunctions.invalidReference();

				expect( $container.find( '.prompt-container' ).length ).toEqual( 0 );
				expect( workspaceService.privateFunctions.displayFilesystem );
				expect( loggingService.displayError ).toHaveBeenCalled();

				var args = loggingService.displayError.calls.argsFor( 0 );

				expect( args[ 0 ] ).toEqual( 'Parent directory no longer exists or has restricted access' );
			} );
		} );

		describe ( 'NewDirectoryFailure', function () {
			it ( 'Should display error message', function () {
				spyOn( loggingService, 'displayError' );

				$( '<div class="prompt-container" />' ).appendTo( $container );

				workspaceService.privateFunctions.newDirectoryFailure();

				expect( $container.find( '.prompt-container' ).length ).toEqual( 1 );
				expect( loggingService.displayError ).toHaveBeenCalled();

				var args = loggingService.displayError.calls.argsFor( 0 );

				expect( args[ 0 ] ).toEqual( 'New directory already exists or is invalid syntax' );
			} );
		} );

		describe ( 'NewDirectorySuccess', function () {
			it ( 'Should display success message, close prompt, and reload menu', function () {
				spyOn( loggingService, 'displaySuccess' );
				spyOn( workspaceService.privateFunctions, 'displayFilesystem' );

				$( '<div class="prompt-container" />' ).appendTo( $container );

				workspaceService.privateFunctions.newDirectorySuccess();

				expect( $container.find( '.prompt-container' ).length ).toEqual( 0 );
				expect( workspaceService.privateFunctions.displayFilesystem );
				expect( loggingService.displaySuccess ).toHaveBeenCalled();

				var args = loggingService.displaySuccess.calls.argsFor( 0 );

				expect( args[ 0 ] ).toEqual( 'Directory created' );
			} );
		} );

		describe ( 'NewFileFailure', function () {
			it ( 'Should display error message', function () {
				spyOn( loggingService, 'displayError' );

				$( '<div class="prompt-container" />' ).appendTo( $container );

				workspaceService.privateFunctions.newFileFailure();

				expect( $container.find( '.prompt-container' ).length ).toEqual( 1 );
				expect( loggingService.displayError ).toHaveBeenCalled();

				var args = loggingService.displayError.calls.argsFor( 0 );

				expect( args[ 0 ] ).toEqual( 'New file already exists or is invalid syntax' );
			} );
		} );

		describe ( 'NewFileSuccess', function () {
			it ( 'Should display success message, close prompt, and reload menu', function () {
				spyOn( loggingService, 'displaySuccess' );
				spyOn( workspaceService.privateFunctions, 'displayFilesystem' );

				$( '<div class="prompt-container" />' ).appendTo( $container );

				workspaceService.privateFunctions.newFileSuccess();

				expect( $container.find( '.prompt-container' ).length ).toEqual( 0 );
				expect( workspaceService.privateFunctions.displayFilesystem );
				expect( loggingService.displaySuccess ).toHaveBeenCalled();

				var args = loggingService.displaySuccess.calls.argsFor( 0 );

				expect( args[ 0 ] ).toEqual( 'File created' );
			} );
		} );

		describe ( 'RenameDirectoryFailure', function () {
			it ( 'Should display error message', function () {
				spyOn( loggingService, 'displayError' );

				$( '<div class="prompt-container" />' ).appendTo( $container );

				workspaceService.privateFunctions.renameDirectoryFailure();

				expect( $container.find( '.prompt-container' ).length ).toEqual( 1 );
				expect( loggingService.displayError ).toHaveBeenCalled();

				var args = loggingService.displayError.calls.argsFor( 0 );

				expect( args[ 0 ] ).toEqual( 'New directory already exists or is invalid syntax' );
			} );
		} );

		describe ( 'RenameDirectorySuccess', function () {
			it ( 'Should display success message, close prompt, and reload menu', function () {
				spyOn( loggingService, 'displaySuccess' );
				spyOn( workspaceService.privateFunctions, 'displayFilesystem' );

				$( '<div class="prompt-container" />' ).appendTo( $container );

				workspaceService.privateFunctions.renameDirectorySuccess();

				expect( $container.find( '.prompt-container' ).length ).toEqual( 0 );
				expect( workspaceService.privateFunctions.displayFilesystem );
				expect( loggingService.displaySuccess ).toHaveBeenCalled();

				var args = loggingService.displaySuccess.calls.argsFor( 0 );

				expect( args[ 0 ] ).toEqual( 'Directory renamed' );
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
				$prompt.appendTo( $container );

				spyOn( ajaxService, 'POST' );
				spyOn( keyService, 'enter' ).and.returnValue( true );

				$prompt.find( '#newdirectory' ).trigger( 'keyup' );

				expect( ajaxService.POST ).toHaveBeenCalled();

				var args = ajaxService.POST.calls.argsFor( 0 );

				expect( args[ 0 ].url ).toEqual( './private/?p=files/directories/dir1/dir2/dir777' );
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
				$prompt.appendTo( $container );

				spyOn( ajaxService, 'POST' );
				spyOn( keyService, 'enter' ).and.returnValue( false );

				$prompt.find( '#newdirectory' ).trigger( 'keyup' );

				expect( ajaxService.POST ).not.toHaveBeenCalled();
			} );
		} );

		describe ( 'SubmitNewFileOnEnter', function () {
			it ( 'Should POST new file request on enter', function () {
				var $prompt = $( '<div class="prompt-container"><input type="text" id="newfile" /></div>' );
				var fileTree = [ 'dir1', 'dir2' ];
				var newFileName = 'dir777';

				$prompt.prop( 'fileTree', fileTree );
				$prompt.find( '#newfile' ).val( newFileName );
				$prompt.find( '#newfile' ).keyup( workspaceService.privateFunctions.submitNewFileOnEnter );
				$prompt.appendTo( $container );

				spyOn( ajaxService, 'POST' );
				spyOn( keyService, 'enter' ).and.returnValue( true );

				$prompt.find( '#newfile' ).trigger( 'keyup' );

				expect( ajaxService.POST ).toHaveBeenCalled();

				var args = ajaxService.POST.calls.argsFor( 0 );

				expect( args[ 0 ].url ).toEqual( './private/?p=files/dir1/dir2/dir777' );
				expect( args[ 0 ].input ).toEqual( { } );
				expect( args[ 0 ].success ).toEqual( workspaceService.privateFunctions.newFileSuccess );
				expect( args[ 0 ][ 401 ] ).toEqual( workspaceService.privateFunctions.displayLogin );
				expect( args[ 0 ][ 498 ] ).toEqual( workspaceService.privateFunctions.newFileFailure );
				expect( args[ 0 ][ 499 ] ).toEqual( workspaceService.privateFunctions.invalidReference );
				expect( args[ 0 ][ 500 ] ).toEqual( ajaxService.logInternalError );
			} );

			it ( 'Should not POST new file request on non-enter', function () {
				var $prompt = $( '<div class="prompt-container"><input type="text" id="newfile" /></div>' );
				var fileTree = [ 'dir1', 'dir2' ];
				var newFileName = 'dir777';

				$prompt.prop( 'fileTree', fileTree );
				$prompt.find( '#newfile' ).val( newFileName );
				$prompt.find( '#newfile' ).keyup( workspaceService.privateFunctions.submitNewFileOnEnter );
				$prompt.appendTo( $container );

				spyOn( ajaxService, 'POST' );
				spyOn( keyService, 'enter' ).and.returnValue( false );

				$prompt.find( '#newfile' ).trigger( 'keyup' );

				expect( ajaxService.POST ).not.toHaveBeenCalled();
			} );
		} );
	} );
} );
