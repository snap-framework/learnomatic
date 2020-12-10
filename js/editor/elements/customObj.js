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
			this.permissions.editButtons.config = false;
			this.permissions.editButtons.classPicker = true;
			this.permissions.subElements = {
				text: false,
				image: false,
				custom: false,
				details: false
			};
		},

		setLabels: function () {
			this.typeName = this.labels.type.custom;
			this.setLabelsDone = true;
			return false;
		},

		initDefaultDomValues: function ($template) {
			$template.find("h2").html(this.labels.default.customTitle)
			$template.find(".LOM-editable").html(this.labels.default.customContent)

			return $template;
		},


		//-------------------------
		doSomething: function () {


		}
	});
});
