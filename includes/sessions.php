<?php
error_reporting(E_ERROR | E_PARSE); //so sorry about this;
/* *********************************************
 * CHECKSESSION
 * Check if the current user has an active session
 * RETURNS username / false
 * ********************************************/
function checksession(){
	if (isset($_SESSION["username"])) {
		//if so, return the username
		echo $_SESSION["username"];
	}else{
		echo "false";
	}
}
/* *********************************************
 * GETSESSIONS
 * fetch the session file and convers to JSON
 * RETURNS JSON session
 * ********************************************/
function getSessions(){
	$json = file_get_contents('courses/_system/sessions.json');
	
	$obj = json_decode($json);
	return $obj;
	
	
}

/* *********************************************
 * updateSession
 * updates the timestamp
 * theoretically destroys outdated items
 * RECEIVES session Json 
 * RETURNS updated session Json
 * ********************************************/

function updateSessions($json){
	$now=time();
	$timeout=1*60;//20 minutes x 60 secondes
	foreach ($json->users as $key => $value) {
		$secondsago=$now-$value->timestamp;
		if ($secondsago<$timeout){

		}else{
			//DESTROY TIMESTAMP?
			unset($json->users->$key);
		}

	}
	return $json;
}

/* *********************************************
 * othersessions
 * check all the active sessions

 * RECEIVES username, page and course 
 * RETURNS updated session Json
 * ********************************************/
function othersessions($received){
	//INIT
	$lockflag=false;
	$user=$received->username;
	$page=$received->filename;
	$course=$received->course;
	$watchers=[];
	$msg="";

	//-----get the sessions
	$json=getSessions();
	//-----update sessions timestamps
	$json=updateSessions($json);
	// loop users
	/*foreach ($json->users as $key => $value) {
		//same course? same page? different user ? 
		if($value->course===$course &&$value->page===$page && $key!== $user){
			//watchers will probably be replaced.

			$lockflag=true;
			$msg="need to tell the console something.";
		}

	}*/
	//JSON to write to file
	$json->users->$user->page=$page;
	$json->users->$user->timestamp=time();
	$json->users->$user->course=$course;
	//$json->users->$user->locked=$lockflag;
	
	//unset($json->users->$user->locked);
	//echo json_encode($json);
	$received->filename="courses/_system/sessions.json";
	$received->content=json_encode($json);
	
	saveSession($json);
	$json->comms=$_SESSION["lastComm"];
	//JSON for the browser's user
	//$json->msg=$msg;
	//send to browser
	
	
	
	echo json_encode($json);	
}

function addWarning($receiverArray){
	$json=getSessions();
	foreach($json->users as $jsonUsername => $sessionUser){
		if (in_array($jsonUsername, $receiverArray)) {
			$sessionUser->warning=true;
		}
	}
	saveSession($json);
}

function removeWarning($received){
	$username=$received->userInfo->username;
	$json=getSessions();
	//$json->users[$username]->warning="false";
	foreach($json->users as $jsonUsername => $sessionUser){
		//echo "\n".$jsonUsername." equals ".$username;
		$json->msg=$received->action;
		if($jsonUsername===$username){
			//echo "WOIW";
			$sessionUser->warning=false;
			unset($sessionUser->warning);
			saveSession($json);
			getRecentComm($received);
		}
	}
	
	
}

function saveSession($json){
	$newFile=fopen("courses/_system/sessions.json", "w") or die("Unable to open file ");
	fwrite($newFile, json_encode($json));
	fclose($newFile);
	
}



/* *********************************************
 * createsession
 * create a PHP SESSION.

 * RECEIVES username
 * ********************************************/
function createsession($un){

	$_SESSION["username"] = $un;
}
/* *********************************************
 * closeSession
 * destroys the session in the JSON FILE
 * destroys the PHP SESSION

 * RECEIVES username to delete
 * RETURNS "session closed"
 * ********************************************/
function closeSession($received){
	//user to delete
	$delete=$received->username;
	//grab the newest session JSON
	$json=getSessions();
	$json=updateSessions($json);
	//delete the user from JSON
	unset($json->users->$delete);
	//SAVE THE FILE
	$newFile=fopen("courses/_system/sessions.json", "w") or die("Unable to open file ");
	fwrite($newFile, json_encode($json));
	fclose($newFile);
	//destroy the session
	unset($_SESSION);
	session_destroy();
	//report to browser
	echo "session closed";
}



?>