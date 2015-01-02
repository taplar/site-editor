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

	public function delete ( $path ) {
		$this->sessionService->invalidateSession();
	}

	public function index ( $path ) {
		return $this->sessionService->isSessionActive();
	}

	public function save ( $path ) {
		$this->sessionService->validateSession();
	}

	public function update ( $path ) {
		Http::getInstance()->badRequest();
	}
}

?>
