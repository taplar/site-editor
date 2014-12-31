<?php

final class Http {
	private static $instance;
	private static $HTTP = "HTTP/1.0 ";
	private static $BAD_REQUEST = "400 Bad Request";
	private static $NOT_FOUND = "404 Not Found";
	private static $INTERNAL_ERROR = "500 Internal Error";
	private static $UNAUTHORIZED = "401 Unauthorized";

	private function __clone () {
	}

	private function __construct () {
	}

	public static function getInstance () {
		if ( !self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	public function badRequest () {
		header( self::$HTTP.self::$BAD_REQUEST );
	}

	public function internalError () {
		header( self::$HTTP.self::$INTERNAL_ERROR );
	}

	public function notFound () {
		header( self::$HTTP.self::$NOT_FOUND );
	}

	public function unauthorized () {
		header( self::$HTTP.self::$UNAUTHORIZED );
	}
}

?>
