<?php

try {
	include_once "config.php";
	include_once "http.php";
	include_once "router.php";
	
	ini_set( "log_errors", 1 );
	ini_set( "error_log", Config::getInstance()->rootDirectory() ."errors.log" );
	Router::getInstance()->resolve();
} catch ( Exception $e ) {
	header( "HTTP/1.0 500 Internal Error" );
}

?>
