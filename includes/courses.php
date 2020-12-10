<?php
//error_reporting(E_ERROR | E_PARSE); //so sorry about this;
/* *********************************************
 * CHECKSESSION
 * Check if the current user has an active session
 * RETURNS username / false
 * ********************************************/
function getCourseList($received){
	
	$dir = scandir('courses/');
	$course_list = array();
	foreach ($dir as $key=>$value) {
		if ($key>1){

			if ('.' !== $value && '..' !== $value && $value[0] !== "_"){
				$course = new CourseObj();
				$course->init($value, $value, [], $value);

				array_push($course_list, $course);
			}

		}
	}		
	
	
	echo json_encode($course_list);
}

function updateCourse($received){
	$value=$received->folder;

	$course = new CourseObj();
	$course->init($value, $value, [], $value);
	$course->updateCourseInfo($received->json);
	echo "true";
}

function copyCourse($received){
	recurse_copy("courses/".$received->origin, "courses/".$received->content);
	
	$course = new CourseObj();
	$course->init($received->name, $received->content, [$received->team], $received->content);
	
	
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