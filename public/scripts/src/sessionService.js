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
			, redirectToHttps: function () {
				var redirectUrl = 'https://' + window.location.hostname;

				if ( window.location.port ) {
					redirectUrl += ":"+ window.location.port[ 0 ] +"443";
				}

				redirectUrl += window.location.pathname;
				window.location.href = redirectUrl;
			}
			, submitLoginOnEnter: function ( event ) {
				if ( KeyService.getInstance().enter( event ) ) {
					AjaxService.getInstance().POST({
						url: './private/?p=sessions'
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
					url: './private/?p=sessions'
					, success: functions.logoutSuccess
					, failure: api.displayLogin
				});
			}
			, validateActiveSession: function () {
				AjaxService.getInstance().GET({
					url: './private/?p=sessions'
					, success: WorkspaceService.getInstance().displayWorkspace
					, 301: functions.redirectToHttps
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
