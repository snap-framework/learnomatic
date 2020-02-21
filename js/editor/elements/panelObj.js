define([

	'jquery',
	'settings-core',
	'./../pageEdit/elementClass'
], function ($, CoreSettings, ElementClass) {
	'use strict';
	return ElementClass.extend({
		initialize: function (options) {
			this.options = options;
			this.autoLoaded = ["text"];
		},

		changePermissions: function () {
			this.permissions.editButtons.add = false;
			this.permissions.editButtons.classPicker = false;
			this.permissions.subElements.text = true;
			this.permissions.subElements.image = true;
			this.permissions.subElements.custom = true;


		},
		initDom: function () {
			this.$el.removeClass("fade");
		},
		customAfterLoad: function () {
			this.$el.removeClass("fade");
		},
		customRemoveBeforeSave: function () {
			this.$el.removeClass("in");
			this.$el.addClass("out");
			this.$el.addClass("fade");
		}
	});
});
