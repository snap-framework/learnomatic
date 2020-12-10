define([
	'modules/BaseModule',
	'jquery',
	'./teamObj'
], function (BaseModule, $,  Team) {
	'use strict';
	return BaseModule.extend({
		initialize: function (options) {
			this.options = options;

			this.root = options.root;
			this.progressManager = options.progressManager;
			
			this.teams=[];
			this.teamList=[];
		},
		
		addTeam:function(teamName){
			var team;
			if(typeof this.teams[teamName] === "undefined"){
				team=this.createTeam(teamName);	
			}else{
				team=this.teams[teamName];
			}
			return team;
		},
		
		createTeam:function(teamName){
			var team;
			
			team=new Team({
				parent:this,
				root:this.root,
				name:teamName
			})
			this.teams[teamName]=team;
			this.teamList[this.teamList.length]=team;
			return this.teams[teamName];
		
	},
		initInterface:function(){
			this.initCourseInterface();
		},
		
		initCourseInterface: function () {
			var $el=$(".LOM-course-manager");
			$el.html("<h3>Manage Courses</h3>");
			for(var i=0;i<this.teamList.length;i++){
				this.teamList[i].initInterface($el);
			}
		},
		
		generateList:function($target){
			$target.html("");

			for (var i=0;i<this.teamList.length;i++){

				this.teamList[i].appendTeam($target);

			}
		}

	});
});
