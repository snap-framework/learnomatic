<?php
//error_reporting(E_ERROR | E_PARSE); //so sorry about this;
/* *********************************************
 * CHECKSESSION
 * Check if the current user has an active session
 * RETURNS username / false
 * ********************************************/


function getCommsList($received){
	$social = new SocialObj($received->userInfo);
	//$social->setLastComm();
	echo json_encode($social, JSON_PRETTY_PRINT);
}

function updateComm($received){
	$social = new SocialObj($received->userInfo);
	$social->updateCommFile($received);
	//echo "true";
}
function createComm($received){
	$social = new SocialObj($received->userInfo);
	$newComm= $social->createComm($received->commInfo);
	echo json_encode($newComm, JSON_PRETTY_PRINT);
}
function deleteComm($received){
	$social = new SocialObj($received->userInfo);
	
	$social->deleteComm($received->commInfo);
}

function getRecentComm($received){
	
	$social = new SocialObj($received->userInfo);
	$social->getRecent();
	echo json_encode($social, JSON_PRETTY_PRINT);
	//$result=$social->getRecent();
	//echo $result;
}

function setLastComm($received){
	
	$social = new SocialObj($received->userInfo);
	$social->setLastComm($received->lastComm);
}