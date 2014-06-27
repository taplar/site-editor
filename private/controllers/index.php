<?php
	class Controllers {
		private static $instance;
		

		private function __construct(){
		}
		
		public static function getInstance(){
			if (!self::$instance){
				self::$instance = new self();
			}
			
			return self::$instance;
		}

		public function register(){
			$rootdir = Config::getInstance()->getEditorDirectory() .'private/controllers/';
			
			foreach(scandir($rootdir) as $key => $value){
				if (strstr($value, 'Controller.php')){
					include_once $rootdir.$value;
				}
			}
		}
	}
?>
