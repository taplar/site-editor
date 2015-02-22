var KeyService = function () {
	var instance = null;

	var buildApi = function () {
		var keyCodes = {
			enter: 13
			, tab: 9
		};

		var functions = {
			keyTriggeredEvent: function ( keyCode, event ) {
				var code = event.which;

				if ( !Utilities.defined( code ) ) {
					code = event.keyCode;
				}

				return ( keyCode === code );
			}
		};

		var api = {
			privateFunctions: functions
			, enter: function ( event ) {
				return functions.keyTriggeredEvent( keyCodes.enter, event );
			}
			, tab: function ( event ) {
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
