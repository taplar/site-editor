# Interface

`"~" represents "http://<domain>/<path to editor>"`

### Validate authorization status

Purpose: Determines on initial page load if user is already authorized.

* Request
`
Method: GET
URL: ~/?auth/validate
`

* Response
`
	{
		responseCode: "AUTHORIZED"|"UNAUTHORIZED"
	}
`
