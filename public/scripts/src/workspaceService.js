var WorkspaceService = function () {
	var instance = null;

	var buildApi = function () {
		var $container = $( '.container ');
		var $menu = $( '.menu' );

		var functions = {
			buildDeleteDirectory: function ( data, fileTreeArray ) {
				var $prompt = $( data );

				$prompt.find( '.existing-directory' ).html( fileTreeArray.join( '/' ) );
				$prompt.prop( 'fileTree', fileTreeArray );

				functions.closePromptContainer();
				$prompt.appendTo( $container );

				var $promptContainer = $container.find( '.prompt-container' );

				$promptContainer.find( '.prompt-yes' ).click( functions.deleteDirectory );
				$promptContainer.find( '.prompt-no' ).click( functions.closePromptContainer );
			}
			, buildFilesystem: function ( data ) {
				var $ul = $( '<ul>' );

				functions.displayFilesInDirectory( $ul, $.parseJSON( data ) );

				var $root = $menu.find( '.root' );

				$root.find( 'ul' ).remove();
				$ul.appendTo( $root );
				$root.find( '> .new-directory' ).click( functions.displayNewDirectory );
				$menu.find( '.search .pattern' ).trigger( 'keyup' );
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

				$container.find( '.menu .control' ).click( function() {
					$container.find( '.menu' ).remove();
				} );

				functions.toggleSearchTips();
				functions.displayFilesystem();
				$menu.find( '.search .pattern' ).keyup( functions.filterMenu );
				$menu.find( '.search .pattern' ).focus();
			}
			, buildNewDirectory: function ( data, fileTreeArray ) {
				var $prompt = $( data );

				$prompt.find( '.existing-directory' ).html( fileTreeArray.join( '/' ) +'/' );
				$prompt.prop( 'fileTree', fileTreeArray );

				functions.closePromptContainer();
				$prompt.appendTo( $container );

				$prompt.find( '.close' ).click( functions.closePromptContainer );
				$prompt.find( '#newdirectory' ).keyup( functions.submitNewDirectoryOnEnter  );
				$prompt.find( '#newdirectory' ).focus();
			}
			, buildWorkspace: function ( data ) {
				$container.html( data );
				$container.find( '.menuIndicator' ).mouseover( functions.displayMenu );
				$container.find( '.logout' ).click( SessionService.getInstance().logout );
			}
			, closePromptContainer: function () {
				$container.find( '.prompt-container' ).remove();
			}
			, deleteDirectory: function () {
				var directory = $container.find( '.prompt-container' ).prop( 'fileTree' ).join( '/' );

				AjaxService.getInstance().DELETE({
					url: './private/?p=files/directories/'+ directory
					, input: { }
					, success: functions.deleteDirectorySuccess
					, 401: functions.displayLogin
					, 497: functions.deleteDirectoryFailure
					, 499: functions.invalidReference
					, 500: AjaxService.getInstance().logInternalError
				});
			}
			, deleteDirectoryFailure: function ( data ) {
				LoggingService.getInstance().displayError( 'Directory not deleted' );
				functions.closePromptContainer();
				functions.displayFilesystem();
			}
			, deleteDirectorySuccess: function ( data ) {
				LoggingService.getInstance().displaySuccess( 'Directory deleted' );
				functions.closePromptContainer();
				functions.displayFilesystem();
			}
			, displayDeleteDirectory: function () {
				var fileTree = functions.buildFileTreeArray( $( this ) );

				AjaxService.getInstance().GET({
					url: './public/views/deleteDirectory.view'
					, success: function ( data ) { functions.buildDeleteDirectory( data, fileTree ); }
					, 401: SessionService.getInstance().displayLogin
					, 404: LoggingService.getInstance().logNotFound
					, 500: LoggingService.getInstance().logInternalError
				});
			}
			, displayFileInDirectory: function ( $filename, $directory ) {
				$( '<li>' )
					.append( $( '<i class="fa fa-file">' ) )
					.append( $( '<span>', {
						class: 'file-name'
						, html: $filename
					} ) )
					.appendTo( $directory );
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
			}
			, displayFilesystem: function () {
				AjaxService.getInstance().GET({
					url: './private/?p=files'
					, success: functions.buildFilesystem
					, 401: SessionService.getInstance().displayLogin
					, 500: LoggingService.getInstance().logInternalError
				});
			}
			, displaySubdirectory: function ( $directoryName, $directory, $subfiles ) {
				var $sublist = $( '<ul>' );
				var $listItem = $( '<li>' );

				$listItem
					.append( $( '<i class="fa fa-folder subdirectory">' ) )
					.append( $( '<span>', {
						class: 'file-name'
						, html: $directoryName
					} ) )
					.append( $( '<span class="new-directory">' ) )
					.find( '.new-directory' )
						.append( $( '<i class="fa fa-folder actionable">' ) )
						.append( $( '<i class="fa fa-plus actionable">' ) )
					.end()
					.append( $( '<i class="fa fa-times delete delete-directory actionable">' ) )
					.append( $sublist )
					.appendTo( $directory );

					functions.displayFilesInDirectory( $sublist, $subfiles );
					$listItem.find( '> .new-directory' ).click( functions.displayNewDirectory );
					$listItem.find( '> .delete-directory' ).click( functions.displayDeleteDirectory );
			}
			, displayMenu: function () {
				AjaxService.getInstance().GET({
					url: './public/views/menu.view'
					, success: functions.buildMenu
					, 401: SessionService.getInstance().displayLogin
					, 404: LoggingService.getInstance().logNotFound
					, 500: LoggingService.getInstance().logInternalError
				});
			}
			, displayNewDirectory: function () {
				var fileTree = functions.buildFileTreeArray( $( this ) );

				AjaxService.getInstance().GET({
					url: './public/views/newDirectory.view'
					, success: function ( data ) { functions.buildNewDirectory( data, fileTree ); }
					, 401: SessionService.getInstance().displayLogin
					, 404: LoggingService.getInstance().logNotFound
					, 500: LoggingService.getInstance().logInternalError
				});
			}
			, filterMenu: function ( event ) {
				var $filter = $( this );
				var pattern = $filter.val().trim().replace( /[%]/g, "[\\S]*" ).replace( /[_]/g, "[\\S]" );
				var $menu = $container.find( '.menu .content .directory-structure .root > ul' );

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

						$menu.find( '.fa-file' ).next().each( function() {
							var $thiz = $( this );

							if ( matcher.test( $thiz.html() ) ) {
								var $parent = $thiz.parent();

								do {
									$parent.show();

									$parent = $parent.parent().parent();
								} while ( $parent.prop( 'tagName' ) == 'LI' );
							}
						} );

						$menu.find( '.fa-folder' ).next().each( function() {
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
				LoggingService.getInstance().displayError( 'Parent directory no longer exists or has restricted access' );
				functions.closePromptContainer();
				functions.displayFilesystem();
			}
			, newDirectoryFailure: function ( data ) {
				LoggingService.getInstance().displayError( 'New directory already exists or is invalid syntax' );
			}
			, newDirectorySuccess: function ( data ) {
				LoggingService.getInstance().displaySuccess( 'Directory created' );
				functions.closePromptContainer();
				functions.displayFilesystem();
			}
			, submitNewDirectoryOnEnter: function ( event ) {
				if ( KeyService.getInstance().enter( event ) ) {
					var newDirectory = $container.find( '.prompt-container' ).prop( 'fileTree' ).join( '/' );
					newDirectory += '/'+ $( this ).val(); 

					AjaxService.getInstance().POST({
						url: './private/?p=files/directories/'+ newDirectory
						, input: { }
						, success: functions.newDirectorySuccess
						, 401: functions.displayLogin
						, 498: functions.newDirectoryFailure
						, 499: functions.invalidReference
						, 500: AjaxService.getInstance().logInternalError
					});
				}
			}
			, toggleSearchTips: function () {
				var $tipSearch = $container.find( '.tip-search' );

				$container.find( '.menu .search-container' ).mouseover( function() {
					$tipSearch.show();
				} );

				$container.find( '.menu .search-container' ).mouseout( function() {
					$tipSearch.hide();
				} );
			}
		};

		var api = {
			privateFunctions: functions
			, displayWorkspace: function () {
				AjaxService.getInstance().GET({
					url: './public/views/workspace.view'
					, success: functions.buildWorkspace
					, 401: SessionService.getInstance().displayLogin
					, 404: LoggingService.getInstance().logNotFound
					, 500: LoggingService.getInstance().logInternalError
				});
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
