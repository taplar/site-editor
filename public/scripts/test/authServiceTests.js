describe('AuthService', function(){
	describe('Validate', function(){
		beforeEach(function(){
			ajaxService = AjaxService.getInstance();
			loggingService = LoggingService.getInstance();

			spyOn(AjaxService, 'getInstance').and.returnValue(ajaxService);
			spyOn(LoggingService, 'getInstance').and.returnValue(loggingService);

			authService = AuthService.getInstance();
		});

		it('Should log unrecoverable error on failure', function(){
			spyOn(loggingService, 'unrecoverableError');

			spyOn(ajaxService, 'GET').and.callFake(function(args){
				args.fnFailure();
			});

			authService.validate();

			expect(loggingService.unrecoverableError.calls.any()).toBe(true);
		});

		it('Should process response on success', function(){
			spyOn(loggingService, 'unrecoverableError');
			spyOn(authService, 'processValidate');

			spyOn(ajaxService, 'GET').and.callFake(function(args){
				args.fnSuccess();
			});

			authService.validate();

			expect(loggingService.unrecoverableError.calls.any()).toBe(false);
			expect(authService.processValidate.calls.any()).toBe(true);
		});
	});

	describe('ProcessValidate', function(){
		beforeEach(function(){
			ajaxService = AjaxService.getInstance();
			loggingService = LoggingService.getInstance();

			spyOn(AjaxService, 'getInstance').and.returnValue(ajaxService);
			spyOn(LoggingService, 'getInstance').and.returnValue(loggingService);

			authService = AuthService.getInstance();
		});

		xit('Should throw error if', function(){
		});
	});
});



/*
### Validate authorization status

Purpose: Determines on initial page load if user is already authorized.

##### Request
```
Method: GET
URL: ~/?auth/validate
```
##### Response
```
{ responseCode: "AUTHORIZED"|"INTERNAL_ERROR"|"INVALID_REQUEST"|"UNAUTHORIZED" }
```
* responseCode
	* AUTHORIZED - Expected when user is recognised; request successful
	* INTERNAL_ERROR - Expected when unexpected exception occurs
	* INVALID_REQUEST - Expected when exception occurs regarding processing of request
	* UNAUTHORIZED - Expected when user is not recognised


*/