var KeyService = {
	getInstance: function() {
		var isCode = function( e, keyCode ) {
			return ( e.keyCode == keyCode );
		};

		var keyService = {
			isEnterPressed: function( e ) { return isCode( e, 13 ); }
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