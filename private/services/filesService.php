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

	public function createDirectory () {
		$path = $this->getPathFromInput();

		if ( $path != NULL ) {
			$filename = $this->getFilenameFromInput();

			if ( $filename != NULL && !file_exists( $path . $filename ) ) {
				mkdir( $path . $filename );
			} else {
				Http::getInstance()->invalidName();
			}
		} else {
			Http::getInstance()->invalidPath();
		}
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

	private function getFilenameFromInput () {
		$filename = $_POST[ "filename" ];

		if ( !isset( $filename ) || !is_string( $filename ) || !$this->isAValidFilename( $filename ) ) {
			return NULL;
		}

		return $filename;
	}

	private function getPathFromInput () {
		$pathArray = $_POST[ "path" ];

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
}

?>
