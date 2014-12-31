<?php

final class FilesService {
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

	private function getDirectoryStructure( $path ) {
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

	public function listDirectoryStructure() {
		return $this->getDirectoryStructure( Config::getInstance()->rootDirectory() );
	}
}

?>
