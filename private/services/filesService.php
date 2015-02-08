<?php

final class FilesService {
	private static $instance;


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

	public function createDirectory ( $pathArray ) {
		$filename = array_pop( $pathArray );
		$pathString = $this->pathExists( $pathArray );
		$pathString = $this->editorIsNotParentOfPath( $pathString );

		if ( $pathString != NULL ) {
			if ( $this->isAValidFilename( $filename ) && !file_exists( $pathString . $filename ) ) {
				mkdir( $pathString . $filename );
			} else {
				Http::getInstance()->invalidName();
			}
		} else {
			Http::getInstance()->invalidPath();
		}
	}

	public function createFile ( $pathArray ) {
		$filename = array_pop( $pathArray );
		$pathString = $this->pathExists( $pathArray );
		$pathString = $this->editorIsNotParentOfPath( $pathString );

		if ( $pathString != NULL ) {
			if ( $this->isAValidFilename( $filename ) && !file_exists( $pathString . $filename ) ) {
				touch( $pathString . $filename );
			} else {
				Http::getInstance()->invalidName();
			}
		} else {
			Http::getInstance()->invalidPath();
		}
	}

	public function deleteFile ( $pathArray ) {
		$filename = array_pop( $pathArray );
		$pathString = $this->pathExists( $pathArray );
		$pathString = $this->editorIsNotParentOfOrSubdirectoryInPath( $pathString );

		if ( $pathString != NULL ) {
			$this->removeFile( $pathString . $filename );
		} else {
			Http::getInstance()->invalidPath();
		}
	}

	public function deleteDirectory ( $pathArray ) {
		$pathString = $this->pathExists( $pathArray );
		$pathString = $this->editorIsNotParentOfOrSubdirectoryInPath( $pathString );

		if ( $pathString != NULL ) {
			$this->removeDirectory( $pathString );
		} else {
			Http::getInstance()->invalidPath();
		}
	}

	private function editorIsNotParentOfOrSubdirectoryInPath ( $pathString ) {
		$testPath = realpath( $pathString );
		$editorPath = realpath( Config::getInstance()->editorDirectory() );

		if ( strpos( $testPath, $editorPath ) === 0
		|| strpos( $editorPath, $testPath ) === 0) {
			return NULL;
		}

		return $pathString;
	}

	private function editorIsNotParentOfPath ( $pathString ) {
		$testPath = realpath( $pathString );
		$editorPath = realpath( Config::getInstance()->editorDirectory() );

		if ( strpos( $testPath, $editorPath ) === 0 ) {
			return NULL;
		}

		return $pathString;
	}

	private function getDirectoryStructure ( $pathString ) {
		$array = array();

		foreach ( scandir( $pathString ) as $key => $value ) {
			if ( $value[ 0 ] != "." ) {
				if ( is_dir( $pathString . $value ) ) {
					$array[ $value ] = $this->getDirectoryStructure( $pathString . $value ."/" );
				} else {
					array_push( $array, $value );
				}
			}
		}

		return $array;
	}

	private function isAValidFilename ( $name ) {
		$name = trim( $name );

		return ( !$this->stringPotentiallyContainsDirectoryShift( $name )
		         && $this->stringDoesNotContainInvalidCharacters( $name ) );
	}

	public function listDirectoryStructure () {
		return $this->getDirectoryStructure( Config::getInstance()->rootDirectory() );
	}

	private function pathExists ( $pathArray ) {
		if ( !isset( $pathArray ) || !is_array( $pathArray ) || !strtolower( $pathArray[ 0 ] ) == "root" ) {
			return NULL;
		}

		$path = Config::getInstance()->rootDirectory();

		for ( $i = 1, $j = count( $pathArray ); $i < $j; $i++ ) {
			if ( !$this->isAValidFilename( $pathArray[ $i ] )
			|| !is_dir( $path . $pathArray[ $i ] ."/" ) ) {
				return NULL;
			}

			$path .= $pathArray[ $i ] ."/";
		}

		return $path;
	}

	private function removeDirectory ( $pathString ) {
		$files = array_diff( scandir( $pathString ), array( '.', '..' ) );

		foreach ( $files as $file ) {
			if ( is_dir( $pathString ."/". $file ) ) {
				if ( !$this->removeDirectory( $pathString . $file ) ) {
					return false;
				}
			} else {
				if ( !$this->removeFile( $pathString . $file ) ) {
					return false;
				}
			}
		}

		rmdir( realpath( $pathString ) );

		if ( is_dir( $pathString ) ) {
			Http::getInstance()->deleteFailure();
			return false;
		}

		return true;
	}

	private function removeFile ( $pathString ) {
		if ( !is_dir( realpath( $pathString ) ) ) {
			unlink( realpath( $pathString ) );
		}

		if ( file_exists( $pathString ) ) {
			Http::getInstance()->deleteFailure();
			return false;
		}

		return true;
	}

	public function renameDirectory ( $pathArray, $content ) {
		$oldFilename = array_pop( $pathArray );
		$newFilename = $content;
		$pathString = $this->pathExists( $pathArray );
		$pathString = $this->editorIsNotParentOfPath( $pathString );
		$oldPathString = $this->editorIsNotParentOfPath( $pathString . $oldFilename );

		if ( $pathString != NULL && $oldPathString != NULL ) {
			if ( $this->isAValidFilename( $oldFilename ) && file_exists( $pathString . $oldFilename )
			&& $this->isAValidFilename( $newFilename ) && !file_exists( $pathString . $newFilename ) ) {
				rename( $pathString . $oldFilename, $pathString . $newFilename );
			} else {
				Http::getInstance()->invalidName();
			}
		} else {
			Http::getInstance()->invalidPath();
		}
	}

	public function renameFile ( $pathArray, $content ) {
		$oldFilename = array_pop( $pathArray );
		$newFilename = $content;
		$pathString = $this->pathExists( $pathArray );
		$pathString = $this->editorIsNotParentOfPath( $pathString );

		if ( $pathString != NULL ) {
			if ( $this->isAValidFilename( $oldFilename ) && file_exists( $pathString . $oldFilename )
			&& $this->isAValidFilename( $newFilename ) && !file_exists( $pathString . $newFilename ) ) {
				rename( $pathString . $oldFilename, $pathString . $newFilename );
			} else {
				Http::getInstance()->invalidName();
			}
		} else {
			Http::getInstance()->invalidPath();
		}
	}

	private function stringDoesNotContainInvalidCharacters ( $string ) {
		return ( preg_match( "/^[A-Za-z0-9 ._-]+$/", $string ) == 1 );
	}

	private function stringPotentiallyContainsDirectoryShift ( $string ) {
		return ( strpos( $string, ".." ) != FALSE );
	}
}

?>
