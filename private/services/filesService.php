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

	public function createDirectory ( $path ) {
		$filename = array_pop( $path );
		$pathString = $this-> validateExistingPath( $path );

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

	public function deleteDirectory ( $path ) {

	}

	public function createFile () {

	}
	
	private function getDirectoryStructure ( $path ) {
		$array = array();

		foreach ( scandir( $path ) as $key => $value ) {
			if ( $value[ 0 ] != "." ) {
				if ( is_dir( $path.$value ) ) {
					$array[ $value ] = $this->getDirectoryStructure( $path.$value ."/" );
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
