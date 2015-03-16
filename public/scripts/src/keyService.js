var KeyService = function () {
	var instance = null;

	var buildApi = function () {
		var keyCodes = {
			ctrl: 17
			, enter: 13
			, tab: 9
			, s: 83
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
			, control: function ( event ) {
				return functions.keyTriggeredEvent( keyCodes.ctrl, event );
			}
			, enter: function ( event ) {
				return functions.keyTriggeredEvent( keyCodes.enter, event );
			}
			, tab: function ( event ) {
				return functions.keyTriggeredEvent( keyCodes.tab, event );
			}
			, s: function ( event ) {
				return functions.keyTriggeredEvent( keyCodes.s, event );
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
