<?php



function getVars($received){	
	$vars = new ColorControlObj($received->filename);
	$vars->populate();
	echo json_encode($vars, JSON_PRETTY_PRINT);
	//echo json_encode($received, JSON_PRETTY_PRINT);
}

?>