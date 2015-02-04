# Interface

`"~" represents "https://< domain >/< path to editor >"`

### Validate Active Session

Purpose: Determine if a session is active.

##### Request
```
Method: GET
URL: ~/private/?p=sessions
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
URL: ~/private/?p=sessions
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
URL: ~/private/?p=sessions
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
URL: ~/private/?p=files
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

### Create new directory

Purpose: Create new (nested) directory

##### Request
```
Method: POST
URL: ~/private/?p=files/directories/root [ /sub-directory1 [ /sub-directory2 [ ... ] ] ] /new-directory
{ }
```
##### Response
```
* HTTP Response Codes
	* 200 - Directory Created
	* 401 - Inactive Session
	* 498 - Directory not created due to invalid name
	* 499 - Directory not created due to invalid path
	* 500 - Internal Error
```

### Delete directory

Purpose: Delete (nested) directory and all contents

##### Request
```
Method: DELETE
URL: ~/private/?p=files/directories/root [ /sub-directory1 [ /sub-directory2 [ ... ] ] ] /existing-directory
{ }
```
##### Response
```
* HTTP Response Codes
	* 200 - Directory Deleted
	* 401 - Inactive Session
	* 497 - Directory not deleted due to recursive delete/unlink failure
	* 499 - Directory not deleted due to invalid path
	* 500 - Internal Error
```

### Create new file

Purpose: Create new (nested) file

##### Request
```
Method: POST
URL: ~/private/?p=files/root [ /sub-directory1 [ /sub-directory2 [ ... ] ] ] /new-file
{ }
```
##### Response
```
* HTTP Response Codes
	* 200 - File Created
	* 401 - Inactive Session
	* 498 - File not created due to invalid name
	* 499 - File not created due to invalid path
	* 500 - Internal Error
```

### Delete file

Purpose: Delete (nested) file

##### Request
```
Method: DELETE
URL: ~/private/?p=files/root [ /sub-directory1 [ /sub-directory2 [ ... ] ] ] /existing-file
{ }
```
##### Response
```
* HTTP Response Codes
	* 200 - File Deleted
	* 401 - Inactive Session
	* 497 - File not deleted due to recursive delete/unlink failure
	* 499 - File not deleted due to invalid path
	* 500 - Internal Error
```

### Rename directory

Purpose: Rename (nested) directory

##### Request
```
Method: PUT
URL: ~/private/?p=files/directories/root [ /sub-directory1 [ /sub-directory2 [ ... ] ] ] /existing-directory
new-directory-name
```
##### Response
```
* HTTP Response Codes
	* 200 - Directory Renamed
	* 401 - Inactive Session
	* 497 - Directory not renamed due to invalid old/new name
	* 499 - Directory not renamed due to invalid path
	* 500 - Internal Error
```
