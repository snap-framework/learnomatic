define([

	'jquery',
	'settings-core',
	'./../pageEdit/elementClass'
], function ($, CoreSettings, ElementClass) {
	'use strict';
	return ElementClass.extend({
		initialize: function (options) {
			this.options = options;
		},

		changePermissions: function () {
			this.permissions.editButtons.add = false;
			this.permissions.editButtons.classPicker = true;
			this.autoAddButton = true;
			//---- SUB ELEMENTS

			this.permissions.subElements.text = true;
			this.permissions.subElements.image = true;
			this.permissions.subElements.custom = true;
			this.permissions.subElements.container = true;
			//this.permissions.subElements.lightbox = true;
			this.permissions.subElements.html = true;
			this.permissions.subElements.btngroup = true;
		},

		/*getHolder: function () {
			this.holderId = this.id;
			return this.$el;
		},*/




	});
});
