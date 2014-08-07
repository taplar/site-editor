describe('WorkspaceService', function(){
	beforeEach(function(){
		ajaxService = AjaxService.getInstance();
		authService = AuthService.getInstance();
		keyService = KeyService.getInstance();
		loggingService = LoggingService.getInstance();

		spyOn(loggingService, 'unrecoverableError');
		spyOn(AjaxService, 'getInstance').and.returnValue(ajaxService);
		spyOn(AuthService, 'getInstance').and.returnValue(authService);
		spyOn(KeyService, 'getInstance').and.returnValue(keyService);
		spyOn(LoggingService, 'getInstance').and.returnValue(loggingService);

		workspaceService = WorkspaceService.getInstance();
	});

	describe('DisplayWorkspace', function(){
		var expectations = function(jsonObject){
			expect(loggingService.unrecoverableError.calls.any()).toBe(jsonObject.unrecoverableError);
			expect(workspaceService.processDisplayWorkspace.calls.any()).toBe(jsonObject.processDisplayWorkspace);

			var arguments = ajaxService.GET.calls.argsFor(0)[0];

			expect(arguments.url).toEqual('public/views/workspace.html');
		};

		beforeEach(function(){
			spyOn(workspaceService, 'processDisplayWorkspace');
		});

		it('Should log unrecoverable error on failure', function(){
			spyOn(ajaxService, 'GET').and.callFake(function(args){
				args.fnFailure();
			});

			workspaceService.displayWorkspace();

			expectations({ unrecoverableError: true, processDisplayWorkspace: false });
		});

		it('Should process response on success', function(){
			spyOn(ajaxService, 'GET').and.callFake(function(args){
				args.fnSuccess();
			});

			workspaceService.displayWorkspace();

			expectations({ unrecoverableError: false, processDisplayWorkspace: true });
		});
	});

	describe('ProcessDisplayWorkspace', function(){
		var expectations = function(jsonObject){
			expect(loggingService.unrecoverableError.calls.any()).toBe(jsonObject.unrecoverableError);
			expect($('.container').html()).toEqual(jsonObject.containerHtml);
		};

		beforeEach(function(){
			$('body').append('<div class="container"></div>');
		});

		afterEach(function(){
			$('.container').remove();
		});

		it('Should throw error if missing data', function(){
			workspaceService.processDisplayWorkspace();

			expectations({ unrecoverableError: true, containerHtml: '' });
		});

		it('Should clear page and build menu and logout options', function(){
			var minimalWorkspace = [
				'<i class="menuIndicator"></i>'
				,'<i class="logout"></i>'
			];

			spyOn(authService, 'actionLogout');
			spyOn(workspaceService, 'actionDisplayMenu');

			workspaceService.processDisplayWorkspace(minimalWorkspace.join(''));

			expectations({ unrecoverableError: false, containerHtml: minimalWorkspace.join('') });

			expect(workspaceService.actionDisplayMenu.calls.any()).toBe(false);
			$('.container .menuIndicator').mouseover();
			expect(workspaceService.actionDisplayMenu.calls.any()).toBe(true);

			expect(authService.actionLogout.calls.any()).toBe(false);
			$('.container .logout').click();
			expect(authService.actionLogout.calls.any()).toBe(true);
		});
	});

	describe('ActionDisplayMenu', function(){
		beforeEach(function(){
		});

		xit('new test', function(){});
	});
});
