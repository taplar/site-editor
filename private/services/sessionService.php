<?php

final class SessionService {
	private static $instance;
	private $http;

	private function __clone () {
	}

	private function __construct () {
		$this->http = Http::getInstance();
	}

	public static function getInstance () {
		if ( !self::$instance ) {
			self::$instance = new self();

			session_start();
		}

		return self::$instance;
	}

	public function invalidateSession () {
		$_SESSION[ "EDITOR_LOGGED_IN" ] = false;
	}

	public function isSessionActive () {
		if ( !isset( $_SESSION[ "EDITOR_LOGGED_IN" ] ) ) {
			$_SESSION[ "EDITOR_LOGGED_IN" ] = false;
		}

		return $_SESSION[ "EDITOR_LOGGED_IN" ];
	}

	public function validateSession () {
		//Defaulting the userid and password to admin for the repo.
		//This function should be reimplemented in a more secure manner
		//for your environment.
		if ( isset( $_POST[ "userid" ] ) && isset( $_POST[ "password" ] ) ) {
			if ( $_POST[ "userid" ] == "admin" && $_POST[ "password" ] == "admin" ) {
				$_SESSION[ "EDITOR_LOGGED_IN" ] = true;
			}
		}

		if ( !$_SESSION[ "EDITOR_LOGGED_IN" ] ) {
			$this->http->unauthorized();
		}
	}
}

?>
