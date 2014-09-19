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
			spyOn(workspaceService, 'displayMenu');

			workspaceService.processDisplayWorkspace(minimalWorkspace.join(''));

			expectations({ unrecoverableError: false, containerHtml: minimalWorkspace.join('') });

			expect(workspaceService.displayMenu.calls.any()).toBe(false);
			$('.container .menuIndicator').mouseover();
			expect(workspaceService.displayMenu.calls.any()).toBe(true);

			expect(authService.actionLogout.calls.any()).toBe(false);
			$('.container .logout').click();
			expect(authService.actionLogout.calls.any()).toBe(true);
		});
	});

	describe('DisplayMenu', function(){
		var expectations = function(jsonObject){
			expect(loggingService.unrecoverableError.calls.any()).toBe(false);
			expect(loggingService.recoverableError.calls.any()).toBe(jsonObject.recoverableError);
			expect(workspaceService.processDisplayMenu.calls.any()).toBe(jsonObject.processDisplayMenu);
		};

		beforeEach(function(){
			spyOn(loggingService, "recoverableError");
			spyOn(workspaceService, "processDisplayMenu");
		});

		it('Should log recoverable error on failure', function(){
			spyOn(ajaxService, 'GET').and.callFake(function(args){
				args.fnFailure();
			});

			workspaceService.displayMenu();

			expectations({ recoverableError: true, processDisplayMenu: false });
		});

		it('Should process response on success', function(){
			spyOn(ajaxService, 'GET').and.callFake(function(args){
				args.fnSuccess();
			});

			workspaceService.displayMenu();

			expectations({ recoverableError: false, processDisplayMenu: true });
		});
	});

	describe('ProcessDisplayMenu', function(){
		var expectations = function(jsonObject){
			expect(loggingService.unrecoverableError.calls.any()).toBe(false);
			expect(loggingService.recoverableError.calls.any()).toBe(jsonObject.recoverableError);
			expect(authService.displayLogin.calls.any()).toBe(jsonObject.displayLogin);

			if (jsonObject.displayLogin){
				var arguments = loggingService.displayInfo.calls.argsFor(0);

				expect(arguments[0]).toEqual('Session Expired');
			}

			expect(workspaceService.buildMenu.calls.any()).toBe(jsonObject.buildMenu);
		};

		beforeEach(function(){
			spyOn(authService, 'displayLogin');
			spyOn(loggingService, 'displayInfo');
			spyOn(loggingService, 'recoverableError');
			spyOn(workspaceService, 'buildMenu');
		});

		it('Should throw error if data is missing', function(){
			workspaceService.processDisplayMenu();

			expectations({ recoverableError: true, displayLogin: false, buildMenu: false });
		});

		it('Should throw error if data is not json parsable', function(){
			workspaceService.processDisplayMenu("not json");

			expectations({ recoverableError: true, displayLogin: false, buildMenu: false });
		});

		it('Should throw error if response code not returned', function(){
			workspaceService.processDisplayMenu("{}");

			expectations({ recoverableError: true, displayLogin: false, buildMenu: false });
		});

		it('Should throw error if internal error occured', function(){
			workspaceService.processDisplayMenu('{"responseCode":"INTERNAL_ERROR", "files":[]}');

			expectations({ recoverableError: true, displayLogin: false, buildMenu: false });
		});

		it('Should throw error if invalid request occured', function(){
			workspaceService.processDisplayMenu('{"responseCode":"INVALID_REQUEST", "files":[]}');

			expectations({ recoverableError: true, displayLogin: false, buildMenu: false });
		});

		it('Should throw error if unexpected response code returned', function(){
			workspaceService.processDisplayMenu('{"responseCode":"CHUMBAWUMBA", "files":[]}');

			expectations({ recoverableError: true, displayLogin: false, buildMenu: false });
		});

		it('Should display login if unauthorized', function(){
			workspaceService.processDisplayMenu('{"responseCode":"UNAUTHORIZED", "files":[]}');

			expectations({ recoverableError: false, displayLogin: true, buildMenu: false });
		});

		it('Should build menu if authorized', function(){
			workspaceService.processDisplayMenu('{"responseCode":"AUTHORIZED", "files":[]}');

			expectations({ recoverableError: false, displayLogin: false, buildMenu: true });
		});
	});

	describe('BuildMenu', function(){
		beforeEach(function(){
			$('body').append('<div class="container"></div>');
		});

		afterEach(function(){
			$('.container').remove();
		});

		it('Should display menu', function(){
			var minimalWorkspace = [
				'<i class="menuIndicator"></i>'
				,'<i class="logout"></i>'
			];
			
			var response = {
				"responseCode": "AUTHORIZED"
				,"files": {
					"0": "file0.0"
					,"1": "file0.1"
					,"folder1": {
						"0": "file1.1"
						,"1": "file2.1"
					}
					,"folder2": {
						"0": "file2.1"
						,"1": "file2.2"
						,"folder3": {
							"0": "file3.1"
						}
					}
				}
			};

			workspaceService.processDisplayWorkspace(minimalWorkspace.join(''));
			workspaceService.processDisplayMenu(JSON.stringify(response));

			console.log($('.container').html());
		});
	});
});



/*

### Retrieve list of files and directories

Purpose: Retrieve file tree for menu.

##### Request
```
Method: GET
URL: ~/?menu/list
```
##### Response
```
{
	files: <array(key => <string|object>)>
	,responseCode: "AUTHORIZED"|"INTERNAL_ERROR"|"INVALID_REQUEST"|"UNAUTHORIZED"
}
```
* files - Array of objects
	* Numeric keys - Object is a string representing a filename
	* Non-numeric keys - Key is a string representing a directory and the Object is an array representing the directory contents in the same [key, object] relationship
* responseCode
	* AUTHORIZED - Expected when user is recognised; request successful
	* INTERNAL_ERROR - Expected when unexpected exception occurs
	* INVALID_REQUEST - Expected when exception occurs regarding processing of request
	* UNAUTHORIZED - Expected when user is not recognised


*/