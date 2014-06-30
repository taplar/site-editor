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

		public function getDirectoryStructure($path){
			$array = array();
			
			foreach(scandir($path) as $key => $value){
				if (!($value == '.' || $value == '..')){
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
	}
?>
