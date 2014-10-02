var WorkspaceService = {
	getInstance: function() {
		var ajaxService = AjaxService.getInstance();
		var authService = AuthService.getInstance();
		var keyService = KeyService.getInstance();
		var loggingService = LoggingService.getInstance();

		var workspaceService = {
			actionFilterMenu: function( event ) {
				var $filter = $(this);
				var pattern = $filter.val().trim().replace( /[%*]/g, "[\\S]*" ).replace( /[_]/g, "[\\S]" );
				var $menu = $( ".container .menu .content .directoryStructure .root > ul" );

				try {
					var matcher = new RegExp( pattern );

					$menu.find( "li" ).show();

					if ( pattern.length > 0 ) {
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
					}
				} catch ( e ) {
					$menu.find( "li" ).hide();
				}
			}
			, addFolderToMenu: function( jsonObject, $list ) {
				for ( key in jsonObject ) {
					if ( isNaN( key ) ) {
						var $sublist = $( "<ul>" );

						$( "<li>" )
							.append( $("<i>", { class: "fa fa-folder subfolder" } ) )
							.append( $( "<span>", { html: key } ) )
							.append( $sublist )
							.appendTo( $list );

						workspaceService.addFolderToMenu( jsonObject[ key ], $sublist );
					}
				}

				for ( key in jsonObject ) {
					if ( !isNaN( key ) ) {
						$( "<li>" )
							.append( $( "<i>", { class: "fa fa-file" } ) )
							.append( $( "<span>", { html: jsonObject[ key ] } ) )
							.appendTo( $list );
					}
				}
			}
			, buildMenu: function( jsonObject ) {
				var $menu = $( "<div> ", { class: "menu flexbox-v" } )
					.append( $( "<div>", { class: "search" } ) )
					.append( $( "<div>", { class: "content flexible-v" } ) )
					.append( $( "<div>", { class: "control center inflexible" } ) );

				$menu.find( ".search" )
					.append( $( "<div>" ) )
					.find( ":last-child" )
						.append( $( "<div>", { class: "search-container" } ) )
						.find( "> :last-child" )
							.append( $( "<i>", { class: "fa fa-search" } ) )
							.end()
						.append( $( "<div>", { class: "pattern-container" } ) )
						.find( "> :last-child" )
							.append( $( "<input>", { class: "pattern" } ) );

				$menu.find( ".content" )
					.append( $( "<ul>", { class: "directoryStructure" } ));

				$menu.find( ".control" )
					.append( $( "<i>", { class: "fa fa-angle-double-up" } ));

				$menu.find( ".directoryStructure" )
					.append( $( "<li>", { class: "root" } ) )
					.find( ":last-child" )
						.append( $( "<i>", { class: "fa fa-folder" } ) )
						.append( "<span>root</span>" )
						.append( $( "<ul>" ) );

				workspaceService.addFolderToMenu( jsonObject, $menu.find( ".directoryStructure li ul" ) );

				$( ".container .menu" ).remove();
				$( ".container" ).append($menu);
				$( ".container .menu .control" ).click( function() {
					$( ".container .menu" ).remove();
				} );
				$( ".container .menu .search input" ).keyup( workspaceService.actionFilterMenu );
			}
			, displayMenu: function() {
				ajaxService.GET({
					url: "?menu/list"
					, fnSuccess: workspaceService.processDisplayMenu
					, fnFailure: loggingService.recoverableError
				});
			}
			, displayWorkspace: function() {
				ajaxService.GET({
					url: "public/views/workspace.html"
					, fnSuccess: workspaceService.processDisplayWorkspace
					, fnFailure: loggingService.unrecoverableError
				});
			}
			, processDisplayMenu: function( jsonString ) {
				try {
					Require.all( jsonString );

					var jsonObject = $.parseJSON( jsonString );

					Require.all( jsonObject, "files", "responseCode" );

					var fnBuildMenu = function() {
						workspaceService.buildMenu( jsonObject.files );
					};

					var fnRedirectToLogin = function() {
						authService.displayLogin();
						loggingService.displayInfo( "Session Expired" );
					};

					authService.processResponseCode({
						responseCode: jsonObject.responseCode
						, fnAuthorized: fnBuildMenu
						, fnUnauthorized: fnRedirectToLogin
					});
				} catch ( error ) {
					loggingService.recoverableError( error );
				}
			}
			, processDisplayWorkspace: function( rawHtml ) {
				try {
					Require.all( rawHtml );

					$( ".container" ).html( rawHtml );
					$( ".container .menuIndicator" ).mouseover( workspaceService.displayMenu );
					$( ".container .logout" ).click( authService.actionLogout );
				} catch ( error ) {
					loggingService.unrecoverableError( error );
				}
			}
		};

		return workspaceService;
	}
};
