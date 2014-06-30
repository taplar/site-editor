var EDITOR = {
	KeyTest: {
		isCode: function(e, keyCode){ return (e.keyCode == keyCode); }
		,isCtrl: function(e){ return EDITOR.KeyTest.isCode(e, 17); }
		,isEnter: function(e){ return EDITOR.KeyTest.isCode(e, 13); }
		,isS: function(e){ return EDITOR.KeyTest.isCode(e, 83); }
		,isTab: function(e){ return EDITOR.KeyTest.isCode(e, 9); }
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
		var $li = $('<li><i class="fa fa-file" />&nbsp;</li>');
		//var $newFile = $('<i class="fa fa-file gray" />');
		//var $newFolder = $('<i class="fa fa-folder gray" />');
		var $ul = $('<ul></ul>');
		
		//$newFile.click(THIS.actionNewFile(path, key));
		//$newFolder.click(THIS.actionNewFolder(path, key));
		//$delete.click(THIS.actionDeleteFolder(path, key));
		//$li.click(THIS.actionToggleExpansion);
		
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
				EDITOR.buildFolder($parent, path, key, files[key], ajaxService);
			}
		}

		for (key in files){
			if (!isNaN(key)){
				EDITOR.buildFile($parent, path, files[key], ajaxService);
			}
		}
	}
	,buildFolder: function($parent, path, folder, files, ajaxService){
		//var $delete = $('<i class="fa fa-times red" />');
		var $li = $('<li><i class="fa fa-folder subfolder" />&nbsp;</li>');
		//var $newFile = $('<i class="fa fa-file gray" />');
		//var $newFolder = $('<i class="fa fa-folder gray" />');
		var $ul = $('<ul></ul>');
		
		//$newFile.click(THIS.actionNewFile(path, key));
		//$newFolder.click(THIS.actionNewFolder(path, key));
		//$delete.click(THIS.actionDeleteFolder(path, key));
		//$li.click(THIS.actionToggleExpansion);
		
		$li.append(folder)
			//.append('&nbsp;').append($newFile)
			//.append('&nbsp;').append($newFolder)
			//.append('&nbsp;').append($delete)
			.append($ul);
		
		EDITOR.buildFileList($ul, path +':'+ folder, files, ajaxService);
		
		$parent.append($li);
	}
	,buildRootFolder: function($parent, ajaxService){
		var $li = $('<li><i class="fa fa-folder" />&nbsp;</li>');
		//var $newFile = $('<i class="fa fa-file gray" />');
		//var $newFolder = $('<i class="fa fa-folder gray" />');
		var $ul = $('<ul></ul>');
		
		//$newFile.click(THIS.actionNewFile(null, 'root'));
		//$newFolder.click(THIS.actionNewFolder(null, 'root'));
		
		$li.append('root')
			//.append('&nbsp;').append($newFile)
			//.append('&nbsp;').append($newFolder)
			.append($ul);
		
		$parent.append($li);
		
		return $ul;
	}
	,displayError: function(message){ EDITOR.displayMessage(message, 'error'); }
	,displayInfo: function(message){ EDITOR.displayMessage(message, 'info'); }
	,displayLogin: function(ajaxService){
		ajaxService.GET('public/views/login.html', {
			fnSuccess: function(data){ EDITOR.processLoginDisplay(data, ajaxService); }
			,fnFailure: EDITOR.unrecoverableError
		});		
	}
	,displayMenu: function(files, ajaxService){
		var $menu = $(
			'<div class="menu flexbox-v">'
				+'<div class="content flexible-v"></div>'
				+'<div class="control center inflexible"><i class="fa fa-angle-double-up fa-2x" /></div>'
			+'</div>');
		var $ul = $('<ul class="directoryStructure"></ul>');

		$menu.find('.content').append($ul);

		$ul = EDITOR.buildRootFolder($ul, ajaxService);

		EDITOR.buildFileList($ul, 'root', files, ajaxService);

		$('.menu').remove();
		$('.container').append($menu);
		$('.menuIndicator').hide();

		$('.menu .control').click(function(){
			$('.menu').remove();
			$('.menuIndicator').show();
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
	,processLoginDisplay: function(data, ajaxService){
		$('.container').html(data);
		$('.login .input input').keyup(function(e){ EDITOR.actionSubmitLogin(e, ajaxService); });
		$('.login .input input:first').focus();
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
	}
	,recoverableError: function(){ EDITOR.displayError('Error occured.  Please try again.'); }
	,unrecoverableError: function(){
		console.log('Unrecoverable error occured.  If this does not resolve itself, contact the site administrator for further assistance.');
		EDITOR.displayError('Error occured.  Check console for more information.');
	}
};

EDITOR.initialize(AjaxService.getInstance());
