describe('WorkspaceService', function(){
	beforeEach(function(){
		ajaxService = AjaxService.getInstance();
		keyService = KeyService.getInstance();
		loggingService = LoggingService.getInstance();

		spyOn(loggingService, 'unrecoverableError');
		spyOn(AjaxService, 'getInstance').and.returnValue(ajaxService);
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
		beforeEach(function(){
			$('body').append('<div class="container"></div>');
		});

		afterEach(function(){
			$('.container').remove();
		});

		it('Should throw error if missing data', function(){
			workspaceService.processDisplayWorkspace();

			expect(loggingService.unrecoverableError.calls.any()).toBe(true);
			expect($('.container').html().length).toBeLessThan(1);
		});

		it('Should clear page and build menu and logout options', function(){
			var minimalWorkspace = [
				'<i class="menuIndicator" />'
				,'<i class="logout" />'
			];
		});
	});
});
