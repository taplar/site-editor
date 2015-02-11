<?php

final class Config {
	private static $instance;
	private static $EDITOR_DIRECTORY = "../";
	private static $ROOT_DIRECTORY = "../../testZone/";

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

	public function editorDirectory () {
		return self::$EDITOR_DIRECTORY;
	}

	public function rootDirectory () {
		return self::$ROOT_DIRECTORY;
	}
}

?>
