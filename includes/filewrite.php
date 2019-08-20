<?php
function dispatcher($json){
	$received=json_decode($json);
	if (!isset($received->br)) {
    	$received->br= "\n";
	}	
	//$file=prepareFile()
	switch ($received->action) {

		case "supermenu":
			//Same for now, eventually deal with multi-linguality, backups etc...
			fullWrite($received);
			break;
    	case "page":
			//rewrite page
			fullWrite($received);
			break;
    	case "readfolder":
			//rewrite page
			readFolder($received);
			break;
    	case "moveFiles":
			//move file from actionstack
			moveFiles($received);
			break;
		case "settings":
			saveSettings($received);
			break;
    	case "delete":
			//rewrite page
			deletePage($received);
			break;
		case "login":
			
			//return role
			getRole($received);
			break;
		case "usersession":
			
			//return role
			checkSessions($received);
			break;
		case "closessions":
			
			//return role
			closeSession($received);
			break;
		case "getcourses":
			courseList($received);
			break;
		case "addcourses":
			copyCourse($received);
			break;
			
		case "deletecourse":
			delete_directory($received->content);
			echo "true";
			break;
			
			
			
		case "zipfolder":
			zipFolder($received);
			break;
			
			
			
		case "downloadzip":
			downloadZip($received);
			break;
			
	}
}

//open the file, validate it and return the object
function prepareFile($filename){
	$folder=substr($filename, 0,strrpos($filename, '/'));
	 //echo "<br>".substr($filename, $start);
	mkdir($folder);
	$newFile=fopen($filename, "w") or die("Unable to open file ");
	return $newFile;
	
}



//this is to rewrite an entire page
function fullWrite($received){
	//prepare the file
	echo $received->filename;
	$page=prepareFile($received->filename);
	fwrite($page, $received->content);
	fclose($page);

	return $received;
}

//this is to delete a page
function deletePage($received){
	
	//prepare the file
	unlink($received->filename);
	//echo "DELETE ".$received->filename;

	return $received;
}



//this is to get a list of files
function readFolder($received){
	if ($handle = opendir($received->filename)) {

		while (false !== ($entry = readdir($handle))) {

			if ($entry != "." && $entry != ".." && preg_match($received->regex, $entry) && $entry != "thumbs.db") {

				echo "$entry,";
			}
		}

		closedir($handle);
	}
	
	return $received;
}

function courseList($received){

	$dir = scandir('courses/');
	$sub_dirs = array();
	foreach ($dir as $key=>$course) {
		if ($key>1){

			//echo $course."</div>";
			//$sub_dirs
			array_push($sub_dirs, $course);

		}
	}	
	echo json_encode($sub_dirs);
	
}

function moveFiles($received){
	$sendback=array();
	$conflicts=array();
	
	$br=$received->br;
	$exists=false;
	$files=$received->filename;
	$courseFolder=$received->folder;
	error_reporting(E_ALL); ini_set('display_errors', 1);
	foreach($files as $i => $item) {
		$msg="";
		//old files with their soon-to-be path
		
		$old_en=getPagePath($files[$i]->oldFile."_en.html",$courseFolder);
		$old_fr=getPagePath($files[$i]->oldFile."_fr.html",$courseFolder);
		
		//new files to be created
		$new_en=getPagePath($files[$i]->newFile."_en.html",$courseFolder);
		$new_fr=getPagePath($files[$i]->newFile."_fr.html",$courseFolder);
		
		//check exists EN and FR
		$oldexists_en=file_exists($old_en);
		$oldexists_fr=file_exists($old_fr);
		
		if($oldexists_en || $oldexists_fr){
			//check the desination
			if($files[$i]->newFile ==="m98"){
			
				$repository=findRepositorySpace($courseFolder);
				$new_en=getPagePath($repository."_en.html",$courseFolder);
				$new_fr=getPagePath($repository."_fr.html",$courseFolder);
				$files[$i]->newFile=$repository;
				
			}
			$exists_en=file_exists($new_en);
			$exists_fr=file_exists($new_fr);
			
			if(!$exists_en && !$exists_fr){

				if($oldexists_en){$msg =$msg.moveFile($files[$i]->oldFile."_en.html", $files[$i]->newFile."_en.html",$received);}
				$msg =$msg."--" ;
				if($oldexists_fr){$msg =$msg.moveFile($files[$i]->oldFile."_fr.html", $files[$i]->newFile."_fr.html",$received);}
				
			}else{
				//-------- CONFLICT---
				$conflictindex=sizeof($conflicts);
				$conflicts[$conflictindex]["oldFile"]=$files[$i]->oldFile;
				$conflicts[$conflictindex]["newFile"]=$files[$i]->newFile;
				//$conflicts[$conflictindex]->newFile=$files[$i]->newFile;
				$msg = $msg."don't move: ".$files[$i]->oldFile." X>".$files[$i]->newFile;
			}
			
			
		}else{
			$msg =$msg."no files to move: ".$files[$i]->oldFile;
		}
		
		$sendback[$i]=$msg;
	}
	$conflicts=moveConflicts($conflicts, $courseFolder);

	// CLEAN UP!!! DELETE UNUSED FOLDERS
	
	echo json_encode($conflicts);
	
}

