<?php
	final class FilesystemService {
		private static $instance;


		private function __clone(){}
		private function __construct(){}
		
		public static function getInstance(){
			if (!self::$instance){
				self::$instance = new self();
			}
			
			return self::$instance;
		}

		public function createFile(){
			$response = ResponseService::getInstance();
			$file = $_POST['file'];

			if ($this->rootPathExists($file) && $this->fileDoesNotExist($file)){
			} else {
				$response->requestWasInvalid();
			}
		}

		public function fileDoesNotExist($pathArray){
			$response = ResponseService::getInstance();
			$response->rawData('File Does Not Exist check unimplemented.');
			return false;
		}

		public function getDirectoryStructure($path){
			$array = array();
			
			foreach(scandir($path) as $key => $value){
				if ($value[0] != '.'){
					if (is_dir($path.$value)){
						$array[$value] = $this->getDirectoryStructure($path.$value.'/');
					} else {
						array_push($array, $value);
					}
				}
			}
			
			return $array;
		}

		public function readFile($path){
			$line = NULL;
			$result = array();
			
			if ($objFile = @fopen($path, "r")){
				for ($i = 0; $line = fgets($objFile); $i++){
					$result[$i] = $line;
				}
				
				fclose($objFile);
			}
			
			return implode("", $result);
		}

		private function rootPathExists($pathArray){
			if (!is_array($pathArray)){
				return false;
			}

			$fullPath = Config::getInstance()->getRootDirectory();
			$pathExists = ($pathArray[0] == 'root');

			for ($i = 0; $i < count($pathArray) - 1 && $pathExists; $i++){
				if ($this->stringContainsPotentialDirectoryShift($pathArray[$i], '..')){
					$pathExists = false;
				} else {
					$fullPath .= $pathArray[i].'/';
					$pathExists = is_dir($fullPath);
				}
			}

			return $pathExists;
		}

		private function stringContainsPotentialDirectoryShift($string){
			return strpos($string, '..');
		}
	}
?>
