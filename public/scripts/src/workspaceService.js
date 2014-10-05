var WorkspaceService = new function() {
	var instance = null;

	var buildApi = function() {
		var ajaxService = AjaxService.getInstance();
		var authService = AuthService.getInstance();
		var loggingService = LoggingService.getInstance();

		var functions = {
			addFolderToMenu: function( jsonObject, $list ) {
				for ( key in jsonObject ) {
					if ( isNaN( key ) ) {
						var $sublist = $( "<ul>" );

						$( "<li>" )
							.append( $("<i>", { class: "fa fa-folder subfolder" } ) )
							.append( $( "<span>", { html: key } ) )
							.append( $( "<span>", { class: "new-folder" } ) )
							.find( ".new-folder" )
								.append( $( "<i>", { class: "fa fa-folder" } ) )
								.append( $( "<i>", { class: "fa fa-plus" } ) )
							.end()
							.append( $sublist )
							.appendTo( $list );

						functions.addFolderToMenu( jsonObject[ key ], $sublist );
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
						.append( $( "<span>", { html: "root" } ) )
						.append( $( "<span>", { class: "new-folder" } ) )
						.find( ".new-folder" )
							.append( $( "<i>", { class: "fa fa-folder" } ) )
							.append( $( "<i>", { class: "fa fa-plus" } ) )
						.end()
						.append( $( "<ul>" ) );

				functions.addFolderToMenu( jsonObject, $menu.find( ".directoryStructure li ul" ) );

				$( ".container .menu" ).remove();
				$( ".container" ).append($menu);
				$( ".container .menu .control" ).click( function() {
					$( ".container .menu" ).remove();
				} );
				$( ".container .menu .search input" ).keyup( functions.filterMenu );
				$( ".container .menu .search-container ").mouseover( function() {
					$( ".tip-search" ).show();
				} );
				$( ".container .menu .search-container ").mouseout( function() {
					$( ".tip-search" ).hide();
				} );
				$( ".container .menu .new-folder" ).click( functions.displayNewFolder );
			}
			, displayMenu: function() {
				ajaxService.GET({
					url: "?menu/list"
					, fnSuccess: functions.processDisplayMenu
					, fnFailure: loggingService.recoverableError
				});
			}
			, displayNewFolder: function() {
				var parent = this;

				ajaxService.GET({
					url: "public/views/prompt.html"
					, fnSuccess: function( rawHtml ) { functions.processDisplayNewDirectory( parent, rawHtml ); }
					, fnFailure: loggingService.recoverableError
				});
			}
			, filterMenu: function( event ) {
				var $filter = $( this );
				var pattern = $filter.val().trim().replace( /[%]/g, "[\\S]*" ).replace( /[_]/g, "[\\S]" );
				var $menu = $( ".container .menu .content .directoryStructure .root > ul" );

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
			, processDisplayMenu: function( jsonString ) {
				try {
					Require.all( jsonString );

					var jsonObject = $.parseJSON( jsonString );

					Require.all( jsonObject, "files", "responseCode" );

					var fnBuildMenu = function() {
						functions.buildMenu( jsonObject.files );
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
			, processDisplayNewDirectory: function( object, rawHtml ) {
				try {
					Require.all( rawHtml );

					var $relatedDirectory = $( object ).parent();
					var $parent = $( "<div>", { class: "existing-directory center" } );
					var $directoryInput = $( "<div class='input center'><input type='text' placeholder='new directory' id='directory' value='' /></div>" );
					var directories = new Array();

					while ( $relatedDirectory.find( "> .fa-folder" ).length ) {
						directories.push( $relatedDirectory.find( "> .fa-folder" ).next().html() );
						$relatedDirectory = $relatedDirectory.parent().parent();
					}

					var $prompt = $( rawHtml );
					$prompt.addClass( "prompt-container-overlay" );
					$prompt.find( ".title" ).append( $( "<i>", { class: "fa fa-times close" } ) );
					$prompt.find( ".content" ).append( $( "<div>", { class: "existing-directory center" } ) );
					$prompt.find( ".content" ).append( $directoryInput );

					$( ".container" ).append( $prompt );
					$directoryInput.find( "#directory" ).focus();

					$prompt.find( ".close" ).click( function() {
						$prompt.remove();
					} );
				} catch ( error ) {
					loggingService.recoverableError( error );
				}
			}
			, processDisplayWorkspace: function( rawHtml ) {
				try {
					Require.all( rawHtml );

					$( ".container" ).html( rawHtml );
					$( ".container .menuIndicator" ).mouseover( functions.displayMenu );
					$( ".container .logout" ).click( authService.logout );
				} catch ( error ) {
					loggingService.unrecoverableError( error );
				}
			}
		};

		return {
			privateFunctions: functions
			, displayWorkspace: function() {
				ajaxService.GET({
					url: "public/views/workspace.html"
					, fnSuccess: functions.processDisplayWorkspace
					, fnFailure: loggingService.unrecoverableError
				});
			}
		};
	};

	return {
		getInstance: function() {
			if ( instance == null ) {
				instance = buildApi();

				delete instance.privateFunctions;
			}

			return instance;
		}
		, getTestInstance: function() {
			return buildApi();
		}
	};
}();



























/*

var EDITOR = {
	actionCreateFilePrompt: function(path, ajaxService){
		ajaxService.GET('public/views/prompt.html', {
			fnSuccess: function(data){ EDITOR.processFileCreatePrompt(data, path, ajaxService); }
			,fnFailure: EDITOR.recoverableError
		});
	}
	,actionSubmitCreateFilePrompt: function(e, path, ajaxService){
		if (EDITOR.KeyTest.isEnter(e)){
			var filename = $('.prompt #filename').val();
			var filenamePattern = /^[a-zA-Z][a-zA-Z0-9._-]*[.][a-zA-Z0-9]+$/;

			if (filenamePattern.test(filename)){
				path.push(filename);

				ajaxService.POST('?file/create', { file: path }, {
					fnSuccess: function(data){
						EDITOR.displayInfo(data);








						$('.prompt-container').remove();
					}
					,fnFailure: EDITOR.recoverableError
				});
			} else {
				EDITOR.displayError("Invalid filename");
			}
		}
	}
	,buildFile: function($parent, path, file, ajaxService){
		//var $delete = $('<i class="fa fa-times red" />');
		var $li = $('<li><i class="fa fa-file file-icon" /></li>');
		//var $newFile = $('<i class="fa fa-file gray" />');
		//var $newFolder = $('<i class="fa fa-folder gray" />');
		var $ul = $('<ul></ul>');
		
		//$newFile.click(THIS.actionNewFile(path, key));
		//$newFolder.click(THIS.actionNewFolder(path, key));
		//$delete.click(THIS.actionDeleteFolder(path, key));
		//$li.click(THIS.actionToggleExpansion);
		
		path.push(file);
		
		$li.append(file)
			//.append('&nbsp;').append($newFile)
			//.append('&nbsp;').append($newFolder)
			//.append('&nbsp;').append($delete)
			.append($ul);
		
		$parent.append($li);
	}
	,buildFolder: function($parent, path, folder, files, ajaxService){
		//var $delete = $('<i class="fa fa-times red" />');
		var $li = $('<li><i class="fa fa-folder folder-icon subfolder" /></li>');
		var $newFile = $('<span class="file-new-icon"><i class="fa fa-file" /><i class="fa fa-plus" /></span>');
		//var $newFolder = $('<i class="fa fa-folder gray" />');
		var $ul = $('<ul></ul>');
		
		path.push(folder);

		$newFile.click(function(){ EDITOR.actionCreateFilePrompt(path, ajaxService); });
		//$newFolder.click(THIS.actionNewFolder(path, key));
		//$delete.click(THIS.actionDeleteFolder(path, key));
		//$li.click(THIS.actionToggleExpansion);
		
		$li.append(folder).append($newFile)
			//.append('&nbsp;').append($newFolder)
			//.append('&nbsp;').append($delete)
			.append($ul);
		
		EDITOR.buildFileList($ul, path, files, ajaxService);
		
		$parent.append($li);
	}
	,buildRootFolder: function($parent, ajaxService){
		var $li = $('<li><i class="fa fa-folder folder-icon" /></li>');
		var $newFile = $('<span class="file-new-icon"><i class="fa fa-file" /><i class="fa fa-plus" /></span>');
		//var $newFolder = $('<i class="fa fa-folder gray" />');
		var $ul = $('<ul></ul>');
		
		//$newFile.click(THIS.actionNewFile(null, 'root'));
		//$newFolder.click(THIS.actionNewFolder(null, 'root'));
		
		$li.append('root').append($newFile)
			//.append('&nbsp;').append($newFolder)
			.append($ul);
		
		$parent.append($li);
		
		return $ul;
	}
	,processApplicationEntry: function(jsonString, ajaxService){
		try {
			var response = $.parseJSON(jsonString);

			Require.all(response, 'responseCode');

			if (response.responseCode == 'UNAUTHORIZED'){
				EDITOR.displayLogin(ajaxService);
			} else if (response.responseCode == 'AUTHORIZED'){
				EDITOR.displayWorkspace(ajaxService);
			} else {
				EDITOR.unrecoverableError();
			}
		} catch (e){
			console.log(e);
			EDITOR.unrecoverableError();
		}
	}
	,processFileCreatePrompt: function(data, path, ajaxService){
		var $prompt = $(data);
		var $content = $prompt.find('.content');

		$prompt.find('.title').html('New File');
		$content.append(
			'<div class="input center">'
				+'<input type="text" placeholder="filename" id="filename" value="" />'
			+'</div>');

		$('.container').append($prompt);
		$('.prompt .input input').keyup(function(e){ EDITOR.actionSubmitCreateFilePrompt(e, path, ajaxService); });
		$('.prompt .input input:first').focus();
	}
};




*/
