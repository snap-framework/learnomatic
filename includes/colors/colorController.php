<?php

/* *************************************************
 *    Comm OBJECT
 * ************************************************/
class ColorControlObj {

	private $name = "UNDEFINED NAME";
	private $userInfo = null;

	private $filename=null;
	private $raw=null;
	public $groups=[];




	public function __construct( $filename ) {
		$this->filename = $filename;
		$this->raw= file_get_contents($this->filename);
	}

	public function populate() {
		$rows = explode("\n", $this->raw);
		$minLength=5;
		$newGroup=new ColorGroupObj("//----Custom----//");
		
		array_push($this->groups, $newGroup);
		
		foreach($rows as $row => $data){
			if(strlen($data)>$minLength){
				if(substr( $data, 0, 4 ) === "//--"){
					//echo "\nColor Group: ".$data." ";
					$newGroup=new ColorGroupObj($data);
					array_push($this->groups, $newGroup);
					//array_push($this->groups, new ColorControlObj($data));
					//check if it's an official color group
					//create the group
				} else {
					if(substr( $data, 0, 2 ) === "//"){
						$newComment = new ColorCommentObj($data);
						$newGroup->appendColor($newComment);

					}else{
						$newColor = new ColorObj($data);
						$newGroup->appendColor($newColor);
					}
				}
				
			}
		}

	}


}

?>