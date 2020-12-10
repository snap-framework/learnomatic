<?php
 ini_set('display_errors',1); 
 error_reporting(E_ALL);
//include ("includes/classes.php");
//include ("includes/filewrite.php");
require_once(dirname(__FILE__)."/includes/classes.php");
require_once(dirname(__FILE__)."/includes/commObj.php");
require_once(dirname(__FILE__)."/includes/socialController.php");

require_once(dirname(__FILE__)."/includes/filewrite.php");
require_once(dirname(__FILE__)."/includes/sessions.php");
require_once(dirname(__FILE__)."/includes/courses.php");
require_once(dirname(__FILE__)."/includes/comms.php");

session_start([
	 'cookie_lifetime' => 86400,
]);

if (empty($_POST))
{ 
	//default values for testing
	$temp = new DataReceive();
	$temp->action = "createComm";
	//updateComm getCommsList
	$temp->userInfo=json_decode('{"username":"sjomphe","team":"ux","courses":["C400", "test_zone"]}');
	$temp->commInfo=json_decode('{ "type": "announcement", "sender": "sjomphe", "receiver": { "user": [ "all" ] }, "content": "stef can now create new announcements" }');
	/*
	$temp->action = "updateCourse";
	$temp->folder = "test_zone";
	$temp->json = '{"name":"Zone de test","code":"test_zone", "teams":{}, "users":{"sjomphe":{"role":"admin","owner":"true"}}}';
	//$temp->json = '{"name":"Zone de test","code":"test_zone"}';
*/
	$received = json_encode($temp);

}else{
	$received = json_encode($_POST);

}

//Dispatcher
dispatcher($received);


?>