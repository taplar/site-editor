var LoggingService = function () {
	var instance = null;

	var buildApi = function () {
		var $body = $( 'body' );

		var functions = {
			displayMessage: function ( message, messageClass ) {
				var $msg = $( '<div>', {
					class: 'message '+ messageClass
					, html: message
				} );

				$body.append( $msg );

				setTimeout( functions.transitionMessageToTopRightCorner( $msg ), 1000 );
			}
			, transitionMessageOffTheTopOfThePage: function ( $msg ) {
				return function () {
					$msg.css( 'top', '-50px' );

					setTimeout( function() {
						$msg.remove();
					}, 4000 );
				};
			}
			, transitionMessageToTopRightCorner: function ( $msg ) {
				return function () {
					$msg
						.css( 'top', '7px' )
						.css( 'right', '125px' );

					setTimeout( functions.transitionMessageOffTheTopOfThePage( $msg ), 4000 );
				};
			}
		};

		var api = {
			privateFunctions: functions
			, displayError: function ( message ) {
				functions.displayMessage( message, 'error' );
			}
			, displayInfo: function ( message ) {
				functions.displayMessage( message, 'info' );
			}
			, displaySuccess: function ( message ) {
				functions.displayMessage( message, 'success' );
			}
			, logInternalError: function () {
				api.displayError( 'Internal Error.  Please see console for more details.' );
				console.log( 'Previous request encountered an error.  Please try again.  If this persists, please contact your site administrator.' );
			}
			, logNotFound: function () {
				api.displayInfo( 'Resource Not Found.  Please see console for more details.' );
				console.log( 'Requested resource was not found.  Please try again.  If this persists, please contact your site administrator.' );
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
