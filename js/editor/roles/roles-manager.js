define([
    'jquery',
	'labels',
	'settings-core',
	"settings-general",
	'./../../../courses/_default/core/settings/settings-core',
	'utils',
	'modules/BaseModule',
	'./../roles/roleObj',
	'./../roles/roles_definition'

], function($,labels, CoreSettings, GeneralSettings, OriginalSettings, Utils, BaseModule, RoleObj, RolesDefinition) {
	'use strict';

	return BaseModule.extend({
		initialize: function(options) {
			var that=this;
			that=that;
			
			this.parent=options.parent; //masterStructure.editor
			this.master=this.parent.parent; //masterStructure
			this.defaultRole="user";
			
			$(this.master).on("Framework:pageLoaded", function() {
				that.pageLoaded();
			});
			
			this.roles=[];//RolesDefinition;
			this.initRoles(RolesDefinition);
			
			this.labels=options.labels;
			this.user=null;
			this.role=this.getRole(this.defaultRole);
			this.userRole=null;
			$("html").attr("data-role", this.defaultRole);
			
			this.$loginBox=this.initLogin();
			this.loadLogin();
			
			
		},
		pageLoaded:function(){
			
			this.checkSessions();
		},
		
		checkSessions:function(){
			var that=this;

			if (this.user !== null) {
			$.post('../../editor.php', { action:"usersession", filename: that.master.currentSub.sPosition, username: that.user.username }, function(data){
				var watchers=(data==="")?[]:data.split(",");
				that.showWatchers(watchers);
				
				}).fail(function() {
					alert( "Posting failed." );
				});				
			}
			
		},
		autoCheckSession:function(){
			var that=this;
				this.autotimer = setInterval(function(){
					that.checkSessions();
				}, 2000);
		},
		stopAutoCheck:function(){
			clearInterval(this.autotimer);
		},
		closeSession:function(){
			
			var that=this;
			this.stopAutoCheck();
			if (this.user !== null) {
			$.post('../../editor.php', { action:"closessions", username: that.user.username }, function(data){
				data=data;

				}).fail(function() {
					alert( "Posting failed." );
				});				
			}
		},
		
		getRole:function(role){
			return RolesDefinition[role];
			
			
		},
		initRoles:function(){
			var that=this;
			for (var key in RolesDefinition) {
				if (RolesDefinition.hasOwnProperty(key)) {

					this.roles[key]=new RoleObj({
						parent:that,
						name:key,
						obj:RolesDefinition[key]
						
					});
				}
			}			
		},
		/*-----------------------------------------------
		 * login popup
		 *-----------------------------------------------*/
		initLogin:function(){
			var that=this;
			var $box;

			$("#wb-lng>ul").append("<li id='LOM-user'><a href='#' class='login' aria-haspopup='true' title='Login'>LOGIN</a></li>");
			$("#LOM-user").append("<div id='LOM-login-container'>Please Login</div>");	
			$box=$("#LOM-login-container");
			$box.hide();

			$("#LOM-user>a").click(function(){
				that.showHideLogin();
			});
			
			
			return $box;
			
		},
		showHideLogin:function(){
			var focusFlag=false;
			if(!this.$loginBox.is(":visible") ){
				focusFlag=true;
			}
			this.$loginBox.slideToggle();
			if(focusFlag){
				this.$loginBox.find(".username").eq(0).focus();
			}
		},
		loadLogin:function(){
			var that=this;
			this.$loginBox.load("../../templates/login.html", function(){
				that.$loginBox.children("form").children("button").click(function(){
					that.submit();
					return false;
				});
			});
			$(document).click(function() {
				//console.log('clicked outside '+);
				if(that.$loginBox.height() >= 50){
					that.$loginBox.slideUp();
				}
			});

			this.$loginBox.click(function(event) {
				//console.log('clicked inside');
				event.stopPropagation();
			});			
		},
		submit:function(){
			var that=this;
			var $username=this.$loginBox.find(".username");
			var $pw=this.$loginBox.find(".password");
			var un=$username.val();
			var pw=$pw.val();
			$.post('../../editor.php', { action:"login", content:un, pw:pw}, function(data){
					//parse the jSON
				if (data!=="error"){
					data=$.parseJSON(data);
					that.user=data;
					that.user.username=(un==="")?"generic":un;
					that.userRole=that.roles[data.role];

					that.role=that.roles[data.role];
					that.switchRole(data.role);
					that.showUserMenu();
					//that.$loginBox.slideUp();
					$(window).on('beforeunload', function(){
						that.closeSession();
									  //return 'Are you sure you want to leave?';
							   });
					that.checkSessions();
					that.autoCheckSession();
					
				}else{
					alert("sorryaboutthealert ERROR!");
					return false;
				}


				}).fail(function() {
					alert( "Posting failed." );
				});			
			
		},
		showWatchers:function(watchers){
			var $watcher;
			if($("#LOM-watcher").length===0){
				$(CoreSettings.contentContainer).prepend("<div id='LOM-watcher' class='LOM-delete-on-save'></div>");
			}
			$watcher=$("#LOM-watcher");	
			$watcher.html("");
			if(watchers.length>0){
								
				for(var i=0;i<watchers.length;i++){
					$watcher.append("<p>"+watchers[i]+" is here</p>");
				}
				
			}else{
				$watcher.remove();
			}
		},
		showUserMenu:function(){
			var that=this;
			this.$loginBox.html("<h3>User Menu</h3>");
			this.$loginBox.append("<p>Welcome "+this.user.name+" "+this.user.lastname+"</p>");
			this.$loginBox.append("<p>switch role <select></select></p>");
			var $select=this.$loginBox.children("p").children("select");
			
			var currentRole=this.userRole.name;
			var currentFlag=false;
			
			for (var keys in this.roles){
				if(typeof this.roles[keys] !=="undefined"){
					currentFlag=(this.roles[keys].name === currentRole)?true:currentFlag;
					if(currentFlag){
						$select.append("<option>"+this.roles[keys].name+"</option>");
					}
				}
			}
			$select.change(function(){
				that.switchRole($(this).val());
			});

			this.$loginBox.append("<p><a href='#' class='LOM-logout' onclick=\"return false;\">Log Out</a></p>");
			var $logout=this.$loginBox.find(".LOM-logout");
			$logout.click(function(){
				that.logOut();
			});
		},
		switchRole:function(role){
			this.roles[role].select();
			$("#LOM-toolbox").hide();
			$("#LOM-toolbox").toggle( "slide" );
		},
		logOut:function(){
			this.closeSession();
			this.user=null;
			this.role=this.getRole(this.defaultRole);
			this.switchRole(this.defaultRole);
			this.$loginBox.html();
			this.loadLogin();

		},
		doSomething:function(){
			
		}


	});
});

