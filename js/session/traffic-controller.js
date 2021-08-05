define([
	'jquery',
	'labels',
	'utils',
	'modules/BaseModule'

], function ($, labels, Utils, BaseModule) {
	'use strict';

	return BaseModule.extend({
		initialize: function (options) {
			var that = this;
			that = this;

			this.root = options.root;
			this.master = this.root.parent; //masterStructure

			this.locations = [];
			this.locationList = [];


			$(this.master).on("Framework:pageLoaded", function () {
				that.pageLoaded();
			});
		},
		pageLoaded: function () {
			this.checkOtherSessions();
		},

		resetLocations: function () {

			this.locations = [];
			this.locationList = [];
			this.root.userManager.resetLocations();
			this.root.courseManager.resetLocations();
		},
		/* ************************************************************
		 * CHECK SESSION
		 * ***********************************************************/
		checkOtherSessions: function () {
			var that = this;
			var filename, course;
			var username = this.root.session.user.username;
			if (this.root.type === "editor") {
				filename = this.root.master.currentSub.sPosition;
				course = this.root.courseFolder;
			} else {
				filename = null;
				course = null;
			}
			if (this.user !== null) {
				$.post(this.root.relPath + 'editor.php', {
					action: "othersessions",
					filename: filename,
					username: username,
					course: course
				}, function (data) {
					//console.log("checked")
					data = $.parseJSON(data);
					var warning = (typeof data.users[that.root.session.user.username] === "undefined") ? null : data.users[that.root.session.user.username].warning;
					that.locateUsers(data.users);
					if (that.root.type === "command") {
						that.updateCommandCenter();
					} else {
						that.whoIsHere();

					}
					that.updateSocial(warning);
				}).fail(function () {
					that.lostConnection();
				});
			}
		},


		autoCheckSession: function () {
			var that = this;
			this.root.ticker = true;
			this.autotimer = setInterval(function () {
				if (that.root.ticker) {
					that.checkOtherSessions();
				}
			}, 2000);

		},

		lostConnection: function () {
			this.root.session.logOut();
			//alert("Posting failed while checking sessions.");

		},
		/* *******************************************************************************
		 * MULTI USER EXPERIENCE... WHO IS WHERE
		 * ******************************************************************************/
		locateUsers: function (userData) {
			//var that=this;
			//var lock= false;
			var currentLocation, user, course, code, isCmd;
			this.resetLocations();

			for (var key in userData) {
				user = this.root.userManager.users[key];
				isCmd = (userData[key].course === "" || userData[key].course === null || typeof userData[key].course === "undefined");
				// user is in CMD or not
				if (isCmd) {
					course = null;
					code = "cmd";

				} else {
					course = this.root.courseManager.courses[userData[key].course];
					code = course.code + "?" + userData[key].page;

				}
				currentLocation = {
					user: user,
					course: course,
					page: userData[key].page,
					code: code
				};
				user.location = currentLocation;

				if (!isCmd) {
					course.locationList[course.locationList.length] = currentLocation;
				}


				this.locationList[this.locationList.length] = currentLocation;
			}
		},


		// MOVE THIS TO SESSION ??... USER MANAGER? ... YES ... USER MANAGER
		whoIsHere: function () {
			var that = this;
			var currentLocation;
			var sessionLocation = this.root.session.user.location;
			var status = "alone";
			// ------ WATCHERS
			if ($("#LOM-watcher").length === 0) {
				$("#dynamic_content").prepend("<div id='LOM-watcher'></div>");
			}

			var $watcher;

			$watcher = $("#LOM-watcher,.LOM-watcher");
			$watcher.html("");
			$watcher.removeClass("LOM-not-alone").removeClass("not-empty");


			for (var i = 0; i < this.locationList.length; i++) {
				currentLocation = this.locationList[i];
				//user is in the same course
				if (currentLocation.course !== null && currentLocation !== sessionLocation) {
					if (currentLocation.course.code === sessionLocation.course.code) {
						status = (status === "alone") ? "samecourse" : status;
						$("html").addClass("not-empty");
						this.root.notAlone = true;
						if (currentLocation.code === sessionLocation.code) {
							//PEOPLE IN SAME PAGE
							status = "samepage";
							$watcher.addClass("not-empty");
							$("html").addClass("LOM-not-alone");
							$watcher.prepend("<p><a href='#' data-usermsg=\"" + currentLocation.user.username + "\">" + currentLocation.user.fullname + "</a> is here</p>");
						} else {
							//people IN SAME COURSE
							$watcher.addClass("not-empty");
							$watcher.append("<p><a href='#' data-usermsg=\"" + currentLocation.user.username + "\">" + currentLocation.user.fullname + "</a> - <a href='#' onclick='fNav(\"" + currentLocation.page + "\")'>" + currentLocation.page + "</a></p>");
							//$watcher.append("<p>" + currentLocation.user.fullname + " - <a href='#' onclick='fNav(\"" + users[key].page + "\")'>" + users[key].page + "</a></p>");
						}
					}

				}
			}

			$watcher.find("[data-usermsg]").each(function () {
				that.root.social.addMsgInteraction($(this));
			});

			if (status === "samepage") {
				$("html").addClass("LOM-not-alone");
				if (!this.root.locked) {
					this.root.lock();
					this.root.notAlone = true;
					$("html").addClass("LOM-not-alone");
				}

			} else if (status === "samecourse") {
				this.root.unlock();
				this.root.notAlone = true;
				$("html").addClass("LOM-not-alone");

			} else {
				this.root.notAlone = false;
				this.root.unlock();

			}


		},




		stopAutoCheck: function () {
			clearInterval(this.autotimer);
		},
		/* *******************************************************************************
		 * UPDATE COMMAND CENTER
		 * ******************************************************************************/
		updateCommandCenter: function () {
			//console.log("UPDATE COMMAND CENTER")
			this.root.courseManager.updateLocations();
		},
		updateSocial: function (warning) {

			//this.root.userManager.setOnlineStatus();
			this.setOnlineStatus();

			if (warning) {
				this.root.social.receivedWarning();
			}
		},

		getPageName: function (name) {

			if (this.root.type === "editor") {
				var list = this.root.master.flatList;

				for (var i = 0; i < list.length; i++) {

					if (list[i].sPosition === name) {
						return list[i].title
					}
				}


			} else {
				return name
			}
			return "batrman";
		},

		setOnlineStatus: function () {
			var un;
			$(".userlist").children().attr("data-online-status", "false");
			for (var i = 0; i < this.locationList.length; i++) {

				un = this.locationList[i].user.username;
				$(".userlist").children("[data-username=" + un + "]").attr("data-online-status", "true");

			}


		}

	});
});