var AuthService = {
	getInstance: function(){
		var ajaxService = AjaxService.getInstance();
		var loggingService = LoggingService.getInstance();

		var authService = {
			actionSubmitLogin: function(event){
			}
			,displayLogin: function(){
				ajaxService.GET({
					url: 'public/views/prompt.html'
					,fnSuccess: authService.processDisplayLogin
					,fnFailure: loggingService.unrecoverableError
				});
			}
			,displayWorkspace: function(){
			}
			,processDisplayLogin: function(rawHtml){
				try {
					Require.all(rawHtml);

					var $prompt = $(rawHtml);
					var $userid = $('<div class="input center"><input type="text" placeholder="userid" id="userid" value="" /></div>');
					var $password = $('<div class="input center"><input type="password" placeholder="password" id="password" value="" /></div>');

					$userid.keyup(authService.actionSubmitLogin);
					$password.keyup(authService.actionSubmitLogin);

					$prompt.find('.title').html('Login');
					$prompt.find('.content').append($userid);
					$prompt.find('.content').append($password);

					$('.container').html('');
					$('.container').append($prompt);
				} catch (error){
					loggingService.unrecoverableError(error);
				}
			}
			,processValidate: function(jsonString){
				try {
					Require.all(jsonString);

					var jsonObject = $.parseJSON(jsonString);

					Require.all(jsonObject, 'responseCode');

					switch (jsonObject.responseCode){
						case 'AUTHORIZED':
							authService.displayWorkspace();
							break;
						case 'UNAUTHORIZED':
							authService.displayLogin();
							break;
						case 'INVALID_REQUEST':
							throw new Error('Invalid Request Occured');
						case 'INTERNAL_ERROR':
							throw new Error('Internal Error Occured');
						default:
							throw new Error('Unrecognised Response Code: '+ jsonObject.responseCode);
					}
				} catch (error){
					loggingService.unrecoverableError(error);
				}
			}
			,validate: function(){
				ajaxService.GET({
					url: '?auth/validate'
					,fnSuccess: authService.processValidate
					,fnFailure: loggingService.unrecoverableError
				});
			}
		};

		return authService;
	}
};
