<?php

final class Router {
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

	private static function forwardToRestFunction ( $path ) {
		$controller = ucwords( strtolower( $path[ 0 ] ) ."Controller" );
		$controller = Router::getInstanceOfClass( $controller, NULL );
		$path = array_splice( $path, 1 );
		$content = Router::getContent();

		switch ( strtoupper( $_SERVER[ "REQUEST_METHOD" ] ) ) {
			case "DELETE":
				$controller->delete( $path );
				break;
			case "GET":
				$controller->index( $path );
				break;
			case "POST":
				$controller->save( $path, $content );
				break;
			case "PUT":
				$controller->update( $path, $content );
				break;
			default:
				Http::getInstance()->badRequest();
				break;
		}
	}

	private static function getContent () {
		$content = file_get_contents("php://input");
		$temp = json_decode( $content );

		if ( $temp !== NULL ) {
			return $temp;
		}

		return $content;
	}

	public static function getInstanceOfClass ( $className, $params ) {
		if ( !ctype_alpha( $className ) ) {
			throw new Exception( "Invalid Class Name" );
		}

		$relativePath = self::getRelativePathToClass( $className );
		$lowercaseClassName = $className;
		$lowercaseClassName{ 0 } = strtolower( $lowercaseClassName{ 0 } );
		$filePath = Config::getInstance()->editorDirectory() . $relativePath . $lowercaseClassName .".php";

		return self::includeFileAndInstantiateClass( $filePath, $className, $params );
	}

	private static function getRelativePathToClass ( $className ) {
		$reversedString = strrev( strtolower( $className ) );

		if ( substr( $reversedString, 0, 10 ) == strrev( "controller" ) ) {
			return "private/controllers/";
		}

		if ( substr( $reversedString, 0, 7 ) == strrev( "service" ) ) {
			return "private/services/";
		}

		throw new Exception( "Unknown Object Type" );
	}

	private static function includeFileAndInstantiateClass ( $filePath, $className, $params ) {
		if ( file_exists( $filePath ) ) {
			include_once $filePath;

			$callable = array( $className, "getInstance" );

			if ( !isset( $params ) ) {
				return call_user_func( $callable );
			}

			return call_user_func_array( $callable, $params );
		}

		throw new Exception( "Class Does Not Exist" );
	}

	private static function loginAttempt ( $requestPath ) {
		return ( strtoupper( $requestPath[ 0 ] ) == "SESSIONS" && strtoupper( $_SERVER[ "REQUEST_METHOD" ] ) == "POST" );
	}

	private function parseRequestPath () {
		if ( isset( $_GET[ "p" ] ) ) {
			return explode( "/", $_GET[ "p" ] );
		}

		return [];
	}

	public function resolve () {
		$requestPath = $this->parseRequestPath();
		$sessionsController = Router::getInstanceOfClass( "SessionsController", NULL );

		if ( count( $requestPath ) > 0 ) {
			if ( $sessionsController->index( $requestPath ) ) {
				Router::forwardToRestFunction( $requestPath );
			} else if ( Router::loginAttempt( $requestPath ) ) {
				$sessionsController->save( $requestPath );
			} else {
				Http::getInstance()->unauthorized();
			}
		} else {
			Http::getInstance()->badRequest();
		}
	}
}

?>
