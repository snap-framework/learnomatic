define([
	'modules/BaseModule',
	'jquery'
], function (BaseModule, $) {
	'use strict';
	return BaseModule.extend({
		initialize: function (options) {
			this.options = options;

			this.root = options.root;
			
			this.userList=[];
			
			this.courseList=[];

			this.name = options.name;
		},

		addUserToTeam:function(user){
			this.userList[this.userList.length]=user;
		},
		addCourseToTeam:function(course){
			
			this.courseList[this.courseList.length]=course;
		},

		removeCourseFromTeam:function(course){
			var oldList=this.courseList;
			this.courseList=[];
			for(var i=0;i<oldList.length;i++){
				if(oldList[i].name !== course.name){
					this.courseList[this.courseList.length]=oldList[i];
				}
			}
			
		},
		
		initInterface: function ($target) {
			if(this.courseList.length>0){
				var teamText="";//"<h3>Team "+this.name+"</h3>";
				$target.append(teamText+"<ul class='courselist' data-team='"+this.name+"'></ul>");
				this.$el=$target.children("ul").last(".course-list");

				for (var i = 0; i < this.courseList.length; i++) {
					//preevent courses that are part of multiple teams to display more than once
					//might need to change that
					if($("[data-course="+this.courseList[i].code+"]").length===0){
						this.courseList[i].appendCourse(this.$el);
					}
				}
			}
		},	
		/* ******************************************
		 * INTERFACE
		 * *****************************************/		


		appendTeam: function ($target) {

			var user=this.root.session.user;

			var role=user.role;
			//role=this.getUserOverride(user);
			//var owner=this.checkOwner(user);
			//this.setInterfaceRole(role);

			$target.append("<li data-team='" + this.name + "'></li>");
			this.$el = $target.children("li").eq($target.children("li").length - 1);


			var nameHtml = "<span class='LOM-team-name'>" + this.name + "</span>";
			this.$el.append("<a href='#'> " + nameHtml + "</a>");
			// download
			//this.setVisible();
			//this.initButtons();

			// DELETE
		}
		
		

	});
});