function copyCourse($received){
	echo "test";
	recurse_copy("courses/_default", "courses/".$received->content);
	
}
function delete_directory($dirname) {
         if (is_dir($dirname))
           $dir_handle = opendir($dirname);
     if (!$dir_handle)
          return false;
     while($file = readdir($dir_handle)) {
           if ($file != "." && $file != "..") {
                if (!is_dir($dirname."/".$file))
                     unlink($dirname."/".$file);
                else
                     delete_directory($dirname.'/'.$file);
           }
     }
     closedir($dir_handle);
     rmdir($dirname);
     return true;
}
function recurse_copy($src,$dst) { 
    $dir = opendir($src); 
    @mkdir($dst); 
    while(false !== ( $file = readdir($dir)) ) { 
        if (( $file != '.' ) && ( $file != '..' )) { 
            if ( is_dir($src . '/' . $file) ) { 
                recurse_copy($src . '/' . $file,$dst . '/' . $file); 
            } 
            else { 
                copy($src . '/' . $file,$dst . '/' . $file); 
            } 
        } 
    } 
    closedir($dir); 
} 

function moveFile($from, $to, $courseFolder){
	//move the actual thing
	rename(getPagePath($from, $courseFolder), getPagePath($to, $courseFolder));
	return "move ".$from." to ".$to;
}

function moveConflicts($conflicts, $courseFolder){
	
	// MAKE SURE THE FOLDER IS THERE
	
	$newConflicts=array();
	foreach($conflicts as $i => $item) {
		//echo "<br>".$item["oldFile"]."_en.html"."->"."m97-".$i."_en.html ->".$item["newFile"]."_en.html";
		//echo "<br>".$item["oldFile"]."_fr.html"."->"."m97-".$i."_fr.html";
		
		$newConflicts[$i]["out_en"]= moveFile($item["oldFile"]."_en.html", "m97-".$i."_en.html", $courseFolder);
		$newConflicts[$i]["out_fr"]= moveFile($item["oldFile"]."_fr.html", "m97-".$i."_fr.html", $courseFolder);

	}
	foreach($conflicts as $i => $item) {
		$newConflicts[$i]["in_en"]=  moveFile("m97-".$i."_en.html", $item["newFile"]."_en.html", $courseFolder);
		$newConflicts[$i]["in_en"]=  moveFile("m97-".$i."_fr.html", $item["newFile"]."_fr.html", $courseFolder);

	}	
	return $newConflicts;
}

function getPagePath($filename, $folder){
	$genericPath="./courses/".$folder."/content/";
	//$genericPath="./content_test/";

	$module="";
	//---------extract the module
	$aPosition=explode("-",substr($filename, 1, -8));
	$aPosition=intval($aPosition[0]);
	$module=strval( $aPosition );

	
	//create if it doesnt exist

	mkdir($genericPath."module".$module, 0777);
	
	return $genericPath."module".$module."/".$filename;
}
function saveSettings($received){
	
}
function findRepositorySpace($folder){
	//loop through m98-0 to m98-99 and find a sweet spot
	for ($i=0; $i<=99; $i++){
		$filename="m98_".$i;
		
 		$currentPage=getPagePath($filename."_en.html", $folder);
		
		
		$repositoryExists=file_exists($currentPage);
		//echo "<br>".$currentPage." exists(".$repositoryExists.")";
		
		if(!$repositoryExists){
			//echo "<br>---page : ".$filename;
			return $filename;
		}
 
	} 
	
}
function getRole($received){
	$users=getUsers();
	foreach($users as $key => $value) {

		if($key === $received->content){
			if($value->password === $received->pw){
				echo json_encode($value);
				return false;
			}else{
				echo "error";
				return false;
			}
		}
	
    }	
	echo "error";
	return false;

}

