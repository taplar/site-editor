var LoggingService = {
	getInstance: function() {
		var displayMessage = function( message, clazz ) {
			var $msg = $( "<div>", { class: clazz, html: message} );

			$( "body" ).append($msg);

			setTimeout( function() {
				$msg.css( "top", "7px" );
				$msg.css( "right", "125px" );

				setTimeout( function() {
					$msg.css( "top", "-50px" );
					setTimeout( function() {
						$msg.remove();
					}, 4000 );
				}, 4000 );
			}, 1000 );
		};

		var loggingService = {
			displayError: function( message ) {
				displayMessage( message, "error" );
			}
			, displayInfo: function( message ) {
				displayMessage( message, "info" );
			}
			, displaySuccess: function( message ) {
				displayMessage( message, "success" );
			}
			, recoverableError: function( error ) {
				console.log( "Error occured.  Please try again.  If error persists, try logging in again.   If unresolved, please contact the site administrator for further assistance." );

				if ( typeof error !== "undefined" ) {
					console.log( error );
				}

				loggingService.displayError( "Error occured.  Please try again or check console for more information." );
			}
			, requiredInput: function( field ) {
				loggingService.displayError( "Required Input: "+ field );
			}
			, unrecoverableError: function( error ) {
				console.log( "Unrecoverable error occured.  If this does not resolve itself, contact the site administrator for further assistance." );

				if ( typeof error !== "undefined" ) {
					console.log( error );
				}

				loggingService.displayError( "Error occured.  Check console for more information." );
			}
		};

		return loggingService;
	}
};
