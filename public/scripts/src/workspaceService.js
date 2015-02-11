var WorkspaceService = function () {
	var instance = null;

	var buildApi = function () {
		var $container = $( '.container ');
		var $menu = $( '.menu' );

		var functions = {
			buildDeleteDirectory: function ( data, fileTreeArray ) {
				functions.buildPromptWithConfirmation( {
					data: data
					, fileTreeArray: fileTreeArray
					, confirmationCallback: functions.deleteDirectory
				} );
			}
			, buildDeleteFile: function ( data, fileTreeArray ) {
				functions.buildPromptWithConfirmation( {
					data: data
					, fileTreeArray: fileTreeArray
					, confirmationCallback: functions.deleteFile
				} );
			}
			, buildFilesystem: function ( data ) {
				var $ul = $( '<ul class="root-list">' );

				functions.displayFilesInDirectory( $ul, $.parseJSON( data ) );

				var $root = $menu.find( '.content-container .root' );

				$root.find( 'ul' ).remove();
				$ul.appendTo( $root );
				$root.find( '> .new-directory' ).click( functions.displayNewDirectory );
				$root.find( '> .new-file' ).click( functions.displayNewFile );
				$menu.find( '.search-container .pattern' ).trigger( 'keyup' );
			}
			, buildFileTreeArray: function ( $fileActionObject ) {
				var fileTree = [];
				var $listItem = $fileActionObject.parent();

				while ( $listItem.find( '> .file-name' ).length > 0 ) {
					fileTree.push( $listItem.find( '> .file-name' ).html() );
					$listItem = $listItem.parent().parent();
				}

				return fileTree.reverse();
			}
			, buildMenu: function ( data ) {
				$container.find( '.menu' ).remove();
				$container.append( data );

				$menu = $container.find( '.menu' );

				$menu.find( '.control-container' ).click( function() {
					$menu.remove();
				} );

				functions.toggleSearchTips();
				functions.displayFilesystem();
				$menu.find( '.search-container .pattern' ).keyup( functions.filterMenu );
				$menu.find( '.search-container .pattern' ).focus();
			}
			, buildMoveDownDirectory: function ( data, fileTreeArray, $element ) {
				functions.buildPromptWithConfirmation( {
					data: data
					, fileTreeArray: fileTreeArray
					, confirmationCallback: functions.moveDownDirectory
					, customSetup: function ( $prompt ) {
						functions.buildSubdirectorySelection( $prompt, $element );
					}
				} );
			}
			, buildMoveDownFile: function ( data, fileTreeArray, $element ) {
				functions.buildPromptWithConfirmation( {
					data: data
					, fileTreeArray: fileTreeArray
					, confirmationCallback: functions.moveDownFile
					, customSetup: function ( $prompt ) {
						functions.buildSubdirectorySelection( $prompt, $element );
					}
				} );
			}
			, buildMoveUpDirectory: function ( data, fileTreeArray ) {
				functions.buildPromptWithConfirmation( {
					data: data
					, fileTreeArray: fileTreeArray
					, confirmationCallback: functions.moveUpDirectory
				} );
			}
			, buildMoveUpFile: function ( data, fileTreeArray ) {
				functions.buildPromptWithConfirmation( {
					data: data
					, fileTreeArray: fileTreeArray
					, confirmationCallback: functions.moveUpFile
				} );
			}
			, buildNew: function ( data, fileTreeArray, inputField, actionCallback ) {
				functions.buildPromptWithoutConfirmation( {
					data: data
					, fileTreeArray: fileTreeArray
					, confirmationCallback: actionCallback
					, inputField: inputField
					, customSetup: function ( $prompt ) {
						var $filepath = $prompt.find( '.file-path' );
						$filepath.html( $filepath.html() +'/' );
					}
				});
			}
			, buildNewDirectory: function ( data, fileTreeArray ) {
				functions.buildPromptWithoutConfirmation( {
					data: data
					, fileTreeArray: fileTreeArray
					, confirmationCallback: functions.submitNewDirectoryOnEnter
					, inputField: '#newdirectory'
					, customSetup: function ( $prompt ) {
						var $filepath = $prompt.find( '.file-path' );
						$filepath.html( $filepath.html() +'/' );
					}
				});
			}
			, buildNewFile: function ( data, fileTreeArray ) {
				functions.buildPromptWithoutConfirmation( {
					data: data
					, fileTreeArray: fileTreeArray
					, confirmationCallback: functions.submitNewFileOnEnter
					, inputField: '#newfile'
					, customSetup: function ( $prompt ) {
						var $filepath = $prompt.find( '.file-path' );
						$filepath.html( $filepath.html() +'/' );
					}
				});
			}
			, buildPromptWithConfirmation: function ( jsonArgs ) {
				Require.all( jsonArgs, 'data', 'fileTreeArray', 'confirmationCallback' );

				var $prompt = $( jsonArgs.data );

				functions.closePromptContainer();
				$prompt.find( '.file-path' ).html( jsonArgs.fileTreeArray.join( '/' ) );
				$prompt.prop( 'fileTree', jsonArgs.fileTreeArray );
				$prompt.hide();
				$prompt.appendTo( $container );
				$prompt.find( '.prompt-yes' ).click( jsonArgs.confirmationCallback );
				$prompt.find( '.prompt-no' ).click( functions.closePromptContainer );

				if ( typeof jsonArgs.customSetup !== 'undefined' ) {
					jsonArgs.customSetup( $prompt );
				}

				$prompt.show();
			}
			, buildPromptWithoutConfirmation: function ( jsonArgs ) {
				Require.all( jsonArgs, 'data', 'fileTreeArray', 'inputField', 'confirmationCallback' );

				var $prompt = $( jsonArgs.data );

				functions.closePromptContainer();
				$prompt.find( '.file-path' ).html( jsonArgs.fileTreeArray.join( '/' ) );
				$prompt.prop( 'fileTree', jsonArgs.fileTreeArray );
				$prompt.hide();
				$prompt.appendTo( $container );
				$prompt.find( '.close' ).click( functions.closePromptContainer );
				$prompt.find( jsonArgs.inputField ).keyup( jsonArgs.confirmationCallback );

				if ( typeof jsonArgs.customSetup !== 'undefined' ) {
					jsonArgs.customSetup( $prompt );
				}

				$prompt.show();
				$prompt.find( jsonArgs.inputField ).focus();
			}
			, buildRenameDirectory: function ( data, fileTreeArray ) {
				functions.buildPromptWithoutConfirmation( {
					data: data
					, fileTreeArray: fileTreeArray
					, confirmationCallback: functions.submitRenameDirectoryOnEnter
					, inputField: '#newdirectory'
					, customSetup: function ( $prompt ) {
						$prompt.find( '.file-path' ).html( fileTreeArray.slice(0, -1).join( '/' ) + '/');
						$prompt.find( '.old-name' ).html( fileTreeArray.slice(-1) );
					}
				});
			}
			, buildRenameFile: function ( data, fileTreeArray ) {
				functions.buildPromptWithoutConfirmation( {
					data: data
					, fileTreeArray: fileTreeArray
					, confirmationCallback: functions.submitRenameFileOnEnter
					, inputField: '#newfile'
					, customSetup: function ( $prompt ) {
						$prompt.find( '.file-path' ).html( fileTreeArray.slice(0, -1).join( '/' ) + '/');
						$prompt.find( '.old-name' ).html( fileTreeArray.slice(-1) );
					}
				});
			}
			, buildSubdirectorySelection: function ( $prompt, $element ) {
				var $selection = $prompt.find( '#newdirectory' );
				var $options = $element.parent().siblings().find( '> i.subdirectory' );

				$selection.find( 'option' ).remove();

				$options.each( function () {
					var filename = $( this ).parent().find( '.file-name' ).html();

					$( '<option>', { value: filename, html: filename } ).appendTo($selection );
				} );

				$selection.focus();
			}
			, buildWorkspace: function ( data ) {
				$container.html( data );
				$container.find( '.menuIndicator' ).mouseover( functions.displayMenu );
				$container.find( '.logout' ).click( SessionService.getInstance().logout );
				$container.find( '.menuIndicator' ).trigger( 'mouseover' );
			}
			, closeMenuPromptWithError: function ( message ) {
				LoggingService.getInstance().displayError( message );
				functions.closePromptContainer();
				functions.displayFilesystem();
			}
			, closeMenuPromptWithSuccess: function ( message ) {
				LoggingService.getInstance().displaySuccess( message );
				functions.closePromptContainer();
				functions.displayFilesystem();
			}
			, closePromptContainer: function () {
				$container.find( '.prompt-container' ).remove();
			}
			, delete: function ( url, successCallback, failureCallback ) {
				var filepath = $container.find( '.prompt-container' ).prop( 'fileTree' ).join( '/' );

				AjaxService.getInstance().DELETE({
					url: url + filepath
					, input: { }
					, success: successCallback
					, 401: functions.displayLogin
					, 497: failureCallback
					, 499: functions.invalidReference
					, 500: AjaxService.getInstance().logInternalError
				});
			}
			, deleteDirectory: function () {
				functions.delete( './private/?p=files/directories/'
					, functions.deleteDirectorySuccess
					, functions.deleteDirectoryFailure );
			}
			, deleteDirectoryFailure: function ( data ) {
				functions.closeMenuPromptWithError( 'Directory not deleted' );
			}
			, deleteDirectorySuccess: function ( data ) {
				functions.closeMenuPromptWithSuccess( 'Directory deleted' );
			}
			, deleteFile: function () {
				functions.delete( './private/?p=files/', functions.deleteFileSuccess
					, functions.deleteFileFailure );
			}
			, deleteFileFailure: function ( data ) {
				functions.closeMenuPromptWithError( 'File not deleted' );
			}
			, deleteFileSuccess: function ( data ) {
				functions.closeMenuPromptWithSuccess( 'File deleted' );
			}
			, displayDeleteDirectory: function () {
				var fileTree = functions.buildFileTreeArray( $( this ) );
				var successCallback = function ( data ) {
					functions.buildDeleteDirectory( data, fileTree );
				};

				functions.displayStaticResource( './public/views/deleteDirectory.view'
					, successCallback );
			}
			, displayDeleteFile: function () {
				var fileTree = functions.buildFileTreeArray( $( this ) );
				var successCallback = function ( data ) {
					functions.buildDeleteFile( data, fileTree );
				};

				functions.displayStaticResource( './public/views/deleteFile.view'
					, successCallback );
			}
			, displayFileInDirectory: function ( $filename, $directory ) { 
				var $listItem = $( '<li class="menu-item">' );

				$listItem
					.append( $( '<i class="fa fa-file file">' ) )
					.append( $( '<span>', {
						class: 'file-name'
						, html: $filename
					} ) )
					.append( $( '<i class="fa fa-pencil-square-o rename rename-file" title="Rename">' ) )
					.append( $( '<i class="fa fa-level-up move move-up-file" title="Move Up">' ) )
					.append( $( '<i class="fa fa-level-down move move-down-file" title="Move Down">' ) )
					.append( $( '<i class="fa fa-times delete delete-file" title="Delete">' ) );

				if ( $directory.hasClass( 'root-list' ) ) {
					$listItem.find( '.move-up-file' ).remove();
				}

				$listItem.appendTo( $directory );
				$listItem.find( '> .delete-file' ).click( functions.displayDeleteFile );
				$listItem.find( '> .rename-file' ).click( functions.displayRenameFile );
				$listItem.find( '> .move-up-file' ).click( functions.displayMoveUpFile );
				$listItem.find( '> .move-down-file' ).click( functions.displayMoveDownFile );
			}
			, displayFilesInDirectory: function ( $directory, $files ) {
				var filenames = [];

				for ( key in $files ) {
					if ( isNaN( key ) ) {
						functions.displaySubdirectory( key, $directory, $files[ key ] );
					} else {
						filenames.push( $files[ key ] );
					}
				}

				for ( key in filenames ) {
					functions.displayFileInDirectory( filenames[ key ], $directory );
				}

				functions.removeMoveDown( $directory );
			}
			, displayFilesystem: function () {
				AjaxService.getInstance().GET({
					url: './private/?p=files'
					, success: functions.buildFilesystem
					, 401: SessionService.getInstance().displayLogin
					, 500: LoggingService.getInstance().logInternalError
				});
			}
			, displayMenu: function () {
				functions.displayStaticResource( './public/views/menu.view', functions.buildMenu );
			}
			, displayMoveDownDirectory: function () {
				var $this = $( this );
				var fileTree = functions.buildFileTreeArray( $this );
				var successCallback = function ( data ) {
					functions.buildMoveDownDirectory( data, fileTree, $this );
				};

				functions.displayStaticResource( './public/views/moveDownDirectory.view'
					, successCallback );
			}
			, displayMoveDownFile: function () {
				var $this = $( this );
				var fileTree = functions.buildFileTreeArray( $this );
				var successCallback = function ( data ) {
					functions.buildMoveDownFile( data, fileTree, $this );
				};

				functions.displayStaticResource( './public/views/moveDownFile.view'
					, successCallback );
			}
			, displayMoveUpDirectory: function () {
				var fileTree = functions.buildFileTreeArray( $( this ) );
				var successCallback = function ( data ) {
					functions.buildMoveUpDirectory( data, fileTree );
				};

				functions.displayStaticResource( './public/views/moveUpDirectory.view'
					, successCallback );
			}
			, displayMoveUpFile: function () {
				var fileTree = functions.buildFileTreeArray( $( this ) );
				var successCallback = function ( data ) {
					functions.buildMoveUpFile( data, fileTree );
				};

				functions.displayStaticResource( './public/views/moveUpFile.view'
					, successCallback );
			}
			, displayNewDirectory: function () {
				var fileTree = functions.buildFileTreeArray( $( this ) );
				var successCallback = function ( data ) {
					functions.buildNewDirectory( data, fileTree );
				};

				functions.displayStaticResource( './public/views/newDirectory.view', successCallback );
			}
			, displayNewFile: function () {
				var fileTree = functions.buildFileTreeArray( $( this ) );
				var successCallback = function ( data ) {
					functions.buildNewFile( data, fileTree );
				};

				functions.displayStaticResource( './public/views/newFile.view', successCallback );
			}
			, displayRename: function ( url, fileTree, renameCallback ) {
				var successCallback = function ( data ) {
					renameCallback( data, fileTree );
				};

				functions.displayStaticResource( url, successCallback );
			}
			, displayRenameDirectory: function () {
				var fileTree = functions.buildFileTreeArray( $( this ) );

				functions.displayRename( './public/views/renameDirectory.view'
					, fileTree
					, functions.buildRenameDirectory );
			}
			, displayRenameFile: function () {
				var fileTree = functions.buildFileTreeArray( $( this ) );

				functions.displayRename( './public/views/renameFile.view'
					, fileTree
					, functions.buildRenameFile );
			}
			, displayStaticResource: function ( url, successCallback ) {
				AjaxService.getInstance().GET({
					url: url
					, success: successCallback
					, 401: SessionService.getInstance().displayLogin
					, 404: LoggingService.getInstance().logNotFound
					, 500: LoggingService.getInstance().logInternalError
				});
			}
			, displaySubdirectory: function ( $directoryName, $directory, $subfiles ) {
				var $sublist = $( '<ul>' );
				var $listItem = $( '<li class="menu-item">' );

				$listItem
					.append( $( '<i class="fa fa-folder folder subdirectory">' ) )
					.append( $( '<span>', {
						class: 'file-name'
						, html: $directoryName
					} ) )
					.append( $( '<i class="fa fa-pencil-square-o rename rename-directory" title="Rename">' ) )
					.append( $( '<span class="new-directory" title="New Directory">' ) )
					.find( '.new-directory' )
						.append( $( '<i class="fa fa-folder folder">' ) )
						.append( $( '<i class="fa fa-plus plus">' ) )
					.end()
					.append( $( '<span class="new-file" title="New File">' ) )
					.find( '.new-file' )
						.append( $( '<i class="fa fa-file file">' ) )
						.append( $( '<i class="fa fa-plus plus">' ) )
					.end()
					.append( $( '<i class="fa fa-level-up move move-up-directory" title="Move Up">' ) )
					.append( $( '<i class="fa fa-level-down move move-down-directory" title="Move Down">' ) )
					.append( $( '<i class="fa fa-times delete delete-directory" title="Delete">' ) )
					.append( $sublist );

				if ( $directory.hasClass( 'root-list' ) ) {
					$listItem.find( '.move-up-directory' ).remove();
				}

				$listItem.appendTo( $directory );

				functions.displayFilesInDirectory( $sublist, $subfiles );

				$listItem.find( '> .new-directory' ).click( functions.displayNewDirectory );
				$listItem.find( '> .delete-directory' ).click( functions.displayDeleteDirectory );
				$listItem.find( '> .rename-directory' ).click( functions.displayRenameDirectory );
				$listItem.find( '> .move-up-directory' ).click( functions.displayMoveUpDirectory );
				$listItem.find( '> .move-down-directory' ).click( functions.displayMoveDownDirectory );
				$listItem.find( '> .new-file' ).click( functions.displayNewFile );
			}
			, filterMenu: function ( event ) {
				var $filter = $( this );
				var pattern = $filter.val().trim().replace( /[%]/g, "[\\S]*" ).replace( /[_]/g, "[\\S]" );
				var $menu = $container.find( '.menu .content-container .content .root > ul' );

				try {
					$menu.find( 'li' ).show();

					if ( pattern.length > 0 ) {
						if ( pattern.charAt( 0 ) != '^' ) {
							pattern = '^'+ pattern;
						}

						if ( pattern.charAt( pattern.length - 1 ) != '$' ) {
							pattern += '$';
						}

						var matcher = new RegExp( pattern );

						$menu.find( 'li' ).hide();

						$menu.find( '.file' ).next().each( function() {
							var $thiz = $( this );

							if ( matcher.test( $thiz.html() ) ) {
								var $parent = $thiz.parent();

								do {
									$parent.show();

									$parent = $parent.parent().parent();
								} while ( $parent.prop( 'tagName' ) == 'LI' );
							}
						} );

						$menu.find( '.folder' ).next().each( function() {
							var $thiz = $( this );

							if ( matcher.test( $thiz.html() ) ) {
								var $parent = $thiz.parent();

								$parent.find( 'li' ).show();

								do {
									$parent.show();

									$parent = $parent.parent().parent();
								} while ( $parent.prop( 'tagName' ) == 'LI' );
							}
						} );
					}
				} catch ( e ) {
					$menu.find( 'li' ).hide();
				}
			}
			, invalidReference: function ( data ) {
				functions.closeMenuPromptWithError( 'Parent directory no longer exists or has restricted access' );
			}
			, moveDownDirectory: function () {
				var $prompt = $container.find( '.prompt-container' );
				var filepath = $prompt.prop( 'fileTree' ).join( '/' );
				var subdirectory = $prompt.find( '#newdirectory' ).val();

				AjaxService.getInstance().PUT({
					url: './private/?p=files/directories/'+ filepath
					, contentType: 'json'
					, input: JSON.stringify ( {
						action: 'shiftdown'
						, name: subdirectory
					} )
					, success: functions.moveDownDirectorySuccess
					, 401: functions.displayLogin
					, 498: functions.moveDownDirectoryFailure
					, 499: functions.invalidReference
					, 500: AjaxService.getInstance().logInternalError
				});
			}
			, moveDownDirectoryFailure: function ( data ) {
				functions.closeMenuPromptWithError( 'Directory not moved' );
			}
			, moveDownDirectorySuccess: function ( data ) {
				functions.closeMenuPromptWithSuccess( 'Directory moved' );
			}
			, moveDownFile: function () {
				var $prompt = $container.find( '.prompt-container' );
				var filepath = $prompt.prop( 'fileTree' ).join( '/' );
				var subdirectory = $prompt.find( '#newdirectory' ).val();

				AjaxService.getInstance().PUT({
					url: './private/?p=files/'+ filepath
					, contentType: 'json'
					, input: JSON.stringify ( {
						action: 'shiftdown'
						, name: subdirectory
					} )
					, success: functions.moveDownFileSuccess
					, 401: functions.displayLogin
					, 498: functions.moveDownFileFailure
					, 499: functions.invalidReference
					, 500: AjaxService.getInstance().logInternalError
				});
			}
			, moveDownFileFailure: function ( data ) {
				functions.closeMenuPromptWithError( 'File not moved' );
			}
			, moveDownFileSuccess: function ( data ) {
				functions.closeMenuPromptWithSuccess( 'File moved' );
			}
			, moveUpDirectory: function () {
				var filepath = $container.find( '.prompt-container' ).prop( 'fileTree' ).join( '/' );

				AjaxService.getInstance().PUT({
					url: './private/?p=files/directories/'+ filepath
					, contentType: 'json'
					, input: JSON.stringify ( { action: 'shiftup' } )
					, success: functions.moveUpDirectorySuccess
					, 401: functions.displayLogin
					, 498: functions.moveUpDirectoryFailure
					, 499: functions.invalidReference
					, 500: AjaxService.getInstance().logInternalError
				});
			}
			, moveUpDirectoryFailure: function ( data ) {
				functions.closeMenuPromptWithError( 'Directory not moved' );
			}
			, moveUpDirectorySuccess: function ( data ) {
				functions.closeMenuPromptWithSuccess( 'Directory moved' );
			}
			, moveUpFile: function () {
				var filepath = $container.find( '.prompt-container' ).prop( 'fileTree' ).join( '/' );

				AjaxService.getInstance().PUT({
					url: './private/?p=files/'+ filepath
					, contentType: 'json'
					, input: JSON.stringify ( { action: 'shiftup' } )
					, success: functions.moveUpFileSuccess
					, 401: functions.displayLogin
					, 498: functions.moveUpFileFailure
					, 499: functions.invalidReference
					, 500: AjaxService.getInstance().logInternalError
				});
			}
			, moveUpFileFailure: function ( data ) {
				functions.closeMenuPromptWithError( 'File not moved' );
			}
			, moveUpFileSuccess: function ( data ) {
				functions.closeMenuPromptWithSuccess( 'File moved' );
			}
			, newDirectoryFailure: function ( data ) {
				LoggingService.getInstance().displayError( 'New directory already exists or is invalid syntax' );
			}
			, newDirectorySuccess: function ( data ) {
				functions.closeMenuPromptWithSuccess( 'Directory created' );
			}
			, newFileFailure: function ( data ) {
				LoggingService.getInstance().displayError( 'New file already exists or is invalid syntax' );
			}
			, newFileSuccess: function ( data ) {
				functions.closeMenuPromptWithSuccess( 'File created' );
			}
			, removeMoveDown: function ( $directory ) {
				$directory.find( 'ul' ).each( function () {
					var $subdirectory = $( this );
					var directoryCount = $subdirectory.find( '> li > i.subdirectory' ).length;

					if ( directoryCount < 2 ) {
						$subdirectory.find( '> li > i.move-down-directory' ).remove();

						if ( directoryCount < 1 ) {
							$subdirectory.find( '> li > i.move-down-file' ).remove();
						}
					}
				} );
			}
			, renameDirectoryFailure: function ( data ) {
				LoggingService.getInstance().displayError( 'New directory already exists or is invalid syntax' );
			}
			, renameDirectorySuccess: function ( data ) {
				functions.closeMenuPromptWithSuccess( 'Directory renamed' );
			}
			, renameFileFailure: function ( data ) {
				LoggingService.getInstance().displayError( 'New file already exists or is invalid syntax' );
			}
			, renameFileSuccess: function ( data ) {
				functions.closeMenuPromptWithSuccess( 'File renamed' );
			}
			, submitNewDirectoryOnEnter: function ( event ) {
				if ( KeyService.getInstance().enter( event ) ) {
					var input = { };
					var filepath = $container.find( '.prompt-container' ).prop( 'fileTree' ).join( '/' );
					filepath += '/'+ $( this ).val();

					functions.submitPostOnEnter( event, './private/?p=files/directories/'
						, filepath, input, functions.newDirectorySuccess, functions.newDirectoryFailure );
				}
			}
			, submitNewFileOnEnter: function ( event ) {
				if ( KeyService.getInstance().enter( event ) ) {
					var input = { };
					var filepath = $container.find( '.prompt-container' ).prop( 'fileTree' ).join( '/' );
					filepath += '/'+ $( this ).val(); 

					functions.submitPostOnEnter( event, './private/?p=files/'
						, filepath, input, functions.newFileSuccess, functions.newFileFailure );
				}
			}
			, submitPostOnEnter: function ( event, url, filepath, input, successCallback, failureCallback ) {
				if ( KeyService.getInstance().enter( event ) ) {
					AjaxService.getInstance().POST({
						url: url + filepath
						, input: input
						, success: successCallback
						, 401: functions.displayLogin
						, 498: failureCallback
						, 499: functions.invalidReference
						, 500: AjaxService.getInstance().logInternalError
					});
				}
			}
			, submitRenameOnEnter: function ( event, input, url, successCallback, failureCallback ) {
				if ( KeyService.getInstance().enter( event ) ) {
					var filepath = $container.find( '.prompt-container' ).prop( 'fileTree' ).join( '/' );

					AjaxService.getInstance().PUT({
						url: url + filepath
						, contentType: 'json'
						, input: JSON.stringify( {
							action: 'rename'
							, name: input
						} )
						, success: successCallback
						, 401: functions.displayLogin
						, 498: failureCallback
						, 499: functions.invalidReference
						, 500: AjaxService.getInstance().logInternalError
					});
				}
			}
			, submitRenameDirectoryOnEnter: function ( event ) {
				if ( KeyService.getInstance().enter( event ) ) {
					var input = $( this ).val();

					functions.submitRenameOnEnter( event
						, $( this ).val()
						, './private/?p=files/directories/'
						, functions.renameDirectorySuccess
						, functions.renameDirectoryFailure );
				}
			}
			, submitRenameFileOnEnter: function ( event ) {
				if ( KeyService.getInstance().enter( event ) ) {
					var input = $( this ).val();

					functions.submitRenameOnEnter( event
						, $( this ).val()
						, './private/?p=files/'
						, functions.renameFileSuccess
						, functions.renameFileFailure );
				}
			}
			, toggleSearchTips: function () {
				var $tipSearch = $container.find( '.tip-search' );

				$container.find( '.menu .search-container .search' ).mouseover( function() {
					$tipSearch.show();
				} );

				$container.find( '.menu .search-container .search' ).mouseout( function() {
					$tipSearch.hide();
				} );
			}
		};

		var api = {
			privateFunctions: functions
			, displayWorkspace: function () {
				functions.displayStaticResource( './public/views/workspace.view', functions.buildWorkspace );
			}
		};

		return api;
	};

	return {
		getInstance: function () {
			if ( instance == null ) {
				instance = buildApi();

				delete instance.privateFunctions;
			}

			return instance;
		}
		, getTestInstance: function () {
			return buildApi();
		}
	};
}();
