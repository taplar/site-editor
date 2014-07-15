describe('AuthService', function(){
	beforeEach(function(){
		ajaxService = AjaxService.getInstance();
		loggingService = LoggingService.getInstance();

		spyOn(loggingService, 'unrecoverableError');
		spyOn(AjaxService, 'getInstance').and.returnValue(ajaxService);
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

	xdescribe('DisplayWorkspace', function(){});
	xdescribe('ProcessDisplayWorkspace', function(){});
});
