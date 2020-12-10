define([
	'jquery',
	'labels',
	'utils',
	'modules/BaseModule'

], function ($, labels, Utils, BaseModule) {
	'use strict';

	return BaseModule.extend({
		initialize: function (options) {
			this.parent = options.parent; //masterStructure.editor
			this.element = this.parent.element; // the elemet this refers to
			this.editor = this.parent.editor; //editor again
			this.root = this.editor; // another word for editor

			this.initBtn(options.$el);

			this.name = this.$btn.attr("data-style-type"); // LOM-ribbon, LOM-circle-ribbon, etc

			this.styleClass = "LOM-" + this.name;

			this.labels = options.labels; // this is not implemented yet


			//this is selected already
			if (this.parent.element.$el.hasClass(this.styleClass)) {
				this.parent.currentRibbon = this;

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
			this.isSelected();//selected
		},
		/* ************************************
		 * IS SELECTED
		 * everything that happens after click
		 * returns nothing
		 * ***********************************/
		isSelected: function () {
			//STRIP other ribbons
			this.parent.stripRibbons(this.parent.$result);
			//add the class for this ribbon
			this.parent.$result.addClass(this.styleClass);
			//deactivate the other buttons
			this.parent.$ribbonList.children(".LOM-style-active").removeClass("LOM-style-active")
			//activate  this button
			this.$btn.addClass("LOM-style-active");

			//
			if (this.name !== "null") {
				//make sure we have AT LEAST an icon selected
				if (this.parent.currentIcon.name === "null") {
					this.parent.iconList[1].isSelected();
				}
			} else {
				//ribbon set to NONE
				this.parent.iconList[0].isSelected();
			}

			//insert a WARNING
			if (this.name === "iconbox" && this.parent.$result.find("h2,h3,h4,h5,h6").length === 0) {
				var warn = "Warning: IconBoxes Need Headings to Work!";
				this.parent.$result.find(".LOM-editable").prepend("<h4 class='LOM-iconbox-warning'>" + warn + "</h4>");
			} else {
				this.parent.$result.find(".LOM-iconbox-warning").remove();
			}


			//set the current ribbon
			this.parent.currentRibbon = this;

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

