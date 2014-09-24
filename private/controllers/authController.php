<?php

final class AuthController {
	private static $instance;


	private function __clone() {
	}

	private function __construct() {
	}

	public static function getInstance() {
		if ( !self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	public function resolve( $request ) {
		if ( count( $request ) > 1 ) {
			if ( strcasecmp( $request[1], "validate" ) == 0 ) {
				// Validate should happen on every request
				// Skip if it is the actual request
				return;
			} else if ( strcasecmp($request[1], "revoke" ) == 0 ) {
				Router::getInstanceOfClass( "AuthorizationService", NULL )->revoke();
				return;
			}
		}

		Router::getInstanceOfClass( "ResponseService", NULL )->pathIsUnknown();
	}
}

?>
