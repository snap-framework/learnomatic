<?php

/* *************************************************
 *    Comm OBJECT
 * ************************************************/
class SocialObj {

	private $name = "UNDEFINED NAME";
	private $userInfo = null;

	private $comms = [];

	public $messages = [];
	public $posts = [];
	public $announcements = [];
	public $notifications = [];
	public $reviews = [];

	public $lastComm = 0;


	private $file = "courses/_system/communicationLog.json";

	public function __construct( $userInfo ) {
		$this->userInfo = $userInfo;
		if(isset($_SESSION[ "lastComm" ])){
			$this->lastComm=$_SESSION[ "lastComm" ];
		}
		$this->refreshCommFile();
	}


	private function refreshCommFile() {
		$this->file;

		if ( file_exists( $this->file ) ) {
			//exists
			$this->populateComms();
			return true;
		} else {
			//dont exist
			$this->createCommFile( $this->file );
			$this->populateComms();
			return false;

		}
	}

	private function resetComms() {
		$this->messages = [];
		$this->posts = [];
		$this->announcements = [];
		$this->notifications = [];
		$this->reviews = [];
	}

	private function createCommFile() {
		$file = fopen( $this->file, 'w' );
		fwrite( $file, json_encode( $this, JSON_PRETTY_PRINT ) ); // here it will print the array pretty
		fclose( $file );

	}
	/* *******************************
	 * POPULATE COMMS
	 * classify all the comms into groups
	 * ******************************/
	private function populateComms() {

		$string = file_get_contents( $this->file );
		$json = json_decode( $string );
		$this->name = $json->name;

		foreach ( $json->comms as $key => $commInfo ) {
			$newComm = $this->initComm( $commInfo );
			array_push( $this->comms, $newComm );

		}

	}
	private function initComm( $commInfo ) {
		
		switch ( $commInfo->type ) {
			case "message":
				$newComm = new MessageObj( $commInfo );
				//add it to the messages only if related
				if ( $newComm->checkRelation( $this->userInfo ) ) {
					$this->messages[ $newComm->id ] = $newComm;
				};
				break;
			case "post":
				$newComm = new PostObj( $commInfo );
				if ( $newComm->checkRelation( $this->userInfo ) ) {
					$this->posts[ $newComm->id ] = $newComm;
				};
				break;
			case "announcement":

				$newComm = new AnnouncementObj( $commInfo );
				if ( $newComm->checkRelation( $this->userInfo ) ) {

					$this->announcements[ $newComm->id ] = $newComm;
				};
				break;
			case "notification":

				$newComm = new NotificationObj( $commInfo );
				if ( $newComm->checkRelation( $this->userInfo ) ) {
					$this->notifications[ $newComm->id ] = $newComm;
				};
				break;
			case "review":
				$newComm = new ReviewObj( $commInfo );
				if ( $newComm->checkRelation( $this->userInfo ) ) {
					$this->reviews[ $newComm->id ] = $newComm;
				};
				break;


			default:
		}
		return $newComm;
	}


	public function updateCommFile( $received ) {
		//do the updates
		$updates = $received->commInfo;
		//echo json_encode($this->comms);
		foreach ( $this->comms as $index => $comm ) {
			if ( $comm->id === $updates->id ) {
				//echo "YESSSS";
				$comm->update( $updates );
			}
		}
		$this->writeCommFile();
		//echo json_encode($updates);
		//echo "<br>";
		echo $this->getAllComms();

	}

	public function createComm( $commInfo ) {
		$commInfo->id = strval( time() );
		//echo json_decode($commInfo);
		$newComm = $this->initComm( $commInfo );
		array_push( $this->comms, $newComm );
		$this->writeCommFile();
		$this->sendWarning( $commInfo );
		return $newComm;
	}
	private function getAllComms() {

		//$comms= json_encode($this->comms);
		$printThis = json_decode( '{"name": "Social Controller"}' );
		$printThis->comms = $this->comms;
		//$printThis->comms="wow";//$this->comms;

		//echo $printThis;
		return json_encode( $printThis, JSON_PRETTY_PRINT );

	}

	private function sendWarning( $commInfo ) {
		addWarning( $commInfo->receiver->user );
	}

	public function setLastComm($comm) {
		$this->lastComm = $received;
		$_SESSION[ "lastComm" ] = $this->lastComm;
	}

	public function getRecent() {
		$this->resetComms();
		foreach ( $this->comms as $index => $comm ) {
			$diff=intval($comm->id)-intval($_SESSION[ "lastComm" ]);
			if ( $diff>0 ) {
				switch ( $comm->type ) {
					case "message":
						$this->messages[ $comm->id ] = $comm;
						break;
				case "post":
						$this->posts[ $comm->id ] = $comm;
						break;
					case "announcement":
						$this->announcements[ $comm->id ] = $comm;
						break;
					case "notification":
						$this->notifications[ $comm->id ] = $comm;
						break;
					case "review":
						$this->reviews[ $comm->id ] = $comm;
						break;
						

					default:
				}
			}
		}


	}
	/* -----------------------------------------
	 * DELETE
	 * ----------------------------------------*/
	public function deleteComm($info){
		$deleteId=$info->id;
		$delIndex;
		foreach ( $this->comms as $key => $commInfo ) {
			if($deleteId===$commInfo->id){
				$delIndex=$key;
			}
		}
		unset($this->comms[$delIndex]);
		echo $this->writeCommFile();
	}
	/* -----------------------------------------
	 * WRITE
	 * ----------------------------------------*/
	private function writeCommFile() {
		$json = $this->getAllComms();
		$file = fopen( $this->file, 'w' );
		fwrite( $file, $json ); // here it will print the array pretty
		fclose( $file );
		return true;
	}

}

?>