<?php

final class Router {
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

	public static function getInstanceOfClass( $className, $params ) {
		if ( !ctype_alpha( $className ) ) {
			throw new Exception( "Invalid Class Name" );
		}

		$reversedString = strrev( strtolower( $className ) );

		if ( substr( $reversedString, 0, 10 ) == "rellortnoc" ) {
			$relativePath = "private/controllers/";
		} else if ( substr( $reversedString, 0, 7 ) == "ecivres" ) {
			$relativePath = "private/services/";
		} else {
			throw new Exception( "Unknown Object Type" );
		}

		$lowercaseClassName = $className;
		$lowercaseClassName{ 0 } = strtolower( $lowercaseClassName{ 0 } );
		$filePath = Config::getInstance()->getEditorDirectory() . $relativePath . $lowercaseClassName .".php";

		if ( file_exists( $filePath ) ) {
			include_once $filePath;

			$callable = array( $className, "getInstance" );

			if ( !isset( $params ) ) {
				return call_user_func( $callable );
			} else {
				return call_user_func_array( $callable, $params );
			}
		} else {
			throw new Exception( "Class Does Not Exist" );
		}
	}

	private function getPath() {
		$keys = array_keys( $_GET );

		if ( count( $keys ) > 0) {
			return explode( "/", $keys[ 0 ] );
		}

		return NULL;
	}

	public function resolve() {
		$response = self::getInstanceOfClass( "ResponseService", NULL );
		$path = $this->getPath();

		try {
			if ( $path && count( $path ) > 0 ) {
				self::getInstanceOfClass( "AuthorizationService", NULL )->validate();

				$className = ucwords( strtolower( $path[ 0 ] ) ."Controller" );

				self::getInstanceOfClass( $className, NULL )->resolve( $path, $response );
			} else {
				$this->resolveInvalidPath( $response );
			}
		} catch ( Exception $e ) {
			$response->unexpectedExceptionOccured();
		}

		echo $response;
	}

	private function resolveInvalidPath( $response ) {
		$filesystem = self::getInstanceOfClass( "FilesystemService", NULL );
		$indexFile = Config::getInstance()->getEditorDirectory() ."public/views/index.html";
		$response->rawData( $filesystem->readFile( $indexFile ) );
	}
}

?>
