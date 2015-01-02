<?php

try {
	include_once "config.php";
	include_once "http.php";
	include_once "router.php";

	Router::getInstance()->resolve();
} catch ( Exception $e ) {
	header( "HTTP/1.0 500 Internal Error" );
}

?>
