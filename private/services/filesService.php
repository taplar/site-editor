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
		$pathString = $this->validateExistingPath( $pathArray );

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

	public function deleteFile () {

	}

	public function deleteDirectory ( $pathArray ) {

	}

	public function createFile () {

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

	private function stringDoesNotContainInvalidCharacters ( $string ) {
		return ( preg_match( "/^[A-Za-z0-9 ._-]+$/", $string ) == 1 );
	}

	private function stringPotentiallyContainsDirectoryShift ( $string ) {
		return ( strpos( $string, ".." ) != FALSE );
	}

	private function validateExistingPath ( $pathArray ) {
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
}

?>
