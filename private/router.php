<?php
	class Router {
		private static $instance;
		private $roots;
		

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
		
		public function resolve(){
			include_once 'private/elements/response.php';

			$response = Response::getInstance();
			$path = $this->getPath();

			try {
				if ($path) {
					if (isset($this->$roots[$path[0]])){
						$this->$roots[$path[0]]->resolve($path, $response);
					} else {
						$response->pathIsUnknown();
					}
				} else {
					include_once 'private/services/filesystemService.php';

					$filesystem = FilesystemService::getInstance();
					$indexFile = Config::getInstance()->getEditorDirectory() .'public/index.html';

					$response->rawData($filesystem->readFile($indexFile));
				}
			} catch (Exception $e){
				$response->unexpectedExceptionOccured();
			}

			echo $response;
		}
/*
		public static function register($root, $variable){
			self::$roots[$root] = $variable;
		}
*/
	}
?>
