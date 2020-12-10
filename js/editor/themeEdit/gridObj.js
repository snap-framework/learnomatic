define([
	'jquery',
	'labels',
	'utils',
	'modules/BaseModule'

], function ($, labels, Utils, BaseModule) {
	'use strict';

	return BaseModule.extend({
		initialize: function (options) {
			var that = this;
			this.parent = options.parent; //masterStructure.editor
			this.element = this.parent.element;
			this.editor = this.parent.editor; //masterStructure
			this.root = this.editor;

			this.initBtn(options.$el);

			this.name = this.$btn.text();
			this.styleClass = "col-sm-" + this.name;

			this.labels = options.labels;


		},
		/*---------------------------------------------------------------------------------------------
				-------------------------interaction
		---------------------------------------------------------------------------------------------*/
		initBtn: function ($btn) {
			var that = this;
			this.$btn = $btn;
			this.$btn.click(function () {
				that.isClicked();
			})
		},
		isClicked: function () {
			this.isSelected();
		},

		isSelected: function () {
			//STRIP
			this.parent.stripGrids(this.parent.$result);
			//add the class
			this.parent.$result.addClass(this.styleClass);
			//deactivate the other buttons
			this.parent.$gridList.children(".LOM-style-active").removeClass("LOM-style-active")
			//activate  the button
			this.$btn.addClass("LOM-style-active");
			this.parent.currentGrid = this;

		}


	});
});

