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
				$this->filesService->deleteFile( $path );
			}
		} else {
			Http::getInstance()->badRequest();
		}
	}

	public function index ( $path ) {
		echo json_encode( $this->filesService->listDirectoryStructure() );
	}

	public function save ( $path, $content ) {
		if ( count( $path ) > 1 ) {
			if ( strtolower( $path[ 0 ] ) == "directories" ) {
				$this->filesService->createDirectory( array_slice( $path, 1 ) );
			} else {
				$this->filesService->createFile( $path );
			}
		} else {
			Http::getInstance()->badRequest();
		}
	}

	public function update ( $path, $content ) {
		if ( count( $path ) > 1 ) {
			if ( strtolower( $path[ 0 ] ) == "directories" ) {
				if ( isset( $content->action ) && $content->action == "shiftup" ) {
					$this->filesService->moveDirectoryIntoParentDirectory( array_slice( $path, 1 ) );
				} else {
					$this->filesService->renameDirectory( array_slice( $path, 1 ), $content );
				}
			} else {
				$this->filesService->renameFile( $path, $content );
			}
		} else {
			Http::getInstance()->badRequest();
		}
	}
}

?>
