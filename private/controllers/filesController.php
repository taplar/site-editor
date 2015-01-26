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

	public function delete ( $path ) {
		if ( count( $path ) > 1 ) {
			if ( strtolower( $path[ 0 ] ) == "directories" ) {
				$this->filesService->deleteDirectory( array_slice( $path, 1 ) );
			} else {
				Http::getInstance()->badRequest();
			}
		} else {
			$this->filesService->deleteFile();
		}
	}

	public function index ( $path ) {
		echo json_encode( $this->filesService->listDirectoryStructure() );
	}

	public function save ( $path ) {
		if ( count( $path ) > 1 ) {
			if ( strtolower( $path[ 0 ] ) == "directories" ) {
				$this->filesService->createDirectory( array_slice( $path, 1 ) );
			} else {
				Http::getInstance()->badRequest();
			}
		} else {
			$this->filesService->createFile();
		}
	}

	public function update ( $path ) {
		Http::getInstance()->badRequest();
	}
}

?>
