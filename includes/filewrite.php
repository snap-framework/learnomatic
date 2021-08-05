<?php
function dispatcher($json){
	$received=json_decode($json);
	if (!isset($received->br)) {
    	$received->br= "\n";
	}	
	//$file=prepareFile()
	switch ($received->action) {
		case "test":
			break;
		case "supermenu":
			//Same for now, eventually deal with multi-linguality, backups etc...
			fullWrite($received);
			break;
    	case "page":
			//rewrite page
			fullWrite($received);
			break;
    	case "readfolder":
			readFolder($received);
			break;

    	case "moveFiles":
			//move file from actionstack
			moveFiles($received);
			break;
		case "findrepository":
			findRepository($received);
			break;
		case "settings":
			saveSettings($received);
			break;
    	case "delete":
			deletePage($received);
			break;
        case "getUsers":
			//return list of users
			getListUsers();
			break;
		case "login":
			
			//return role
			getRole($received);
			break;
		case "checksession":
			
			//return role
			checkSession($received);
			
			
			
			break;
		case "createsession":
			
			//return role
			createsession($received);
			
			
			
			break;
		case "othersessions":
			
			//return role
			othersessions($received);
			break;
		case "closessions":
			
			//return role
			closeSession($received);
			break;

		case "getCourseList":
			getCourseList($received);
			break;
		case "updateCourse":
			updateCourse($received);
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
			
		case "upload_image":
			uploadImage($received);
			break;
			
		case "getCommsList":
			getCommsList($received);
			break;
		case "updateComm":
			updateComm($received);
			break;
		case "createComm":
			createComm($received);
			break;
		case "deleteComm":
			deleteComm($received);
			break;
		case "removeWarning":
			removeWarning($received);
			break;
			case "transfertheme":
			//echo $received->filename;
			transferTheme($received);
			break;
		case "getvars":
			getVars($received);
			break;
	}
}

//open the file, validate it and return the object
function prepareFile($filename){
	
	$folder=substr($filename, 0,strrpos($filename, '/'));
	createFolders($filename);
	$newFile=fopen($filename, "w") or die("Unable to open file ");

	return $newFile;
	
}

function createFolders($path){
	//$path=str_replace("world","Peter",$path);
	$cumulative="courses";
	$aFolder=explode("/",$path);
	foreach($aFolder as $folder ) {
		if (strpos($folder, '.') <= 0 && $folder !=="courses") {		
			checkFolder($cumulative."/", $folder);
			$cumulative=$cumulative."/".$folder;
		}
	}	
}

//this is to rewrite an entire page
function fullWrite($received){
	//prepare the file
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
	if (file_exists($received->filename)){
		if ($handle = opendir($received->filename)) {

			while (false !== ($entry = readdir($handle))) {

				if ($entry != "." && $entry != ".." && preg_match($received->regex, $entry) && $entry != "thumbs.db") {

					echo "$entry,";
				}
			}

			closedir($handle);
		}
		return $received;
	}else{
		echo "false";
	}
}


function checkFolder($path, $folder){
	if (!file_exists($path.$folder)) {
		mkdir($path.$folder, 0777, true);
	}
}






function moveFiles($received){
	$reposArray=array();
	
	$courseFolder=$received->folder;//course folder
	$contentFolder="./courses/".$courseFolder."/content/";//folder for the content;
	$moveStack=$received->filename;//MOVE STACK
	
	//verify m97 exists
	$targetPage="m97";
	$newFolder=getFolderFromPage("m97")."/";
	createFolder($contentFolder, $newFolder);
	
	
	//now that m97 (transition) is ready, lets loop through the moves once.
	foreach($moveStack as $i => $item) {
		$page=$item->oldFile;
		
		//name folders
		$fromFolderName=getFolderFromPage($page);
		$toFolderName=getFolderFromPage("m97");
		$folderFrom=$contentFolder.$fromFolderName."/";
		$folderTo=$contentFolder.$toFolderName."/";
		
		//do the files even exist?
		$exist_en=file_exists($folderFrom.$page."_en.html");
		$exist_fr=file_exists($folderFrom.$page."_fr.html");
		//find a sweet spot in m97 only if both fr and en exist
		if($exist_en || $exist_fr){
		

			//figure out the name of the new position
			$targetPage=findEmptySpace($contentFolder, "97");//send to a sweet spot in 97
			echo "<br> empty space: ".$targetPage;
			// FROM TO
			array_push($reposArray, [$targetPage, $item->newFile]);

			//move english
			if ($exist_en){moveFile2($page."_en.html", $targetPage."_en.html", $folderFrom, $folderTo);}
			//move French
			if ($exist_fr){moveFile2($page."_fr.html", $targetPage."_fr.html", $folderFrom, $folderTo);}		
			
			
		}


	}

	//print_r($reposArray);
	//now we need to loop through m97
	
	foreach($reposArray as $i => $item) {
		$fromPage=$item[0];
		$targetPage=$item[1];
		
		//name folders
		$fromFolderName=getFolderFromPage("m97");
		$toFolderName=getFolderFromPage($targetPage);
		$folderFrom=$contentFolder.$fromFolderName."/";
		$folderTo=$contentFolder.$toFolderName."/";		

		echo "<br> move --- ".$folderFrom.$fromPage." to ".$folderTo.$targetPage;
		
		//lets create the folder in case it doesn'T exist
		
		createFolder($contentFolder."/", $toFolderName);
		
		//move english
		moveFile2($fromPage."_en.html", $targetPage."_en.html", $folderFrom, $folderTo);
		//move French
		moveFile2($fromPage."_fr.html", $targetPage."_fr.html", $folderFrom, $folderTo);		
		
		

	}	
	
}



