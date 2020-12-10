define([
	'modules/BaseModule',
	'jquery'
], function (BaseModule, $) {
	'use strict';
	return BaseModule.extend({
		initialize: function (options) {
			this.options = options;

			this.parent = options.parent;
			this.root = this.parent.root;
			this.progressManager = this.parent.progressManager;
			this.courseManager = this.parent;
			this.name = options.name;
			
			this.code = options.code;

			this.owners = []; //options.users
			this.teams=[];
			this.teamList = [];
			
			this.specialUsers=this.options.users;
			
			
			this.getTeams(options.teams);
			//this.setSpecialCourse();

		},


		
		
		checkSpecialUserExists:function(user){
			var username=user.username;
			if(this.specialUsers!==null ){
				
				if(typeof this.specialUsers[username] !=="undefined"){
					return true;
				}
			}
			return false;
		},
		getUserOverride:function(user){
			if(this.checkSpecialUserExists(user)){
				return this.root.roleManager.roles[this.specialUsers[user.username].role];
				//return this.specialUsers[user.username].role;
			}else{
				return user.role;
			}
			
		},
		
		checkOwner:function(user){
			
			if(this.checkSpecialUserExists(user) ){
				if(this.specialUsers[user.username].owner === "true"){
					user.ownerships[this.name]=true;
					user.ownershipList[user.ownerships.length]=this;
					return true;
				}
			}
			return false;
			
		},
		
		linkUsers:function(){
			var user;
			for (var key in this.specialUsers) {
				user=this.root.userManager.users[key];
				user.specialCourseList[user.specialCourseList.length]=this;
			}
		},
		/* ******************************************
		 * TEAMS
		 * *****************************************/	
		getTeams:function(teams){
			
			if(teams.length>0){
				for(var i=0;i<teams.length;i++){
					teams[i]=this.joinTeam(teams[i])
				}
			}else{
				teams[0]=this.joinTeam("unassigned")
				
			}

			return teams;
		},
		
		joinTeam:function(teamName){
			//create the team if it doesn't exist already

			
			var alreadyInTeam=this.partOfTeam(teamName);

			if(!alreadyInTeam){
				var teamObj=this.root.teamManager.addTeam(teamName);
				teamObj.addCourseToTeam(this);
				if(this.teamList.length===1 && this.teamList[0].name==="unassigned"){
					this.teams["unassigned"].removeCourseFromTeam(this);
					this.teamList=[];
					this.teams=[];
					
					
				}				
				this.teams[teamName]=teamObj;
				this.teamList[this.teamList.length]=teamObj;
				return true;
			}else{
				return false;
			}
		},
		
		leaveTeam:function(teamName){
			var member=this.partOfTeam(teamName);
			if(member){
				var oldList=this.teamList;
				this.teamList=[];
				this.teams=[];
				//rebuild the array
				for (var i=0;i<oldList.length;i++){
					//console.log(oldList[i]);
					if(oldList[i].name!==teamName){
						this.teamList[this.teamList.length]=oldList[i];
						this.teams[oldList[i].name]=oldList[i];
					}
				}
				
				this.root.teamManager.teams[teamName].removeCourseFromTeam(this);
				if(this.teamList.length===0){
					this.joinTeam("unassigned");
				}
				
				
			}else{
				return false;
			}
			
		},		
		partOfTeam:function(teamName){
			var part=false;
			for (var i=0;i<this.teamList.length;i++){
				if(this.teamList[i].name===teamName){
					part=true;
				}
			}
			return part;
		},

		/* ******************************************
		 * INTERFACE
		 * *****************************************/
		appendCourse: function ($target) {
			var user=this.root.session.user;
			var role=user.role;
			role=this.getUserOverride(user);
			var owner=this.checkOwner(user);
            
			//var team = $target.attr("data-team")
			$target.append("<li data-course='" + this.code + "'></li>");
			this.$el = $target.children("li").eq($target.children("li").length - 1);
            
			var access = role.name;
			var accessHtml = "<span class='LOM-course-access' data-access=" + access + " title='Access : " + access + "'>(Access " + access + ")</span>";
			
         //var teamHtml = (this.teamList.length > 0) ? "<span class='LOM-course-team' data-team='"+team+"'>(Team " + team + ")</span>" : "<span class='LOM-course-name'>(No team)</span>";
			var nameHtml = "<span class='LOM-course-name'>" + this.name + "</span>";
			var visitorHtml = "<span class='LOM-course-visitors'></span>"
			this.$el.append("<a href='courses/" + this.code + "/index_en.html'> " + nameHtml + "  " + accessHtml + " " + visitorHtml + "</a>");
			
            // download

			// DELETE
		},
		
		addButtons:function(){
			var user=this.root.session.user;
			var role=user.role;
			role=this.getUserOverride(user);
			var owner=this.checkOwner(user);
			//var team = $target.attr("data-team")
			this.setVisible(role);
			this.initButtons(role);
			
		},
		
		
		
		
		updateLocations:function(){
			var loc=this.locationList;
			var msg;
			msg="<p>"+ loc.length+" user(s)</p>";
			var $locBox=$("[data-course="+this.code+"]").find(".LOM-course-visitors");
			//console.log($("[data-course="+this.code+"]").children("a").children(".LOM-course-visitors"))
			$locBox.html(msg);
			/*for (var i=0;i<loc.length;i++){
				//console.log(loc[i].user.username)
				//console.log($locBox)
				$locBox.html("wow")//loc[i].user.fullname)
			}*/
		},
		
		getLocations:function(){
			return this.locationList;
		},			
		
		setDelete:function(role){
			var allow=false;
			var deleteAll=role.permissions.deleteAll;
			var deleteTeam=role.permissions.deleteTeam;			
			
			if(deleteAll){
				allow=true;
			}else{
				//supposed to only see current team, can we see that at least?
				if(deleteTeam===true){
					//well you see your team... 
					var userTeam=this.root.session.user.team.name;
					var sameTeam=false;

					for (var i=0; i<this.teamList.length;i++){
						if(this.teamList[i].name===userTeam){
							//same team, YAY!
							sameTeam=true;

						}
					}
					
					if(sameTeam===true){
							//same team, YAY!
						allow=true;
					}else{
							//buuut you're on a different team...
						allow=false;
					}
				
				}else{
					//you're not supposed to see anything... not your team, not anything.
					allow=false;
				}
			}
			
			return allow;
		},
		setVisible: function (role) {
			var visible=false;
			var seeAll=role.permissions.seeCourseAll;
			var seeTeam=role.permissions.seeCourseTeam;
			if (seeAll === true) {
				//yes we see all, probably an admin.
				visible=true;
			}else{
				//supposed to only see current team, can we see that at least?
				if(seeTeam===true){
					//well you see your team... 
					var userTeam=this.root.session.user.team.name;
					var sameTeam=false;

					for (var i=0; i<this.teamList.length;i++){
						if(this.teamList[i].name===userTeam){
							//same team, YAY!
							sameTeam=true;

						}
					}
					
					if(sameTeam===true){
							//same team, YAY!
						visible=true;
					}else{
							//buuut you're on a different team...
						visible=false;
					}
				
				}else{
					//you're not supposed to see anything... not your team, not anything.
					visible=false;
				}
			}
			if (visible!==true) {
				this.$el.remove();
			}

		},
		initButtons: function (role) {
			this.initConfig(role);
			this.initDownloads(role);
			this.initUsersButton(role);
			this.initDelete(role);
		},


		initConfig: function (role) {
			var that = this;
			var allowConfig=role.permissions.configCourse;
			var disable=(allowConfig)?" ": " disabled ";
			
			var classes = "course-config ico-LOM-wrench snap-xs";
			var labelText = "Configure";
			this.$el.append("<button class='" + classes + "' lang='en' title='" + labelText + "' "+disable+">" + labelText + "</button>");
			this.$el.children(".course-config").click(function () {
				//that.manageUsersClicked();
				that.parent.courseForm(true, that);
			});

		},

		initUsersButton: function () {
			var that = this;
			var classes = "course-users ico-LOM-users snap-xs";
			var labelText = "Manage Users";
			this.$el.append("<button class='" + classes + "' lang='en' title='" + labelText + "'>" + labelText + "</button>");
			this.$el.children(".course-users").click(function () {
				that.manageUsersClicked();
			});

		},

		manageUsersClicked: function () {
			var that=this;
			
            $.magnificPopup.open({
				items: {
				src: this.root.relPath+'templates/command/course-settings.html'
				},
				type: 'ajax',
                removalDelay: 500,
				callbacks: {
                    beforeOpen: function() {
                       this.st.mainClass = "mfp-zoom-in";
                    },
					ajaxContentAdded: function() {
						that.manageUsersSetup($(this.content))
					}
				},
                midClick: true
			});
		},
		manageUsersSetup:function($target){
			$target.attr("data-course-code", this.code);
			$target.find(".modal-title").html("User Management: "+this.name+" ");
			this.root.userManager.generateList($target.find(".userlist"), "team-name");
			this.addUserRoleButtons($target);
			//this.manageTeamsSetup($target);
		},
		
		manageTeamsSetup:function($target){
			this.root.teamManager.generateList($target.find(".teamlist"));
			$target.find(".teamlist").find("[data-team=unassigned]").remove();
			this.selectTeams($target);
			
		},
		
		addUserRoleButtons:function($target){
			var that=this;
			var $btns=$target.find(".userlist").find("button");
			for (var key in this.specialUsers) {
				$target.find("[data-username="+key+"]").attr("data-role",this.specialUsers[key].role)

			}
			$btns.click(function(){
				var username=$(this).closest("[data-username]").attr("data-username");
				var role=$(this).attr("data-role");
				var isOwner=false;
				
				that.setSpecialUser(username, role, isOwner);
				$(this).parent().parent().attr("data-role", $(this).attr("data-role"))
				that.root.userManager.users[username].roleManage(that, $(this).closest("li"));
			});			
		},
		
		setSpecialUser:function(username, role, isOwner){
			if(this.specialUsers===null){
				this.specialUsers={};
			}
			if(typeof this.specialUsers[username] === "undefined"){
				this.specialUsers[username]={};
			}
			this.specialUsers[username].role=role
			
			this.saveInfo();
			
		},
		
		selectTeams:function($target){
			var that=this;
			
			var $teams=$target.find("[data-team]")
			var member;
			var $currTeam;
			
			for(var i = 0;i<$teams.length;i++){
				$currTeam=$teams.eq(i);
				member=this.partOfTeam($currTeam.attr("data-team"));
				$currTeam.attr("data-member", member);
				$currTeam.click(function(){
					that.clickSelectTeam($(this));
				});
			}
		},
		clickSelectTeam:function($team){
			var teamName = $team.attr("data-team")
			//var teamObj=this.root.teamManager.teams[teamName];
			var isMember=this.partOfTeam(teamName)
            
			if(isMember){
				this.leaveTeam(teamName);
                $team.attr("data-member", false);
			}else{
				this.joinTeam(teamName);
				$team.attr("data-member", true);
			}
            
			this.saveInfo();
		},
		
		initDelete: function (role) {
			var that = this;
			var allowDelete=this.setDelete(role);
			var disable=(!allowDelete)?" disabled ":" ";

			var classes = "course-delete ico-LOM-trash snap-xs";
			this.$el.append("<button class='" + classes + "' "+disable+" title='Delete'>X</button>");
			this.$el.children(".course-delete").click(function () {
				that.deleteCourse();
			});
		},

		deleteCourse: function () {
            if(confirm("Are you sure you want to delete course “" + this.name + "”?")){
                var that = this;
                var $deletingMsg, $deletedMsg;

                //deletecourse
                $.ajax({
                    url: this.root.relPath+"editor.php",
                    type: "POST",
                    data: {
                        action: "deletecourse",
                        content: "courses/" + that.code
                    },
                    beforeSend: function () {
                        $deletingMsg = that.progressManager.showMessage("deleting course &ldquo;" + that.name + "&rdquo;&hellip;", "status");
                    },
                    success: function (data) {
                        that.progressManager.removeMessage($deletingMsg);
                        $deletedMsg = that.progressManager.showMessage("course &ldquo;" + that.name + "&rdquo; deleted!", "status");

                        setTimeout(function () {
                            that.progressManager.removeMessage($deletedMsg);
                        }, 3000);

                        if (data === "true") {
                            $("[data-course=" + that.code + "]").remove();
                        }
                    },
                    fail: function (data, error, errortext) {
                        this.progressManager.handleError(data, error, errortext, "Error while deleting course &ldquo;" + that.name + "&rdquo;")
                    }
                });
            }
		},

		disableDelete: function () {
			this.$el.children(".course-delete").remove();
		},

		initDownloads: function (role) {
			
			var that = this;

			var allowDownload=role.permissions.download;

			var classes = "course-download ico-LOM-download snap-xs";
			var textEn = "Download English";
			var textFr = "Download French";
			var disable=(allowDownload)?" ": " disabled ";
			this.$el.append("<button class='" + classes + "' lang='en' title='" + textEn + "' "+disable+">" + textEn + "</button>");
			this.$el.append("<button class='" + classes + "' lang='fr' title='" + textFr + "' "+disable+">" + textFr + "</button>");
			this.$el.children(".course-download").click(function () {
				that.downloadCourse($(this).attr("lang"));
			});
			
		},
		downloadCourse: function (lang) {
			var that = this;
            var $zippingMsg;
            
			$.ajax({
				type: "POST",
				url: this.root.relPath+"editor.php",
				data: {
					action: "zipfolder",
					filename: "courses/" + that.code,
					content: lang,
				},
				beforeSend: function () {
					$zippingMsg = that.progressManager.showMessage("zipping course &ldquo;" + that.name + "&rdquo;&hellip;", "status");
				},
				success: function (data) {
					that.startDownload(data, $zippingMsg);
				},
				fail: function (data, error, errortext) {
					that.progressManager.handleError(data, error, errortext, "Error while zipping course &ldquo;" + that.name + "&rdquo;")
				}
			});
		},

		startDownload: function (file, $zippingMsg) {
			var that = this;
            var $downloadingMsg;

            this.progressManager.removeMessage($zippingMsg);
			$downloadingMsg = this.progressManager.showMessage("downloading package &ldquo;" + file + "&rdquo;&hellip;", "status");

            this.progressManager.isNavigatingToDownload = true;
			window.location = "courses/_download/" + file;
            this.progressManager.isNavigatingToDownload = false;

			setTimeout(function () {
				that.progressManager.removeMessage($downloadingMsg);
			}, 5000);

			setTimeout(function () {
				$.post(this.root.relPath+"editor.php", {
					action: "delete",
					filename: "courses/_download/" + file
				}, function () {

					//document.location=data;
				}).fail(function (data, error, errortext) {
					that.progressManager.handleError(data, error, errortext, "Error while deleting package &ldquo;" + file + "&rdquo; on the server")
				});

			}, 10000);
		},


		displayTeams: function () {
			this.$el.attr("data-teams", this.teams);

			this.$el.children("a").children(".LOM-course-team").html("( Team:" + this.teams + ")");
		},
		/* ******************************************
		 * SAVING
		 * *****************************************/
		saveInfo:function(){
			var that=this;
			
			var json={};
			json.name=this.name;
			json.code=this.code;
			json.teams=this.getTeamArray();
			json.users=this.specialUsers;
			
            var $savingMsg, $savedMsg;

			$.ajax({
				type: "POST",
				url: this.root.relPath+"editor.php",
				data: {
					action: "updateCourse",
					//content: "",
					folder: this.code,
					//json: '{"name":"'+that.name+'","code":"'+that.code+'", "teams":{}, "users":{"sjomphe":{"role":"admin","owner":"true"}}}'
					//json: '{"name":"'+that.name+'","code":"'+that.code+'", "teams":{}, "users":'+users+'}'
					json:JSON.stringify(json)
				},
				beforeSend: function () {
					$savingMsg = that.progressManager.showMessage("saving course info&hellip;", "status");
				},
				success: function () {
					that.progressManager.removeMessage($savingMsg);
					$savedMsg = that.progressManager.showMessage("course info updated for &ldquo;" + that.name + "&rdquo;!", "status");
                    
                    that.courseManager.setDom();

					setTimeout(function () {
						that.progressManager.removeMessage($savedMsg);
					}, 3000);                  
				},
				fail: function (data, error, errortext) {
					that.progressManager.handleError(data, error, errortext, "Error while updating courses");
				}
			});			
		},
		
		getTeamArray:function(){
			var teams=[];
			if(this.teamList.length===1 && this.teamList[0].name ==="unassigned"){
				return [];
			}else{
				for (var i=0;i<this.teamList.length;i++){
					if(this.teamList[i].name!=="unassigned"){
						teams[i]=this.teamList[i].name;
					}
				}
			}
			return teams;
		}

	});
});
