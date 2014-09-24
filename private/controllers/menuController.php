<?php

final class MenuController {
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
			if ( strcasecmp( $request[1], "list" ) == 0 ) {
				Router::getInstanceOfClass( "MenuService", NULL )->listDirectoryStructure();
				return;
			}
		}

		Router::getInstanceOfClass( "ResponseService", NULL )->pathIsUnknown();
	}
}

?>
