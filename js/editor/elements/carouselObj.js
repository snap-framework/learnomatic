define([

	'jquery',
	'settings-core',
	'./../pageEdit/elementClass'
], function ($, CoreSettings, ElementClass) {
	'use strict';
	return ElementClass.extend({
		initialize: function (options) {
			this.options = options;
			this.autoLoaded = ["panel", "panel"];
			this.autoAddElement = "panel";
			this.autoAddButton = false;

		},
		changePermissions: function () {
			this.permissions.editButtons.add = true;
			this.permissions.editButtons.classPicker = true;
			this.permissions.subElements.details = true;
		},


		initDom: function () {
			this.$el.children("div").removeClass("wb-tabs");
		},

		customRemoveBeforeSave: function () {
			this.$el.children("div").addClass("wb-tabs");
			this.$el.children("div.carousel-s2").children("ul").html("");
			for (var i = 0; i < this.elements.length; i++) {
				this.addControls(this.elements[i]);
			}

		},
		customAfterLoad: function () {
			this.$el.children("div").removeClass("wb-tabs");

			return false;
		},
		//-------------------------
		addControls: function (panel) {
			this.connectDom();
			var $controls = this.$el.children("div").children("ul").eq(0);
			$controls.append("<li><a href=\"#" + panel.id + "\">" + panel.id + "</a></li>");
		}
	});
});
