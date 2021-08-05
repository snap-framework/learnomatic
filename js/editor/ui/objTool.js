define([

	'jquery',
	'labels',
	'settings-core',
	'utils',
	'modules/BaseModule'

], function ($, labels, CoreSettings, Utils, BaseModule) {
	'use strict';

	return BaseModule.extend({
		initialize: function (options) {
			//var that=this;

			this.parent = options.parent;

			this.root = this.parent.root;

			this.name = options.name;

			this.$el = null;
			this.$modes = this.parent.$modes;
			this.$dashboard = this.parent.$dashboard;

			this.icon = options.icon;
			this.labels = options.labels;

		},
		/*---------------------------------------------------------------------------------------------
				-------------------------DOM SETUP
		---------------------------------------------------------------------------------------------*/
		generateButtonHtml: function () {
			var html = "<button class=\"ico-" + this.icon + " snap-md\" title=\"" + this.labels + "\">" + this.labels + "</button>";
			this.$dashboard.append(html);
			this.$el = this.$dashboard.children(".ico-" + this.icon).eq(0);

			this.attachHoverState();
			this.attachClickEvent();
			this.hide();
			return true;
		},
		attachHoverState: function () {
			/*this.$el.hover(
				function () {
					$(this).removeClass("snap-xs").addClass("snap-sm");
				},
				function () {
					$(this).removeClass("snap-sm").addClass("snap-xs");
				}
			);*/
		},
		attachClickEvent: function () {
			var that = this;
			this.$el.click(function () {
				that.actionDispatcher();

			});
		},

		/*---------------------------------------------------------------------------------------------
				-------------------------
		---------------------------------------------------------------------------------------------*/
		hide: function () {
			this.$el.hide();
		},
		show: function () {
			this.$el.show();
		},
		/*---------------------------------------------------------------------------------------------
				-------------------------actions
		---------------------------------------------------------------------------------------------*/
		actionDispatcher: function () {
			switch (this.name) {
				case "deletepage":
					if (!this.root.locked) {
						this.root.deletePage();
					} else {
						this.root.lockMessage();
					}

					break;
				case "savetemplate":
					this.root.saveTemplate();
					break;
				case "a11y":
					this.root.a11y.startA11yCheck();
					break;
				case "searchreplace":

					if (!this.root.notAlone) {
						this.root.openSearchReplace();
					} else {
						this.root.lockMessage("course");
					}

					break;
				case "globalview":
					this.root.structure.initGlobalView();
					break;
				case "localview":
					this.root.structure.initLocalView();
					break;
				case "colors":
					//this.root.themes.initVars();
					this.root.themes.build();
					break;
				case "layout":

					if (!this.root.locked) {
						this.root.layout.popPicker();
					} else {
						this.root.lockMessage();
					}


					break;
			}


		},


		doSomething: function () {


		}
	});
});