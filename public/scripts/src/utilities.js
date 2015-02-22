var Utilities = {
	defined: function ( object ) {
		return ( typeof object !== 'undefined' );
	}
	, valueInList: function ( value ) {
		var list = Array.prototype.slice.call( arguments ).slice( 1 );

		return ( list.indexOf( value ) > -1 );
	}
};
