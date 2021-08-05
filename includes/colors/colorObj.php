<?php

/* *************************************************
 *    color OBJECT
 * ************************************************/
class ColorObj{
	private $raw=null;
	public $value=null;
	public $variable=null;
	public $comment=null;
	public $isColor=true;


	public function __construct($data){
		$this->raw=$data;
		$data=preg_replace('/\s+/', '', $data);	
		$this->variable= substr($data, 0, strpos($data,":"));
		$this->value=substr($data,(strpos($data,":")+1), (strpos($data,";")-strpos($data,":")-1));
		$this->comment=substr($data,(strpos($data,";")+1));
		//
		//echo "\n".$data;

	}
	public function __destruct(){
		//destroy object
	}	

}




?>