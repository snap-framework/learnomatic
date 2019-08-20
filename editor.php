<?php
 ini_set('display_errors',1); 
 error_reporting(E_ALL);
//include ("includes/classes.php");
//include ("includes/filewrite.php");
require_once(dirname(__FILE__)."/includes/classes.php");
require_once(dirname(__FILE__)."/includes/filewrite.php");


if (empty($_POST))
{
	//default values for testing
	$temp = new DataReceive();
	$temp->action = "closessions";
	$temp->username="admin_sjomphe";
	$temp->pw="admin";
	$temp->br="<br>";
	//'[{"oldFile":"m2-0","newFile":"m1-3-0"},{"oldFile":"m2-1","newFile":"m1-3-1"},{"oldFile":"m2-2","newFile":"m1-3-2"},{"oldFile":"m3-0","newFile":"m2-0"},{"oldFile":"m3-1","newFile":"m2-1"},{"oldFile":"m3-2-0","newFile":"m2-2-0"},{"oldFile":"m3-2-1","newFile":"m2-2-1"},{"oldFile":"m98-0","newFile":"m3-0"},{"oldFile":"m98-1","newFile":"m3-1"}]';
	$temp->filename = "m0";
	// $temp->content = "<h1>Default Content</h1>";
	

	$received = json_encode($temp);

}else{
	$received = json_encode($_POST);

}

//Dispatcher
dispatcher($received);


?>