<?php
	class Config {
		private static $instance;
		public $EDITOR_DIRECTORY;
		
		
		private function __construct(){
			$this->EDITOR_DIRECTORY = './';
		}
		
		public function getEditorDirectory(){
			return $this->EDITOR_DIRECTORY;
		}

		public static function getInstance(){
			if (!self::$instance){
				self::$instance = new self();
			}
			
			return self::$instance;
		}
	}
?>