function createFolder($where, $what){
	//verify folder
	$checkExistFolder=file_exists($where.$what);
	if(!$checkExistFolder){
		//create folder
		mkdir($where.$what, 0777);
	}else{
		//already exists
	}
}

function getFolderFromPage($page){
	$arr = explode("-", $page, 2);
	$folder=$arr[0];
	$folder=str_replace("m", "module", $folder);
	return $folder;
}

function findRepository($received){
	$folder = findEmptySpace($received->folder, "98");
	echo $folder;
	
}

function findEmptySpace($contentFolder, $folderNum){
	for ($i=0; $i<=150; $i++){
		$filename="m".$folderNum."-".$i;
		
		
		
 		$currentPage= $contentFolder."module".$folderNum."/m".$folderNum."-".$i;
		$cur_en=$currentPage."_en.html";
		$cur_fr=$currentPage."_fr.html";
		
		//echo "<br>-check ".$cur_en." && ".$cur_fr." file exists: ".file_exists($cur_en);
		
		if(!file_exists($cur_en) && !file_exists($cur_fr)){
			return "m".$folderNum."-".$i;
		}else{
			
		}

 
	} 	
}

// source https://www.geeksforgeeks.org/copy-the-entire-contents-of-a-directory-to-another-directory-in-php/
function custom_copy($src, $dst) {  
  
    // open the source directory 
    $dir = opendir($src);  
  
    // Make the destination directory if not exist 
    @mkdir($dst);  
  
    // Loop through the files in source directory 
    while( $file = readdir($dir) ) {  
  
        if (( $file != '.' ) && ( $file != '..' )) {  
            if ( is_dir($src . '/' . $file) )  
            {  
  
                // Recursively calling custom copy function 
                // for sub directory  
                custom_copy($src . '/' . $file, $dst . '/' . $file);  
  
            }  
            else {  
                copy($src . '/' . $file, $dst . '/' . $file);  
            }  
        }  
    }  
  
    closedir($dir); 
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






function getRole($received){
	$users=getUsers();
	foreach($users as $key => $value) {

		if($key === $received->content){
			if($value->password === $received->pw){
				createsession($received->content);
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
	function transferTheme($received){
		$current=$received->course."/theme";
		$newFolder= $received->filename;
		delete_directory($received->course."/theme");
		mkdir($current);
		custom_copy($newFolder, $current);
		echo true;
	}




	function zipFolder($received){
		$path=$received->filename;
		$lang=$received->content;
		$course=substr($path, strrpos($path, '/') + 1);
		$rootPath = realpath($path);
		$filename = $course."_".date("y-m-d").'_'.$lang;

		// Initialize archive object
		$zip = new ZipArchive();
		$zip->open('courses/_download/'.$filename.'.zip', ZipArchive::CREATE | ZipArchive::OVERWRITE);

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
		$path = "courses/_download/pkg_".$lang."/";
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
			if (file_exists('courses/_download/'.$filename.'.zip')) {
				//echo "The file was found: " . date("d-m-Y h:i:s") . "<br>";
				echo $filename.'.zip';
				break;
			}
		} while(true);		
		//
		
	}

function uploadImage($received){
	
	

	$folder="courses/".$received->filename."/".$received->location;

	createFolders($folder);

	$imgName=$_FILES["file"]["name"];
	$test=explode(".", $_FILES["file"]["name"]);
	$imgExtension =end($test);
	
	$uploaded=move_uploaded_file($_FILES["file"]["tmp_name"], $folder.$imgName);
	
	$received->filename=$imgName;
	$received->uploaded=$uploaded;
	
	echo  json_encode($received);
	
	
	
	
	
	
}
function downloadZip($received){
  $filename = "courses/_download/".$received->content;

  if (file_exists($filename)) {

	  

header('Content-Type: application/octet-stream');
header("Content-Transfer-Encoding: Binary"); 
header("Content-disposition: attachment; filename=\"" . basename($filename) . "\""); 
readfile($filename); // do the double-download-dance (dirty but worky)	  
   }	else{
	  echo "file not found";
  }
}




function getUsers(){
	$json = file_get_contents('users.json');
	
	$obj = json_decode($json);
	return $obj->users;
	
	
}

function getListUsers(){
	$users = getUsers();
	echo json_encode($users);
}


?>