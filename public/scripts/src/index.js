new function(){
	var authService = AuthService.getInstance();

	authService.validate();
}();





/*

var EDITOR = {
	KeyTest: {
		isCode: function(e, keyCode){ return (e.keyCode == keyCode); }
		,isCtrl: function(e){ return EDITOR.KeyTest.isCode(e, 17); }
		,isEnter: function(e){ return EDITOR.KeyTest.isCode(e, 13); }
		,isS: function(e){ return EDITOR.KeyTest.isCode(e, 83); }
		,isTab: function(e){ return EDITOR.KeyTest.isCode(e, 9); }
	}
	,actionCreateFilePrompt: function(path, ajaxService){
		ajaxService.GET('public/views/prompt.html', {
			fnSuccess: function(data){ EDITOR.processFileCreatePrompt(data, path, ajaxService); }
			,fnFailure: EDITOR.recoverableError
		});
	}
	,actionDisplayMenu: function(ajaxService){
		ajaxService.GET('?menu/list', {
			fnSuccess: function(data){ EDITOR.processMenuDisplay(data, ajaxService); }
			,fnFailure: EDITOR.recoverableError
		});
	}
	,actionLogout: function(ajaxService){
		ajaxService.GET('?auth/revoke', {
			fnSuccess: function(){ EDITOR.displayLogin(ajaxService); }
			,fnFailure: EDITOR.recoverableError
		});
	}
	,actionSubmitCreateFilePrompt: function(e, path, ajaxService){
		if (EDITOR.KeyTest.isEnter(e)){
			var filename = $('.prompt #filename').val();
			var filenamePattern = /^[a-zA-Z][a-zA-Z0-9._-]*[.][a-zA-Z0-9]+$/;

			if (filenamePattern.test(filename)){
				path.push(filename);

				ajaxService.POST('?file/create', { file: path }, {
					fnSuccess: function(data){
						EDITOR.displayInfo(data);








						$('.prompt-container').remove();
					}
					,fnFailure: EDITOR.recoverableError
				});
			} else {
				EDITOR.displayError("Invalid filename");
			}
		}
	}
	,actionSubmitLogin: function(e, ajaxService){
		if (EDITOR.KeyTest.isEnter(e)){
			ajaxService.POST('?auth/validate', {
				userid: $('#userid').val()
				,password: $('#password').val()
			}, {
				fnSuccess: function(data){ EDITOR.processLoginSubmit(data, ajaxService); }
				,fnFailure: function(){}
			});
		}
	}
	,buildFile: function($parent, path, file, ajaxService){
		//var $delete = $('<i class="fa fa-times red" />');
		var $li = $('<li><i class="fa fa-file file-icon" /></li>');
		//var $newFile = $('<i class="fa fa-file gray" />');
		//var $newFolder = $('<i class="fa fa-folder gray" />');
		var $ul = $('<ul></ul>');
		
		//$newFile.click(THIS.actionNewFile(path, key));
		//$newFolder.click(THIS.actionNewFolder(path, key));
		//$delete.click(THIS.actionDeleteFolder(path, key));
		//$li.click(THIS.actionToggleExpansion);
		
		path.push(file);
		
		$li.append(file)
			//.append('&nbsp;').append($newFile)
			//.append('&nbsp;').append($newFolder)
			//.append('&nbsp;').append($delete)
			.append($ul);
		
		$parent.append($li);
	}
	,buildFileList: function($parent, path, files, ajaxService){
		for (key in files){
			if (isNaN(key)){ //display folders first
				EDITOR.buildFolder($parent, path.slice(0), key, files[key], ajaxService);
			}
		}

		for (key in files){
			if (!isNaN(key)){
				EDITOR.buildFile($parent, path.slice(0), files[key], ajaxService);
			}
		}
	}
	,buildFolder: function($parent, path, folder, files, ajaxService){
		//var $delete = $('<i class="fa fa-times red" />');
		var $li = $('<li><i class="fa fa-folder folder-icon subfolder" /></li>');
		var $newFile = $('<span class="file-new-icon"><i class="fa fa-file" /><i class="fa fa-plus" /></span>');
		//var $newFolder = $('<i class="fa fa-folder gray" />');
		var $ul = $('<ul></ul>');
		
		path.push(folder);

		$newFile.click(function(){ EDITOR.actionCreateFilePrompt(path, ajaxService); });
		//$newFolder.click(THIS.actionNewFolder(path, key));
		//$delete.click(THIS.actionDeleteFolder(path, key));
		//$li.click(THIS.actionToggleExpansion);
		
		$li.append(folder).append($newFile)
			//.append('&nbsp;').append($newFolder)
			//.append('&nbsp;').append($delete)
			.append($ul);
		
		EDITOR.buildFileList($ul, path, files, ajaxService);
		
		$parent.append($li);
	}
	,buildRootFolder: function($parent, ajaxService){
		var $li = $('<li><i class="fa fa-folder folder-icon" /></li>');
		var $newFile = $('<span class="file-new-icon"><i class="fa fa-file" /><i class="fa fa-plus" /></span>');
		//var $newFolder = $('<i class="fa fa-folder gray" />');
		var $ul = $('<ul></ul>');
		
		//$newFile.click(THIS.actionNewFile(null, 'root'));
		//$newFolder.click(THIS.actionNewFolder(null, 'root'));
		
		$li.append('root').append($newFile)
			//.append('&nbsp;').append($newFolder)
			.append($ul);
		
		$parent.append($li);
		
		return $ul;
	}
	,displayError: function(message){ EDITOR.displayMessage(message, 'error'); }
	,displayInfo: function(message){ EDITOR.displayMessage(message, 'info'); }
	,displayLogin: function(ajaxService){
		ajaxService.GET('public/views/prompt.html', {
			fnSuccess: function(data){ EDITOR.processLoginDisplay(data, ajaxService); }
			,fnFailure: EDITOR.unrecoverableError
		});
	}
	,displayMenu: function(files, ajaxService){
		ajaxService.GET('public/views/menu.html', {
			fnSuccess: function(data){
				var $menu = $(data);
				var $ul = EDITOR.buildRootFolder($menu.find('.directoryStructure'), ajaxService);

				EDITOR.buildFileList($ul, ['root'], files, ajaxService);

				$('.menu').remove();
				$('.container').append($menu);
				$('.menuIndicator').hide();

				$('.menu .control').click(function(){
					$('.menu').remove();
					$('.menuIndicator').show();
				});
			}
			,fnFailure: EDITOR.recoverableError
		});
	}
	,displayMessage: function(message, clazz){
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
	}
	,displaySuccess: function(message){ EDITOR.displayMessage(message, 'success'); }
	,displayWorkspace: function(ajaxService){
		ajaxService.GET('public/views/workspace.html', {
			fnSuccess: function(data){ EDITOR.processWorkspaceDisplay(data, ajaxService); }
			,fnFailure: EDITOR.recoverableError
		});		
	}
	,initialize: function(ajaxService){
		ajaxService.GET('?auth/validate', {
			fnSuccess: function(data){ EDITOR.processApplicationEntry(data, ajaxService); }
			,fnFailure: EDITOR.unrecoverableError
		});
	}
	,processApplicationEntry: function(jsonString, ajaxService){
		try {
			var response = $.parseJSON(jsonString);

			Require.all(response, 'responseCode');

			if (response.responseCode == 'UNAUTHORIZED'){
				EDITOR.displayLogin(ajaxService);
			} else if (response.responseCode == 'AUTHORIZED'){
				EDITOR.displayWorkspace(ajaxService);
			} else {
				EDITOR.unrecoverableError();
			}
		} catch (e){
			console.log(e);
			EDITOR.unrecoverableError();
		}
	}
	,processFileCreatePrompt: function(data, path, ajaxService){
		var $prompt = $(data);
		var $content = $prompt.find('.content');

		$prompt.find('.title').html('New File');
		$content.append(
			'<div class="input center">'
				+'<input type="text" placeholder="filename" id="filename" value="" />'
			+'</div>');

		$('.container').append($prompt);
		$('.prompt .input input').keyup(function(e){ EDITOR.actionSubmitCreateFilePrompt(e, path, ajaxService); });
		$('.prompt .input input:first').focus();
	}
	,processLoginDisplay: function(data, ajaxService){
		var $prompt = $(data);
		var $content = $prompt.find('.content');

		$prompt.find('.title').html('Login');
		$content.append(
			'<div class="input center">'
				+'<input type="text" placeholder="userid" id="userid" value="" />'
			+'</div>');
		$content.append(
			'<div class="input center">'
				+'<input type="password" placeholder="password" id="password" value="" />'
			+'</div>');

		$('.container').html($prompt);
		$('.prompt .input input').keyup(function(e){ EDITOR.actionSubmitLogin(e, ajaxService); });
		$('.prompt .input input:first').focus();
	}
	,processLoginSubmit: function(jsonString, ajaxService){
		try {
			var response = $.parseJSON(jsonString);

			Require.all(response, 'responseCode');

			if (response.responseCode == 'UNAUTHORIZED'){
				EDITOR.displayInfo('Authorization Failed.');
			} else if (response.responseCode == 'AUTHORIZED'){
				EDITOR.displayWorkspace(ajaxService);
			} else {
				EDITOR.unrecoverableError();
			}
		} catch (e){
			console.log(e);
			EDITOR.recoverableError();
		}
	}
	,processMenuDisplay: function(jsonString, ajaxService){
		try {
			var response = $.parseJSON(jsonString);

			Require.all(response, 'files', 'responseCode');

			if (response.responseCode == 'AUTHORIZED'){
				EDITOR.displayMenu(response.files, ajaxService);
			} else if (response.responseCode == 'UNAUTHORIZED'){
				EDITOR.displayInfo('Authorization expired.');
				EDITOR.displayLogin(ajaxService);
			} else {
				EDITOR.recoverableError();
			}
		} catch (e){
			console.log(e);
			EDITOR.recoverableError();
		}
	}
	,processWorkspaceDisplay: function(data, ajaxService){
		$('.container').html(data);
		$('.logout').click(function(){ EDITOR.actionLogout(ajaxService); });
		$('.menuIndicator').mouseover(function(){ EDITOR.actionDisplayMenu(ajaxService); });

		EDITOR.actionDisplayMenu(ajaxService);
	}
	,recoverableError: function(){ EDITOR.displayError('Error occured.  Please try again.'); }
	,unrecoverableError: function(){
		console.log('Unrecoverable error occured.  If this does not resolve itself, contact the site administrator for further assistance.');
		EDITOR.displayError('Error occured.  Check console for more information.');
	}
};

EDITOR.initialize(AjaxService.getInstance());




*/