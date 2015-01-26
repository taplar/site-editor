<?php

try {
	include_once "config.php";
	include_once "http.php";
	include_once "router.php";
	
	ini_set( "error_log", Config::getInstance()->rootDirectory() ."errors.log" );
	ini_set('display_errors', 'On');
	error_reporting(E_ALL | E_STRICT);
	
	Router::getInstance()->resolve();
} catch ( Exception $e ) {
	header( "HTTP/1.0 500 Internal Error" );
}

?>
