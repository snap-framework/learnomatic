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
			this.editor = this.parent.editor;

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
			var html = "<button class=\"ico-" + this.icon + " snap-xs\" title=\"" + this.labels + "\">" + this.labels + "</button>";
			this.$dashboard.append(html);
			this.$el = this.$dashboard.children(".ico-" + this.icon).eq(0);

			this.attachHoverState();
			this.attachClickEvent();
			this.hide();
			return true;
		},
		attachHoverState: function () {
			this.$el.hover(
				function () {
					$(this).removeClass("snap-xs").addClass("snap-sm");
				},
				function () {
					$(this).removeClass("snap-sm").addClass("snap-xs");
				}
			);
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
					this.editor.deletePage();
					break;
				case "savetemplate":
					this.editor.saveTemplate();
					break;
				case "globalview":
					this.editor.structure.initGlobalView();
					break;
				case "localview":
					this.editor.structure.initLocalView();
					break;
				case "layout":
					this.editor.popLayoutPicker();

					break;
			}


		},


		doSomething: function () {


		}
	});
});
