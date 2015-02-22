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

				var args = workspaceService.privateFunctions.displayStaticResource.calls.first().args;

				expect( args[ 0 ] ).toEqual( './public/views/workspace.view' );
				expect( args[ 1 ] ).toEqual( workspaceService.privateFunctions.buildWorkspace );
			} );
		} );
	} );

	describe ( 'PrivateFunctions', function () {
		describe ( 'BuildDeleteDirectory', function () {
			it ( 'Should use private function', function () {
				var data = { somekey: 'somevalue' };
				var fileTreeArray = [ 'dir1', 'dir2', 'dir3' ];

				spyOn( workspaceService.privateFunctions, 'buildPromptWithConfirmation' );

				workspaceService.privateFunctions.buildDeleteDirectory( data, fileTreeArray );

				expect( workspaceService.privateFunctions.buildPromptWithConfirmation ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.buildPromptWithConfirmation.calls.first().args[ 0 ];

				expect( args.data ).toEqual( data );
				expect( args.fileTreeArray ).toEqual( fileTreeArray );
				expect( args.confirmationCallback ).toEqual( workspaceService.privateFunctions.deleteDirectory );
			} );
		} );

		describe ( 'BuildDeleteFile', function () {
			it ( 'Should use private function', function () {
				var data = { somekey: 'somevalue' };
				var fileTreeArray = [ 'dir1', 'dir2', 'dir3' ];

				spyOn( workspaceService.privateFunctions, 'buildPromptWithConfirmation' );

				workspaceService.privateFunctions.buildDeleteFile( data, fileTreeArray );

				expect( workspaceService.privateFunctions.buildPromptWithConfirmation ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.buildPromptWithConfirmation.calls.first().args[ 0 ];

				expect( args.data ).toEqual( data );
				expect( args.fileTreeArray ).toEqual( fileTreeArray );
				expect( args.confirmationCallback ).toEqual( workspaceService.privateFunctions.deleteFile );
			} );
		} );

		describe ( 'BuildEditFile', function () {
			it ( 'Should build edit file and retrieve data', function () {
				var data = [
					'<div class="file-container">'
						, '<div class="control-container">'
							, '<div class="file-path"></div>'
							, '<i class="close"></i>'
						,'</div>'
						, '<div class="content-container">'
							, '<div class="content"></div>'
						,'</div>'
					, '<div>'
				].join( '' );
				var fileTreeArray = [ 'dir1', 'dir2', 'dir3' ];

				spyOn( ajaxService, 'GET' );

				workspaceService.privateFunctions.buildEditFile( data, fileTreeArray );

				expect( ajaxService.GET ).toHaveBeenCalled();

				var args = ajaxService.GET.calls.first().args[ 0 ];

				expect( args.url ).toEqual( './private/?p=files/'+ fileTreeArray.join( '/' ) );
				expect( args[ 401 ] ).toEqual( sessionService.displayLogin );
				expect( args[ 404 ] ).toEqual( loggingService.logNotFound );
				expect( args[ 500 ] ).toEqual( loggingService.logInternalError );

				args.success( JSON.stringify( { file: 'content data to edit' } ) );

				var $editor = $container.find( '.file-container' );

				expect( $editor.length ).toEqual( 1 );
				expect( $editor.prop( 'fileTree') ).toEqual( fileTreeArray );
				expect( $editor.find( '.control-container .file-path' ).html() ).toEqual( fileTreeArray.join( '/' ) );
				expect( $editor.find( '.content-container .content' ).text() ).toEqual( 'content data to edit' );

				$editor.find( '.control-container .close' ).click();

				expect( $container.find( '.file-container' ).length ).toEqual( 0 );
			} );
		} );

		describe ( 'BuildFilesystem', function () {
			it ( 'Should remove existing ul and insert new one', function () {
				spyOn( workspaceService.privateFunctions, 'displayFilesInDirectory' );
				spyOn( workspaceService.privateFunctions, 'removeMoveDown' );

				$( '<div>', { class: 'root' } ).appendTo( $container );
				$( '<ul>', { class: 'existingUL' } ).appendTo( $container.find( '.root' ) );

				var data = { key1: 'value1', key2: 'value2' };

				workspaceService.privateFunctions.buildFilesystem( JSON.stringify( data ) );

				expect( $container.find( '.root ul' ).hasClass( 'existingURL' ) ).toBe( false );
				expect( workspaceService.privateFunctions.displayFilesInDirectory ).toHaveBeenCalled();
				expect( workspaceService.privateFunctions.removeMoveDown ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.displayFilesInDirectory.calls.first().args;

				expect( args[ 0 ][ 0 ] ).toEqual( $container.find( '.root ul' )[ 0 ] );
				expect( args[ 1 ] ).toEqual( data );

				args = workspaceService.privateFunctions.removeMoveDown.calls.first().args;

				expect( args[ 0 ][ 0 ] ).toEqual( $container.find( '.content-container .root' )[ 0 ] );
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

		describe ( 'BuildMoveDownDirectory', function () {
			it ( 'Should use private function', function () {
				var data = { somekey: 'somevalue' };
				var fileTreeArray = [ 'dir1', 'dir2', 'dir3' ];
				var $object = $( '<div>' );

				spyOn( workspaceService.privateFunctions, 'buildPromptWithConfirmation' );
				spyOn( workspaceService.privateFunctions, 'buildSubdirectorySelection' );

				workspaceService.privateFunctions.buildMoveDownDirectory( data, fileTreeArray, $object );

				expect( workspaceService.privateFunctions.buildPromptWithConfirmation ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.buildPromptWithConfirmation.calls.first().args[ 0 ];

				expect( args.data ).toEqual( data );
				expect( args.fileTreeArray ).toEqual( fileTreeArray );
				expect( args.confirmationCallback ).toEqual( workspaceService.privateFunctions.moveDownDirectory );

				expect( workspaceService.privateFunctions.buildSubdirectorySelection ).not.toHaveBeenCalled();
				args.customSetup( 'something' );
				expect( workspaceService.privateFunctions.buildSubdirectorySelection ).toHaveBeenCalled();

				args = workspaceService.privateFunctions.buildSubdirectorySelection.calls.first().args;

				expect( args[ 0 ] ).toEqual( 'something' );
				expect( args[ 1 ] ).toEqual( $object );
			} );
		} );

		describe ( 'BuildMoveDownFile', function () {
			it ( 'Should use private function', function () {
				var data = { somekey: 'somevalue' };
				var fileTreeArray = [ 'dir1', 'dir2', 'dir3' ];
				var $object = $( '<div>' );

				spyOn( workspaceService.privateFunctions, 'buildPromptWithConfirmation' );
				spyOn( workspaceService.privateFunctions, 'buildSubdirectorySelection' );

				workspaceService.privateFunctions.buildMoveDownFile( data, fileTreeArray, $object );

				expect( workspaceService.privateFunctions.buildPromptWithConfirmation ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.buildPromptWithConfirmation.calls.first().args[ 0 ];

				expect( args.data ).toEqual( data );
				expect( args.fileTreeArray ).toEqual( fileTreeArray );
				expect( args.confirmationCallback ).toEqual( workspaceService.privateFunctions.moveDownFile );

				expect( workspaceService.privateFunctions.buildSubdirectorySelection ).not.toHaveBeenCalled();
				args.customSetup( 'something' );
				expect( workspaceService.privateFunctions.buildSubdirectorySelection ).toHaveBeenCalled();

				args = workspaceService.privateFunctions.buildSubdirectorySelection.calls.first().args;

				expect( args[ 0 ] ).toEqual( 'something' );
				expect( args[ 1 ] ).toEqual( $object );
			} );
		} );

		describe ( 'BuildMoveUpDirectory', function () {
			it ( 'Should use private function', function () {
				var data = { somekey: 'somevalue' };
				var fileTreeArray = [ 'dir1', 'dir2', 'dir3' ];

				spyOn( workspaceService.privateFunctions, 'buildPromptWithConfirmation' );

				workspaceService.privateFunctions.buildMoveUpDirectory( data, fileTreeArray );

				expect( workspaceService.privateFunctions.buildPromptWithConfirmation ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.buildPromptWithConfirmation.calls.first().args[ 0 ];

				expect( args.data ).toEqual( data );
				expect( args.fileTreeArray ).toEqual( fileTreeArray );
				expect( args.confirmationCallback ).toEqual( workspaceService.privateFunctions.moveUpDirectory );
			} );
		} );

		describe ( 'BuildMoveUpFile', function () {
			it ( 'Should use private function', function () {
				var data = { somekey: 'somevalue' };
				var fileTreeArray = [ 'dir1', 'dir2', 'dir3' ];

				spyOn( workspaceService.privateFunctions, 'buildPromptWithConfirmation' );

				workspaceService.privateFunctions.buildMoveUpFile( data, fileTreeArray );

				expect( workspaceService.privateFunctions.buildPromptWithConfirmation ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.buildPromptWithConfirmation.calls.first().args[ 0 ];

				expect( args.data ).toEqual( data );
				expect( args.fileTreeArray ).toEqual( fileTreeArray );
				expect( args.confirmationCallback ).toEqual( workspaceService.privateFunctions.moveUpFile );
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
			it ( 'Should use private function', function () {
				var data = { somekey: "somevalue" };
				var fileTreeArray = [ 'dir1', 'dir2', 'file1' ];

				spyOn( workspaceService.privateFunctions, 'buildPromptWithoutConfirmation' );

				workspaceService.privateFunctions.buildNewDirectory( data, fileTreeArray );

				expect( workspaceService.privateFunctions.buildPromptWithoutConfirmation ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.buildPromptWithoutConfirmation.calls.first().args[ 0 ];

				expect( args.data ).toEqual( data );
				expect( args.fileTreeArray ).toEqual( fileTreeArray );
				expect( args.inputField ).toEqual( '#newdirectory' );
				expect( args.confirmationCallback ).toEqual( workspaceService.privateFunctions.submitNewDirectoryOnEnter );
			} );
		} );

		describe ( 'BuildNewFile', function () {
			it ( 'Should use private function', function () {
				var data = { somekey: "somevalue" };
				var fileTreeArray = [ 'dir1', 'dir2', 'file1' ];

				spyOn( workspaceService.privateFunctions, 'buildPromptWithoutConfirmation' );

				workspaceService.privateFunctions.buildNewFile( data, fileTreeArray );

				expect( workspaceService.privateFunctions.buildPromptWithoutConfirmation ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.buildPromptWithoutConfirmation.calls.first().args[ 0 ];

				expect( args.data ).toEqual( data );
				expect( args.fileTreeArray ).toEqual( fileTreeArray );
				expect( args.inputField ).toEqual( '#newfile' );
				expect( args.confirmationCallback ).toEqual( workspaceService.privateFunctions.submitNewFileOnEnter );
			} );
		} );

		describe ( 'BuildPromptWithConfirmation', function () {
			beforeEach ( function () {
				fileTreeArray = [ 'public', 'css', 'index.css' ];

				$fragment = $( [
					'<div>'
						, '<div class="prompt-container">'
							, '<span class="file-path"></span>'
							, '<input class="prompt-yes"></input>'
							, '<input class="prompt-no"></input>'
						, '</div>'
					, '</div>'
				].join( '' ) );

				testCallbacks = {
					confirmationCallback: function () {}
					, customSetup: function () {}
				};

				spyOn( testCallbacks, 'confirmationCallback' );
				spyOn( testCallbacks, 'customSetup' );
				spyOn( workspaceService.privateFunctions, 'closePromptContainer' );
			} );

			it ( 'Should build prompt, bind actions, and perform custom setup', function () {
				workspaceService.privateFunctions.buildPromptWithConfirmation( {
					data: $fragment.html()
					, fileTreeArray: fileTreeArray
					, confirmationCallback: testCallbacks.confirmationCallback
					, customSetup: testCallbacks.customSetup
				} );

				expect( workspaceService.privateFunctions.closePromptContainer ).toHaveBeenCalled();

				var $prompt = $container.find( '.prompt-container' );

				expect( $prompt.find( '.file-path' ).html() ).toEqual( fileTreeArray.join( '/' ) );
				expect( $prompt.prop( 'fileTree' ) ).toEqual( fileTreeArray );
				expect( $prompt.is( ':visible' ) ).toBe( true );

				expect( testCallbacks.confirmationCallback ).not.toHaveBeenCalled();
				$prompt.find( '.prompt-yes' ).trigger( 'click' );
				expect( testCallbacks.confirmationCallback ).toHaveBeenCalled();

				workspaceService.privateFunctions.closePromptContainer.calls.reset();
				expect( workspaceService.privateFunctions.closePromptContainer ).not.toHaveBeenCalled();
				$prompt.find( '.prompt-no' ).trigger( 'click' );
				expect( workspaceService.privateFunctions.closePromptContainer ).toHaveBeenCalled();

				expect( testCallbacks.customSetup ).toHaveBeenCalled();
			} );

			it ( 'Should build prompt, bind actions', function () {
				workspaceService.privateFunctions.buildPromptWithConfirmation( {
					data: $fragment.html()
					, fileTreeArray: fileTreeArray
					, confirmationCallback: testCallbacks.confirmationCallback
				} );

				expect( workspaceService.privateFunctions.closePromptContainer ).toHaveBeenCalled();

				var $prompt = $container.find( '.prompt-container' );

				expect( $prompt.find( '.file-path' ).html() ).toEqual( fileTreeArray.join( '/' ) );
				expect( $prompt.prop( 'fileTree' ) ).toEqual( fileTreeArray );
				expect( $prompt.is( ':visible' ) ).toBe( true );

				expect( testCallbacks.confirmationCallback ).not.toHaveBeenCalled();
				$prompt.find( '.prompt-yes' ).trigger( 'click' );
				expect( testCallbacks.confirmationCallback ).toHaveBeenCalled();

				workspaceService.privateFunctions.closePromptContainer.calls.reset();
				expect( workspaceService.privateFunctions.closePromptContainer ).not.toHaveBeenCalled();
				$prompt.find( '.prompt-no' ).trigger( 'click' );
				expect( workspaceService.privateFunctions.closePromptContainer ).toHaveBeenCalled();
			} );
		} );

		describe ( 'BuildPromptWithoutConfirmation', function () {
			beforeEach ( function () {
				fileTreeArray = [ 'public', 'css', 'index.css' ];

				$fragment = $( [
					'<div>'
						, '<div class="prompt-container">'
							, '<i class="close"></i>'
							, '<span class="file-path"></span>'
							, '<input id="inputfield"></input>'
						, '</div>'
					, '</div>'
				].join( '' ) );

				testCallbacks = {
					confirmationCallback: function () {}
					, customSetup: function () {}
				};

				spyOn( testCallbacks, 'confirmationCallback' );
				spyOn( testCallbacks, 'customSetup' );
				spyOn( workspaceService.privateFunctions, 'closePromptContainer' );
			} );

			it ( 'Should build prompt, bind actions, and perform custom setup', function () {
				workspaceService.privateFunctions.buildPromptWithoutConfirmation( {
					data: $fragment.html()
					, fileTreeArray: fileTreeArray
					, confirmationCallback: testCallbacks.confirmationCallback
					, customSetup: testCallbacks.customSetup
					, inputField: '#inputfield'
				} );

				expect( workspaceService.privateFunctions.closePromptContainer ).toHaveBeenCalled();

				var $prompt = $container.find( '.prompt-container' );

				expect( $prompt.find( '.file-path' ).html() ).toEqual( fileTreeArray.join( '/' ) );
				expect( $prompt.prop( 'fileTree' ) ).toEqual( fileTreeArray );
				expect( $prompt.is( ':visible' ) ).toBe( true );

				expect( testCallbacks.confirmationCallback ).not.toHaveBeenCalled();
				$prompt.find( '#inputfield' ).trigger( 'keyup' );
				expect( testCallbacks.confirmationCallback ).toHaveBeenCalled();

				workspaceService.privateFunctions.closePromptContainer.calls.reset();
				expect( workspaceService.privateFunctions.closePromptContainer ).not.toHaveBeenCalled();
				$prompt.find( '.close' ).trigger( 'click' );
				expect( workspaceService.privateFunctions.closePromptContainer ).toHaveBeenCalled();

				expect( testCallbacks.customSetup ).toHaveBeenCalled();
			} );

			it ( 'Should build prompt, bind actions', function () {
				workspaceService.privateFunctions.buildPromptWithoutConfirmation( {
					data: $fragment.html()
					, fileTreeArray: fileTreeArray
					, confirmationCallback: testCallbacks.confirmationCallback
					, inputField: '#inputfield'
				} );

				expect( workspaceService.privateFunctions.closePromptContainer ).toHaveBeenCalled();

				var $prompt = $container.find( '.prompt-container' );

				expect( $prompt.find( '.file-path' ).html() ).toEqual( fileTreeArray.join( '/' ) );
				expect( $prompt.prop( 'fileTree' ) ).toEqual( fileTreeArray );
				expect( $prompt.is( ':visible' ) ).toBe( true );

				expect( testCallbacks.confirmationCallback ).not.toHaveBeenCalled();
				$prompt.find( '#inputfield' ).trigger( 'keyup' );
				expect( testCallbacks.confirmationCallback ).toHaveBeenCalled();

				workspaceService.privateFunctions.closePromptContainer.calls.reset();
				expect( workspaceService.privateFunctions.closePromptContainer ).not.toHaveBeenCalled();
				$prompt.find( '.close' ).trigger( 'click' );
				expect( workspaceService.privateFunctions.closePromptContainer ).toHaveBeenCalled();
			} );
		} );

		describe ( 'BuildRenameDirectory', function () {
			it ( 'Should use private function', function () {
				var data = { aKey: 'aValue' };
				var fileTreeArray = [ 'dir1', 'dir2', 'file1' ];

				spyOn( workspaceService.privateFunctions, 'buildPromptWithoutConfirmation' );

				workspaceService.privateFunctions.buildRenameDirectory( data, fileTreeArray );

				expect( workspaceService.privateFunctions.buildPromptWithoutConfirmation ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.buildPromptWithoutConfirmation.calls.first().args[ 0 ];

				expect( args.data ).toEqual( data );
				expect( args.fileTreeArray ).toEqual( fileTreeArray );
				expect( args.inputField ).toEqual( '#newdirectory' );
				expect( args.confirmationCallback ).toEqual( workspaceService.privateFunctions.submitRenameDirectoryOnEnter );
			} );
		} );

		describe ( 'BuildRenameFile', function () {
			it ( 'Should use private function', function () {
				var data = { aKey: 'aValue' };
				var fileTreeArray = [ 'dir1', 'dir2', 'file1' ];

				spyOn( workspaceService.privateFunctions, 'buildPromptWithoutConfirmation' );

				workspaceService.privateFunctions.buildRenameFile( data, fileTreeArray );

				expect( workspaceService.privateFunctions.buildPromptWithoutConfirmation ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.buildPromptWithoutConfirmation.calls.first().args[ 0 ];

				expect( args.data ).toEqual( data );
				expect( args.fileTreeArray ).toEqual( fileTreeArray );
				expect( args.inputField ).toEqual( '#newfile' );
				expect( args.confirmationCallback ).toEqual( workspaceService.privateFunctions.submitRenameFileOnEnter );
			} );
		} );

		describe ( 'BuildSubdirectorySelection', function () {
			it ( 'Should select all immediate subdirectories and set on the selection', function () {
				var $menu = $( [
					'<ul>'
						,'<li class="menu-item">'
							,'<i class="folder subdirectory"></i>'
							,'<span class="file-name">directory1</span>'
							,'<ul>'
								,'<li class="menu-item">'
									,'<i class="folder subdirectory"></i>'
									,'<span class="file-name">directory1.1</span>'
									,'<ul>'
										,'<li class="menu-item">'
											,'<i class="file"></i>'
											,'<span class="file-name">file1.1.1</span>'
										,'</li>'
										,'<li class="menu-item">'
											,'<i class="file"></i>'
											,'<span class="file-name">file1.1.2</span>'
										,'</li>'
									,'</ul>'
								,'</li>'
								,'<li class="menu-item">'
									,'<i class="file"></i>'
									,'<span class="file-name">file1.1</span>'
								,'</li>'
							,'</ul>'
						,'</li>'
						,'<li class="menu-item">'
							,'<i class="folder subdirectory"></i>'
							,'<span class="file-name">directory2</span>'
							,'<ul>'
								,'<li class="menu-item">'
									,'<i class="folder subdirectory"></i>'
									,'<span class="file-name">directory2.1</span>'
									,'<ul>'
										,'<li class="menu-item">'
											,'<i class="folder subdirectory"></i>'
											,'<span class="file-name">directory2.1.1</span>'
											,'<ul></ul>'
										,'</li>'
										,'<li class="menu-item">'
											,'<i class="folder subdirectory"></i>'
											,'<span class="file-name">directory2.1.2</span>'
											,'<i class="move-directory-down"></i>'
											,'<ul></ul>'
										,'</li>'
										,'<li class="menu-item">'
											,'<i class="folder subdirectory"></i>'
											,'<span class="file-name">directory2.1.3</span>'
											,'<ul></ul>'
										,'</li>'
										,'<li class="menu-item">'
											,'<i class="file"></i>'
											,'<span class="file-name">file2.1.1</span>'
										,'</li>'
										,'<li class="menu-item">'
											,'<i class="file"></i>'
											,'<span class="file-name">file2.1.2</span>'
										,'</li>'
									,'</ul>'
								,'</li>'
								,'<li class="menu-item">'
									,'<i class="folder subdirectory"></i>'
									,'<span class="file-name">directory2.2</span>'
									,'<ul>'
										,'<li class="menu-item">'
											,'<i class="file"></i>'
											,'<span class="file-name">file2.2.1</span>'
										,'</li>'
										,'<li class="menu-item">'
											,'<i class="file"></i>'
											,'<span class="file-name">file2.2.2</span>'
										,'</li>'
									,'</ul>'
								,'</li>'
								,'<li class="menu-item">'
									,'<i class="file"></i>'
									,'<span class="file-name">file2.1</span>'
								,'</li>'
							,'</ul>'
						,'</li>'
						,'<li class="menu-item">'
							,'<i class="file"></i>'
							,'<span class="file-name">file2</span>'
						,'</li>'
					,'</ul>'
				].join( '' ) );

				var $prompt = $( [
					'<div class="prompt-container">'
						, '<div class="content-container">'
							, '<div class="content">'
								, '<select id="newdirectory">'
									, '<option>Old Option</option>'
								,'</select>'
							, '</div>'
						, '</div>'
					, '</div>'
				].join( '' ) );

				var $selection = $menu.find( '.move-directory-down' );

				workspaceService.privateFunctions.buildSubdirectorySelection( $prompt, $selection );

				var $options = $prompt.find( '#newdirectory option' );

				expect( $options.length ).toEqual( 2 );
				expect( $options.get( 0 ).value ).toEqual( 'directory2.1.1' );
				expect( $options.get( 0 ).innerHTML ).toEqual( 'directory2.1.1' );
				expect( $options.get( 1 ).value ).toEqual( 'directory2.1.3' );
				expect( $options.get( 1 ).innerHTML ).toEqual( 'directory2.1.3' );
			} );
		} );

		describe ( 'BuildUploadFile', function () {
			it ( 'Should use private function', function () {
				var data = { somekey: 'somevalue' };
				var fileTreeArray = [ 'dir1', 'dir2', 'dir3' ];

				spyOn( workspaceService.privateFunctions, 'buildPromptWithConfirmation' );

				workspaceService.privateFunctions.buildUploadFile( data, fileTreeArray );

				expect( workspaceService.privateFunctions.buildPromptWithConfirmation ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.buildPromptWithConfirmation.calls.first().args[ 0 ];

				expect( args.data ).toEqual( data );
				expect( args.fileTreeArray ).toEqual( fileTreeArray );
				expect( args.confirmationCallback ).toEqual( workspaceService.privateFunctions.uploadFile );
			} );
		} );

		describe ( 'BuildWorkspace', function () {
			it ( 'Should replace container html and bind events', function () {
				spyOn( sessionService, 'logout' );
				spyOn( workspaceService.privateFunctions, 'displayMenu' );

				$container.html( 'existing data to be replaced' );

				workspaceService.privateFunctions.buildWorkspace( '<i class="menuIndicator"></i><i class="logout"></i>' );

				expect( $container.html() ).not.toEqual( 'existing data to be replaced' );

				expect( workspaceService.privateFunctions.displayMenu ).toHaveBeenCalled();
				workspaceService.privateFunctions.displayMenu.calls.reset();
				expect( workspaceService.privateFunctions.displayMenu ).not.toHaveBeenCalled();
				$container.find( '.menuIndicator' ).mouseover();
				expect( workspaceService.privateFunctions.displayMenu ).toHaveBeenCalled();

				expect( sessionService.logout ).not.toHaveBeenCalled();
				$container.find( '.logout' ).click();
				expect( sessionService.logout ).toHaveBeenCalled();
			} );
		} );

		describe ( 'CloseMenuPromptWithError', function () {
			it ( 'Should log error message, close prompt, and reload filesystem', function () {
				spyOn( loggingService, 'displayError' );
				spyOn( workspaceService.privateFunctions, 'closePromptContainer' );
				spyOn( workspaceService.privateFunctions, 'displayFilesystem' );

				workspaceService.privateFunctions.closeMenuPromptWithError( 'This is my message' );

				expect( loggingService.displayError ).toHaveBeenCalled();
				expect( workspaceService.privateFunctions.closePromptContainer ).toHaveBeenCalled();
				expect( workspaceService.privateFunctions.displayFilesystem ).toHaveBeenCalled();

				var args = loggingService.displayError.calls.first().args;

				expect( args[ 0 ] ).toEqual( 'This is my message' );
			} );
		} );

		describe ( 'CloseMenuPromptWithSuccess', function () {
			it ( 'Should log success message, close prompt, and reload filesystem', function () {
				spyOn( loggingService, 'displaySuccess' );
				spyOn( workspaceService.privateFunctions, 'closePromptContainer' );
				spyOn( workspaceService.privateFunctions, 'displayFilesystem' );

				workspaceService.privateFunctions.closeMenuPromptWithSuccess( 'This is my message' );

				expect( loggingService.displaySuccess ).toHaveBeenCalled();
				expect( workspaceService.privateFunctions.closePromptContainer ).toHaveBeenCalled();
				expect( workspaceService.privateFunctions.displayFilesystem ).toHaveBeenCalled();

				var args = loggingService.displaySuccess.calls.first().args;

				expect( args[ 0 ] ).toEqual( 'This is my message' );
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

		describe ( 'Delete', function () {
			it ( 'Should call DELETE with url, filepath, and callbacks', function () {
				var $prompt = $( '<div class="prompt-container" />' );
				var fileTree = [ 'root', 'dir1', 'dir2' ];

				$prompt.prop( 'fileTree', fileTree );
				$prompt.appendTo( $container );
				workspaceService.privateFunctions.someRandomFailureCallback = function () {};
				workspaceService.privateFunctions.someRandomSuccessCallback = function () {};

				spyOn( ajaxService, 'DELETE' );
				spyOn( workspaceService.privateFunctions, 'someRandomFailureCallback' );
				spyOn( workspaceService.privateFunctions, 'someRandomSuccessCallback' );

				workspaceService.privateFunctions.delete( 'aUrl/?p='
					, workspaceService.privateFunctions.someRandomSuccessCallback
					, workspaceService.privateFunctions.someRandomFailureCallback );

				expect( ajaxService.DELETE ).toHaveBeenCalled();

				var args = ajaxService.DELETE.calls.first().args;

				expect( args[ 0 ].url ).toEqual( 'aUrl/?p=root/dir1/dir2' );
				expect( args[ 0 ].input ).toEqual( { } );
				expect( args[ 0 ].success ).toEqual( workspaceService.privateFunctions.someRandomSuccessCallback );
				expect( args[ 0 ][ 401 ] ).toEqual( workspaceService.privateFunctions.displayLogin );
				expect( args[ 0 ][ 497 ] ).toEqual( workspaceService.privateFunctions.someRandomFailureCallback );
				expect( args[ 0 ][ 499 ] ).toEqual( workspaceService.privateFunctions.invalidReference );
				expect( args[ 0 ][ 500 ] ).toEqual( ajaxService.logInternalError );
			} );
		} );

		describe ( 'DeleteDirectory', function () {
			it ( 'Should use private function', function () {
				spyOn( workspaceService.privateFunctions, 'delete' );

				workspaceService.privateFunctions.deleteDirectory();

				expect( workspaceService.privateFunctions.delete ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.delete.calls.first().args;

				expect( args[ 0 ] ).toEqual( './private/?p=files/directories/' );
				expect( args[ 1 ] ).toEqual( workspaceService.privateFunctions.deleteDirectorySuccess );
				expect( args[ 2 ] ).toEqual( workspaceService.privateFunctions.deleteDirectoryFailure );
			} );
		} );

		describe ( 'DeleteDirectoryFailure', function () {
			it ( 'Should use private function', function () {
				spyOn( workspaceService.privateFunctions, 'closeMenuPromptWithError' );

				workspaceService.privateFunctions.deleteDirectoryFailure();

				expect( workspaceService.privateFunctions.closeMenuPromptWithError ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.closeMenuPromptWithError.calls.first().args;

				expect( args[ 0 ] ).toEqual( 'Directory not deleted' );
			} );
		} );

		describe ( 'DeleteDirectorySuccess', function () {
			it ( 'Should use private function', function () {
				spyOn( workspaceService.privateFunctions, 'closeMenuPromptWithSuccess' );

				workspaceService.privateFunctions.deleteDirectorySuccess();

				expect( workspaceService.privateFunctions.closeMenuPromptWithSuccess ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.closeMenuPromptWithSuccess.calls.first().args;

				expect( args[ 0 ] ).toEqual( 'Directory deleted' );
			} );
		} );

		describe ( 'DeleteFile', function () {
			it ( 'Should use private function', function () {
				spyOn( workspaceService.privateFunctions, 'delete' );

				workspaceService.privateFunctions.deleteFile();

				expect( workspaceService.privateFunctions.delete ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.delete.calls.first().args;

				expect( args[ 0 ] ).toEqual( './private/?p=files/' );
				expect( args[ 1 ] ).toEqual( workspaceService.privateFunctions.deleteFileSuccess );
				expect( args[ 2 ] ).toEqual( workspaceService.privateFunctions.deleteFileFailure );
			} );
		} );

		describe ( 'DeleteFileFailure', function () {
			it ( 'Should use private function', function () {
				spyOn( workspaceService.privateFunctions, 'closeMenuPromptWithError' );

				workspaceService.privateFunctions.deleteFileFailure();

				expect( workspaceService.privateFunctions.closeMenuPromptWithError ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.closeMenuPromptWithError.calls.first().args;

				expect( args[ 0 ] ).toEqual( 'File not deleted' );
			} );
		} );

		describe ( 'DeleteFileSuccess', function () {
			it ( 'Should use private function', function () {
				spyOn( workspaceService.privateFunctions, 'closeMenuPromptWithSuccess' );

				workspaceService.privateFunctions.deleteFileSuccess();

				expect( workspaceService.privateFunctions.closeMenuPromptWithSuccess ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.closeMenuPromptWithSuccess.calls.first().args;

				expect( args[ 0 ] ).toEqual( 'File deleted' );
			} );
		} );

		describe ( 'DisplayDeleteDirectory', function () {
			it ( 'Should use private function', function () {
				var fileTreeArray = [ 'file1', 'file2', 'file3' ];

				spyOn( workspaceService.privateFunctions, 'buildFileTreeArray' ).and.returnValue( fileTreeArray );
				spyOn( workspaceService.privateFunctions, 'buildDeleteDirectory' );
				spyOn( workspaceService.privateFunctions, 'displayStaticResource' );

				workspaceService.privateFunctions.displayDeleteDirectory();

				expect( workspaceService.privateFunctions.displayStaticResource ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.displayStaticResource.calls.first().args;

				expect( args[ 0 ] ).toEqual( './public/views/deleteDirectory.view' );

				var successCallback = args[ 1 ];

				expect( workspaceService.privateFunctions.buildDeleteDirectory ).not.toHaveBeenCalled();
				successCallback( 'some data' );
				expect( workspaceService.privateFunctions.buildDeleteDirectory ).toHaveBeenCalled();

				args = workspaceService.privateFunctions.buildDeleteDirectory.calls.first().args;

				expect( args[ 0 ] ).toEqual( 'some data' );
				expect( args[ 1 ] ).toEqual( fileTreeArray );
			} );
		} );

		describe ( 'DisplayDeleteFile', function () {
			it ( 'Should use private function', function () {
				var fileTreeArray = [ 'file1', 'file2', 'file3' ];

				spyOn( workspaceService.privateFunctions, 'buildFileTreeArray' ).and.returnValue( fileTreeArray );
				spyOn( workspaceService.privateFunctions, 'buildDeleteFile' );
				spyOn( workspaceService.privateFunctions, 'displayStaticResource' );

				workspaceService.privateFunctions.displayDeleteFile();

				expect( workspaceService.privateFunctions.displayStaticResource ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.displayStaticResource.calls.first().args;

				expect( args[ 0 ] ).toEqual( './public/views/deleteFile.view' );

				var successCallback = args[ 1 ];

				expect( workspaceService.privateFunctions.buildDeleteFile ).not.toHaveBeenCalled();
				successCallback( 'some data' );
				expect( workspaceService.privateFunctions.buildDeleteFile ).toHaveBeenCalled();

				args = workspaceService.privateFunctions.buildDeleteFile.calls.first().args;

				expect( args[ 0 ] ).toEqual( 'some data' );
				expect( args[ 1 ] ).toEqual( fileTreeArray );
			} );
		} );

		describe ( 'DisplayEditFile', function () {
			it ( 'Should use private function with derived fileTree', function () {
				var fileTreeArray = [ 'dir1', 'dir2' ];

				spyOn( workspaceService.privateFunctions, 'buildFileTreeArray' ).and.returnValue( fileTreeArray );
				spyOn( workspaceService.privateFunctions, 'displayStaticResource' );
				spyOn( workspaceService.privateFunctions, 'buildEditFile' );

				workspaceService.privateFunctions.displayEditFile();

				expect( workspaceService.privateFunctions.displayStaticResource ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.displayStaticResource.calls.first().args;

				expect( args[ 0 ] ).toEqual( './public/views/editFile.view' );

				args = args[ 1 ];

				expect( workspaceService.privateFunctions.buildEditFile ).not.toHaveBeenCalled();
				args();
				expect( workspaceService.privateFunctions.buildEditFile ).toHaveBeenCalled();

				args = workspaceService.privateFunctions.buildEditFile.calls.first().args;

				expect( args[ 1 ] ).toEqual( fileTreeArray );
			} );

			it ( 'Should use private function with provided derived fileTree', function () {
				var fileTreeArray = [ 'dir1', 'dir2' ];

				spyOn( workspaceService.privateFunctions, 'buildFileTreeArray' ).and.returnValue( fileTreeArray );
				spyOn( workspaceService.privateFunctions, 'displayStaticResource' );
				spyOn( workspaceService.privateFunctions, 'buildEditFile' );

				workspaceService.privateFunctions.displayEditFile( null, fileTreeArray );

				expect( workspaceService.privateFunctions.buildFileTreeArray ).not.toHaveBeenCalled();
				expect( workspaceService.privateFunctions.displayStaticResource ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.displayStaticResource.calls.first().args;

				expect( args[ 0 ] ).toEqual( './public/views/editFile.view' );

				args = args[ 1 ];

				expect( workspaceService.privateFunctions.buildEditFile ).not.toHaveBeenCalled();
				args();
				expect( workspaceService.privateFunctions.buildEditFile ).toHaveBeenCalled();

				args = workspaceService.privateFunctions.buildEditFile.calls.first().args;

				expect( args[ 1 ] ).toEqual( fileTreeArray );
			} );
		} );

		describe ( 'DisplayFileInDirectory', function () {
			beforeEach ( function () {
				spyOn( workspaceService.privateFunctions, 'displayEditFile' );
				spyOn( workspaceService.privateFunctions, 'displayRenameFile' );
				spyOn( workspaceService.privateFunctions, 'displayDeleteFile' );
				spyOn( workspaceService.privateFunctions, 'displayMoveUpFile' );
				spyOn( workspaceService.privateFunctions, 'displayMoveDownFile' );

				$ul = $( '<ul>' );
				$expectedMenu = $( [
					'<ul>'
						, '<li class="menu-item">'
							, '<i class="fa fa-file file"></i>'
							, '<span class="file-name">fileForSale</span>'
							, '<i class="fa fa-pencil edit edit-file" title="Edit"></i>'
							, '<i class="fa fa-pencil-square-o rename rename-file" title="Rename"></i>'
							, '<i class="fa fa-level-up move move-up-file" title="Move Up"></i>'
							, '<i class="fa fa-level-down move move-down-file" title="Move Down"></i>'
							, '<i class="fa fa-times delete delete-file" title="Delete"></i>'
						, '</li>'
					, '</ul>'
				].join( '' ) );
			});

			it ( 'Should add file to directory listing', function () {
				workspaceService.privateFunctions.displayFileInDirectory( 'fileForSale', $ul );

				expect( $ul.html() ).toEqual( $expectedMenu.html() );

				expect( workspaceService.privateFunctions.displayRenameFile ).not.toHaveBeenCalled();
				$ul.find( '.rename-file' ).trigger( 'click' );
				expect( workspaceService.privateFunctions.displayRenameFile ).toHaveBeenCalled();

				expect( workspaceService.privateFunctions.displayDeleteFile ).not.toHaveBeenCalled();
				$ul.find( '.delete-file' ).trigger( 'click' );
				expect( workspaceService.privateFunctions.displayDeleteFile ).toHaveBeenCalled();

				expect( workspaceService.privateFunctions.displayMoveUpFile ).not.toHaveBeenCalled();
				$ul.find( '.move-up-file' ).trigger( 'click' );
				expect( workspaceService.privateFunctions.displayMoveUpFile ).toHaveBeenCalled();

				expect( workspaceService.privateFunctions.displayMoveDownFile ).not.toHaveBeenCalled();
				$ul.find( '.move-down-file' ).trigger( 'click' );
				expect( workspaceService.privateFunctions.displayMoveDownFile ).toHaveBeenCalled();

				expect( workspaceService.privateFunctions.displayEditFile ).not.toHaveBeenCalled();
				$ul.find( '.edit-file' ).trigger( 'click' );
				expect( workspaceService.privateFunctions.displayEditFile ).toHaveBeenCalled();
			} );

			it ( 'Should add file to directory listing without move up icon', function () {
				$ul.addClass( 'root-list' );
				$expectedMenu.find( '.move-up-file' ).remove();

				workspaceService.privateFunctions.displayFileInDirectory( 'fileForSale', $ul );

				expect( $ul.html() ).toEqual( $expectedMenu.html() );
			} );
		} );

		describe ( 'DisplayFilesInDirectory', function () {
			it ( 'Should process directories and files', function () {
				spyOn( workspaceService.privateFunctions, 'displaySubdirectory' );
				spyOn( workspaceService.privateFunctions, 'displayFileInDirectory' );

				var $directory = $( '<ul>' );
				var $files = {
					'0': 'file1.html'
					, 'directory1': { '0': 'file1.1.html' }
					, '1': 'file2.html'
					, 'directory2': { '0': 'file2.1.html' }
				}

				workspaceService.privateFunctions.displayFilesInDirectory( $directory, $files );

				expect( workspaceService.privateFunctions.displaySubdirectory ).toHaveBeenCalled();
				expect( workspaceService.privateFunctions.displayFileInDirectory ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.displaySubdirectory.calls.first().args;
				expect( args[ 0 ] ).toEqual( 'directory1' );
				expect( args[ 1 ] ).toEqual( $directory );
				expect( args[ 2 ] ).toEqual( $files[ 'directory1' ] );

				args = workspaceService.privateFunctions.displaySubdirectory.calls.argsFor( 1 );
				expect( args[ 0 ] ).toEqual( 'directory2' );
				expect( args[ 1 ] ).toEqual( $directory );
				expect( args[ 2 ] ).toEqual( $files[ 'directory2' ] );

				args = workspaceService.privateFunctions.displayFileInDirectory.calls.first().args;
				expect( args[ 0 ] ).toEqual( 'file1.html' );
				expect( args[ 1 ] ).toEqual( $directory );

				args = workspaceService.privateFunctions.displayFileInDirectory.calls.argsFor( 1 );
				expect( args[ 0 ] ).toEqual( 'file2.html' );
				expect( args[ 1 ] ).toEqual( $directory );
			} );
		} );

		describe ( 'DisplayFilesystem', function () {
			it ( 'Should call GET to retreive directory structure', function () {
				spyOn( ajaxService, 'GET' );

				workspaceService.privateFunctions.displayFilesystem();

				expect( ajaxService.GET ).toHaveBeenCalled();

				var args = ajaxService.GET.calls.first().args;

				expect( args[ 0 ].url ).toEqual( './private/?p=files' );
				expect( args[ 0 ].success ).toEqual( workspaceService.privateFunctions.buildFilesystem );
				expect( args[ 0 ][ 401 ] ).toEqual( sessionService.displayLogin );
				expect( args[ 0 ][ 500 ] ).toEqual( loggingService.logInternalError );
			} );
		} );

		describe ( 'DisplayMenu', function () {
			it( 'Should use private function', function () {
				spyOn( workspaceService.privateFunctions, 'displayStaticResource' );

				workspaceService.privateFunctions.displayMenu();

				expect( workspaceService.privateFunctions.displayStaticResource ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.displayStaticResource.calls.first().args;

				expect( args[ 0 ] ).toEqual( './public/views/menu.view' );
				expect( args[ 1 ] ).toEqual( workspaceService.privateFunctions.buildMenu );
			} );
		} );

		describe ( 'DisplayMoveDownDirectory', function () {
			it ( 'Should use private function', function () {
				var fileTreeArray = [ 'file1', 'file2', 'file3' ];

				spyOn( workspaceService.privateFunctions, 'buildFileTreeArray' ).and.returnValue( fileTreeArray );
				spyOn( workspaceService.privateFunctions, 'buildMoveDownDirectory' );
				spyOn( workspaceService.privateFunctions, 'displayStaticResource' );

				var $item = $( '<div>' );
				$item.click( workspaceService.privateFunctions.displayMoveDownDirectory );

				$item.trigger( 'click' );

				expect( workspaceService.privateFunctions.displayStaticResource ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.displayStaticResource.calls.first().args;

				expect( args[ 0 ] ).toEqual( './public/views/moveDownDirectory.view' );

				var successCallback = args[ 1 ];

				expect( workspaceService.privateFunctions.buildMoveDownDirectory ).not.toHaveBeenCalled();
				successCallback( 'some data' );
				expect( workspaceService.privateFunctions.buildMoveDownDirectory ).toHaveBeenCalled();

				args = workspaceService.privateFunctions.buildMoveDownDirectory.calls.first().args;

				expect( args[ 0 ] ).toEqual( 'some data' );
				expect( args[ 1 ] ).toEqual( fileTreeArray );
				expect( args[ 2 ][ 0 ] ).toEqual( $item[ 0 ] );
			} );
		} );

		describe ( 'DisplayMoveDownFile', function () {
			it ( 'Should use private function', function () {
				var fileTreeArray = [ 'file1', 'file2', 'file3' ];

				spyOn( workspaceService.privateFunctions, 'buildFileTreeArray' ).and.returnValue( fileTreeArray );
				spyOn( workspaceService.privateFunctions, 'buildMoveDownFile' );
				spyOn( workspaceService.privateFunctions, 'displayStaticResource' );

				var $item = $( '<div>' );
				$item.click( workspaceService.privateFunctions.displayMoveDownFile );

				$item.trigger( 'click' );

				expect( workspaceService.privateFunctions.displayStaticResource ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.displayStaticResource.calls.first().args;

				expect( args[ 0 ] ).toEqual( './public/views/moveDownFile.view' );

				var successCallback = args[ 1 ];

				expect( workspaceService.privateFunctions.buildMoveDownFile ).not.toHaveBeenCalled();
				successCallback( 'some data' );
				expect( workspaceService.privateFunctions.buildMoveDownFile ).toHaveBeenCalled();

				args = workspaceService.privateFunctions.buildMoveDownFile.calls.first().args;

				expect( args[ 0 ] ).toEqual( 'some data' );
				expect( args[ 1 ] ).toEqual( fileTreeArray );
				expect( args[ 2 ][ 0 ] ).toEqual( $item[ 0 ] );
			} );
		} );

		describe ( 'DisplayMoveUpDirectory', function () {
			it ( 'Should use private function', function () {
				var fileTreeArray = [ 'file1', 'file2', 'file3' ];

				spyOn( workspaceService.privateFunctions, 'buildFileTreeArray' ).and.returnValue( fileTreeArray );
				spyOn( workspaceService.privateFunctions, 'buildMoveUpDirectory' );
				spyOn( workspaceService.privateFunctions, 'displayStaticResource' );

				workspaceService.privateFunctions.displayMoveUpDirectory();

				expect( workspaceService.privateFunctions.displayStaticResource ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.displayStaticResource.calls.first().args;

				expect( args[ 0 ] ).toEqual( './public/views/moveUpDirectory.view' );

				var successCallback = args[ 1 ];

				expect( workspaceService.privateFunctions.buildMoveUpDirectory ).not.toHaveBeenCalled();
				successCallback( 'some data' );
				expect( workspaceService.privateFunctions.buildMoveUpDirectory ).toHaveBeenCalled();

				args = workspaceService.privateFunctions.buildMoveUpDirectory.calls.first().args;

				expect( args[ 0 ] ).toEqual( 'some data' );
				expect( args[ 1 ] ).toEqual( fileTreeArray );
			} );
		} );

		describe ( 'DisplayMoveUpFile', function () {
			it ( 'Should use private function', function () {
				var fileTreeArray = [ 'file1', 'file2', 'file3' ];

				spyOn( workspaceService.privateFunctions, 'buildFileTreeArray' ).and.returnValue( fileTreeArray );
				spyOn( workspaceService.privateFunctions, 'buildMoveUpFile' );
				spyOn( workspaceService.privateFunctions, 'displayStaticResource' );

				workspaceService.privateFunctions.displayMoveUpFile();

				expect( workspaceService.privateFunctions.displayStaticResource ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.displayStaticResource.calls.first().args;

				expect( args[ 0 ] ).toEqual( './public/views/moveUpFile.view' );

				var successCallback = args[ 1 ];

				expect( workspaceService.privateFunctions.buildMoveUpFile ).not.toHaveBeenCalled();
				successCallback( 'some data' );
				expect( workspaceService.privateFunctions.buildMoveUpFile ).toHaveBeenCalled();

				args = workspaceService.privateFunctions.buildMoveUpFile.calls.first().args;

				expect( args[ 0 ] ).toEqual( 'some data' );
				expect( args[ 1 ] ).toEqual( fileTreeArray );
			} );
		} );

		describe ( 'DisplayNewDirectory', function () {
			it ( 'Should use private function', function () {
				var fileTreeArray = [ 'file1', 'file2', 'file3' ];

				spyOn( workspaceService.privateFunctions, 'buildFileTreeArray' ).and.returnValue( fileTreeArray );
				spyOn( workspaceService.privateFunctions, 'buildNewDirectory' );
				spyOn( workspaceService.privateFunctions, 'displayStaticResource' );

				workspaceService.privateFunctions.displayNewDirectory();

				expect( workspaceService.privateFunctions.displayStaticResource ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.displayStaticResource.calls.first().args;

				expect( args[ 0 ] ).toEqual( './public/views/newDirectory.view' );

				var successCallback = args[ 1 ];

				expect( workspaceService.privateFunctions.buildNewDirectory ).not.toHaveBeenCalled();
				successCallback( 'some data' );
				expect( workspaceService.privateFunctions.buildNewDirectory ).toHaveBeenCalled();

				args = workspaceService.privateFunctions.buildNewDirectory.calls.first().args;

				expect( args[ 0 ] ).toEqual( 'some data' );
				expect( args[ 1 ] ).toEqual( fileTreeArray );
			} );
		} );

		describe ( 'DisplayNewFile', function () {
			it ( 'Should use private function', function () {
				var fileTreeArray = [ 'file1', 'file2', 'file3' ];

				spyOn( workspaceService.privateFunctions, 'buildFileTreeArray' ).and.returnValue( fileTreeArray );
				spyOn( workspaceService.privateFunctions, 'buildNewFile' );
				spyOn( workspaceService.privateFunctions, 'displayStaticResource' );

				workspaceService.privateFunctions.displayNewFile();

				expect( workspaceService.privateFunctions.displayStaticResource ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.displayStaticResource.calls.first().args;

				expect( args[ 0 ] ).toEqual( './public/views/newFile.view' );

				var successCallback = args[ 1 ];

				expect( workspaceService.privateFunctions.buildNewFile ).not.toHaveBeenCalled();
				successCallback( 'some data' );
				expect( workspaceService.privateFunctions.buildNewFile ).toHaveBeenCalled();

				args = workspaceService.privateFunctions.buildNewFile.calls.first().args;

				expect( args[ 0 ] ).toEqual( 'some data' );
				expect( args[ 1 ] ).toEqual( fileTreeArray );
			} );
		} );

		describe ( 'DisplayRename', function () {
			it ( 'Should use private function', function () {
				var fileTreeArray = [ 'file1', 'file2', 'file3' ];

				workspaceService.privateFunctions.someRandomConfirmationCallback = function () {};

				spyOn( workspaceService.privateFunctions, 'someRandomConfirmationCallback' );
				spyOn( workspaceService.privateFunctions, 'displayStaticResource' );

				workspaceService.privateFunctions.displayRename( 'some url'
					, fileTreeArray
					, workspaceService.privateFunctions.someRandomConfirmationCallback );

				expect( workspaceService.privateFunctions.displayStaticResource ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.displayStaticResource.calls.first().args;

				expect( args[ 0 ] ).toEqual( 'some url' );

				var successCallback = args[ 1 ];

				expect( workspaceService.privateFunctions.someRandomConfirmationCallback ).not.toHaveBeenCalled();
				successCallback( 'some data' );
				expect( workspaceService.privateFunctions.someRandomConfirmationCallback ).toHaveBeenCalled();

				args = workspaceService.privateFunctions.someRandomConfirmationCallback.calls.first().args;

				expect( args[ 0 ] ).toEqual( 'some data' );
				expect( args[ 1 ] ).toEqual( fileTreeArray );
			} );
		} );

		describe ( 'DisplayRenameDirectory', function () {
			it ( 'Should use private function', function () {
				var fileTreeArray = [ 'dir1', 'dir2' ];

				spyOn( workspaceService.privateFunctions, 'buildFileTreeArray' ).and.returnValue( fileTreeArray );
				spyOn( workspaceService.privateFunctions, 'displayRename' );

				workspaceService.privateFunctions.displayRenameDirectory();

				expect( workspaceService.privateFunctions.displayRename ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.displayRename.calls.first().args;

				expect( args[ 0 ] ).toEqual( './public/views/renameDirectory.view' );
				expect( args[ 1 ] ).toEqual( fileTreeArray );
				expect( args[ 2 ] ).toEqual( workspaceService.privateFunctions.buildRenameDirectory );
			} );
		} );

		describe ( 'DisplayRenameFile', function () {
			it ( 'Should use private function', function () {
				var fileTreeArray = [ 'dir1', 'dir2' ];

				spyOn( workspaceService.privateFunctions, 'buildFileTreeArray' ).and.returnValue( fileTreeArray );
				spyOn( workspaceService.privateFunctions, 'displayRename' );

				workspaceService.privateFunctions.displayRenameFile();

				expect( workspaceService.privateFunctions.displayRename ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.displayRename.calls.first().args;

				expect( args[ 0 ] ).toEqual( './public/views/renameFile.view' );
				expect( args[ 1 ] ).toEqual( fileTreeArray );
				expect( args[ 2 ] ).toEqual( workspaceService.privateFunctions.buildRenameFile );
			} );
		} );

		describe ( 'DisplayStaticResource', function () {
			it ( 'Should call GET to retrieve resource', function () {
				spyOn( ajaxService, 'GET' );

				var successCallback = function () {};
				var url = 'some url';

				workspaceService.privateFunctions.displayStaticResource( url, successCallback );

				expect( ajaxService.GET ).toHaveBeenCalled();

				var args = ajaxService.GET.calls.first().args;

				expect( args[ 0 ].url ).toEqual( url );
				expect( args[ 0 ].success ).toEqual( successCallback );
				expect( args[ 0 ][ 401 ] ).toEqual( sessionService.displayLogin );
				expect( args[ 0 ][ 404 ] ).toEqual( loggingService.logNotFound );
				expect( args[ 0 ][ 500 ] ).toEqual( loggingService.logInternalError );
			} );
		} );

		describe ( 'DisplaySubdirectory', function () {
			beforeEach ( function () {
				spyOn( workspaceService.privateFunctions, 'displayFilesInDirectory' );
				spyOn( workspaceService.privateFunctions, 'displayNewDirectory' );
				spyOn( workspaceService.privateFunctions, 'displayDeleteDirectory' );
				spyOn( workspaceService.privateFunctions, 'displayRenameDirectory' );
				spyOn( workspaceService.privateFunctions, 'displayMoveDownDirectory' );
				spyOn( workspaceService.privateFunctions, 'displayMoveUpDirectory' );
				spyOn( workspaceService.privateFunctions, 'displayNewFile' );
				spyOn( workspaceService.privateFunctions, 'displayUploadFile' );

				$ul = $( '<ul>' );
				$subfiles = { 'file': 'blah' };

				$expectedMenu = $( [
					'<ul>'
						, '<li class="menu-item">'
							, '<i class="fa fa-folder folder subdirectory"></i>'
							, '<span class="file-name">directoryForPurchase</span>'
							, '<i class="fa fa-pencil-square-o rename rename-directory" title="Rename"></i>'
							, '<span class="new-directory" title="New Directory">'
								, '<i class="fa fa-folder folder"></i>'
								, '<i class="fa fa-plus plus"></i>'
							, '</span>'
							, '<span class="new-file" title="New File">'
								, '<i class="fa fa-file file"></i>'
								, '<i class="fa fa-plus plus"></i>'
							, '</span>'
							, '<i class="fa fa-upload upload" title="Upload File"></i>'
							, '<i class="fa fa-level-up move move-up-directory" title="Move Up"></i>'
							, '<i class="fa fa-level-down move move-down-directory" title="Move Down"></i>'
							, '<i class="fa fa-times delete delete-directory" title="Delete"></i>'
							, '<ul></ul>'
						, '</li>'
					, '</ul>'
				].join( '' ) );
			} );

			it ( 'Should add directory to directory listing', function () {
				workspaceService.privateFunctions.displaySubdirectory( 'directoryForPurchase', $ul, $subfiles );

				expect( $ul.html() ).toEqual( $expectedMenu.html() );

				expect( workspaceService.privateFunctions.displayFilesInDirectory ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.displayFilesInDirectory.calls.first().args;

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

				expect( workspaceService.privateFunctions.displayMoveUpDirectory ).not.toHaveBeenCalled();
				$ul.find( '.move-up-directory' ).trigger( 'click' );
				expect( workspaceService.privateFunctions.displayMoveUpDirectory ).toHaveBeenCalled();

				expect( workspaceService.privateFunctions.displayMoveDownDirectory ).not.toHaveBeenCalled();
				$ul.find( '.move-down-directory' ).trigger( 'click' );
				expect( workspaceService.privateFunctions.displayMoveDownDirectory ).toHaveBeenCalled();

				expect( workspaceService.privateFunctions.displayUploadFile ).not.toHaveBeenCalled();
				$ul.find( '.upload' ).trigger( 'click' );
				expect( workspaceService.privateFunctions.displayUploadFile ).toHaveBeenCalled();
			} );

			it ( 'Should not add move up directory icon if parent is root', function () {
				$ul.addClass( 'root-list' );
				$expectedMenu.find( '.move-up-directory' ).remove();

				workspaceService.privateFunctions.displaySubdirectory( 'directoryForPurchase', $ul, $subfiles );

				expect( $ul.html() ).toEqual( $expectedMenu.html() );
			} );
		} );

		describe ( 'DisplayUploadFile', function () {
			it ( 'Should use private function', function () {
				var fileTreeArray = [ 'file1', 'file2', 'file3' ];

				spyOn( workspaceService.privateFunctions, 'buildFileTreeArray' ).and.returnValue( fileTreeArray );
				spyOn( workspaceService.privateFunctions, 'buildUploadFile' );
				spyOn( workspaceService.privateFunctions, 'displayStaticResource' );

				workspaceService.privateFunctions.displayUploadFile();

				expect( workspaceService.privateFunctions.displayStaticResource ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.displayStaticResource.calls.first().args;

				expect( args[ 0 ] ).toEqual( './public/views/uploadFile.view' );

				var successCallback = args[ 1 ];

				expect( workspaceService.privateFunctions.buildUploadFile ).not.toHaveBeenCalled();
				successCallback( 'some data' );
				expect( workspaceService.privateFunctions.buildUploadFile ).toHaveBeenCalled();

				args = workspaceService.privateFunctions.buildUploadFile.calls.first().args;

				expect( args[ 0 ] ).toEqual( 'some data' );
				expect( args[ 1 ] ).toEqual( fileTreeArray );
			} );
		} );

		describe ( 'FilterMenu', function () {
			var menuData = [
				'<div class="menu">'
					,'<div class="search-container">'
						,'<div class="search">'
							,'<i class="icon"></i>'
						,'</div>'
						,'<div class="pattern-container"></div>'
						,'<input type="text" class="pattern"></div>'
					,'</div>'
					,'<div class="content-container">'
						,'<ul class="content">'
							,'<li class="root menu-item">'
								,'<i class="folder"></i>'
								,'<span class="file-name">root</span>'
								,'<span class="new-directory">'
									,'<i class="folder"></i>'
									,'<i class="plus"></i>'
								,'</span>'
								,'<ul></ul>'
							,'</li>'
						,'</ul>'
					,'</div>'
					,'<div class="control-container"><i class="close"></i></div>'
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
				spyOn( workspaceService.privateFunctions, 'removeMoveDown' );

				workspaceService.privateFunctions.buildMenu( menuData.join( '' ) );
				workspaceService.privateFunctions.buildFilesystem( JSON.stringify( fileData ) );

				$liElements = $container.find( '.content .file-name' ).parent().filter( ':not(.root)' )
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
			it ( 'Should use private function', function () {
				spyOn( workspaceService.privateFunctions, 'closeMenuPromptWithError' );

				workspaceService.privateFunctions.invalidReference();

				expect( workspaceService.privateFunctions.closeMenuPromptWithError ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.closeMenuPromptWithError.calls.first().args;

				expect( args[ 0 ] ).toEqual( 'Parent directory no longer exists or has restricted access' );
			} );
		} );

		describe ( 'MoveDownDirectory', function () {
			it ( 'Should submit PUT request', function () {
				var $prompt = $( [
					'<div class="prompt-container">'
						, '<div class="content-container>'
							, '<div class="input">'
								, '<select id="newdirectory">'
									, '<option value="subdir" selected="selected">subdir</option>'
								,'</select>'
							, '</div>'
						, '</div>'
					, '</div>'
				].join( '' ) );
				var fileTree = [ 'dir1', 'dir2', 'dir777' ];

				$prompt.prop( 'fileTree', fileTree );
				$prompt.appendTo( $container );

				spyOn( ajaxService, 'PUT' );

				workspaceService.privateFunctions.moveDownDirectory();

				expect( ajaxService.PUT ).toHaveBeenCalled();

				var args = ajaxService.PUT.calls.first().args[ 0 ];

				expect( args.url ).toEqual( './private/?p=files/directories/dir1/dir2/dir777' );
				expect( args.contentType ).toEqual( 'json' );
				expect( args.input ).toEqual( JSON.stringify( {
					action: 'shiftdown'
					, name: 'subdir'
				} ) );
				expect( args.success ).toEqual( workspaceService.privateFunctions.moveDownDirectorySuccess );
				expect( args[ 401 ] ).toEqual( workspaceService.privateFunctions.displayLogin );
				expect( args[ 498 ] ).toEqual( workspaceService.privateFunctions.moveDownDirectoryFailure );
				expect( args[ 499 ] ).toEqual( workspaceService.privateFunctions.invalidReference );
				expect( args[ 500 ] ).toEqual( ajaxService.logInternalError );
			} );
		} );

		describe ( 'MoveDownDirectoryFailure', function () {
			it ( 'Should use private function', function () {
				spyOn( workspaceService.privateFunctions, 'closeMenuPromptWithError' );

				workspaceService.privateFunctions.moveDownDirectoryFailure();

				expect( workspaceService.privateFunctions.closeMenuPromptWithError ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.closeMenuPromptWithError.calls.first().args;

				expect( args[ 0 ] ).toEqual( 'Directory not moved' );
			} );
		} );

		describe ( 'MoveDownDirectorySuccess', function () {
			it ( 'Should use private function', function () {
				spyOn( workspaceService.privateFunctions, 'closeMenuPromptWithSuccess' );

				workspaceService.privateFunctions.moveDownDirectorySuccess();

				expect( workspaceService.privateFunctions.closeMenuPromptWithSuccess ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.closeMenuPromptWithSuccess.calls.first().args;

				expect( args[ 0 ] ).toEqual( 'Directory moved' );
			} );
		} );

		describe ( 'MoveDownFile', function () {
			it ( 'Should submit PUT request', function () {
				var $prompt = $( [
					'<div class="prompt-container">'
						, '<div class="content-container>'
							, '<div class="input">'
								, '<select id="newdirectory">'
									, '<option value="subdir" selected="selected">subdir</option>'
								,'</select>'
							, '</div>'
						, '</div>'
					, '</div>'
				].join( '' ) );
				var fileTree = [ 'dir1', 'dir2', 'dir777' ];

				$prompt.prop( 'fileTree', fileTree );
				$prompt.appendTo( $container );

				spyOn( ajaxService, 'PUT' );

				workspaceService.privateFunctions.moveDownFile();

				expect( ajaxService.PUT ).toHaveBeenCalled();

				var args = ajaxService.PUT.calls.first().args[ 0 ];

				expect( args.url ).toEqual( './private/?p=files/dir1/dir2/dir777' );
				expect( args.contentType ).toEqual( 'json' );
				expect( args.input ).toEqual( JSON.stringify( {
					action: 'shiftdown'
					, name: 'subdir'
				} ) );
				expect( args.success ).toEqual( workspaceService.privateFunctions.moveDownFileSuccess );
				expect( args[ 401 ] ).toEqual( workspaceService.privateFunctions.displayLogin );
				expect( args[ 498 ] ).toEqual( workspaceService.privateFunctions.moveDownFileFailure );
				expect( args[ 499 ] ).toEqual( workspaceService.privateFunctions.invalidReference );
				expect( args[ 500 ] ).toEqual( ajaxService.logInternalError );
			} );
		} );

		describe ( 'MoveDownFileFailure', function () {
			it ( 'Should use private function', function () {
				spyOn( workspaceService.privateFunctions, 'closeMenuPromptWithError' );

				workspaceService.privateFunctions.moveDownFileFailure();

				expect( workspaceService.privateFunctions.closeMenuPromptWithError ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.closeMenuPromptWithError.calls.first().args;

				expect( args[ 0 ] ).toEqual( 'File not moved' );
			} );
		} );

		describe ( 'MoveDownFileSuccess', function () {
			it ( 'Should use private function', function () {
				spyOn( workspaceService.privateFunctions, 'closeMenuPromptWithSuccess' );

				workspaceService.privateFunctions.moveDownFileSuccess();

				expect( workspaceService.privateFunctions.closeMenuPromptWithSuccess ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.closeMenuPromptWithSuccess.calls.first().args;

				expect( args[ 0 ] ).toEqual( 'File moved' );
			} );
		} );

		describe ( 'MoveUpDirectory', function () {
			it ( 'Should submit PUT request', function () {
				var $prompt = $( '<div class="prompt-container"></div>' );
				var fileTree = [ 'dir1', 'dir2', 'dir777' ];

				$prompt.prop( 'fileTree', fileTree );
				$prompt.appendTo( $container );

				spyOn( ajaxService, 'PUT' );

				workspaceService.privateFunctions.moveUpDirectory();

				expect( ajaxService.PUT ).toHaveBeenCalled();

				var args = ajaxService.PUT.calls.first().args[ 0 ];

				expect( args.url ).toEqual( './private/?p=files/directories/dir1/dir2/dir777' );
				expect( args.contentType ).toEqual( 'json' );
				expect( args.input ).toEqual( JSON.stringify( { action: 'shiftup' } ) );
				expect( args.success ).toEqual( workspaceService.privateFunctions.moveUpDirectorySuccess );
				expect( args[ 401 ] ).toEqual( workspaceService.privateFunctions.displayLogin );
				expect( args[ 498 ] ).toEqual( workspaceService.privateFunctions.moveUpDirectoryFailure );
				expect( args[ 499 ] ).toEqual( workspaceService.privateFunctions.invalidReference );
				expect( args[ 500 ] ).toEqual( ajaxService.logInternalError );
			} );
		} );

		describe ( 'MoveUpDirectoryFailure', function () {
			it ( 'Should use private function', function () {
				spyOn( workspaceService.privateFunctions, 'closeMenuPromptWithError' );

				workspaceService.privateFunctions.moveUpDirectoryFailure();

				expect( workspaceService.privateFunctions.closeMenuPromptWithError ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.closeMenuPromptWithError.calls.first().args;

				expect( args[ 0 ] ).toEqual( 'Directory not moved' );
			} );
		} );

		describe ( 'MoveUpDirectorySuccess', function () {
			it ( 'Should use private function', function () {
				spyOn( workspaceService.privateFunctions, 'closeMenuPromptWithSuccess' );

				workspaceService.privateFunctions.moveUpDirectorySuccess();

				expect( workspaceService.privateFunctions.closeMenuPromptWithSuccess ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.closeMenuPromptWithSuccess.calls.first().args;

				expect( args[ 0 ] ).toEqual( 'Directory moved' );
			} );
		} );

		describe ( 'MoveUpFile', function () {
			it ( 'Should submit PUT request', function () {
				var $prompt = $( '<div class="prompt-container"></div>' );
				var fileTree = [ 'dir1', 'dir2', 'dir777' ];

				$prompt.prop( 'fileTree', fileTree );
				$prompt.appendTo( $container );

				spyOn( ajaxService, 'PUT' );

				workspaceService.privateFunctions.moveUpFile();

				expect( ajaxService.PUT ).toHaveBeenCalled();

				var args = ajaxService.PUT.calls.first().args[ 0 ];

				expect( args.url ).toEqual( './private/?p=files/dir1/dir2/dir777' );
				expect( args.contentType ).toEqual( 'json' );
				expect( args.input ).toEqual( JSON.stringify( { action: 'shiftup' } ) );
				expect( args.success ).toEqual( workspaceService.privateFunctions.moveUpFileSuccess );
				expect( args[ 401 ] ).toEqual( workspaceService.privateFunctions.displayLogin );
				expect( args[ 498 ] ).toEqual( workspaceService.privateFunctions.moveUpFileFailure );
				expect( args[ 499 ] ).toEqual( workspaceService.privateFunctions.invalidReference );
				expect( args[ 500 ] ).toEqual( ajaxService.logInternalError );
			} );
		} );

		describe ( 'MoveUpFileFailure', function () {
			it ( 'Should use private function', function () {
				spyOn( workspaceService.privateFunctions, 'closeMenuPromptWithError' );

				workspaceService.privateFunctions.moveUpFileFailure();

				expect( workspaceService.privateFunctions.closeMenuPromptWithError ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.closeMenuPromptWithError.calls.first().args;

				expect( args[ 0 ] ).toEqual( 'File not moved' );
			} );
		} );

		describe ( 'MoveUpFileSuccess', function () {
			it ( 'Should use private function', function () {
				spyOn( workspaceService.privateFunctions, 'closeMenuPromptWithSuccess' );

				workspaceService.privateFunctions.moveUpFileSuccess();

				expect( workspaceService.privateFunctions.closeMenuPromptWithSuccess ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.closeMenuPromptWithSuccess.calls.first().args;

				expect( args[ 0 ] ).toEqual( 'File moved' );
			} );
		} );

		describe ( 'NewDirectoryFailure', function () {
			it ( 'Should display error message', function () {
				spyOn( loggingService, 'displayError' );

				workspaceService.privateFunctions.newDirectoryFailure();

				expect( loggingService.displayError ).toHaveBeenCalled();

				var args = loggingService.displayError.calls.first().args;

				expect( args[ 0 ] ).toEqual( 'New directory already exists or is invalid syntax' );
			} );
		} );

		describe ( 'NewDirectorySuccess', function () {
			it ( 'Should use private function', function () {
				spyOn( workspaceService.privateFunctions, 'closeMenuPromptWithSuccess' );

				workspaceService.privateFunctions.newDirectorySuccess();

				expect( workspaceService.privateFunctions.closeMenuPromptWithSuccess ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.closeMenuPromptWithSuccess.calls.first().args;

				expect( args[ 0 ] ).toEqual( 'Directory created' );
			} );
		} );

		describe ( 'NewFileFailure', function () {
			it ( 'Should display error message', function () {
				spyOn( loggingService, 'displayError' );

				workspaceService.privateFunctions.newFileFailure();

				expect( loggingService.displayError ).toHaveBeenCalled();

				var args = loggingService.displayError.calls.first().args;

				expect( args[ 0 ] ).toEqual( 'New file already exists or is invalid syntax' );
			} );
		} );

		describe ( 'NewFileSuccess', function () {
			it ( 'Should use private function', function () {
				var $fragment = $( [
					'<div class="prompt-container">'
						, '<input type="text" id="newfile" value="whatsUpWith.dat"></input>'
					, '</div>'
				].join( '' ) );
				var fileTreeArray = [ 'dir1', 'dir2' ];

				$fragment.prop( 'fileTree', fileTreeArray );
				$fragment.appendTo( $container );

				spyOn( workspaceService.privateFunctions, 'closeMenuPromptWithSuccess' );
				spyOn( workspaceService.privateFunctions, 'displayEditFile' );

				workspaceService.privateFunctions.newFileSuccess();

				expect( workspaceService.privateFunctions.closeMenuPromptWithSuccess ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.closeMenuPromptWithSuccess.calls.first().args;

				expect( args[ 0 ] ).toEqual( 'File created' );

				expect( workspaceService.privateFunctions.displayEditFile ).toHaveBeenCalled();

				args = workspaceService.privateFunctions.displayEditFile.calls.first().args;

				expect( args[ 0 ] ).toEqual( null );
				expect( args[ 1 ] ).toEqual( fileTreeArray );
			} );
		} );

		describe ( 'RemoveMoveDown', function () {
			it ( 'Should remove the move down icon from menu items without sibling directories', function () {
				var $directory = $( [
					'<ul>'
						, '<li class="menu-item">'
							, '<i class="folder subdirectory"></i>'
							, '<span class="file-name">directory1x</span>'
							, '<i class="move move-up-directory"></i>'
							, '<i class="move move-down-directory"></i>'
							, '<ul>'
								, '<li class="menu-item">'
									, '<i class="folder subdirectory"></i>'
									, '<span class="file-name">directory1.1x</span>'
									, '<i class="move move-up-directory"></i>'
									, '<i class="move move-down-directory"></i>'
									, '<ul>'
										, '<li class="menu-item">'
											, '<i class="folder subdirectory"></i>'
											, '<span class="file-name">directory1.1.1x</span>'
											, '<i class="move move-up-directory"></i>'
											, '<i class="move move-down-directory"></i>'
											, '<ul>'
												, '<li class="menu-item">'
													, '<i class="file"></i>'
													, '<span class="file-name">file1.1.1.1x</span>'
													, '<i class="move move-up-file"></i>'
													, '<i class="move move-down-file"></i>'
												, '</li>'
											, '</ul>'
										, '</li>'
										, '<li class="menu-item">'
											, '<i class="folder subdirectory"></i>'
											, '<span class="file-name">directory1.1.2x</span>'
											, '<i class="move move-up-directory"></i>'
											, '<i class="move move-down-directory"></i>'
											, '<ul>'
												, '<li class="menu-item">'
													, '<i class="file"></i>'
													, '<span class="file-name">file1.1.2.1x</span>'
													, '<i class="move move-up-file"></i>'
													, '<i class="move move-down-file"></i>'
												, '</li>'
											, '</ul>'
										, '</li>'
										, '<li class="menu-item">'
											, '<i class="folder subdirectory"></i>'
											, '<span class="file-name">directory1.1.3x</span>'
											, '<i class="move move-up-directory"></i>'
											, '<i class="move move-down-directory"></i>'
											, '<ul>'
												, '<li class="menu-item">'
													, '<i class="file"></i>'
													, '<span class="file-name">file1.1.3.1x</span>'
													, '<i class="move move-up-file"></i>'
													, '<i class="move move-down-file"></i>'
												, '</li>'
											, '</ul>'
										, '</li>'
										, '<li class="menu-item">'
											, '<i class="file"></i>'
											, '<span class="file-name">file1.1.1x</span>'
											, '<i class="move move-up-file"></i>'
											, '<i class="move move-down-file"></i>'
										, '</li>'
									, '</ul>'
								, '</li>'
								, '<li class="menu-item">'
									, '<i class="file"></i>'
									, '<span class="file-name">file1.1x</span>'
									, '<i class="move move-up-file"></i>'
									, '<i class="move move-down-file"></i>'
								, '</li>'
							, '</ul>'
						, '</li>'
						, '<li class="menu-item">'
							, '<i class="folder subdirectory"></i>'
							, '<span class="file-name">directory2x</span>'
							, '<i class="move move-up-directory"></i>'
							, '<i class="move move-down-directory"></i>'
							, '<ul>'
								, '<li class="menu-item">'
									, '<i class="folder subdirectory"></i>'
									, '<span class="file-name">directory2.1x</span>'
									, '<i class="move move-up-directory"></i>'
									, '<i class="move move-down-directory"></i>'
									, '<ul>'
										, '<li class="menu-item">'
											, '<i class="file"></i>'
											, '<span class="file-name">file2.1.1x</span>'
											, '<i class="move move-up-file"></i>'
											, '<i class="move move-down-file"></i>'
										, '</li>'
									, '</ul>'
								, '</li>'
								, '<li class="menu-item">'
									, '<i class="folder subdirectory"></i>'
									, '<span class="file-name">directory2.2x</span>'
									, '<i class="move move-up-directory"></i>'
									, '<i class="move move-down-directory"></i>'
									, '<ul>'
										, '<li class="menu-item">'
											, '<i class="folder subdirectory"></i>'
											, '<span class="file-name">directory2.2.1x</span>'
											, '<i class="move move-up-directory"></i>'
											, '<i class="move move-down-directory"></i>'
											, '<ul>'
												, '<li class="menu-item">'
													, '<i class="file"></i>'
													, '<span class="file-name">file2.2.1.1x</span>'
													, '<i class="move move-up-file"></i>'
													, '<i class="move move-down-file"></i>'
												, '</li>'
											, '</ul>'
										, '</li>'
										, '<li class="menu-item">'
											, '<i class="file"></i>'
											, '<span class="file-name">file2.2.1x</span>'
											, '<i class="move move-up-file"></i>'
											, '<i class="move move-down-file"></i>'
										, '</li>'
									, '</ul>'
								, '</li>'
								, '<li class="menu-item">'
									, '<i class="file"></i>'
									, '<span class="file-name">file2.1x</span>'
									, '<i class="move move-up-file"></i>'
									, '<i class="move move-down-file"></i>'
								, '</li>'
							, '</ul>'
						, '</li>'
						, '<li class="menu-item">'
							, '<i class="file"></i>'
							, '<span class="file-name">file1x</span>'
							, '<i class="move move-up-file"></i>'
							, '<i class="move move-down-file"></i>'
						, '</li>'
					, '</ul>'
				].join( '' ) );

				workspaceService.privateFunctions.removeMoveDown( $directory );

				var $directories = $directory.find( '.menu-item' );

				expect( $directories.find( '.file-name' ).length ).toEqual( 19 );
				expect( $directories.find( '.file-name:contains("directory1x")' ).parent().find( '> .move-down-directory' ).length ).toEqual( 1 );
				expect( $directories.find( '.file-name:contains("directory1.1x")' ).parent().find( '> .move-down-directory' ).length ).toEqual( 0 );
				expect( $directories.find( '.file-name:contains("directory1.1.1x")' ).parent().find( '> .move-down-directory' ).length ).toEqual( 1 );
				expect( $directories.find( '.file-name:contains("directory1.1.2x")' ).parent().find( '> .move-down-directory' ).length ).toEqual( 1 );
				expect( $directories.find( '.file-name:contains("directory1.1.3x")' ).parent().find( '> .move-down-directory' ).length ).toEqual( 1 );
				expect( $directories.find( '.file-name:contains("directory2x")' ).parent().find( '> .move-down-directory' ).length ).toEqual( 1 );
				expect( $directories.find( '.file-name:contains("directory2.1x")' ).parent().find( '> .move-down-directory' ).length ).toEqual( 1 );
				expect( $directories.find( '.file-name:contains("directory2.2x")' ).parent().find( '> .move-down-directory' ).length ).toEqual( 1 );
				expect( $directories.find( '.file-name:contains("directory2.2.1x")' ).parent().find( '> .move-down-directory' ).length ).toEqual( 0 );

				expect( $directories.find( '.file-name:contains("file1x")' ).parent().find( '> .move-down-file' ).length ).toEqual( 1 );
				expect( $directories.find( '.file-name:contains("file1.1x")' ).parent().find( '> .move-down-file' ).length ).toEqual( 1 );
				expect( $directories.find( '.file-name:contains("file1.1.1x")' ).parent().find( '> .move-down-file' ).length ).toEqual( 1 );
				expect( $directories.find( '.file-name:contains("file1.1.1.1x")' ).parent().find( '> .move-down-file' ).length ).toEqual( 0 );
				expect( $directories.find( '.file-name:contains("file1.1.2.1x")' ).parent().find( '> .move-down-file' ).length ).toEqual( 0 );
				expect( $directories.find( '.file-name:contains("file1.1.3.1x")' ).parent().find( '> .move-down-file' ).length ).toEqual( 0 );
				expect( $directories.find( '.file-name:contains("file2.1x")' ).parent().find( '> .move-down-file' ).length ).toEqual( 1 );
				expect( $directories.find( '.file-name:contains("file2.1.1x")' ).parent().find( '> .move-down-file' ).length ).toEqual( 0 );
				expect( $directories.find( '.file-name:contains("file2.2.1x")' ).parent().find( '> .move-down-file' ).length ).toEqual( 1 );
				expect( $directories.find( '.file-name:contains("file2.2.1.1x")' ).parent().find( '> .move-down-file' ).length ).toEqual( 0 );
			} );
		} );

		describe ( 'RenameDirectoryFailure', function () {
			it ( 'Should display error message', function () {
				spyOn( loggingService, 'displayError' );

				workspaceService.privateFunctions.renameDirectoryFailure();

				expect( loggingService.displayError ).toHaveBeenCalled();

				var args = loggingService.displayError.calls.first().args;

				expect( args[ 0 ] ).toEqual( 'New directory already exists or is invalid syntax' );
			} );
		} );

		describe ( 'RenameDirectorySuccess', function () {
			it ( 'Should use private function', function () {
				spyOn( workspaceService.privateFunctions, 'closeMenuPromptWithSuccess' );

				workspaceService.privateFunctions.renameDirectorySuccess();

				expect( workspaceService.privateFunctions.closeMenuPromptWithSuccess ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.closeMenuPromptWithSuccess.calls.first().args;

				expect( args[ 0 ] ).toEqual( 'Directory renamed' );
			} );
		} );

		describe ( 'RenameFileFailure', function () {
			it ( 'Should display error message', function () {
				spyOn( loggingService, 'displayError' );

				workspaceService.privateFunctions.renameFileFailure();

				expect( loggingService.displayError ).toHaveBeenCalled();

				var args = loggingService.displayError.calls.first().args;

				expect( args[ 0 ] ).toEqual( 'New file already exists or is invalid syntax' );
			} );
		} );

		describe ( 'RenameFileSuccess', function () {
			it ( 'Should use private function', function () {
				spyOn( workspaceService.privateFunctions, 'closeMenuPromptWithSuccess' );

				workspaceService.privateFunctions.renameFileSuccess();

				expect( workspaceService.privateFunctions.closeMenuPromptWithSuccess ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.closeMenuPromptWithSuccess.calls.first().args;

				expect( args[ 0 ] ).toEqual( 'File renamed' );
			} );
		} );

		describe ( 'SubmitNewDirectoryOnEnter', function () {
			it ( 'Should use private function on enter', function () {
				var $prompt = $( '<div class="prompt-container"><input type="text" id="newdirectory"></input></div>' );
				var fileTree = [ 'dir1', 'dir2' ];
				var newDirectoryName = 'dir777';

				$prompt.prop( 'fileTree', fileTree );
				$prompt.find( '#newdirectory' ).val( newDirectoryName );
				$prompt.find( '#newdirectory' ).keyup( workspaceService.privateFunctions.submitNewDirectoryOnEnter );
				$prompt.appendTo( $container );

				spyOn( workspaceService.privateFunctions, 'submitPostOnEnter' );
				spyOn( keyService, 'enter' ).and.returnValue( true );

				$prompt.find( '#newdirectory' ).trigger( 'keyup' );

				expect( workspaceService.privateFunctions.submitPostOnEnter ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.submitPostOnEnter.calls.first().args;

				expect( args[ 1 ] ).toEqual( './private/?p=files/directories/' );
				expect( args[ 2 ] ).toEqual( 'dir1/dir2/dir777' );
				expect( args[ 3 ] ).toEqual( { } );
				expect( args[ 4 ] ).toEqual( workspaceService.privateFunctions.newDirectorySuccess );
				expect( args[ 5 ] ).toEqual( workspaceService.privateFunctions.newDirectoryFailure );
			} );

			it ( 'Should not use private function on non-enter', function () {
				var $prompt = $( '<div class="prompt-container"><input type="text" id="newdirectory"></input></div>' );
				var fileTree = [ 'dir1', 'dir2' ];
				var newDirectoryName = 'dir777';

				$prompt.prop( 'fileTree', fileTree );
				$prompt.find( '#newdirectory' ).val( newDirectoryName );
				$prompt.find( '#newdirectory' ).keyup( workspaceService.privateFunctions.submitNewDirectoryOnEnter );
				$prompt.appendTo( $container );

				spyOn( workspaceService.privateFunctions, 'submitPostOnEnter' );
				spyOn( keyService, 'enter' ).and.returnValue( false );

				$prompt.find( '#newdirectory' ).trigger( 'keyup' );

				expect( workspaceService.privateFunctions.submitPostOnEnter ).not.toHaveBeenCalled();
			} );
		} );

		describe ( 'SubmitNewFileOnEnter', function () {
			it ( 'Should use private function on enter', function () {
				var $prompt = $( '<div class="prompt-container"><input type="text" id="newfile"></input></div>' );
				var fileTree = [ 'dir1', 'dir2' ];
				var newFileName = 'dir777';

				$prompt.prop( 'fileTree', fileTree );
				$prompt.find( '#newfile' ).val( newFileName );
				$prompt.find( '#newfile' ).keyup( workspaceService.privateFunctions.submitNewFileOnEnter );
				$prompt.appendTo( $container );

				spyOn( workspaceService.privateFunctions, 'submitPostOnEnter' );
				spyOn( keyService, 'enter' ).and.returnValue( true );

				$prompt.find( '#newfile' ).trigger( 'keyup' );

				expect( workspaceService.privateFunctions.submitPostOnEnter ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.submitPostOnEnter.calls.first().args;

				expect( args[ 1 ] ).toEqual( './private/?p=files/' );
				expect( args[ 2 ] ).toEqual( 'dir1/dir2/dir777' );
				expect( args[ 3 ] ).toEqual( { } );
				expect( args[ 4 ] ).toEqual( workspaceService.privateFunctions.newFileSuccess );
				expect( args[ 5 ] ).toEqual( workspaceService.privateFunctions.newFileFailure );
			} );

			it ( 'Should not use private function on non-enter', function () {
				var $prompt = $( '<div class="prompt-container"><input type="text" id="newfile"></input></div>' );
				var fileTree = [ 'dir1', 'dir2' ];
				var newFileName = 'dir777';

				$prompt.prop( 'fileTree', fileTree );
				$prompt.find( '#newfile' ).val( newFileName );
				$prompt.find( '#newfile' ).keyup( workspaceService.privateFunctions.submitNewFileOnEnter );
				$prompt.appendTo( $container );

				spyOn( workspaceService.privateFunctions, 'submitPostOnEnter' );
				spyOn( keyService, 'enter' ).and.returnValue( false );

				$prompt.find( '#newfile' ).trigger( 'keyup' );

				expect( workspaceService.privateFunctions.submitPostOnEnter ).not.toHaveBeenCalled();
			} );
		} );

		describe ( 'SubmitPostOnEnter', function () {
			it ( 'Should submit POST on enter', function () {
				spyOn( ajaxService, 'POST' );
				spyOn( keyService, 'enter' ).and.returnValue( true );

				var event = {};
				var url = 'some url';
				var filepath = 'some file path';
				var input = { aKey: 'aValue' };
				var successCallback = function () {};
				var failureCallback = function () {};

				workspaceService.privateFunctions.submitPostOnEnter( event, url, filepath, input, successCallback, failureCallback );

				expect( ajaxService.POST ).toHaveBeenCalled();

				var args = ajaxService.POST.calls.first().args;

				expect( args[ 0 ].url ).toEqual( url + filepath );
				expect( args[ 0 ].input ).toEqual( input );
				expect( args[ 0 ].success ).toEqual( successCallback );
				expect( args[ 0 ][ 401 ] ).toEqual( workspaceService.privateFunctions.displayLogin );
				expect( args[ 0 ][ 498 ] ).toEqual( failureCallback );
				expect( args[ 0 ][ 499 ] ).toEqual( workspaceService.privateFunctions.invalidReference );
				expect( args[ 0 ][ 500 ] ).toEqual( ajaxService.logInternalError );
			} );

			it ( 'Should not submit POST on non-enter', function () {
				spyOn( ajaxService, 'POST' );
				spyOn( keyService, 'enter' ).and.returnValue( false );

				var event = {};
				var url = 'some url';
				var filepath = 'some file path';
				var input = { aKey: 'aValue' };
				var successCallback = function () {};
				var failureCallback = function () {};

				workspaceService.privateFunctions.submitPostOnEnter( event, url, filepath, input, successCallback, failureCallback );

				expect( ajaxService.POST ).not.toHaveBeenCalled();
			} );
		} );

		describe ( 'SubmitRenameOnEnter', function () {
			it ( 'Should submit PUT on enter', function () {
				var $prompt = $( '<div class="prompt-container"><input type="text" id="newname"></input></div>' );
				var fileTree = [ 'dir1', 'dir2' ];
				var anEvent = {};
				var input = 'dir3';
				var url = 'some url'
				var successCallback = function () {};
				var failureCallback = function () {};

				$prompt.prop( 'fileTree', fileTree );
				$prompt.appendTo( $container );

				spyOn( ajaxService, 'PUT' );
				spyOn( keyService, 'enter' ).and.returnValue( true );

				workspaceService.privateFunctions.submitRenameOnEnter(anEvent, input, url
					, successCallback, failureCallback );

				expect( ajaxService.PUT ).toHaveBeenCalled();

				var args = ajaxService.PUT.calls.first().args[ 0 ];

				expect( args.url ).toEqual( url + 'dir1/dir2' );
				expect( args.contentType ).toEqual( 'json' );
				expect( args.input ).toEqual( JSON.stringify( {
					action: 'rename'
					, name: input
				} ) );
				expect( args.success ).toEqual( successCallback );
				expect( args[ 401 ] ).toEqual( workspaceService.privateFunctions.displayLogin );
				expect( args[ 498 ] ).toEqual( failureCallback );
				expect( args[ 499 ] ).toEqual( workspaceService.privateFunctions.invalidReference );
				expect( args[ 500 ] ).toEqual( ajaxService.logInternalError );
			} );

			it ( 'Should not submit PUT on non-enter', function () {
				var $prompt = $( '<div class="prompt-container"><input type="text" id="newname"></input></div>' );
				var fileTree = [ 'dir1', 'dir2' ];
				var anEvent = {};
				var input = { aKey: 'aValue' };
				var url = 'some url'
				var successCallback = function () {};
				var failureCallback = function () {};

				$prompt.prop( 'fileTree', fileTree );
				$prompt.appendTo( $container );

				spyOn( ajaxService, 'PUT' );
				spyOn( keyService, 'enter' ).and.returnValue( false );

				workspaceService.privateFunctions.submitRenameOnEnter(anEvent, input, url
					, successCallback, failureCallback );

				expect( ajaxService.PUT ).not.toHaveBeenCalled();
			} );
		} );

		describe ( 'SubmitRenameDirectoryOnEnter', function () {
			it ( 'Should use private function on enter', function () {
				var $prompt = $( '<div class="prompt-container"><input type="text" id="newdirectory"></input></div>' );
				var fileTree = [ 'dir1', 'dir2' ];
				var newDirectoryName = 'dir777';

				$prompt.prop( 'fileTree', fileTree );
				$prompt.find( '#newdirectory' ).val( newDirectoryName );
				$prompt.find( '#newdirectory' ).keyup( workspaceService.privateFunctions.submitRenameDirectoryOnEnter );
				$prompt.appendTo( $container );

				spyOn( keyService, 'enter' ).and.returnValue( true );
				spyOn( workspaceService.privateFunctions, 'submitRenameOnEnter' );

				$prompt.find( '#newdirectory' ).trigger( 'keyup' );

				expect( workspaceService.privateFunctions.submitRenameOnEnter ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.submitRenameOnEnter.calls.first().args;

				expect( args[ 1 ] ).toEqual( 'dir777' );
				expect( args[ 2 ] ).toEqual( './private/?p=files/directories/' );
				expect( args[ 3 ] ).toEqual( workspaceService.privateFunctions.renameDirectorySuccess );
				expect( args[ 4 ] ).toEqual( workspaceService.privateFunctions.renameDirectoryFailure );
			} );

			it ( 'Should not use private function on non-enter', function () {
				var $prompt = $( '<div class="prompt-container"><input type="text" id="newdirectory"></input></div>' );
				var fileTree = [ 'dir1', 'dir2' ];
				var newDirectoryName = 'dir777';

				$prompt.prop( 'fileTree', fileTree );
				$prompt.find( '#newdirectory' ).val( newDirectoryName );
				$prompt.find( '#newdirectory' ).keyup( workspaceService.privateFunctions.submitRenameDirectoryOnEnter );
				$prompt.appendTo( $container );

				spyOn( keyService, 'enter' ).and.returnValue( false );
				spyOn( workspaceService.privateFunctions, 'submitRenameOnEnter' );

				$prompt.find( '#newdirectory' ).trigger( 'keyup' );

				expect( workspaceService.privateFunctions.submitRenameOnEnter ).not.toHaveBeenCalled();
			} );
		} );

		describe ( 'SubmitRenameFileOnEnter', function () {
			it ( 'Should use private function on enter', function () {
				var $prompt = $( '<div class="prompt-container"><input type="text" id="newfile"></input></div>' );
				var fileTree = [ 'dir1', 'dir2' ];
				var newFileName = 'dir777';

				$prompt.prop( 'fileTree', fileTree );
				$prompt.find( '#newfile' ).val( newFileName );
				$prompt.find( '#newfile' ).keyup( workspaceService.privateFunctions.submitRenameFileOnEnter );
				$prompt.appendTo( $container );

				spyOn( keyService, 'enter' ).and.returnValue( true );
				spyOn( workspaceService.privateFunctions, 'submitRenameOnEnter' );

				$prompt.find( '#newfile' ).trigger( 'keyup' );

				expect( workspaceService.privateFunctions.submitRenameOnEnter ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.submitRenameOnEnter.calls.first().args;

				expect( args[ 1 ] ).toEqual( 'dir777' );
				expect( args[ 2 ] ).toEqual( './private/?p=files/' );
				expect( args[ 3 ] ).toEqual( workspaceService.privateFunctions.renameFileSuccess );
				expect( args[ 4 ] ).toEqual( workspaceService.privateFunctions.renameFileFailure );
			} );

			it ( 'Should not use private function on non-enter', function () {
				var $prompt = $( '<div class="prompt-container"><input type="text" id="newfile"></input></div>' );
				var fileTree = [ 'dir1', 'dir2' ];
				var newFileName = 'dir777';

				$prompt.prop( 'fileTree', fileTree );
				$prompt.find( '#newfile' ).val( newFileName );
				$prompt.find( '#newfile' ).keyup( workspaceService.privateFunctions.submitRenameFileOnEnter );
				$prompt.appendTo( $container );

				spyOn( keyService, 'enter' ).and.returnValue( false );
				spyOn( workspaceService.privateFunctions, 'submitRenameOnEnter' );

				$prompt.find( '#newfile' ).trigger( 'keyup' );

				expect( workspaceService.privateFunctions.submitRenameOnEnter ).not.toHaveBeenCalled();
			} );
		} );

		describe ( 'ToggleSearchTips', function () {
			it ( 'Should toggle search tips', function () {
				var data = [
					'<div class="menu">'
						, '<div class="search-container">'
							, '<div class="search">'
								, '<i class="tip-search"></i>'
							, '</div>'
						, '</div>'
					, '</div>'
				];

				$container.append( data.join( '' ) );

				$tipSearch = $container.find( '.tip-search' );
				$searchContainer = $tipSearch.parent();

				workspaceService.privateFunctions.toggleSearchTips();

				$tipSearch.hide();
				expect( $tipSearch.is( ':visible' ) ).toBe( false );
				$searchContainer.trigger( 'mouseover' );
				expect( $tipSearch.is( ':visible' ) ).toBe( true );
				$searchContainer.trigger( 'mouseout' );
				expect( $tipSearch.is( ':visible' ) ).toBe( false );
			} );
		} );

		describe ( 'UploadFile', function () {
			it ( 'Should submit POST request', function () {
				var $prompt = $( [
					'<div class="prompt-container">'
						,'<div id="newfile"></div>'
					,'</div>'
				].join( '' ) );
				var fileTree = [ 'dir1', 'dir2', 'dir777' ];
				var files = [ { name: 'newFileName' } ];
				var formData = {
					append: function ( key, value ) {
						formData.file = value;
					}
				};

				$prompt.prop( 'fileTree', fileTree );
				$prompt.find( '#newfile' ).prop( 'files', files );
				$prompt.appendTo( $container );

				spyOn( ajaxService, 'POST' );
				spyOn( window, 'FormData' ).and.returnValue( formData );

				workspaceService.privateFunctions.uploadFile();

				expect( ajaxService.POST ).toHaveBeenCalled();

				var args = ajaxService.POST.calls.first().args[ 0 ];

				expect( args.url ).toEqual( './private/?p=files/dir1/dir2/dir777/newFileName' );
				expect( args.contentType ).toBe( false );
				expect( args.processData ).toBe( false );
				expect( args.input.file ).toEqual( formData.file );
				expect( args.success ).toEqual( workspaceService.privateFunctions.uploadFileSuccess );
				expect( args[ 401 ] ).toEqual( workspaceService.privateFunctions.displayLogin );
				expect( args[ 496 ] ).toEqual( workspaceService.privateFunctions.uploadFileFailure );
				expect( args[ 499 ] ).toEqual( workspaceService.privateFunctions.invalidReference );
				expect( args[ 500 ] ).toEqual( ajaxService.logInternalError );
			} );

			it ( 'Should not submit POST request if no file is selected', function () {
				var $prompt = $( [
					'<div class="prompt-container">'
						,'<div id="newfile"></div>'
					,'</div>'
				].join( '' ) );
				var fileTree = [ 'dir1', 'dir2', 'dir777' ];
				var files = [ ];
				var formData = {
					append: function ( key, value ) {
						formData.file = value;
					}
				};

				$prompt.prop( 'fileTree', fileTree );
				$prompt.find( '#newfile' ).prop( 'files', files );
				$prompt.appendTo( $container );

				spyOn( ajaxService, 'POST' );
				spyOn( window, 'FormData' ).and.returnValue( formData );

				workspaceService.privateFunctions.uploadFile();

				expect( ajaxService.POST ).not.toHaveBeenCalled();
			} );
		} );

		describe ( 'UploadFileFailure', function () {
			it ( 'Should display error message', function () {
				spyOn( loggingService, 'displayError' );

				workspaceService.privateFunctions.uploadFileFailure();

				expect( loggingService.displayError ).toHaveBeenCalled();

				var args = loggingService.displayError.calls.first().args;

				expect( args[ 0 ] ).toEqual( 'New file already exists, is invalid syntax, or upload failed' );
			} );
		} );

		describe ( 'UploadFileSuccess', function () {
			it ( 'Should use private function', function () {
				spyOn( workspaceService.privateFunctions, 'closeMenuPromptWithSuccess' );

				workspaceService.privateFunctions.uploadFileSuccess();

				expect( workspaceService.privateFunctions.closeMenuPromptWithSuccess ).toHaveBeenCalled();

				var args = workspaceService.privateFunctions.closeMenuPromptWithSuccess.calls.first().args;

				expect( args[ 0 ] ).toEqual( 'File uploaded' );
			} );
		} );



	} );
} );
