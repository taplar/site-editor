<?php
	final class Config {
		private static $instance;
		private final $EDITOR_DIRECTORY = './';
		private final $ROOT_DIRECTORY = '../';
		
		
		private function __clone(){}
		private function __construct(){}

		public function getEditorDirectory(){
			return $this->EDITOR_DIRECTORY;
		}
		
		public function getRootDirectory(){
			return $this->ROOT_DIRECTORY;
		}

		public static function getInstance(){
			if (!self::$instance){
				self::$instance = new self();
			}
			
			return self::$instance;
		}
	}
?>