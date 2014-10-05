var KeyService = new function() {
	var instance = null;

	var buildApi = function() {
		var functions = {
			keyCodeCreatedEvent: function( event, keyCode ) {
				return ( event.keyCode == keyCode );
			}
		};

		return {
			privateFunctions: functions
			, isEnter: function( event ) {
				return functions.keyCodeCreatedEvent( event, 13 );
			}
		};
	};

	return {
		getInstance: function() {
			if ( instance == null ) {
				instance = buildApi();

				delete instance.privateFunctions;
			}

			return instance;
		}
		, getTestInstance: function() {
			return buildApi();
		}
	};
}();




/*
	var KeyTest = {
		isCode: function(e, keyCode){ return (e.keyCode == keyCode); }
		,isCtrl: function(e){ return KeyTest.isCode(e, 17); }
		,isEnter: function(e){ return KeyTest.isCode(e, 13); }
		,isS: function(e){ return KeyTest.isCode(e, 83); }
		,isTab: function(e){ return KeyTest.isCode(e, 9); }
	};
*/