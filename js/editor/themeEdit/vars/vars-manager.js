define([
	'jquery',
	'labels',
	'utils',
	'modules/BaseModule',
	'settings-core',
	'./colorSchemeObj'

], function ($, labels, Utils, BaseModule, CoreSettings, ColorScheme) {
	'use strict';

	return BaseModule.extend({
		initialize: function (options) {
			var that = this;
			that = that;

			this.parent = options.parent; //masterStructure.editor
			this.editor = this.parent.editor;
			this.root = this.editor;
			this.master = this.parent.master; //masterStructure


			this.courseScheme = null;
			this.newScheme = null;

			this.labels = options.labels;
			this.locked = false;


		},
		/*---------------------------------------------------------------------------------------------
		-------------------------init VARS
		---------------------------------------------------------------------------------------------*/
		init: function () {
			this.initDefault();//default will init the course
		},

		initDefault: function () {
			var that = this;
			// DEFAULT . dont forget to toggle esdcv perhaps?);
			$.post(this.root.relPath + '/editor.php', {
				action: "getvars",
				filename: 'courses/_default/theme/scss/_vars.scss'
			}, function (data) {
				if (data !== "false") {
					data = JSON.parse(data);
					that.initCourse(data);

				}
			}).fail(function () {
				alert("Posting failed while retreieving vars from vars manager.");
			});

		},
		initCourse: function (defaultData) {
			var that = this;
			$.post(this.root.relPath + '/editor.php', {
				action: "getvars",
				filename: 'courses/' + this.editor.courseFolder + '/theme/scss/_vars.scss'
			}, function (data) {
				if (data !== "false") {
					data = JSON.parse(data);


					var scheme = new ColorScheme({
						parent: that,
						data: defaultData,
						name: "course",
						original: false,
						newList: that.listColors(data),
						newData: that.listColorsName(data)
					});
					that.courseScheme = scheme;
					if ($("#LOM-color-vars").length > 0) {
						that.setDom($("#LOM-color-vars"));

					}

				}
			}).fail(function () {
				alert("Posting failed while retreieving vars from vars manager.");
			});
		},

		listColors: function (data) {
			var list = [];

			$.each(data.groups, function (key, set) {


				$.each(set.colors, function (colorkey, color) {
					//console.log(color)
					if (color.isColor) {
						color.group = set.name;
						list[list.length] = color;
					}
				})
			})
			return list;
		},

		listColorsName: function (data) {
			var list = [];

			$.each(data.groups, function (key, set) {


				$.each(set.colors, function (colorkey, color) {
					//console.log(color)
					if (color.isColor) {
						list[color.variable] = color;
					}
				})
			})
			return list;
		},

		/*---------------------------------------------------------------------------------------------
				-------------------------DOM INIT
		---------------------------------------------------------------------------------------------*/
		setDom: function ($target) {
			var that = this;
			var domTitle = (Utils.lang === "en") ? "Theme Color Scheme" : "Couleurs du thème";

			$target.html("<p class='LOM-ribbon icon-warning'>Currently, this feature is only available in Chrome</p><div class='LOM-vars-list LOM-colors-basic'></div>");
			var $list = $target.children(".LOM-vars-list");
			this.$el = $target;

			this.courseScheme.display($list);

			var $tab = $(".LOM-tab-colormanager").parent();



		},

		/*---------------------------------------------------------------------------------------------
				-------------------------FILE MANAGEMENT
		---------------------------------------------------------------------------------------------*/
		saveVars: function (content, course) {
			//console.log(content)
			//save the file


			$.post('../../editor.php', {
				action: "page",
				filename: "courses/" + this.editor.courseFolder + "/theme/scss/_vars.scss",
				content: content
			}, function () {

			}).fail(function () {
				alert("Posting failed while updating html.");
			});

		}



	});
});

