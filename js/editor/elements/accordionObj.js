define([

	'jquery',
	'settings-core',
	'./../pageEdit/elementClass'
], function ($, CoreSettings, ElementClass) {
	'use strict';
	return ElementClass.extend({
		initialize: function (options) {
			this.options = options;
			this.autoLoaded = ["details", "details", "details"];
			this.autoAddElement = "details";
			this.autoAddButton = false;
		},
		changePermissions: function () {
			this.permissions.editButtons.add = true;
			this.permissions.editButtons.classPicker = true;
			this.permissions.subElements.details = true;
		},

		startSort: function () {
			this.storeElementsValues();
		},

		initDom: function () {
			if (this.subtype === "tabs") {
				this.$el.removeClass("wb-tabs");
			}
		},

		customRemoveBeforeSave: function () {
			if (this.subtype === "tabs") {
				this.$el.addClass("wb-tabs");
			}
		},
		customAfterLoad: function () {

			if (this.subtype === "tabs") {
				this.$el.removeClass("wb-tabs");
			}
			return false;
		},
		//-------------------------
		doSomething: function () {


		}
	});
});
