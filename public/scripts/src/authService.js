var AuthService = {
	getInstance: function(){
		var ajaxService = AjaxService.getInstance();
		var keyService = KeyService.getInstance();
		var loggingService = LoggingService.getInstance();

		var authService = {
			actionLogout: function(event){
				ajaxService.GET({
					url: '?auth/revoke'
					,fnSuccess: authService.processLogout
					,fnFailure: loggingService.unrecoverableError
				});
			}
			,actionSubmitLogin: function(event){
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
					$('#userid').focus();
				} catch (error){
					loggingService.unrecoverableError(error);
				}
			}
			,processLoginSubmit: function(jsonString){
				try {
					Require.all(jsonString);

					var jsonObject = $.parseJSON(jsonString);

					Require.all(jsonObject, 'responseCode');

					var workspaceService = WorkspaceService.getInstance();

					authService.processResponseCode({
						responseCode: jsonObject.responseCode
						,fnAuthorized: workspaceService.displayWorkspace
						,fnUnauthorized: function(){ loggingService.displayError('Invalid Credentials'); }
					});
				} catch (error){
					loggingService.unrecoverableError(error);
				}
			}
			,processLogout: function(jsonString){
				try {
					Require.all(jsonString);

					var jsonObject = $.parseJSON(jsonString);

					Require.all(jsonObject, 'responseCode');

					authService.processResponseCode({
						responseCode: jsonObject.responseCode
						,fnAuthorized: function(){ /* should not happen */ }
						,fnUnauthorized: function(){
							authService.displayLogin();
							loggingService.displaySuccess('Logout Success');
						}
					});
				} catch (error){
					loggingService.unrecoverableError(error);
				}
			}
			,processResponseCode: function(jsonObject){
				Require.all(jsonObject, 'responseCode', 'fnAuthorized', 'fnUnauthorized');

				switch (jsonObject.responseCode){
					case 'AUTHORIZED':
						jsonObject.fnAuthorized();
						break;
					case 'UNAUTHORIZED':
						jsonObject.fnUnauthorized();
						break;
					case 'INVALID_REQUEST':
						throw new Error('Invalid Request Occured');
					case 'INTERNAL_ERROR':
						throw new Error('Internal Error Occured');
					default:
						throw new Error('Unrecognised Response Code: '+ jsonObject.responseCode);
				}
			}
			,processValidate: function(jsonString){
				try {
					Require.all(jsonString);

					var jsonObject = $.parseJSON(jsonString);

					Require.all(jsonObject, 'responseCode');

					var workspaceService = WorkspaceService.getInstance();
					
					authService.processResponseCode({
						responseCode: jsonObject.responseCode
						,fnAuthorized: workspaceService.displayWorkspace
						,fnUnauthorized: authService.displayLogin
					});
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
