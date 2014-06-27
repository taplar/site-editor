<?php
	define('EDITOR_ONSITE', 1);
	
	session_start();
	
	include_once 'private/config.php';
	include_once 'private/router.php';
	include_once 'private/controllers/index.php';
	
	Controllers::getInstance()->register();
	Router::getInstance()->resolve();
?>
