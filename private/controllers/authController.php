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

		public function resolve($request){
			include_once 'private/services/authorizationService.php';

			if (count($request) > 1){
				if (strcasecmp($request[1], 'validate') == 0){
					//validate should happen on every request
					//skip if it is the actual request
					return;
				}
			}
			
			ResponseService::getInstance()->pathIsUnknown();
		}
	}

	if (defined('EDITOR_ONSITE')){
		Router::getInstance()->register('auth', AuthController::getInstance());
	}
?>
