var KeyService = new function() {
	var instance = null;

	var functions = {
		keyCodeCreatedEvent: function( event, keyCode ) {
			return ( event.keyCode == keyCode );
		}
	};

	var buildApi = function( functions ) {
		return {
			isEnter: function( event ) {
				return functions.keyCodeCreatedEvent( event, 13 );
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




/*
	var KeyTest = {
		isCode: function(e, keyCode){ return (e.keyCode == keyCode); }
		,isCtrl: function(e){ return KeyTest.isCode(e, 17); }
		,isEnter: function(e){ return KeyTest.isCode(e, 13); }
		,isS: function(e){ return KeyTest.isCode(e, 83); }
		,isTab: function(e){ return KeyTest.isCode(e, 9); }
	};
*/