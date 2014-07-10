describe('AjaxService', function(){
	describe('GET', function(){
		beforeEach(function(){
			ajaxService = AjaxService.getInstance();
		});

		it('Should throw error if missing arguments', function(){
			try {
				ajaxService.GET();
				expect(false).toBe(true);
			} catch (e){
				expect(e[0].message).toEqual("Argument 'args' is undefined");
			}
		});

		it('Should throw error if missing url', function(){
			try {
				ajaxService.GET({
					fnSuccess: null
					,fnFailure: null
				});
				expect(false).toBe(true);
			} catch (e){
				expect(e[0].message).toEqual("Missing Property: url");
			}
		});

		it('Should throw error if missing success callback', function(){
			try {
				ajaxService.GET({
					url: 'about:blank'
					,fnFailure: null
				});
				expect(false).toBe(true);
			} catch (e){
				expect(e[0].message).toEqual("Missing Property: fnSuccess");
			}
		});

		it('Should throw error if missing failure callback', function(){
			try {
				ajaxService.GET({
					url: 'about:blank'
					,fnSuccess: null
				});
				expect(false).toBe(true);
			} catch (e){
				expect(e[0].message).toEqual("Missing Property: fnFailure");
			}
		});

		it('Should execute failure callback', function(){
			var obj = {
				url: ''
				,fnSuccess: jasmine.createSpy()
				,fnFailure: jasmine.createSpy()
			};

			spyOn($, 'ajax').and.callFake(function(args){
				args.error();
			});

			ajaxService.GET(obj);

			expect(obj.fnSuccess.calls.any()).toBe(false);
			expect(obj.fnFailure.calls.any()).toBe(true);
		});

		it('Should execute success callback', function(){
			var obj = {
				url: ''
				,fnSuccess: jasmine.createSpy()
				,fnFailure: jasmine.createSpy()
			};

			spyOn($, 'ajax').and.callFake(function(args){
				args.success();
			});

			ajaxService.GET(obj);

			expect(obj.fnSuccess.calls.any()).toBe(true);
			expect(obj.fnFailure.calls.any()).toBe(false);
		});
	});

	describe('POST', function(){
		beforeEach(function(){
			ajaxService = AjaxService.getInstance();
		});

		it('Should throw error if missing arguments', function(){
			try {
				ajaxService.POST();
				expect(false).toBe(true);
			} catch (e){
				expect(e[0].message).toEqual("Argument 'args' is undefined");
			}
		});

		it('Should throw error if missing url', function(){
			try {
				ajaxService.POST({
					input: null
					,fnSuccess: null
					,fnFailure: null
				});
				expect(false).toBe(true);
			} catch (e){
				expect(e[0].message).toEqual("Missing Property: url");
			}
		});

		it('Should throw error if missing input', function(){
			try {
				ajaxService.POST({
					url: null
					,fnSuccess: null
					,fnFailure: null
				});
				expect(false).toBe(true);
			} catch (e){
				expect(e[0].message).toEqual("Missing Property: input");
			}
		});

		it('Should throw error if missing success callback', function(){
			try {
				ajaxService.POST({
					url: 'about:blank'
					,input: null
					,fnFailure: null
				});
				expect(false).toBe(true);
			} catch (e){
				expect(e[0].message).toEqual("Missing Property: fnSuccess");
			}
		});

		it('Should throw error if missing failure callback', function(){
			try {
				ajaxService.POST({
					url: 'about:blank'
					,input: null
					,fnSuccess: null
				});
				expect(false).toBe(true);
			} catch (e){
				expect(e[0].message).toEqual("Missing Property: fnFailure");
			}
		});

		it('Should execute failure callback', function(){
			var obj = {
				url: ''
				,input: ''
				,fnSuccess: jasmine.createSpy()
				,fnFailure: jasmine.createSpy()
			};

			spyOn($, 'ajax').and.callFake(function(args){
				args.error();
			});

			ajaxService.POST(obj);

			expect(obj.fnSuccess.calls.any()).toBe(false);
			expect(obj.fnFailure.calls.any()).toBe(true);
		});

		it('Should execute success callback', function(){
			var obj = {
				url: ''
				,input: ''
				,fnSuccess: jasmine.createSpy()
				,fnFailure: jasmine.createSpy()
			};

			spyOn($, 'ajax').and.callFake(function(args){
				args.success();
			});

			ajaxService.POST(obj);

			expect(obj.fnSuccess.calls.any()).toBe(true);
			expect(obj.fnFailure.calls.any()).toBe(false);
		});
	});
});
