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

		setLabels: function () {
			switch (this.subtype) {
				case "tabs":
					this.typeName = this.labels.type.tabs;
					break;
				default:
					this.typeName = this.labels.type.accordion;
					break;
			}

			this.setLabelsDone = true;
			return false;
		},

		initDefaultDomValues: function ($template) {
			if (this.subtype === "tabs") {
				$template.children(".LOM-element").addClass("wb-tabs");
			}
			return $template;
		},

		getHolder: function () {
			this.holderId = this.id;
			return this.$el;
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