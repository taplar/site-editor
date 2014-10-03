var AuthService = {
	getInstance: function() {
		var ajaxService = AjaxService.getInstance();
		var keyService = KeyService.getInstance();
		var loggingService = LoggingService.getInstance();

		var logErrorIfUserIdOrPasswordIsUndefined = function( json ) {
			if ( typeof json.userid === "undefined" ) {
				loggingService.unrecoverableError( new Error( "Required field undefined: userid" ) );
			} else if ( typeof json.password === "undefined" ) {
				loggingService.unrecoverableError( new Error( "Required field undefined: password" ) );
			}
		};

		var executeCallbackIfCredentialsAreNotBlank = function( json, callback ) {
			if ( json.userid.trim().length > 0 ) {
				if ( json.password.trim().length > 0 ) {
					callback();
				} else {
					loggingService.requiredInput( "password" );
					$( "#password" ).focus();
				}
			} else {
				loggingService.requiredInput( "userid" );
				$( "#userid" ).focus();
			}
		};

		var authService = {
			actionSubmitLogin: function( event ) {
				var json = {
					userid: $( ".prompt-container #userid" ).val()
					, password: $( ".prompt-container #password" ).val()
				};

				logErrorIfUserIdOrPasswordIsUndefined( json );

				if ( keyService.isEnterPressed( event ) ) {
					executeCallbackIfCredentialsAreNotBlank( json, function() {
						ajaxService.POST({
							url: "?auth/validate"
							, input: json
							, fnSuccess: authService.processLoginSubmit
							, fnFailure: loggingService.unrecoverableError
						});
					} );
				}
			}
			, displayLogin: function() {
				ajaxService.GET({
					url: "public/views/prompt.html"
					, fnSuccess: authService.processDisplayLogin
					, fnFailure: loggingService.unrecoverableError
				});
			}
			, logout: function() {
				ajaxService.GET({
					url: "?auth/revoke"
					,fnSuccess: authService.processLogout
					,fnFailure: loggingService.unrecoverableError
				});
			}
			, processDisplayLogin: function( html ) {
				try {
					Require.all( html );

					var $input = $( "<div>", {
						class: "input center"
					} );

					var $promptTemplate = $( html );

					$promptTemplate
						.find( ".title" )
							.html( "Login" )
						.end()
						.find( ".content" )
							.append( $input.clone().append( $( "<input>", {
								type: "text"
								, placeholder: "userid"
								, id: "userid"
								, value: ""
							} ) ) )
							.append( $input.clone().append( $( "<input>", {
								type: "password"
								, placeholder: "password"
								, id: "password"
								, value: ""
							} ) ) );

					$( ".container" )
						.html( "" )
						.append( $promptTemplate );

					$promptTemplate.find( "#password" ).keyup( authService.actionSubmitLogin );
					$promptTemplate
						.find( "#userid" )
							.keyup( authService.actionSubmitLogin )
							.focus();
				} catch ( error ) {
					loggingService.unrecoverableError( error );
				}
			}
			, processLoginSubmit: function( jsonString ) {
				try {
					Require.all( jsonString );

					var responseJson = $.parseJSON( jsonString );

					Require.all( responseJson, "responseCode" );

					var workspaceService = WorkspaceService.getInstance();

					authService.processResponseCode({
						responseCode: responseJson.responseCode
						, fnAuthorized: workspaceService.displayWorkspace
						, fnUnauthorized: function() {
							loggingService.displayError( "Invalid Credentials" );
						}
					});
				} catch ( error ) {
					loggingService.unrecoverableError( error );
				}
			}
			, processLogout: function( jsonString ) {
				try {
					Require.all( jsonString );

					var responseJson = $.parseJSON( jsonString );

					Require.all( responseJson, "responseCode" );

					authService.processResponseCode({
						responseCode: responseJson.responseCode
						, fnAuthorized: function() { /* should not happen */ }
						, fnUnauthorized: function() {
							authService.displayLogin();
							loggingService.displaySuccess( "Logout Success" );
						}
					});
				} catch ( error ){
					loggingService.unrecoverableError( error );
				}
			}
			, processResponseCode: function( responseJson ) {
				Require.all( responseJson, "responseCode", "fnAuthorized", "fnUnauthorized" );

				switch ( responseJson.responseCode ) {
					case "AUTHORIZED":
						responseJson.fnAuthorized();
						break;
					case "UNAUTHORIZED":
						responseJson.fnUnauthorized();
						break;
					case "INVALID_REQUEST":
						throw new Error( "Invalid Request Occured" );
					case "INTERNAL_ERROR":
						throw new Error( "Internal Error Occured" );
					default:
						throw new Error( "Unrecognised Response Code: "+ responseJson.responseCode );
				}
			}
			, processValidate: function( jsonString ) {
				try {
					Require.all( jsonString );

					var responseJson = $.parseJSON( jsonString );

					Require.all( responseJson, "responseCode" );

					var workspaceService = WorkspaceService.getInstance();

					authService.processResponseCode({
						responseCode: responseJson.responseCode
						, fnAuthorized: workspaceService.displayWorkspace
						, fnUnauthorized: authService.displayLogin
					});
				} catch ( error ) {
					loggingService.unrecoverableError( error );
				}
			}
			, validate: function(){
				ajaxService.GET({
					url: "?auth/validate"
					, fnSuccess: authService.processValidate
					, fnFailure: loggingService.unrecoverableError
				});
			}
		};

		return authService;
	}
};