function updateSessions($json){
	$br="<br>";
	$now=time();
	$timeout=20*60;//20 minutes x 60 secondes
	foreach ($json->users as $key => $value) {
		$secondsago=$now-$value->timestamp;
		if ($secondsago<$timeout){
			
		}else{
			//echo $br."unset ".$key." ";
			unset($json->users->$key);
		}
		
	}
	return $json;
}


	function zipFolder($received){
		$path=$received->filename;
		$lang=$received->content;
		$course=substr($path, strrpos($path, '/') + 1);
		$rootPath = realpath($path);
		$filename = $course."_".date("y-m-d").'_'.$lang;

		// Initialize archive object
		$zip = new ZipArchive();
		$zip->open('download/'.$filename.'.zip', ZipArchive::CREATE | ZipArchive::OVERWRITE);

		// Create recursive directory iterator

		$files = new RecursiveIteratorIterator(
			new RecursiveDirectoryIterator($rootPath),
			RecursiveIteratorIterator::LEAVES_ONLY
		);

		foreach ($files as $name => $file)
		{
			// Skip directories (they would be added automatically)
			if (!$file->isDir())
			{
				// Get real and relative path for current file
				$filePath = $file->getRealPath();
				$relativePath = substr($filePath, strlen($rootPath) + 1);

				// Add current file to archive
				$zip->addFile($filePath, $relativePath);
			}
		}
		
		//now add the manifests
		$lang=$received->content;
		$path = "download/pkg_".$lang."/";
		$rootPath = realpath($path);
		
		$files = new RecursiveIteratorIterator(
			new RecursiveDirectoryIterator($rootPath),
			RecursiveIteratorIterator::LEAVES_ONLY
		);
		foreach ($files as $name => $file)
		{
			// Skip directories (they would be added automatically)
			if (!$file->isDir())
			{
				// Get real and relative path for current file
				$filePath = $file->getRealPath();
				$relativePath = substr($filePath, strlen($rootPath) + 1);

				// Add current file to archive
				$zip->addFile($filePath, $relativePath);
			}
		}
		
		
		
		

		// Zip archive will be created only after closing object
		$zip->close();	
		do {
			if (file_exists('download/'.$filename.'.zip')) {
				//echo "The file was found: " . date("d-m-Y h:i:s") . "<br>";
				echo $filename.'.zip';
				break;
			}
		} while(true);		
		//
		
	}
function downloadZip($received){
  $filename = "download/".$received->content;

  if (file_exists($filename)) {
     /*header('Content-Type: application/zip');
     header('Content-Disposition: attachment; filename="'.basename($filename).'"');
     header('Content-Length: ' . filesize($filename));

     flush();
     readfile($filename);
     // delete file
     unlink($filename);
 	echo $filename;*/
	  

header('Content-Type: application/octet-stream');
header("Content-Transfer-Encoding: Binary"); 
header("Content-disposition: attachment; filename=\"" . basename($filename) . "\""); 
readfile($filename); // do the double-download-dance (dirty but worky)	  
   }	else{
	  echo "file not found";
  }
}

function checkSessions($received){
	$br="<br>";
	$lockflag=false;
	$user=$received->username;
	$page=$received->filename;
	$watchers=[];

	//-----get the sessions
	$json=getSessions();
	
	$json=updateSessions($json);
	foreach ($json->users as $key => $value) {

		
		if($value->page===$page && $key!== $user){
			$watchers[ sizeof($watchers)]=$key;
			$lockflag=true;
		}

	}

	//SEND TO BROWSER
	echo implode(",", $watchers);
	
	//----- RECREATE JSON
	$json->users->$user=json_decode('{"page":"'.$page.'","timestamp":"'.time().'"}');
		
	//echo json_encode($json);
	$received->filename="sessions.js";
	$received->content=json_encode($json);
	$newFile=fopen("sessions.js", "w") or die("Unable to open file ");
	fwrite($newFile, json_encode($json));
	fclose($newFile);
	
	//$json->users
	
	
	//echo $br."poke php";
	
	

	
	
}
function closeSession($received){
	$delete=$received->username;
		$json=getSessions();
	$json=updateSessions($json);
	unset($json->users->$delete);
	$newFile=fopen("sessions.js", "w") or die("Unable to open file ");
	fwrite($newFile, json_encode($json));
	fclose($newFile);
}

function getUsers(){
	$json = file_get_contents('users.js');
	
	$obj = json_decode($json);
	return $obj->users;
	
	
}
function getSessions(){
	$json = file_get_contents('sessions.js');
	
	$obj = json_decode($json);
	return $obj;
	
	
}

?>