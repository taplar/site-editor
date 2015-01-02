var WorkspaceService = function () {
	var instance = null;

	var buildApi = function () {
		var functions = {
			buildFilesystem: function ( data ) {
				var $ul = $( '<ul>' );

				functions.displayFilesInDirectory( $ul, $.parseJSON( data ) );

				$( '.root ul' ).remove();
				$ul.appendTo( $( '.root' ) );
				$( '.root > .new-directory' ).click( functions.displayNewDirectory );
				$( '.search .pattern' ).trigger( 'keyup' );
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
				$( '.container .menu' ).remove();
				$( '.container' ).append( data );

				$( '.container .menu .control' ).click( function() {
					$( '.container .menu' ).remove();
				} );

				functions.toggleSearchTips();
				functions.displayFilesystem();
				$( '.search .pattern' ).keyup( functions.filterMenu );
				$( '.search .pattern' ).focus();
			}
			, buildNewDirectory: function ( data, fileTreeArray ) {
				var $prompt = $( data );

				$prompt.find( '.existing-directory' ).html( fileTreeArray.join( '/' ) +'/' );
				$prompt.prop( 'fileTree', fileTreeArray );

				$( '.prompt-container' ).remove();
				$prompt.appendTo( $( '.container' ) );

				$( '.prompt-container .close' ).click( function () {
					$( '.prompt-container' ).remove();
				} );

				$( '#newdirectory' ).keyup( functions.submitNewDirectoryOnEnter  );
				$( '#newdirectory' ).focus();
			}
			, buildWorkspace: function ( data ) {
				$( '.container' ).html( data );
				$( '.container .menuIndicator' ).mouseover( functions.displayMenu );
				$( '.container .logout' ).click( SessionService.getInstance().logout );
			}
			, displayFileInDirectory: function ( $filename, $directory ) {
				$( '<li>' )
					.append( $( '<i>', { class: 'fa fa-file'} ) )
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
					url: './private/?files'
					, success: functions.buildFilesystem
					, 401: SessionService.getInstance().displayLogin
					, 500: LoggingService.getInstance().logInternalError
				});
			}
			, displaySubdirectory: function ( $directoryName, $directory, $subfiles ) {
				var $sublist = $( '<ul>' );
				var $listItem = $( '<li>' );

				$listItem
					.append( $( '<i>', { class: 'fa fa-folder subdirectory'} ) )
					.append( $( '<span>', {
						class: 'file-name'
						, html: $directoryName
					} ) )
					.append( $( '<span>', { class: 'new-directory' } ) )
					.find( '.new-directory' )
						.append( $( '<i>', { class: 'fa fa-folder' } ) )
						.append( $( '<i>', { class: 'fa fa-plus' } ) )
					.end()
					.append( $sublist )
					.appendTo( $directory );

					functions.displayFilesInDirectory( $sublist, $subfiles );
					$listItem.find( '> .new-directory' ).click( functions.displayNewDirectory );
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
				var $menu = $( ".container .menu .content .directory-structure .root > ul" );

				try {
					$menu.find( "li" ).show();

					if ( pattern.length > 0 ) {
						if ( pattern.charAt( 0 ) != "^" ) {
							pattern = "^"+ pattern;
						}

						if ( pattern.charAt( pattern.length - 1 ) != "$" ) {
							pattern += "$";
						}

						var matcher = new RegExp( pattern );

						$menu.find( "li" ).hide();

						$menu.find( ".fa-file" ).next().each( function() {
							if ( matcher.test( $( this ).html() ) ) {
								var $parent = $( this ).parent();

								do {
									$parent.show();

									$parent = $parent.parent().parent();
								} while ( $parent.prop( "tagName" ) == "LI" );
							}
						} );

						$menu.find( ".fa-folder" ).next().each( function() {
							if ( matcher.test( $( this ).html() ) ) {
								var $parent = $( this ).parent();

								$parent.find( "li" ).show();

								do {
									$parent.show();

									$parent = $parent.parent().parent();
								} while ( $parent.prop( "tagName" ) == "LI" );
							}
						} );
					}
				} catch ( e ) {
					$menu.find( "li" ).hide();
				}
			}
			, invalidReference: function ( data ) {
				LoggingService.getInstance().displayError( 'Parent directory no longer exists' );
				$( '.prompt-container' ).remove();
				functions.displayFilesystem();
			}
			, newDirectoryFailure: function ( data ) {
				LoggingService.getInstance().displayError( 'New directory already exists or is invalid syntax' );
			}
			, newDirectorySuccess: function ( data ) {
				LoggingService.getInstance().displaySuccess( 'Directory created' );
				$( '.prompt-container' ).remove();
				functions.displayFilesystem();
			}
			, submitNewDirectoryOnEnter: function ( event ) {
				if ( KeyService.getInstance().enter( event ) ) {
					AjaxService.getInstance().POST({
						url: './private/?files/directories'
						, input: {
							path: $( '.prompt-container' ).prop( 'fileTree' )
							, filename: $( this ).val()
						}
						, success: functions.newDirectorySuccess
						, 401: functions.displayLogin
						, 498: functions.newDirectoryFailure
						, 499: functions.invalidReference
						, 500: AjaxService.getInstance().logInternalError
					});
				}
			}
			, toggleSearchTips: function () {
				$( '.container .menu .search-container' ).mouseover( function() {
					$( '.tip-search' ).show();
				} );

				$( '.container .menu .search-container' ).mouseout( function() {
					$( '.tip-search' ).hide();
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
