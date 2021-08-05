<?php

/* *************************************************
 *    color OBJECT
 * ************************************************/
class ColorCommentObj{
	public $comment=null;
	public $isComment=true;


	public function __construct($data){

		$this->comment=$data;
		//
		//echo "\n".$data;

	}
	public function __destruct(){
		//destroy object
	}	

}




?>