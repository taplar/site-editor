var SessionService = function () {
	var instance = null;

	var buildApi = function () {
		var $container = $( '.container' );

		var functions = {
			buildLoginForm: function ( data ) {
				$container.html( data );
				$( '#userid, #password' ).keyup( functions.submitLoginOnEnter );
				$( '#userid' ).focus();
			}
			, loginFailure: function () {
				LoggingService.getInstance().displayError( 'Invalid Credentials' );
			}
			, logoutSuccess: function ( data ) {
				LoggingService.getInstance().displaySuccess( 'Logged Out' );
				api.displayLogin( data );
			}
			, submitLoginOnEnter: function ( event ) {
				if ( KeyService.getInstance().enter( event ) ) {
					AjaxService.getInstance().POST({
						url: './private/?sessions'
						, input: {
							userid: $( '#userid' ).val()
							, password: $( '#password' ).val()
						}
						, success: WorkspaceService.getInstance().displayWorkspace
						, 401: functions.loginFailure
						, 500: LoggingService.getInstance().logInternalError
					});
				}
			}
		};

		var api = {
			privateFunctions: functions
			, displayLogin: function () {
				AjaxService.getInstance().GET({
					url: './public/views/login.view'
					, success: functions.buildLoginForm
					, 404: LoggingService.getInstance().logNotFound
					, 500: LoggingService.getInstance().logInternalError
				});
			}
			, logout: function () {
				AjaxService.getInstance().DELETE({
					url: './private/?sessions'
					, success: functions.logoutSuccess
					, failure: api.displayLogin
				});
			}
			, validateActiveSession: function () {
				AjaxService.getInstance().GET({
					url: './private/?sessions'
					, success: WorkspaceService.getInstance().displayWorkspace
					, 401: api.displayLogin
					, 500: LoggingService.getInstance().logInternalError
				});
			}
		};

		return api;
	};

	return {
		getInstance: function () {
			if ( instance == null ) {
				instance = buildApi();

				delete instance.privateFunctions;
			}

			return instance;
		}
		, getTestInstance: function () {
			return buildApi();
		}
	};
}();
