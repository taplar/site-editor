<?php

final class AuthorizationService {
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

	public function authorize() {
		// For the purpose of the repository, authorize will use a static userid and password.
		// It should be replaced with a more secure component driven by your site.
		if ( isset( $_POST[ "userid" ] ) && isset( $_POST[ "password" ] ) ) {
			$_SESSION[ "EDITOR_LOGGED_IN" ] = $this->credentialsMatch();
		} else if ( isset( $_POST[ "userid" ] ) xor isset( $_POST[ "password" ] ) ) {
			Router::getInstanceOfClass( "ResponseService", NULL )->requestWasInvalid();
		}
	}

	public function credentialsMatch() {
		return ( $_POST[ "userid" ] == "admin" && $_POST[ "password" ] == "admin" );
	}

	public function revoke() {
		$_SESSION[ "EDITOR_LOGGED_IN" ] = false;
		$this->validate();
	}

	public function validate() {
		session_start();

		if ( !isset( $_SESSION[ "EDITOR_LOGGED_IN" ] ) ) {
			$_SESSION[ "EDITOR_LOGGED_IN" ] = false;
		}

		$this->authorize();
		$response = Router::getInstanceOfClass( "ResponseService", NULL );

		if ( $_SESSION[ "EDITOR_LOGGED_IN" ] ) {
			$response->userIsRecognised();
		} else {
			$response->userIsNotRecognised();
		}

		return $_SESSION[ "EDITOR_LOGGED_IN" ];
	}
}

?>
