var WorkspaceService = {
	getInstance: function(){
		var ajaxService = AjaxService.getInstance();
		var keyService = KeyService.getInstance();
		var loggingService = LoggingService.getInstance();

		var workspaceService = {
			displayWorkspace: function(){
				ajaxService.GET({
					url: 'public/views/workspace.html'
					,fnSuccess: workspaceService.processDisplayWorkspace
					,fnFailure: loggingService.unrecoverableError
				});
			}
			,processDisplayWorkspace: function(rawHtml){
				try {
					Require.all(rawHtml);
				} catch (error){
					loggingService.unrecoverableError(error);
				}
			}
		};

		return workspaceService;
	}
};
