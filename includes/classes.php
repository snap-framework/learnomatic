<?php

//class for getting data from javascript
class DataReceive {
	private $filename="";
	private $content="";
}
/* *************************************************
 *    COURSE OBJECT
 * ************************************************/
class CourseObj{
	public $name="";
	public $code="";
	public $teams=null;//json_decode('{}');
	private $location="";
	public $users=null;//json_decode('{}');
	
	public function init($name, $code, $teams, $location){
		$this->name=$name;
		$this->code=$code;
		$this->teams=$teams;
		$this->location="courses/".$location;
		
		$this->refreshCourseInfo();
	}
	
	private function getinfoFile(){
		return $this->location."/courseinfo.json";
	}
	
	private function refreshCourseInfo(){
		$filename = $this->getinfoFile();

		if (file_exists($filename)) {
			//exists
			$this->getCourseInfo();
			return true;
		} else {
			//dont exist
			$this->createCourseInfo();
			return false;

		}		
	}
	
	private function createCourseInfo(){
		$file = fopen($this->location."/courseinfo.json", 'w');
		fwrite($file, json_encode($this, JSON_PRETTY_PRINT));   // here it will print the array pretty
		fclose($file);
		
	}	

	private function getCourseInfo(){
		$string = file_get_contents($this->getinfoFile());
		$json = json_decode($string);
		$this->name=$json->name;
		$this->teams=$json->teams;
		$this->users=$json->users;
	}
	
	public function updateCourseInfo($jsonUpdate){
		
		$json=json_decode($jsonUpdate);
		$this->name=$json->name;
		$this->code=$json->code;
		$this->teams=$json->teams;
		$this->users=$json->users;
		
		$this->createCourseInfo();
		echo $json->teams;

		
	}
}

?>