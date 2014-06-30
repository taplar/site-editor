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

			$response = ResponseService::getInstance();
			$rootDirectory = Config::getInstance()->getRootDirectory();

			$response->files(FilesystemService::getInstance()->getDirectoryStructure($rootDirectory));
		}
	}
?>
