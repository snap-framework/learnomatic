define([

	'jquery',
	'labels',
	'settings-core',
	'utils',
	'modules/BaseModule',
	'./../ui/objMode'

], function ($, labels, CoreSettings, Utils, BaseModule, ObjMode) {
	'use strict';

	return BaseModule.extend({
		initialize: function (options) {
			this.options = options;
			//var that=this;
			this.parent = options.parent;

			this.interface = options.interface;

			this.master = this.parent.parent;
			this.root = options.parent;


			this.labels = options.labels;
			//options.modes;
			this.modes = [];
			this.modeList = [];
			this.currentMode = null;

			this.prepareHtml();

			this.$dashboard = this.prepareHtmlDashboard();

			if (this.root.settings.social.default) {
				this.$socialBoard = this.prepareHtmlSocialBoard();
			}

			this.initModes(options.modes);

			//



		},

		getStarted: function () {

			var firstMode = (this.root.isPage404) ? 1 : 0;
			this.currentMode = this.modeList[firstMode].select();
			this.$modes = null;
			this.$dashboard = null;

		},

		initModes: function (modesList) {
			var that = this;
			//add the html to the dom
			var $modeTarget = this.prepareHtmlModes();
			var $target;
			var newMode;
			var socialActive;
			//create the mode objects
			for (var i = 0; i < modesList.length; i++) {

				//go0nna need to adjust SPECIAL ROLE
				//console.log("SPECIAL ROLE ADJUST);")
				//var permissions="user";//this.root.session.user.role;
				//is social active?
				if (modesList[i].interface === "social") {
					socialActive = (this.root.settings.social.default && this.root.settings.social[modesList[i].name]) ? true : false;
				}


				if (this.interface === modesList[i].interface || socialActive) {
					newMode = new ObjMode({
						parent: that,
						name: modesList[i].name,
						labels: modesList[i].labels,
						tools: modesList[i].tools,
						//permissions: permissions,
						interface: modesList[i].interface,
						root: this.root
					});
					this.modeList[this.modeList.length] = newMode;
					this.modes[modesList[i].name] = newMode;
					$target = (modesList[i].interface === "social") ? $(".LOM-socialboard").eq(0) : $modeTarget;
					newMode.generateButtonHtml($target);
					//newMode.$el.hide();
					newMode.disable();

				}

			}
		},

		enableModes: function () {

			for (var i = 0; i < this.modeList.length; i++) {
				this.modeList[i].disable();
				var permission = this.root.session.displayRole.permissions[this.modeList[i].name];
				if (permission) {
					this.modeList[i].enable();
				}
			}

		},

		getModeClasses: function () {
			var aModes = [];
			for (var i = 0; i < this.aModes.length; i++) {
				aModes[aModes.length] = "LOM-" + this.aModes[i] + "-active";
			}
			return aModes;
		},

		/*---------------------------------------------------------------------------------------------
				-------------------------DOM SETUP
		---------------------------------------------------------------------------------------------*/
		prepareHtml: function () {
			var $container = $((this.interface === "editor") ? CoreSettings.contentContainer : "main.container");
			$container.before("<div id=\"LOM-toolbox\"></div>");
			$container.before("<div id=\"LOM-social\"></div>");
			this.$toolbox = $("#LOM-toolbox");
			this.$social = $("#LOM-social");
		},

		prepareHtmlModes: function () {
			this.$toolbox.prepend("<div class=\"LOM-modetoggle\"><div class='LOM-modes-title'>Modes</div></div>");
			//init navigation
			var that = this;
			$(this.master).on("Framework:pageLoaded", function () {
				var modeName = that.currentMode.name;
				if (modeName !== "preview" && modeName !== "pageEdit") {
					that.modesList[0].select();
					that.modesList[0].activate();

				}
			});

			return $(".LOM-modetoggle").eq(0);


		},
		prepareHtmlDashboard: function () {
			this.$toolbox.append("<div class=\"LOM-dashboard\"><div class='LOM-modes-title'>" + ((Utils.lang === "en") ? "Tools" : "Outils") + "</div></div>");
			return $(".LOM-dashboard").eq(0);


		},
		prepareHtmlSocialBoard: function () {
			this.$social.append("<div class=\"LOM-socialboard\"><div class='LOM-modes-title'>Social</div></div>");
			return $(".LOM-socialboard").eq(0);


		},

		slideToggle: function () {
			this.$toolbox.hide();
			this.$toolbox.toggle("slide");
		},

		loadAutomations: function () {

			var $ul = $("[data-lom-show]");
			$ul.after("<button class=\"view-more ico-LOM-plus snap-md\">View More</button>");
			$ul.siblings(".view-more").click(function () {
				var defaultSteps = 3;
				var $show = $(this).siblings("[data-lom-show]");
				var steps = (typeof $show.attr("data-lom-show") === "undefined") ? defaultSteps : parseInt($show.attr("data-lom-show"), 10);
				var current = parseInt($show.attr("data-lom-show"), 10);
				var total = $show.children().length;

				if (current === total || total - current < steps) {
					current = total;
					$(this).remove();
				} else {
					current += steps;
				}
				$show.attr("data-lom-show", current + 1);

			});

		},
		/*---------------------------------------------------------------------------------------------
				-------------------------UI Visual feedback
		---------------------------------------------------------------------------------------------*/
		addVisualFeedback: function (el) {
			//TODO: Add other styles, switch to deal with different sort of visual feedback required... - CSPS-TD
			$(el).removeClass('LOM-feedback-transition').addClass('LOM-feedback-transition').delay(750).queue(function () {
				$(el).removeClass('LOM-feedback-transition').dequeue();
			});
		},

		/*---------------------------------------------------------------------------------------------
				-------------------------CHANGE MODES
		---------------------------------------------------------------------------------------------*/
		changeMode: function (to) {

			Utils.classToggle($("html"), this.modeClasses, "LOM-" + to + "-active");
		},

		doSomething: function () {


		}
	});
});
