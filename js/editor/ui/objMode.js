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
			this.editor = this.parent.editor;

			this.$el = null;
			this.$modes = this.parent.$modes;
			this.$dashboard = this.parent.$dashboard;

			this.name = name;
			this.labels = options.labels;
			this.btnClass = "LOM-mode-" + name;
			this.activeClass = "LOM-" + name + "-active";

			this.permissions = options.permissions;

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
				//prevent double-clicking;
				if (that.parent.currentMode !== that) {
					that.select();
					if (that.parent.currentMode !== null) {
						that.parent.currentMode.deactivate();
					}
					that.activate();
				}

			});
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
					icon: tools[i].icon
				});
				aTools[i].generateButtonHtml();
			}

			return aTools;
		},

		/*---------------------------------------------------------------------------------------------
				-------------------------
		---------------------------------------------------------------------------------------------*/
		select: function () {
			var aModes = this.parent.modes;
			var aClasses = [];
			var name = "";
			for (var i = 0; i < aModes.length; i++) {
				name = this.parent.modes[i].name;
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
					this.editor.structure.exitStructureEditor();
					break;


			}
		},

		activate: function () {
			var that = this;
			this.parent.currentMode = this;
			switch (this.name) {
				case "structure":
					$('#dynamic_content').html('');
					that.editor.structure.initLocalView();
					break;
				case "pageEdit":
				case "preview":
					//(re)Load current page

					this.master.currentSub.loadPage();
					this.master.targetNav = masterStructure.currentSub.aPosition;
					this.master.resetNav();
					break;
				case "settings":
					this.editor.settings.setDom();
					break;
				case "theme":
					this.editor.themes.setDom();
					break;


			}


		},

		setPermissions: function () {
			//console.log(this);
		},
		showButtons: function () {
			for (var i = 0; i < this.parent.modes.length; i++) {
				this.parent.modes[i].hideButtons();
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
