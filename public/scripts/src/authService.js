var AuthService = {
	getInstance: function(){
		var ajaxService = AjaxService.getInstance();
		var keyService = KeyService.getInstance();
		var loggingService = LoggingService.getInstance();

		var authService = {
			actionSubmitLogin: function(event){
				var data = {
					userid: $('.prompt-container #userid').val()
					,password: $('.prompt-container #password').val()
				};

				if (typeof(data.userid) === 'undefined'){
					loggingService.unrecoverableError(new Error('Required field undefined: userid'));
				} else if (typeof(data.password) === 'undefined'){
					loggingService.unrecoverableError(new Error('Required field undefined: password'));
				}

				if (keyService.isEnterPressed(event)){
					data.userid = $.trim(data.userid);
					data.password = $.trim(data.password);

					if (data.userid.length > 0 && data.password.length > 0){
						ajaxService.POST({
							url: '?auth/validate'
							,input: data
							,fnSuccess: authService.processLoginSubmit
							,fnFailure: loggingService.unrecoverableError
						});
					} else {
						if (data.userid.length < 1) {
							loggingService.requiredInput('userid');
						}

						if (data.password.length < 1) {
							loggingService.requiredInput('password');
						}
					}
				}
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
			,processLoginSubmit: function(jsonString){
				try {
					Require.all(jsonString);

					var jsonObject = $.parseJSON(jsonString);

					Require.all(jsonObject, 'returnCode');
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
