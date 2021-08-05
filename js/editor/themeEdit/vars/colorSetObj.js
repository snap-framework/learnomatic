define([
	'jquery',
	'labels',
	'utils',
	'modules/BaseModule',
	'settings-core',
	'./colorObj',
	'./colorCommentObj'

], function ($, labels, Utils, BaseModule, CoreSettings, Color, ColorComment) {
	'use strict';

	return BaseModule.extend({
		initialize: function (options) {
			var that = this;
			that = that;
			this.options = options;

			this.parent = options.parent; //masterStructure.editor
			this.editor = this.parent.editor;
			this.root = this.editor;
			this.master = this.parent.master; //masterStructure
			this.scheme = this.parent;
			this.manager = this.scheme.parent;

			this.labels = options.labels;


			this.data = options.data;

			this.name = options.data.name
			this.major = options.data.major;

			this.list = [];
			this.colors = [];
			this.colorList = [];
			this.comments = [];

			//this.initColors(options.data);



		},
		/*---------------------------------------------------------------------------------------------
		-------------------------init VARS
		---------------------------------------------------------------------------------------------*/
		init: function () {

		},

		initColors: function (data) {
			var that = this;
			var commentObj, colorObj;

			$.each(data.colors, function (key, color) {
				if (color.isColor) {
					colorObj = new Color({
						parent: that,
						data: color
					});
					that.appendColor(colorObj);

				}
				if (color.isComment) {
					//this is a comment
					commentObj = new ColorComment({
						parent: that,
						data: color
					});

					that.list[that.list.length] = commentObj;
					that.scheme.list[that.scheme.list.length] = commentObj;
				}


			});


		},

		appendColor: function (obj) {
			this.colorList[this.colorList.length] = obj;
			this.list[this.list.length] = obj;
			this.colors[obj.name] = obj;
			this.scheme.colors[obj.name] = obj;
			if (obj.set.name.toLowerCase() === "custom") {
				this.scheme.list.unshift(obj);
			} else {
				this.scheme.list.push(obj);
			}

			if (this.name.toLowerCase() === "global" || this.name.toLowerCase() === "custom") {
				if (obj.type === "hex") {
					this.scheme.globalColors[obj.value] = obj;
				}
			}

		},
		/*---------------------------------------------------------------------------------------------
		-------------------------
		---------------------------------------------------------------------------------------------*/
		saveGroup: function () {
			for (var i = 0; i < this.colorList.length; i++) {
				this.colorList[i].presave();
			}
		},
		resetGroup: function () {
			for (var i = 0; i < this.colorList.length; i++) {
				this.colorList[i].reset();
			}

		},

		fetchCode: function () {
			return "\n\n//------" + this.name + "------//\n";
		},




		/*---------------------------------------------------------------------------------------------
		-------------------------
		---------------------------------------------------------------------------------------------*/

		appendComment: function (obj) {
			this.list[this.list.length] = obj;

		}



	});
});

