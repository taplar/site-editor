<?php
	final class AuthController {
		private static $instance;


		private function __clone(){}
		private function __construct(){}

		public static function getInstance(){
			if (!self::$instance){
				self::$instance = new self();
			}
			
			return self::$instance;
		}

		public function resolve($path){}
	}

	if (defined('EDITOR_ONSITE')){
		Router::getInstance()->register('auth', AuthController::getInstance());
	}
?>
