var KeyService = function () {
	var instance = null;

	var buildApi = function () {
		var keyCodes = {
			enter: 13
			, tab: 9
		};

		var functions = {
			keyTriggeredEvent: function ( keyCode, event ) { //TODO: TEST THIS
				var code = event.which;

				if ( typeof code == 'undefined' ) {
					code = event.keyCode;
				}

				return ( keyCode == code );
			}
		};

		var api = {
			privateFunctions: functions
			, enter: function ( event ) {
				return functions.keyTriggeredEvent( keyCodes.enter, event );
			}
			, tab: function ( event ) { //TODO: TEST THIS
				return functions.keyTriggeredEvent( keyCodes.tab, event );
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
