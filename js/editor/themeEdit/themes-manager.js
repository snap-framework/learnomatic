define([
	'jquery',
	'labels',
	'settings-core',
	"settings-general",
	'./../../../courses/_default/core/settings/settings-core',
	'utils',
	'modules/BaseModule',
	'./../themeEdit/objTheme',
	'./vars/vars-manager'

], function ($, labels, CoreSettings, GeneralSettings, OriginalSettings, Utils, BaseModule, Theme, VarsManager) {
	'use strict';

	return BaseModule.extend({
		initialize: function (options) {
			var that = this;
			that = that;

			this.parent = options.parent; //masterStructure.editor
			this.editor = this.parent;
			this.master = this.parent.parent; //masterStructure

			this.$theme = $("#theme-style");
			this.$main = $("#main-style");

			this.themes = [];

			this.$template = null;
			this.labels = options.labels;

			this.locked = null;

			this.initTemplate();

			this.varsManager = new VarsManager({
				parent: this
			})

			this.varsManager.init();

		},
		/*---------------------------------------------------------------------------------------------
				-------------------------DOM INIT
		---------------------------------------------------------------------------------------------*/
		setDom: function () {
			var that = this;
			//start filling the page
			$(CoreSettings.contentContainer).html("<h1>Theme Editor</h1>")
				.append("<p>Some explanation as to whats going on</p>")
				.append("<div class='wb-tabs wet-boew-tabbedinterface tabs-style-2 ignore-session'><div class='tabpanels' id='LOM-theme-tabs'></div></div>");
			var $tabs = $("#LOM-theme-tabs");
			$tabs
				.append("<details><summary><span class='LOM-theme-tab LOM-tab-themepick'>Theme Picker</span></summary><div id='themes-list'></div></details>")
			//.append("<details><summary><span class='LOM-theme-tab LOM-tab-colormanager'>Color Manager</span></summary><div id='LOM-color-vars'></div></details>")

			var $themePicker = $("#themes-list");
			$themePicker
				.append("<p>First Step, choose a Theme: ")
				.append(this.$template.html()); //.hide().fadeIn();				
			initWbAdd(".wb-tabs");
			// once the tabs are good to go.
			var handle = window.setInterval(function () {
				//make sure it's inited
				if ($tabs.parent().hasClass("wb-tabs-inited")) {
					//destroy the interval
					clearInterval(handle);
					//start the vars manager
					that.varsManager.setDom($("#LOM-color-vars"));
					// ----- Set General Themes
					for (var i = 0; i < that.themes.length; i++) {
						that.themes[i].generateSelectButton($("#themes-list"));
					}
				}
			}, 100);
		},


		connectDom: function () {},
		/* ************************************************************
		 * TRANSFER THEME
		 * take the new theme and transfer it to the right folder
		 * calls vars manager init
		 * ************************************************************/
		transferTheme: function (theme) {
			var that = this;
			var folder = "courses/" + this.editor.courseFolder;
			$.post('../../editor.php', {
				action: "transfertheme",
				filename: 'templates/LOM-themes/' + theme.name,
				course: folder
			}, function (data) {
				//parse the jSON
				if (data !== "false" && typeof data !== "undefined" && data !== "") {
					//initialize the vars in the color manager
					that.varsManager.init();

				}

			}).fail(function () {
				alert("Posting failed while initializing theme.");
			});

		},

		stepTwo: function (obj) {
			//enable 


		},





		build: function () {
			this.varsManager.courseScheme.save();
			this.editor.lbxController.pop({
				title: "Theme Successfuly Built",
				obj: this,
				action: this.afterpopBuild
			});

		},

		afterpopBuild: function ($pop, params) {

			$pop.html("<p>For now, the Theme compiler isn't up yet. get your friendly Dev to compile it!");
		},

		/*---------------------------------------------------------------------------------------------
				-------------------------INIT
		---------------------------------------------------------------------------------------------*/
		initTemplate: function () {
			var that = this;
			$.ajax({
				url: "../../templates/themes-ui.html",
				type: 'GET',
				async: true,
				cache: false,
				timeout: 30000,
				error: function () {

					return true;
				},
				success: function (tpl) {
					that.$template = $(tpl);
					that.initThemes();
				}
			});
		},
		initThemes: function () {
			var that = this;
			$.post('../../editor.php', {
				action: "readfolder",
				filename: 'templates/LOM-themes/',
				regex: "/^[a-zA-Z]/"
			}, function (data) {
				//parse the jSON
				if (data !== "false" && typeof data !== "undefined" && data !== "") {
					if (data.charAt(data.length - 1) === ",") {
						data = data = data.slice(0, -1);
					}
					var themesList = data.split(",");
					for (var i = 0; i < themesList.length; i++) {
						that.themes[that.themes.length] = new Theme({
							parent: that,
							name: themesList[i]
						});
					}

				}

			}).fail(function () {
				alert("Posting failed while initializing theme.");
			});
		}
	});
});