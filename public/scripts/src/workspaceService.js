var WorkspaceService = {
	getInstance: function() {
		var ajaxService = AjaxService.getInstance();
		var authService = AuthService.getInstance();
		var keyService = KeyService.getInstance();
		var loggingService = LoggingService.getInstance();

		var workspaceService = {
			buildMenu: function( jsonFiles ) {
				console.log( jsonFiles );
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
