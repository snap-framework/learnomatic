define([
	'modules/BaseModule',
	'jquery',
	'./../session/roles_definition'
], function (BaseModule, $, RolesDefinition) {
	'use strict';
	return BaseModule.extend({
		initialize: function (options) {
			this.options = options;

			this.parent = options.parent;
			this.root = this.parent.root;

			this.isSession = false;

			this.username = options.username;
			this.name = options.name;
			this.lastname = options.lastname;
			this.fullname = this.name + " " + this.lastname;
			this.team = this.getTeam(options.team);

			this.courses = null; //options.courses;
			this.coursesList = [];

			this.specialCourseList = [];

			this.role = this.root.roleManager.roles[options.role];

			this.ownerships = [];
			this.ownershipList = [];

			this.permissions = this.getPermissions(this.role);
		},

		/*
		 * hides all subs from a level
		 */
		getPermissions: function (role) {
			return RolesDefinition[role];
		},

		getTeam: function (teamName) {
			var team = this.root.teamManager.addTeam(teamName);
			team.addUserToTeam(this);
			return team;

		},

		getUserInfoSocial: function () {
			
			var courseList=this.getCourseArray()
			return {
				username: this.username,
				courses: courseList,
				team: this.team.name
			}
		},

		getCourseArray: function () {
			var newArray = [];
			var teamList=this.team.courseList;
			var spList=this.specialCourseList;
			
			//array of courses from team
			for (var i=0;i<teamList.length;i++){
				newArray[newArray.length]=teamList[i].code;
			}

			for(var j=0;j<spList.length;j++){
				if(newArray.toString().indexOf(spList[j].code)<0){
					newArray[newArray.length]=spList[j].code;
				}
			}
			return newArray;

		},

		setOwnership: function (courseName) {
			this.ownerships[this.ownerships.length] = this.root.courseManager.courses[courseName];
			this.root.courseManager.courses[courseName].addOwner(this);

		},

		appendUser: function ($target) {
			var user = this.root.session.user;
			var role = this.root.session.displayRole;
			//role=this.getUserOverride(user);
			//var owner=this.checkOwner(user);


			$target.append("<li data-username='" + this.username + "'><a href='#' data-usermsg='" + this.username + "'><span>" + this.fullname + "</span></a></li>");
			if ($target.closest("#LOM-course-settings").length > 0) {

				this.setupRoleManager($target);
			}
			this.$el = $target.children("li").last();
			
			this.root.social.addMsgInteraction(this.$el.children("a"));
			
			this.setVisible(role);
		},

		addButtons: function ($target, role) {
			var that = this;

			var deleteUser = (this.allowDelete(role)) ? "" : "disabled";
			$target.append("<button class='user-delete ico-LOM-trash snap-xs' " + deleteUser + " title='Delete'>X</button>");
			$target.children(".user-delete").last().click(function () {
				that.deleteUser();
			});

		},

		allowDelete: function (role) {
			var allow = true;
			var sTeam = this.root.session.user.team;
			var deleteAll = role.permissions.deleteAll;
			var deleteTeam = role.permissions.deleteTeam;

			if (deleteAll) {
				//POWER
				allow = true;
			} else {
				if (deleteTeam) {
					if (sTeam === this.team) {
						allow = true;
					} else {
						allow = false;
					}
				} else {
					allow = false;
				}
			}
			return allow;
		},

		deleteUser: function () {
			var deleteFlag = confirm("Delete User?");
			if (deleteFlag) {
				//console.log("delete: "+this.username);
			}
		},

		setVisible: function (role) {
			var visible = false;
			//var sLevel=RolesDefinition[sRole].level;
			var seeAll = role.permissions.seeUserAll;
			var seeTeam = role.permissions.seeUserTeam;

			//are you licensed to see this?
			if (seeAll === true) {
				//congrats, you're almighty!
				visible = true;
			} else {
				if (seeTeam === true) {
					//well you see your team... 

					if (this.team.name === this.root.session.user.team.name) {
						//same team, YAY!
						visible = true;
					} else {
						//buuut you're on a different team...
						visible = false;
					}
				} else {
					//"cant see teams "
					visible = false;
				}

			}

			if (visible === false || this.root.session.user === this) {
				this.$el.hide();
			}

		},


		setupRoleManager: function ($target) {
			var disabled;
			var $userlink = $target.find("[data-username=" + this.username + "]");
			//get the course Code and then the course itself
			var courseCode=$target.closest("[data-course-code]").attr("data-course-code");
			var course=this.root.courseManager.courses[courseCode];
			this.roleManage(course, $userlink);
			
			var sessionRole=this.root.session.user.role;
			var sessionOverrideRole = course.getUserOverride(this.root.session.user);
			
			
			var sessionSameTeam=this.root.session.user.team===this.team;

			
			//------------------LOCKS-------------------
			var teamLock=this.roleManageTeamLock(course);
			//var userLock=false;
			
			//user is god tier, can't change his status
			var userGodTier=(this.role.level===1);
			//session god tier bypasses locks
			var sessionGodTier=(sessionRole.level<=2 || sessionOverrideRole.level<=2)

			$userlink.append("<div class='course-role-group'><span class=\"LOM-label\" style=\"margin-right: 15px;\"></span></div>");
			
			if(!sessionSameTeam){
				$userlink.children("a").append(" <span class='LOM-userlist-role-team'>Team "+this.team.name+"</span>")
			}
			
			for (var key in this.root.roleManager.roles) {
				disabled=(userGodTier)?" disabled ":"";
				//course-user-role ico-LOM-user snap-sm
				//$userlink.children("div").append("<button class='course-user-role role-" + key + " snap-xs ico-USERS-" + key + "' data-role='" + key + "' "+disabled+" title='" + key.replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase()) + "'>" + key.replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase()) + "</button>");
				$userlink.children("div").append("<button class='course-user-role role-" + key + " snap-xs ico-USERS-" + key + "' data-role='" + key + "' "+disabled+" title='" + key.toUpperCase() + "'>" + key.toUpperCase() + "</button>");

				//var that = this;
				$userlink.find(".course-user-role").hover(
					function () {
						$(this).siblings(".LOM-label").text($(this).attr("title"));
					},
					function () {
						$(this).siblings(".LOM-label").text("");
					}
				)
				
					
				
			}
			
			if(teamLock){
				$userlink.remove();
			}		
			


			
		},
		
		roleManage:function(course, $userlink){
			//------------------------- which role displays
			var listedRole=this.role;
			var listedRoleOverride=course.getUserOverride(this);
			var sessionSameTeam=this.root.session.user.team===this.team;
			
			

			$userlink.attr("data-role", listedRoleOverride.name);
			$userlink.attr("data-same-team", sessionSameTeam);
			$userlink.attr("data-role-override", !(listedRoleOverride===listedRole));		
		},
		
		roleManageTeamLock:function(course){
			var teamLock;
			var sessionOverrideRole = course.getUserOverride(this.root.session.user);
			var partOfTeamCourse=course.partOfTeam(this.team.name);
			
			//------------------TEAM LOCK-------------------
			if(sessionOverrideRole.permissions.seeUserAll){
				teamLock=false;
			}else{
				if(sessionOverrideRole.permissions.seeUserTeam){
					teamLock=(partOfTeamCourse)?false:true;
				}else{
					teamLock=true;
				}
			}	
			return teamLock;
		},


		switchRole: function (role, first) {
			this.roles[role].select();
			
			if(!first){
				this.root.ui.slideToggle();
			}
			

		},
	});
});
