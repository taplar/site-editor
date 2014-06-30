<?php
	final class MenuController {
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
			include_once 'private/services/menuService.php';

			if (count($request) > 1){
				if (strcasecmp($request[1], 'list') == 0){
					MenuService::getInstance()->listDirectoryStructure();
					return;
				}
			}
			
			ResponseService::getInstance()->pathIsUnknown();
		}
	}

	if (defined('EDITOR_ONSITE')){
		Router::getInstance()->register('menu', MenuController::getInstance());
	}
?>
