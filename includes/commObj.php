<?php

/* *************************************************
 *    Comm OBJECT
 * ************************************************/
class CommObj{
	public $id=null;
	public $type="undefined";
	public $sender=null;
	public $receiver=null;
	public $content="";
	
	protected $allowReceiveAll=false;
	protected $allowCheckSender=false;
	protected $allowCheckReceiver=false;
	protected $allowCheckTeam=false;	
	protected $allowCheckCourse=false;

	public function __construct($json){
		$this->id=$json->id;
		$this->type=$json->type;
		$this->sender=$json->sender;
		$this->receiver=$json->receiver;
		$this->content=$json->content;
	}
	public function __destruct(){
		//destroy object
	}	
	/* ********************************************
	 * FILTERS
	 * *******************************************/
	public function checkRelation($userInfo){

		$filter=$this->userFilter($userInfo);
		return $filter;
	}
	
	private function userFilter($userInfo){
		$keepThis=false;
		//will filter in if we need to check in the sender 
		if($this->allowCheckSender){
			if($this->isSender($userInfo->username) === true){
				$keepThis=true;
			}
		}
		//will filter in if we need to check in the receiver
		if($this->allowCheckReceiver){
			if($this->isReceiver($userInfo->username) === true){
				$keepThis=true;
			}
			
		}
		
		if($this->allowCheckTeam){
			if($this->isMemberOfTeam($userInfo->team) === true){
				$keepThis=true;
			}
		}
		
		if($this->allowCheckCourse){
			if($this->hasAccessToCourse($userInfo->courses) === true){
				$keepThis=true;
			}
		}
		return $keepThis;
	}
	
	private function isSender($user){
		if($this->sender===$user){
			return true;
		}else{
			return false;
		}
	}
	private function isReceiver($user){
		$flag=false;
		foreach ($this->receiver->user as $key=>$username) {
			if($username===$user){
				$flag=true;
			}else if($this->allowReceiveAll===true && $username === "all"){
				
				$flag=true;
			}
		}
		return $flag;
	}
	
	private function isMemberOfTeam($userTeam){
		$flag=false;
		foreach ($this->receiver->team as $key=>$team) {
			if($team===$userTeam){
				$flag=true;
			}
		}
		return $flag;
	}
	private function hasAccessToCourse($userCourseList){
		$flag=false;
		foreach ($userCourseList as $key=>$userCourse) {
			foreach ($this->receiver->course as $courseCount=>$commCourse){
				if($commCourse === $userCourse){
					$flag=true;
				}
			}
		}
		return $flag;
	}	
	public function update($updates){
		$this->content=isset($updates->content)?$updates->content:$this->content;
		$this->sender=isset($updates->sender)?$updates->sender:$this->sender;
		$this->receiver=isset($updates->receiver)?$updates->receiver:$this->receiver;
	}
	
}



/* *************************************************
 *    MESSAGE OBJECT
 * ************************************************/
class MessageObj extends CommObj{
	private $name="message object";
	public function __construct($json)
	{
		parent::__construct($json);// call the parent class's constructor
		//new constructor
		$this->allowCheckSender=true;
		$this->allowCheckReceiver=true;


	}
}


/* *************************************************
 *    POST OBJECT
 * ************************************************/
class PostObj extends CommObj{
	private $name="Post object";

	
	public function __construct($json)
	{
	parent::__construct($json);// call the parent class's constructor
		//new constructor
		$this->allowCheckTeam=true;
		$this->allowCheckCourse=true;


	}
}
/* *************************************************
 *    announcement OBJECT
 * ************************************************/
class AnnouncementObj extends CommObj{
	private $name="announcement object";
	//private $allowReceiveAll=true;

	public function __construct($json){
		parent::__construct($json);// call the parent class's constructor
		//new constructor
		$this->allowReceiveAll=true;
		$this->allowCheckSender=true;
		$this->allowCheckReceiver=true;		
	}

}
/* *************************************************
 *    NOTIFICATION OBJECT
 * ************************************************/
class NotificationObj extends CommObj{
	private $name="NOTIFICATION object";
	
	public function __construct($json){
		parent::__construct($json);// call the parent class's constructor
		//new constructor
		$this->allowReceiveAll=true;
		$this->allowCheckSender=true;
		$this->allowCheckReceiver=true;	
		$this->allowCheckTeam=true;
		$this->allowCheckCourse=true;
	}
}
/* *************************************************
 *    REVIEW OBJECT
 * ************************************************/
class ReviewObj extends CommObj{
	private $name="Review object";
	
	public function __construct($json)
	{
	parent::__construct($json);// call the parent class's constructor
		//new constructor
		
		$this->allowCheckCourse=true;
	}
}




?>