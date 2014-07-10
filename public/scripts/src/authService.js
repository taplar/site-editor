var AuthService = {
	getInstance: function(){
		var ajaxService = AjaxService.getInstance();
		var loggingService = LoggingService.getInstance();

		return {
			processValidate: function(){
			}
			,validate: function(){
				ajaxService.GET({
					url: '?auth/validate'
					,fnSuccess: this.processValidate
					,fnFailure: loggingService.unrecoverableError
				});
			}
		};
	}
};
