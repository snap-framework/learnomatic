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
			this.autoAddButton = true;
		},
		changePermissions: function () {
			this.permissions.editButtons.add = true;
			this.permissions.editButtons.classPicker = true;

		},

		setLabels: function () {
			this.typeName = this.labels.type.carousel;
			this.setLabelsDone = true;
			return false;
		},
		/*
		customAfterLoad: function () {
			this.$el.children("div").removeClass("wb-tabs");

			return false;
		},
		*/
		customAfterLoad: function () {
			//this.addControls();
		},
		//-------------------------
		addControls: function () {
			var $bkp = this.getBkp();
			var $el = this.getThisBkp($bkp);

			var $controls = $el.children("ul").eq(0);
			$controls.html("");


			//$controls.append("<li><a href=\"#" + panel.id + "\">" + panel.id + "</a></li>");
			var $panels = this.$el.children(".LOM-holder").children(".LOM-element");
			for (var i = 0; i < $panels.length; i++) {
				$controls.append("<li><a href=\"#" + $panels.eq(i).attr("id") + "\">" + i + "</a></li>");
			}
			$el.children(".tabpanels").children().eq(0).removeClass("out").addClass("in");
			this.saveBkp($bkp);
		}


	});
});
