# Interface

`"~" represents "https://< domain >/< path to editor >"`

### Validate Active Session

Purpose: Determine if a session is active.

##### Request
```
Method: GET
URL: ~/private/?sessions
```
##### Response
```
* HTTP Response Codes
	* 200 - Active Session
	* 401 - Inactive Session
	* 500 - Internal Error
```

### Create Active Session

Purpose: Validate authorization against provided input.

##### Request
```
Method: POST
URL: ~/private/?sessions
{
	userid: < string >
	,password: < string >
}
```
##### Response
```
* HTTP Response Codes
	* 200 - Active Session Created
	* 401 - Invalid Credentials
	* 500 - Internal Error
```

### Delete Active Session

Purpose: Terminate the active session.

##### Request
```
Method: DELETE
URL: ~/private/?sessions
```
##### Response
```
* HTTP Response Codes
	* 200 - Active Session Terminated
	* 500 - Internal Error
```

### Retrieve list of files and directories

Purpose: Retrieve file tree for menu.

##### Request
```
Method: GET
URL: ~/private/?files
```
##### Response
```
* HTTP Response Codes
	* 200 - File Tree Returned
	* 401 - Inactive Session
	* 500 - Internal Error

* DATA
{
	files: < array( key => < object > ) >
}
```
* files - Array of objects
	* key (numeric)
		* object is a filename string
	* key (alphanumeric)
		* key is a directory string
		* object is an array with structure identical to 'files'
