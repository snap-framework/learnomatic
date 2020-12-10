define([
	'jquery',
	'LOM-settings',
	'./../editor/LOM_labels',
	'./../session/sessionObj',
	'./user-Manager',
	'./course-Manager',
	'./team-Manager',
	'./progress-Manager',
	'./../social/social-Manager',
	'./../session/roles-Manager',
	'./../session/traffic-controller',
	'./../editor/ui/ui-manager',
	'./../editor/ui/LOM_ui_buttons',
	'magnific'
], function ($, LomSettings, LOMLabels, Session, UserManager, CourseManager, TeamManager, ProgressManager, SocialManager, RolesManager, TrafficController, UImanager, LOMButtons) {
	'use strict';

	function command() {
		this.type = "command";
		$("html").addClass("LOM-command-center");
		this.relPath = "";
		this.labels = LOMLabels;
		this.settings = LomSettings;

		this.ui = new UImanager({
			parent: this,
			modes: LOMButtons,
			interface: "command"
		});
		this.progressManager = new ProgressManager({
			root: this,
			window: window
		});
		this.roleManager = new RolesManager({
			root: this,
			labels: this.labels
		});
		this.session = new Session({
			root: this,
			progressManager: this.progressManager,
			labels: this.labels
		});
		this.teamManager = new TeamManager({
			root: this,
			progressManager: this.progressManager
		});
		this.userManager = new UserManager({
			root: this,
			progressManager: this.progressManager
		});
		this.courseManager = new CourseManager({
			root: this,
			progressManager: this.progressManager
		});
		this.traffic = new TrafficController({
			root: this,
			progressManager: this.progressManager
		});

		this.progressManager.initInterface();
		this.userManager.initUsers();
		this.courseManager.initCourses();

		this.initDone = function () {
			if (this.courseManager.inited && this.userManager.inited && this.session.inited) {
				//console.log("--------INIT DONE------------");
				this.session.loggedIn();


				this.social = new SocialManager({
					root: this,
					progressManager: this.progressManager
				});
			}
			//
		}
		this.socialLoaded = function () {
			this.ui.getStarted();
			this.updateInterface();
		}

		this.updateInterface = function () {
			//setup the courses
			//this.teamManager.initInterface();
			//setup the users
			//this.userManager.initInterface();
			this.ui.currentMode.activate()
		}
		this.reset = function () {
			this.courseManager.reset();
			this.userManager.reset();
		}
		/*
		 * @start the UI manager, that deals with modes and tools
		 */
		this.setupUI = function () {
			var that = this;
			this.ui = new UImanager({
				parent: that,
				modes: LOMButtons,
				interface: "command"
			});

		}

			,
			/* ***************************************
			 * OVERVIEW
			 * 
			 * 
			 * ***************************************/

			/*
			 * hides all subs from a level
			 */
			this.setOverview = function (label) {
				var that = this;
				$.get(this.relPath + "templates/command/interface-overview.html", function (data) {
					var $container = $("main").children(".content");
					$container.html(data);
					$container.find("h2").eq(0).text(label);

					var $announceTarget = $container.find(".LOM-overview-announcements").find(".LOM-overview-announcement-container");
					that.social.displayAnnouncements($announceTarget);

					var $courseTarget = $container.find(".LOM-overview-courses").find(".courselist");
					that.courseManager.generateList($courseTarget);

					var $userTarget = $container.find(".LOM-overview-users").find(".userlist");
					that.userManager.generateList($userTarget);

					that.ui.loadAutomations();

				});
			}

	}

	function initialize() {
		if (typeof cmd === "undefined") {
			//generate the object
			window.cmd = new command();
		}
	}



	return {
		initialize: initialize
	};
});