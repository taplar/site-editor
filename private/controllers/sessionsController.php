<?php

final class SessionsController {
	private static $instance;
	private $sessionService;

	private function __clone () {
	}

	private function __construct () {
		$this->sessionService = Router::getInstanceOfClass( "SessionService", NULL );
	}

	public static function getInstance () {
		if ( !self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	public function delete ( $requestParams ) {
		$this->sessionService->invalidateSession();
	}

	public function index ( $requestParams ) {
		return $this->sessionService->isSessionActive();
	}

	public function save ( $requestParams ) {
		$this->sessionService->validateSession();
	}

	public function update ( $requestParams ) {
		Http::getInstance()->badRequest();
	}
}

?>
