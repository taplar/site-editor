var LoggingService = new function() {
	var instance = null;

	var functions = {
		displayMessage: function( message, messageClass ) {
			var $msg = $( "<div>", {
				class: messageClass
				, html: message
			} );

			$( "body" ).append( $msg );

			setTimeout( function() {
				$msg
					.css( "top", "7px" )
					.css( "right", "125px" );

				setTimeout( function() {
					$msg.css( "top", "-50px" );
					
					setTimeout( function() {
						$msg.remove();
					}, 4000 );
				}, 4000 );
			}, 1000 );
		}
	};

	var buildApi = function( functions ) {
		return {
			displayError: function( message ) {
				functions.displayMessage( message, "error" );
			}
			, displayInfo: function( message ) {
				functions.displayMessage( message, "info" );
			}
			, displaySuccess: function( message ) {
				functions.displayMessage( message, "success" );
			}
			, recoverableError: function( error ) {
				console.log( "Error occured.  Please try again.  If error persists, try logging in again.   If unresolved, please contact the site administrator for further assistance." );

				if ( typeof error !== "undefined" ) {
					console.log( error );
				}

				this.displayError( "Error occured.  Please try again or check console for more information." );
			}
			, requiredInput: function( field ) {
				this.displayError( "Required Input: "+ field );
			}
			, unrecoverableError: function( error ) {
				console.log( "Unrecoverable error occured.  If this does not resolve itself, contact the site administrator for further assistance." );

				if ( typeof error !== "undefined" ) {
					console.log( error );
				}

				this.displayError( "Error occured.  Check console for more information." );
			}
		};
	};

	return {
		getInstance: function() {
			if ( instance != null ) {
				return instance;
			}

			instance = buildApi( functions );

			return instance;
		}
		, getTestInstance: function() {
			var functionsClone = Require.clone( functions );
			var instance = buildApi( functionsClone );

			instance.privateFunctions = functionsClone;
			
			return instance;
		}
	};
}();
