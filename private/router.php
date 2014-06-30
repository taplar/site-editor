<?php
	final class Router {
		private static $instance;
		private $roots;
		

		private function __clone(){}

		private function __construct(){
			$this->roots = array();
		}
		
		public static function getInstance(){
			if (!self::$instance){
				self::$instance = new self();
			}
			
			return self::$instance;
		}
		
		private function getPath(){
			$keys = array_keys($_GET);

			if (count($keys) > 0){
				return explode('/', $keys[0]);
			}

			return null;
		}

		public function register($root, $variable){
			$this->roots[$root] = $variable;
		}
		
		public function resolve(){
			include_once 'private/services/responseService.php';

			$response = ResponseService::getInstance();
			$path = $this->getPath();

			try {
				if ($path) {
					include_once 'private/services/authorizationService.php';

					AuthorizationService::getInstance()->validate();

					if (isset($this->roots[$path[0]])){
						$this->roots[$path[0]]->resolve($path);
					} else {
						$response->pathIsUnknown();
					}
				} else {
					include_once 'private/services/filesystemService.php';

					$filesystem = FilesystemService::getInstance();
					$indexFile = Config::getInstance()->getEditorDirectory() .'public/views/index.html';

					$response->rawData($filesystem->readFile($indexFile));
				}
			} catch (Exception $e){
				$response->unexpectedExceptionOccured();
			}

			echo $response;
		}
	}
?>
