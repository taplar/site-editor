<?php

final class FilesController {
	private static $instance;
	private $filesService;

	private function __clone () {
	}

	private function __construct () {
		$this->filesService = Router::getInstanceOfClass( "FilesService", NULL );
	}

	public static function getInstance () {
		if ( !self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	public function delete ( $requestParams ) {
	}

	public function index ( $requestParams ) {
		echo json_encode( $this->filesService->listDirectoryStructure() );
	}

	public function save ( $requestParams ) {
	}

	public function update ( $requestParams ) {
	}
}

?>
