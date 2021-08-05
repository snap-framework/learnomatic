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
			this.master = this.parent.master;
			this.editor = this.parent.editor;

			this.name = options.name;
			this.themeFile = "theme.css";
			this.mainFile = "main.css";
			this.themeLocation = "templates/LOM-themes/" + this.name + "/";



			this.$el = null;

		},
		/*---------------------------------------------------------------------------------------------
				-------------------------DOM SETUP
		---------------------------------------------------------------------------------------------*/

		select: function () {
			//change the style!
			$("html").hide();
			this.parent.$theme.attr("href", "../../" + this.themeLocation + this.themeFile);
			this.parent.$main.attr("href", "../../" + this.themeLocation + this.mainFile);
			$("html").fadeIn("slow");

			this.editor.lbxController.pop({
				title: "Theme Modified",
				obj: this,
				action: this.lockAfterPop,
				saveBtn: "ok"
			});
		},
		generateSelectButton: function ($target) {
			var that = this;
			$target.append("<button class='snap-lg ico-LOM-theme' name='" + this.name + "'>" + this.name + "</button>");
			var $btn = $target.children("button").eq($target.children("button").length - 1);
			//$btn.attr("style", ":before{background-color:red!important;}");

			$btn.append("<style>#themes-list [name='" + this.name + "']:before{background-image:url(../../templates/LOM-themes/" + this.name + "/preview.jpg);}</style>")

			$btn.click(function () {
				that.select();
			});

		},

		lockAfterPop: function ($pop, params) {
			params.obj.themeConfirmScreen($pop);

		},
		themeConfirmScreen: function ($pop) {
			var that = this;

			//------ body
			$pop.append("<div class='row'><div class='col-sm-8 col-sm-push-1'></div><div class='col-sm-1 col-sm-pull-8'></div></div>");
			var explanation = "<p>The Theme was modified but the changes are temporary</p><p>Would you like to keep this theme?</p>"

			$pop.children(".row").children().eq(0).append(explanation);
			$pop.children(".row").children().eq(1).append("<img class='img-responsive' src=\"../../templates/LOM-themes/" + this.name + "/preview.jpg\">");

			// ------ footer
			var $footer = $(".modal-footer");
			$footer.html("");
			$footer.append("<button class=\"snap-sm ico-QS-check LOM-theme-confirmtheme\">Confirm</button>")
			$footer.append("<button class=\"snap-sm ico-SNAP-delete LOM-theme-canceltheme\">cancel</button>")
			$(".LOM-theme-confirmtheme").click(function () {
				that.confirmTheme();
			});
			$(".LOM-theme-canceltheme").click(function () {
				that.cancelTheme();
			});
		},
		confirmTheme: function () {
			this.editor.lbxController.close();
			this.parent.transferTheme(this);
			//confirm theme change, move the file, etc.
		},
		cancelTheme: function () {
			this.reset();
			this.editor.lbxController.close();

		},
		reset: function () {
			this.parent.$theme.attr("href", "theme/theme.css");
			this.parent.$main.attr("href", "theme/main.css");

		},

		doSomething: function () {




		}
	});
});