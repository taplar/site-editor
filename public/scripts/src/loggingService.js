var LoggingService = {
	getInstance: function(){
		var displayMessage =function(message, clazz){
			var $msg = $('<div class="'+ clazz +'">'+ message +'</div>');

			$('body').append($msg);

			setTimeout(function(){
				$msg.css('top', '7px');
				$msg.css('right', '125px');

				setTimeout(function(){
					$msg.css('top', '-50px');

					setTimeout(function(){
						$msg.remove();
					}, 4000);
				}, 4000);
			}, 1000);
		};

		return {
			displayError: function(message){ displayMessage(message, 'error'); }
			,unrecoverableError: function(){
				console.log('Unrecoverable error occured.  If this does not resolve itself, contact the site administrator for further assistance.');
				this.displayError('Error occured.  Check console for more information.');
			}
		};
	}
};
