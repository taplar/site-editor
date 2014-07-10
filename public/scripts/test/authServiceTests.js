/*
describe('AuthService', function(){
	describe('Validate', function(){
		it('Should throw exception if missing arguments', function(){});
		it('Should throw exception if missing ajaxService', function(){});
		it('Should throw exception if missing success callback', function(){});
		it('Should throw exception if missing failure callback', function(){});
		it('Should execute failure callback', function(){});
	});
});




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