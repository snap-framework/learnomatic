define([
	'jquery',
	'modules/BaseModule'
], function ($, BaseModule) {
	'use strict';
	return BaseModule.extend({
		initialize: function (options) {
			this.options = options;
			this.root = options.root;
			this.progressManager = options.progressManager;
			this.user = null;
			this.displayRole = null;

			this.labels = options.labels;

			this.$content = (this.root.type === "command") ? $(".content") : $("#dynamic_content");
			this.$login = $(".login");
			this.$loginBox = $("#LOM-login-container");
			this.$loggedinBox = $(".loggedin");
		},

		/* ***************************************
		 * Check SESSION
		 * PHP call to retrieve session username
		 * launches the login procedure
		 * ***************************************/
		checkSession: function () {


			this.$loginBox = this.initLoginBox();
			this.loadLogin();

			var that = this;
			$.post(this.root.relPath + 'editor.php', {
				action: "checksession"
			}, function (username) {

				if (username === "false") {
					// NO SESSION
					console.log("NO SESSION")
				} else {
					//log in.
					that.logIn(username, "");

				}
			}).fail(function (data, error, errortext) {
				that.progressManager.handleError(data, error, errortext, "Error while checking sessions")
			});
		},
		/* ***************************************
		 * LOGIN
		 * PHP call to retrieve user data
		 * launches post-login details
		 * ***************************************/
		logIn: function (un, pw) {

			var that = this;
			$.post(this.root.relPath + 'editor.php', {
				action: "login",
				content: un,
				pw: pw
			}, function (data) {
				//parse the jSON
				if (data !== "error") {
					data = $.parseJSON(data);
					that.username = un;
					//that.user = that.root.userManager.users[un];

					that.setSessionUser();
					that.inited = true;

					//if inside a course
					if (that.root.ui.interface === "editor") {
						var currentCourseCode = that.root.courseFolder;
						that.root.currentCourse = that.root.courseManager.courses[currentCourseCode];
						that.displayRole = that.root.currentCourse.getUserOverride(that.user);

					} else {
						that.displayRole = that.root.roleManager.roles[data.role];
					}

					that.switchRole(data.role);
					that.showUserMenu();
					that.root.initDone();
					$(window).on('beforeunload', function () {
						//that.closeSession();
						//return 'Are you sure you want to leave?';
					});

					that.root.traffic.checkOtherSessions();
					that.root.traffic.autoCheckSession();
				} else {
					alert("The username " + un + " does not exist.");

					return false;
				}
			}).fail(function (data, error, errortext) {
				this.progressManager.handleError(data, error, errortext)
			});
		},

		setSessionUser: function () {
			this.user = this.root.userManager.users[this.username];

			//this.user.isSession;
		},
		/* ***************************************
		 * post LOGIN setup
		 * 
		 * 
		 * ***************************************/
		loggedIn: function () {
			var that = this;
			this.root.courseManager.linkUsers();

			//Hide Login
			this.$login.addClass("hidden");
			//Show everything
			this.$content.removeClass("hidden");
			//this.$loggedinBox.removeClass("hidden");

			//this.$loggedinBox.html("<p>Welcome <strong>" + this.user.fullname + "</strong>! (<a href='#' class='LOM-logout' onclick='return false;'>Log out</a>)</p>");

			var $logout = $(".LOM-logout");

			$logout.click(function () {
				that.logOut();
			});
		},

		logOut: function () {
			this.closeSession();
			this.root.reset();
			this.user = null;
			this.switchRole(this.root.roleManager.defaultRole);
			$(".LOM-modetoggle").children("button").hide();
			this.$loginBox.html();
			this.loadLogin();
			//this.removeSidebars();

		},
		closeSession: function () {
			var that = this;
			this.root.traffic.stopAutoCheck();

			if (this.user !== null) {
				$.post(this.root.relPath + 'editor.php', {
					action: "closessions",
					username: that.user.username
				}, function () {

				}).fail(function () {
					alert("Posting failed while closing session.");
				});
			}
		},



		/* ***********************************************************************
		 * ROLE MANAGEMENT
		 * 
		 * 
		 * ***********************************************************************/
		switchRole: function (roleName) {
			//var roleObj=this.root.roleManager.roles[roleName];
			//console.log(roleObj.name);
			this.displayRole = this.root.roleManager.getRole(roleName);
			this.root.ui.enableModes();
		},


		/* ***********************************************************************
		 * DOM MANAGEMENT
		 * 
		 * 
		 * ***********************************************************************/

		/* ************************************************
		 * INIT LOGIN BOX
		 * create the box itself
		 * ***********************************************/

		initLoginBox: function () {
			var that = this;
			var $box;

			//Add the user menu button to the toolbar
			$("#LOM-toolbox").prepend("<div id='LOM-login-box'><button class='LOM-login snap-md ico-LOM-login' aria-haspopup='true' title='Login'>" + this.labels.login.menuTitle + "</button></div>");

			//Create the user menu panel
			$("#LOM-toolbox #LOM-login-box").append("<div id='LOM-login-container'>Please Login</div>");
			$box = $("#LOM-login-container");
			$box.attr("aria-hidden", "true");

			//Attach click event to the button
			$("#LOM-toolbox #LOM-login-box .LOM-login").click(function () {
				that.showHideLogin();
			});

			//Close the user menu when you click outside
			$(document).click(function () {
				if (that.$loginBox.css("visibility") == "visible") {
					that.$loginBox.removeClass("visible").attr("aria-hidden", "true");
					setTimeout(function () {
						that.$loginBox.removeClass("animateBefore");
					}, 200);

					setTimeout(function () {
						$("#LOM-toolbox #LOM-login-box .LOM-login").removeClass("activated");
					}, 600);
				}
			});

			return $box;

		},

		/* ************************************************
		 * LOAD LOGIN BOX
		 * USERNAME AND PASSWORD BOXES
		 * ***********************************************/
		loadLogin: function () {

			var that = this;
			this.$loginBox.load(this.root.relPath + "templates/login.html", function () {
				that.$loginBox.children("form").children("button").html(that.labels.login.login);
				that.$loginBox.children("form").find(".username").parent("label").prepend(that.labels.login.username);
				//that.$loginBox.children("form").find(".username").attr("placeholder", that.labels.login.username);
				that.$loginBox.children("form").find(".password").parent("label").prepend(that.labels.login.password);
				//that.$loginBox.children("form").find(".password").attr("placeholder", that.labels.login.password);
				that.$loginBox.children("form").children("button").click(function () {
					that.submit();
					return false;
				});
			});

			this.$loginBox.click(function (event) {
				event.stopPropagation();
			});
		},
		submit: function () {
			var $username = this.$loginBox.find(".username");
			var $pw = this.$loginBox.find(".password");
			var un = $username.val();
			var pw = $pw.val();
			this.logIn(un.toLowerCase(), pw, false);


		},
		showUserMenu: function () {
			var that = this;
			this.$loginBox.html("<h3>" + this.labels.login.menuTitle + "</h3>");
			this.$loginBox.append("<p>" + this.labels.login.welcome + this.user.name + " " + this.user.lastname + "</p>");
			this.$loginBox.append("<p>" + this.labels.login.switch + "<select></select></p>");
			var $select = this.$loginBox.children("p").children("select");

			var roleList = this.root.roleManager.roleList;
			for (var i = 0; i < roleList.length; i++) {
				if (roleList[i].level >= this.displayRole.level) {
					$select.append("<option value='" + roleList[i].name + "'>" + this.labels.login.roles[roleList[i].name] + "</option>");
				}
			}
			$select.change(function () {
				var roleValue = $(this).val();
				that.switchRole(roleValue);
			});

			this.$loginBox.append("<p><a href='#' class='LOM-logout btn btn-default' onclick=\"return false;\">" + this.labels.login.logout + "</a></p>");
			var $logout = this.$loginBox.find(".LOM-logout");
			$logout.click(function () {
				that.logOut();
			});
		},

		showHideLogin: function () {
			var that = this;
			if (this.$loginBox.css("visibility") != "visible") {

				$("#LOM-toolbox #LOM-login-box .LOM-login").addClass("activated");

				setTimeout(function () {
					that.$loginBox.addClass("animateBefore");
				}, 400);
				setTimeout(function () {
					that.$loginBox.attr("aria-hidden", "false").addClass("visible");
				}, 500);
				setTimeout(function () {
					that.$loginBox.find(".username").eq(0).attr("tabindex", 0).focus();
				}, 600);
			} else {
				this.$loginBox.removeClass("visible").attr("aria-hidden", "true");
				setTimeout(function () {
					that.$loginBox.removeClass("animateBefore");
				}, 200);

				setTimeout(function () {
					$("#LOM-toolbox #LOM-login-box .LOM-login").removeClass("activated");
				}, 600);
			}
		},

		removeSidebars: function () {
			$("#LOM-toolbox").remove();
			$("#LOM-social").remove();
		}
	});
});
