define([

	'jquery',
	'settings-core',
	'./../pageEdit/elementClass'
], function ($, CoreSettings, ElementClass) {
	'use strict';
	return ElementClass.extend({
		initialize: function (options) {
			this.options = options;
			this.autoLoaded = ["image"];
		},

		changePermissions: function () {
			this.permissions.editButtons.add = false;
			this.permissions.editButtons.classPicker = false;
			this.permissions.subElements.text = true;
			this.permissions.subElements.image = true;
			this.permissions.subElements.custom = true;
			this.permissions.editButtons.review = false;


		},
		initDom: function () {
			//this.$el.removeClass("fade");
			this.parent.addControls();
		},
		getCustomHolderSelector: function () {
			return "figure.LOM-holder";
		}

	});
});
