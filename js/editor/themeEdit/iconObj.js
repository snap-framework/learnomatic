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
			this.parent = options.parent; //editor
			this.element = this.parent.element; //element this refers to
			this.editor = this.parent.editor; //editor
			this.root = this.editor;//another editor

			this.initBtn(options.$el);
			this.iconClass = this.$btn.attr("data-style-icon");//LOM-login, SNAP-locked
			this.name = this.iconClass.split("-")[1]; // login, locked
			this.iconPack = this.iconClass.split("-")[0]; // LOM, SNAP, QS, etc
			this.btnClass = "ico-" + this.iconPack + "-" + this.name; //ico-LOM-login, etc
			this.styleClass = "icon-" + this.name; // icon-login

			this.labels = options.labels; //not implemented

			//this is selected already			
			if (this.parent.element.$el.hasClass(this.styleClass)) {
				this.parent.currentIcon = this;
			}

		},
		/*---------------------------------------------------------------------------------------------
				-------------------------INTERACTIONS
		---------------------------------------------------------------------------------------------*/
		initBtn: function ($btn) {
			var that = this;
			this.$btn = $btn;
			this.$btn.click(function () {
				that.isClicked(); // this $btn was clicked
			});

		},
		/* ************************************
		 * IS CLICKED
		 * will launch the isSelected method
		 * returns nothing
		 * ***********************************/
		isClicked: function () {
			this.isSelected();
		},
		/* ************************************
		 * IS SELECTED
		 * everything that happens after click
		 * returns nothing
		 * ***********************************/
		isSelected: function () {
			//STRIP other icons
			this.parent.stripIcons(this.parent.$result);
			//add the class for this icon
			this.parent.$result.addClass(this.styleClass);
			//deactivate the other buttons in the lbx
			this.parent.$iconList.children(".LOM-style-active").removeClass("LOM-style-active")
			//activate  this button 
			this.$btn.addClass("LOM-style-active");
			//set the current icon
			this.parent.currentIcon = this;

		},
		/* ************************************
		 * DISABLE/ENABLE button
		 * returns nothing
		 * ***********************************/
		disableBtn: function () {
			this.$btn.prop("disabled", true);
		},
		enableBtn: function () {
			this.$btn.prop("disabled", false);
		}


	});
});

