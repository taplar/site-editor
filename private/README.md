# Interface

`"~" represents "http://<domain>/<path to editor>"`

### Application start

Purpose: Returns the start page for the editor.

##### Request
```
Method: GET
URL: ~/
```
##### Response
```
Raw webpage data
```

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
	* AUTHORIZED - Expected when user is recognised
	* INTERNAL_ERROR - Expected when unexpected exception occurs
	* INVALID_REQUEST - Expected when exception occurs regarding processing of request
	* UNAUTHORIZED - Expected when user is not recognised

### Invalidate authorization status

Purpose: Ends the user's validation.

##### Request
```
Method: GET
URL: ~/?auth/revoke
```
##### Response
```
{ responseCode: "INTERNAL_ERROR"|"INVALID_REQUEST"|"UNAUTHORIZED" }
```
* responseCode
	* INTERNAL_ERROR - Expected when unexpected exception occurs
	* INVALID_REQUEST - Expected when exception occurs regarding processing of request
	* UNAUTHORIZED - Expected when user is not recognised
