define([

	'jquery',
	'labels',
	'settings-core',
	'utils',
	'modules/BaseModule',
	'./../ui/objTool'

], function ($, labels, CoreSettings, Utils, BaseModule, ObjTool) {
	'use strict';

	return BaseModule.extend({
		initialize: function (options) {
			//var that=this;
			var name = options.name;
			this.parent = options.parent;
			this.master = this.parent.master;
			this.root = this.parent.root;
			this.root = options.root;

			this.$el = null;
			this.$modes = this.parent.$modes;
			this.$dashboard = this.parent.$dashboard;

			this.name = name;
			this.labels = options.labels;
			this.btnClass = "LOM-mode-" + name;
			this.activeClass = "LOM-" + name + "-active";

			this.interface = options.interface;

			//this.permissions = options.permissions;

			//----tools
			this.tools = this.initTools(options.tools);
		},
		/*---------------------------------------------------------------------------------------------
				-------------------------DOM SETUP
		---------------------------------------------------------------------------------------------*/
		generateButtonHtml: function ($target) {
			var icon = this.getIcon();
			$target.append("<button class=\"LOM-mode-" + this.name + " snap-md ico-LOM-" + icon + "\" title=\"" + this.labels + "\">" + this.labels + "</button>");
			this.$el = $target.children("button.LOM-mode-" + this.name);
			this.attachHoverState();
			this.attachClickEvent();
			return true;
		},
		attachHoverState: function () {
			this.$el.hover(
				function () {
					//$( this ).removeClass("snap-xs").addClass("snap-sm");
				},
				function () {
					//$( this ).removeClass("snap-sm").addClass("snap-xs");
				}
			);
		},
		attachClickEvent: function () {
			var that = this;
			this.$el.click(function () {

				if (that.name === "structure") {
					if (that.root.notAlone) {
						that.root.lockMessage("course");

					}
					//REMOVE!!!!
					that.modeClicked();
				} else {
					//prevent double-clicking;
					if (that.parent.currentMode !== that) {
						that.modeClicked();

					}
				}

				$(window).trigger("LOM:switchMode", this);

			});
		},
		modeClicked: function () {


			//Make sure there are no activities/exams with no questions before going into preview mode (causes issues with QS)
			var emptyActivities = false;
			$(".qs-exercise").each(function () {
				if ($(this).find(".LOM-element[data-lom-element=\"multiplechoice\"]").length == 0) {
					emptyActivities = true;
				}
			})

			if (this.name == "preview" && emptyActivities) {
				alert(this.root.labels.element.editview.QS.emptyActivity);
			} else {
				if (this.interface !== "social") {
					this.select();
					if (this.parent.currentMode !== null) {
						this.parent.currentMode.deactivate();
					}
				}
				this.activate();
			}
		},

		getIcon: function () {
			var icon = "";
			switch (this.name) {
				case "pageEdit":
					icon = "editpage";
					break;
				case "settings":
					icon = "gear";
					break;
				case "overview":
					icon = "home";
					break;
				case "courses":
					icon = "course";
					break;
				case "boards":
					icon = "board";
					break;
				case "announcements":
					icon = "announcement";
					break;
				default:
					icon = this.name;
			}
			return icon;
		},
		/*---------------------------------------------------------------------------------------------
				-------------------------TOOLS
		---------------------------------------------------------------------------------------------*/
		initTools: function (tools) {

			var aTools = [];
			for (var i = 0; i < tools.length; i++) {
				aTools[aTools.length] = new ObjTool({
					parent: this,
					name: tools[i].name,
					labels: tools[i].labels,
					icon: tools[i].icon,
					root: this.root
				});
				aTools[i].generateButtonHtml();
			}

			return aTools;
		},

		/*---------------------------------------------------------------------------------------------
				-------------------------
		---------------------------------------------------------------------------------------------*/
		select: function () {
			var aModes = this.parent.modeList;
			var aClasses = [];
			var name = "";
			for (var i = 0; i < aModes.length; i++) {
				name = this.parent.modeList[i].name;
				aClasses[aClasses.length] = "LOM-" + name + "-active";
			}

			Utils.classToggle($("html"), aClasses, "LOM-" + this.name + "-active");
			//load the tools for this
			this.showButtons();
			return this;
		},

		deactivate: function () {

			switch (this.name) {
				case "structure":
					//this.master.currentSub=this.master.flatList[0];
					this.root.structure.exitStructureEditor();
					break;


			}
		},

		activate: function () {
			if (this.interface !== "social") {
				this.parent.currentMode = this;
			}

			switch (this.name) {
				case "structure":
					$('#dynamic_content').html('');
					this.root.structure.initLocalView();
					break;
				case "pageEdit":
				case "preview":
					//show the page !
					if ($('#dynamic_content').is(":hidden")) {
						$('#dynamic_content').show();
						$("#LOM_a11y").remove();
						$("#cke_LOM_a11y").remove();
					}
					//(re)Load current page
					this.master.currentSub.loadPage();
					this.master.targetNav = this.master.currentSub.aPosition;
					this.master.resetNav();
					break;
				case "settings":
					this.root.settings.setDom();
					break;
				case "theme":
					this.root.themes.setDom();
					break;
				case "resources":
					this.root.resourcesEdit.setDom();
					break;
				case "users":
					this.root.userManager.initDom(this.labels);
					break;
				case "courses":
					this.root.courseManager.setDom(this.labels);
					break;
				case "overview":
					this.root.setOverview(this.labels);
					break;
				case "chat":
					this.root.social.chatManager.startChatMode();
					break;
				case "notifications":
					//console.log("check notifications")
					break;

				case "review":
					this.root.social.reviewManager.popReviews();
					break;



			}


		},

		enable: function () {
			//this.$el.css("background-color", "inherit");
			this.$el.show();

		},
		disable: function () {
			//this.$el.css("background-color", "red");
			this.$el.hide();
		},

		setPermissions: function () {
			//console.log(this);
		},
		showButtons: function () {
			for (var i = 0; i < this.parent.modeList.length; i++) {
				this.parent.modeList[i].hideButtons();
			}

			for (i = 0; i < this.tools.length; i++) {
				this.tools[i].show();
			}

		},
		hideButtons: function () {
			for (var i = 0; i < this.tools.length; i++) {
				this.tools[i].hide();
			}
		},
		doSomething: function () {


		}
	});
});