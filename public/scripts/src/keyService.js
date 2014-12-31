var KeyService = function () {
	var instance = null;

	var buildApi = function () {
		var functions = {
		};

		var api = {
			privateFunctions: functions
			, enter: function ( event ) {
				var code = event.which;

				if ( typeof code == 'undefined' ) {
					code = event.keyCode;
				}

				return ( code == 13 );
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
