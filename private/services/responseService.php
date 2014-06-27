<?php
	final class ResponseService {
		private static $instance;
		private $array;


		private function __clone(){}

		private function __construct(){
			$this->array = array();
			$this->userIsNotRecognised();
		}
		
		public function __toString(){
			if (!isset($this->array['rawData'])){
				return json_encode($this->array);
			} else {
				return $this->array['rawData'];
			}
		}
		
		private function addResponse($key, $value){
			$this->array[$key] = $value;
		}
		
		public static function getInstance(){
			if (!self::$instance){
				self::$instance = new self();
			}
			
			return self::$instance;
		}

		public function pathIsUnknown(){
			$this->requestWasInvalid();
		}

		public function rawData($data){
			$this->addResponse('rawData', $data);
		}

		public function requestWasInvalid(){
			$this->responseCode('INVALID_REQUEST');
		}

		private function responseCode($code){
			$this->addResponse('responseCode', $code);
		}

		public function unexpectedExceptionOccured(){
			$this->responseCode('INTERNAL_ERROR');
		}

		public function userIsNotRecognised(){
			$this->responseCode('UNAUTHORIZED');
		}

		public function userIsRecognised(){
			$this->responseCode('AUTHORIZED');
		}
	}
?>
