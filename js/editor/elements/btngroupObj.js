define([

	'jquery',
	'settings-core',
	'./../pageEdit/elementClass'
], function ($, CoreSettings, ElementClass) {
	'use strict';
	return ElementClass.extend({
		initialize: function (options) {

			this.options = options;

			this.autoLoaded = ["button", "button", "button"];
			this.autoAddElement = "button";


		},
		changePermissions: function () {
			this.permissions.editButtons.add = true;
			this.permissions.editButtons.classPicker = true;
			this.permissions.subElements = {
				button: false
			};
			this.permissions.sortable = true;
		},

		setLabels: function () {
			this.typeName = this.labels.type.btngroup;
			this.setLabelsDone = true;
			return false;
		},



		/*---------------------------------------------------------------------------------------------
		-------------------------CONFIGURATION
		---------------------------------------------------------------------------------------------*/

		//-------------------------
		doSomething: function () {


		}
	});
});
