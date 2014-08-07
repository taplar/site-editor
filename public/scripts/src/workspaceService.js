var WorkspaceService = {
	getInstance: function(){
		var ajaxService = AjaxService.getInstance();
		var authService = AuthService.getInstance();
		var keyService = KeyService.getInstance();
		var loggingService = LoggingService.getInstance();

		var workspaceService = {
			actionDisplayMenu: function(event){
			}
			,displayWorkspace: function(){
				ajaxService.GET({
					url: 'public/views/workspace.html'
					,fnSuccess: workspaceService.processDisplayWorkspace
					,fnFailure: loggingService.unrecoverableError
				});
			}
			,processDisplayWorkspace: function(rawHtml){
				try {
					Require.all(rawHtml);

					$('.container').html(rawHtml);
					$('.container .menuIndicator').mouseover(workspaceService.actionDisplayMenu);
					$('.container .logout').click(authService.actionLogout);
				} catch (error){
					loggingService.unrecoverableError(error);
				}
			}
		};

		return workspaceService;
	}
};
