<?php
	final class FileController {
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
			include_once 'private/services/filesystemService.php';

			if (count($request) > 1){
				if (strcasecmp($request[1], 'create') == 0){
					FilesystemService::getInstance()->createFile();
					return;
				}
			}
			
			ResponseService::getInstance()->pathIsUnknown();
		}
	}

	if (defined('EDITOR_ONSITE')){
		Router::getInstance()->register('file', FileController::getInstance());
	}
?>
