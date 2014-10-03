var KeyService = {
	getInstance: function() {
		var isCode = function( event, keyCode ) {
			return ( event.keyCode == keyCode );
		};

		var keyService = {
			isEnterPressed: function( event ) {
				return isCode( event, 13 );
			}
		};

		return keyService;
	}
};




/*
	var KeyTest = {
		isCode: function(e, keyCode){ return (e.keyCode == keyCode); }
		,isCtrl: function(e){ return KeyTest.isCode(e, 17); }
		,isEnter: function(e){ return KeyTest.isCode(e, 13); }
		,isS: function(e){ return KeyTest.isCode(e, 83); }
		,isTab: function(e){ return KeyTest.isCode(e, 9); }
	};
*/