var WorkspaceService = {
	getInstance: function(){
		var ajaxService = AjaxService.getInstance();
		var keyService = KeyService.getInstance();
		var loggingService = LoggingService.getInstance();

		var workspaceService = {
			displayWorkspace: function(){
			}
		};

		return workspaceService;
	}
};
