<?php
//phpinfo ();
require_once(dirname(__FILE__)."/includes/filewrite.php");
$folder=$_POST[folder];
print_r($_POST);
 ini_set('display_errors',1); 
 error_reporting(E_ALL);
$uploadfile = $_FILES['userfile']['name'];
mkdir("courses/".$folder, 0700);


if (move_uploaded_file($_FILES['userfile']['tmp_name'], "courses/".$folder."/$uploadfile")) {
    echo "Uploaded.\n";
} else {
    echo "Not uploaded.\n";
}
$newfile="courses/".$folder."/".$uploadfile;
echo $newfile;
//echo 'Here is some more debugging info:';
//print_r($_FILES);
$zip = new ZipArchive;  $res = $zip->open($newfile);
  if ($res === TRUE) {
     $zip->extractTo("courses/".$folder."/");
     $zip->close();
     echo 'extraction successful';
	 //header('Location: index.html');
	  
	  
	  // Get the contents of the JSON file 
	  $settingsPage="courses/".$folder."/settings/settings-general.js";
	  $strJsonFileContents = file_get_contents($settingsPage);
		if (strpos($strJsonFileContents, 'editMode') === false) {
		  $jsonString=str_replace("});","",$strJsonFileContents);
			$jsonString=$jsonString.",editMode:true"."});";
			$page=prepareFile($settingsPage);
			fwrite($page, $jsonString);
			fclose($page);
		}

	  header('Location: index.html');
	  
	  
  } else {
     echo 'extraction error';
  }  
	
?>