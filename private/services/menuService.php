<?php
	final class MenuService {
		private static $instance;


		private function __clone(){}
		private function __construct(){}
		
		public static function getInstance(){
			if (!self::$instance){
				self::$instance = new self();
			}
			
			return self::$instance;
		}

		public function listDirectoryStructure(){
			include_once 'private/services/filesystemService.php';

			$response = Router::getInstanceOfClass('ResponseService', null);
			$rootDirectory = Config::getInstance()->getRootDirectory();

			$response->files(Router::getInstanceOfClass('FilesystemService', null)->getDirectoryStructure($rootDirectory));
		}
	}
?>
