<?php

/* *************************************************
 *    color group OBJECT
 * ************************************************/
class ColorGroupObj{
	private $raw=null;
	public $name=null;
	public $major=null;

	public $colors=[];

	public function __construct($data){
		// store RAW data
		$this->raw=$data;
		//get the name out of it
		$arr = array();
		preg_match('/[A-z]+-?[A-z]+/', $data, $arr);
		//store as name
		$this->name = array_values($arr)[0];
		//is it a major or minor group ?
		if(substr( $data, 0, 4 ) === "//--"){
			$this->major=true;
		}else{
			$this->major=false;
		}
		//echo "\n".$this->name;
	}
	public function __destruct(){
		//destroy object
	}	

	public function appendColor($data){
		//echo "\n".$data;
		//add this color to the list
		array_push($this->colors, $data); 
	}



}




?>