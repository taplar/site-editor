describe('AuthService', function(){
	beforeEach(function(){
		ajaxService = AjaxService.getInstance();
		keyService = KeyService.getInstance();
		loggingService = LoggingService.getInstance();

		spyOn(loggingService, 'unrecoverableError');
		spyOn(AjaxService, 'getInstance').and.returnValue(ajaxService);
		spyOn(KeyService, 'getInstance').and.returnValue(keyService);
		spyOn(LoggingService, 'getInstance').and.returnValue(loggingService);

		authService = AuthService.getInstance();
	});

	describe('Validate', function(){
		var expectations = function(jsonObject){
			expect(loggingService.unrecoverableError.calls.any()).toBe(jsonObject.unrecoverableError);
			expect(authService.processValidate.calls.any()).toBe(jsonObject.processValidate);

			var arguments = ajaxService.GET.calls.argsFor(0)[0];

			expect(arguments.url).toEqual('?auth/validate');
		};

		beforeEach(function(){
			spyOn(authService, 'processValidate');
		});

		it('Should log unrecoverable error on failure', function(){
			spyOn(ajaxService, 'GET').and.callFake(function(args){
				args.fnFailure();
			});

			authService.validate();

			expectations({ unrecoverableError: true, processValidate: false });
		});

		it('Should process response on success', function(){
			spyOn(ajaxService, 'GET').and.callFake(function(args){
				args.fnSuccess();
			});

			authService.validate();

			expectations({ unrecoverableError: false, processValidate: true });
		});
	});

	describe('ProcessValidate', function(){
		var expectations = function(jsonObject){
			expect(loggingService.unrecoverableError.calls.any()).toBe(jsonObject.unrecoverableError);
			expect(authService.displayLogin.calls.any()).toBe(jsonObject.displayLogin);
			expect(authService.displayWorkspace.calls.any()).toBe(jsonObject.displayWorkspace);
		};

		beforeEach(function(){
			spyOn(authService, 'displayLogin');
			spyOn(authService, 'displayWorkspace');
		});

		it('Should throw error if data is missing', function(){
			authService.processValidate();

			expectations({ unrecoverableError: true, displayLogin: false, displayWorkspace: false });
		});

		it('Should throw error if data is not json parsable', function(){
			authService.processValidate("not json");

			expectations({ unrecoverableError: true, displayLogin: false, displayWorkspace: false });
		});

		it('Should throw error if response code not returned', function(){
			authService.processValidate("{}");

			expectations({ unrecoverableError: true, displayLogin: false, displayWorkspace: false });
		});

		it('Should throw error if internal error occured', function(){
			authService.processValidate('{"responseCode":"INTERNAL_ERROR"}');

			expectations({ unrecoverableError: true, displayLogin: false, displayWorkspace: false });
		});

		it('Should throw error if invalid request occured', function(){
			authService.processValidate('{"responseCode":"INVALID_REQUEST"}');

			expectations({ unrecoverableError: true, displayLogin: false, displayWorkspace: false });
		});

		it('Should throw error if unexpected response code returned', function(){
			authService.processValidate('{"responseCode":"CHUMBAWUMBA"}');

			expectations({ unrecoverableError: true, displayLogin: false, displayWorkspace: false });
		});

		it('Should display login if unauthorized', function(){
			authService.processValidate('{"responseCode":"UNAUTHORIZED"}');

			expectations({ unrecoverableError: false, displayLogin: true, displayWorkspace: false });
		});

		it('Should display workspace if authorized', function(){
			authService.processValidate('{"responseCode":"AUTHORIZED"}');

			expectations({ unrecoverableError: false, displayLogin: false, displayWorkspace: true });
		});
	});

	describe('DisplayLogin', function(){
		var expectations = function(jsonObject){
			expect(loggingService.unrecoverableError.calls.any()).toBe(jsonObject.unrecoverableError);
			expect(authService.processDisplayLogin.calls.any()).toBe(jsonObject.processDisplayLogin);

			var arguments = ajaxService.GET.calls.argsFor(0)[0];

			expect(arguments.url).toEqual('public/views/prompt.html');
		};

		beforeEach(function(){
			spyOn(authService, 'processDisplayLogin');
		});

		it('Should log unrecoverable error on failure', function(){
			spyOn(ajaxService, 'GET').and.callFake(function(args){
				args.fnFailure();
			});

			authService.displayLogin();

			expectations({ unrecoverableError: true, processDisplayLogin: false });
		});

		it('Should process response on success', function(){
			spyOn(ajaxService, 'GET').and.callFake(function(args){
				args.fnSuccess();
			});

			authService.displayLogin();

			expectations({ unrecoverableError: false, processDisplayLogin: true });
		});
	});

	describe('ProcessDisplayLogin', function(){
		beforeEach(function(){
			$('body').append('<div class="container"></div>');
		});

		afterEach(function(){
			$('.container').remove();
		});

		it('Should throw error if missing data', function(){
			authService.processDisplayLogin();

			expect(loggingService.unrecoverableError.calls.any()).toBe(true);
			expect($('.container').html().length).toBeLessThan(1);
		});

		it('Should build login and bind actions', function(){
			var minimalPrompt = [
				'<div class="prompt-container">'
					,'<div class="prompt">'
						,'<div class="title"></div>'
						,'<div class="content"></div>'
				,'</div></div>'
			];

			spyOn(authService, 'actionSubmitLogin');

			authService.processDisplayLogin(minimalPrompt.join(''));

			expect(loggingService.unrecoverableError.calls.any()).toBe(false);
			expect($('.container .prompt-container .title').html()).toEqual('Login');
			expect($('.container .prompt-container #userid').length).toEqual(1);
			expect($('.container .prompt-container #password').length).toEqual(1);

			expect(authService.actionSubmitLogin.calls.any()).toBe(false);
			$('.container .prompt-container #userid').keyup();
			expect(authService.actionSubmitLogin.calls.any()).toBe(true);

			authService.actionSubmitLogin.calls.reset();

			expect(authService.actionSubmitLogin.calls.any()).toBe(false);
			$('.container .prompt-container #password').keyup();
			expect(authService.actionSubmitLogin.calls.any()).toBe(true);
		});
	});
	
	describe('ActionSubmitLogin', function(){
		var expectations = function(jsonObject){
			expect(loggingService.unrecoverableError.calls.any()).toBe(jsonObject.unrecoverableError);
			expect(loggingService.requiredInput.calls.count()).toBe(jsonObject.requiredInput.length);

			for (var i = 0; i < jsonObject.requiredInput.length; i++){
				expect(loggingService.requiredInput).toHaveBeenCalledWith(jsonObject.requiredInput[i]);
			}
		};

		beforeEach(function(){
			var minimalPrompt = [
				'<div class="prompt-container">'
					,'<div class="prompt">'
						,'<div class="title"></div>'
						,'<div class="content"></div>'
				,'</div></div>'
			];

			$('body').append('<div class="container"></div>');

			spyOn(authService, 'actionSubmitLogin').and.callThrough();
			spyOn(loggingService, 'requiredInput').and.callThrough();

			authService.processDisplayLogin(minimalPrompt.join(''));

			$userid = $('.prompt-container #userid');
			$password = $('.prompt-container #password');
		});

		afterEach(function(){
			$('.container').remove();
		});

		it('Should only have keyup event on userid', function(){
			expect(authService.actionSubmitLogin.calls.any()).toBe(false);

			$userid.keydown();
			expect(authService.actionSubmitLogin.calls.any()).toBe(false);

			$userid.keypress();
			expect(authService.actionSubmitLogin.calls.any()).toBe(false);

			$userid.keyup();
			expect(authService.actionSubmitLogin.calls.any()).toBe(true);
		});

		it('Should only have keyup event on password', function(){
			expect(authService.actionSubmitLogin.calls.any()).toBe(false);

			$password.keydown();
			expect(authService.actionSubmitLogin.calls.any()).toBe(false);

			$password.keypress();
			expect(authService.actionSubmitLogin.calls.any()).toBe(false);

			$password.keyup();
			expect(authService.actionSubmitLogin.calls.any()).toBe(true);
		});

		it('Should throw error if userid is not defined', function(){
			$userid.remove();
			$password.keyup();

			expectations({ unrecoverableError: true, requiredInput: [] });
		});

		it('Should throw error if password is not defined', function(){
			$password.remove();
			$userid.keyup();

			expectations({ unrecoverableError: true, requiredInput: [] });
		});

		it('Should not display messages if fields are blank and enter was not pressed', function(){
			spyOn(keyService, 'isEnterPressed').and.returnValue(false);

			$userid.keyup();

			expectations({ unrecoverableError: false, requiredInput: [] });
		});

		it('Should display messages if fields are blank and enter was pressed', function(){
			spyOn(keyService, 'isEnterPressed').and.returnValue(true);

			$userid.keyup();

			expectations({
				unrecoverableError: false
				,requiredInput: ['userid', 'password']
			});
		});

		xit('Should not perform request if userid is blank', function(){
			spyOn(keyService, 'isEnterPressed').and.returnValue(true);

			$password.val('admin');
			$password.keyup();

			expectations({
				unrecoverableError: false
				,requiredInput: ['userid']
			});
		});

		xit('Should not perform request if password is blank', function(){});
		xit('Should throw error if data is missing', function(){});
		xit('Should throw error if data is not json parsable', function(){});
		xit('Should throw error if response code not returned', function(){});
		xit('Should throw error if internal error occured', function(){});
		xit('Should throw error if invalid request occured', function(){});
		xit('Should throw error if unexpected response code returned', function(){});
		xit('Should display message if unauthorized', function(){});
		xit('Should display workspace if authorized', function(){});
	});

	xdescribe('DisplayWorkspace', function(){});
	xdescribe('ProcessDisplayWorkspace', function(){});
});



/*
### Authorization request

Purpose: Validate authorization against provided input.

##### Request
```
Method: POST
URL: ~/?auth/validate
{
	userid: <string>
	,password: <string>
}
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