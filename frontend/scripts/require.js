var Require = {
	all: function(args){
		var errors = [];

		if (typeof(args) == 'undefined'){
			errors.push(new Error("Argument 'args' is undefined"));
		} else {
			for (var i = 1; i < arguments.length; i++){
				if (typeof(arguments[i]) != 'string'){
					errors.push(new Error("Invalid argument passed.  Expected: array[,string[,string[,...]]]"));
				} else {
					if (typeof(args[arguments[i]]) == 'undefined'){
						errors.push(new Error('Missing property: '+ arguments[i]));
					}
				}
			}
		}

		if (errors.length > 0){
			throw errors;
		}
	}
};
