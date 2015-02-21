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
	* 301 - Switch to HTTPS
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
Content-Type: "application/json"
'{ "action" : "rename", "name" : "< string >" }'
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

### Rename file

Purpose: Rename (nested) file

##### Request
```
Method: PUT
URL: ~/private/?p=files/root [ /sub-directory1 [ /sub-directory2 [ ... ] ] ] /existing-file
Content-Type: "application/json"
'{ "action": "rename", "name": "< string >" }'
```
##### Response
```
* HTTP Response Codes
	* 200 - File Renamed
	* 401 - Inactive Session
	* 497 - File not renamed due to invalid old/new name
	* 499 - File not renamed due to invalid path
	* 500 - Internal Error
```

### Move up directory

Purpose: Move nested directory out of parent directory

##### Request
```
Method: PUT
URL: ~/private/?p=files/directories/root/sub-directory1 [ /sub-directory2 [ /sub-directory3 [ ... ] ] ] /existing-directory
Content-Type: "application/json"
'{ "action" : "shiftup", "name" : "< string >" }'
```
##### Response
```
* HTTP Response Codes
	* 200 - Directory Moved
	* 401 - Inactive Session
	* 497 - Directory not moved due to invalid old/new name
	* 499 - Directory not moved due to invalid path
	* 500 - Internal Error
```

### Move up file

Purpose: Move nested file out of parent directory

##### Request
```
Method: PUT
URL: ~/private/?p=files/root/sub-directory1 [ /sub-directory2 [ /sub-directory3 [ ... ] ] ] /existing-file
Content-Type: "application/json"
'{ "action": "shiftup", "name": "< string >" }'
```
##### Response
```
* HTTP Response Codes
	* 200 - File Moved
	* 401 - Inactive Session
	* 497 - File not moved due to invalid old/new name
	* 499 - File not moved due to invalid path
	* 500 - Internal Error
```

### Move down directory

Purpose: Move directory into sibling directory

##### Request
```
Method: PUT
URL: ~/private/?p=files/directories/root [ /sub-directory1 [ /sub-directory2 [ ... ] ] ] /existing-directory
Content-Type: "application/json"
'{ "action" : "shiftdown", "name" : "< string >" }'
```
##### Response
```
* HTTP Response Codes
	* 200 - Directory Moved
	* 401 - Inactive Session
	* 497 - Directory not moved due to invalid old/new name
	* 499 - Directory not moved due to invalid path
	* 500 - Internal Error
```

### Move down file

Purpose: Move file into sibling directory

##### Request
```
Method: PUT
URL: ~/private/?p=files/root [ /sub-directory1 [ /sub-directory2 [ ... ] ] ] /existing-directory
Content-Type: "application/json"
'{ "action" : "shiftdown", "name" : "< string >" }'
```
##### Response
```
* HTTP Response Codes
	* 200 - File Moved
	* 401 - Inactive Session
	* 497 - File not moved due to invalid old/new name
	* 499 - File not moved due to invalid path
	* 500 - Internal Error
```

### Upload file

Purpose: Upload file to filesystem

##### Request
```
Method: POST
URL: ~/private/?p=files/root [ /sub-directory1 [ /sub-directory2 [ ... ] ] ] /new-file
FormData data
```
##### Response
```
* HTTP Response Codes
	* 200 - File Uploaded
	* 401 - Inactive Session
	* 496 - File not uploaded due to already exists, invalid name, or upload failure
	* 499 - File not uploaded due to invalid path
	* 500 - Internal Error
```

### Retrieve file contents

Purpose: Get the file contents for editing

##### Request
```
Method: GET
URL: ~/private/?p=files/root [ /sub-directory1 [ /sub-directory2 [ ... ] ] ] /existing-file
```
##### Response
```
* HTTP Response Codes
	* 200 - File Found
	* 401 - Inactive Session
	* 404 - File not found
	* 500 - Internal Error

* DATA
{ file: < string > }
```
