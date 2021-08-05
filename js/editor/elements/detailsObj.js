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
			this.permissions.editButtons.classPicker = false;
			this.permissions.subElements.text = true;
			this.permissions.subElements.image = true;
			this.permissions.subElements.custom = true;
			this.permissions.editButtons.review = false;

			if (this.subtype == "graphDesc") {
				this.permissions.editButtons.delete = false;
				this.permissions.subElements.image = false;
				this.permissions.subElements.custom = false;
			}
		},

		setLabels: function () {
			this.typeName = this.labels.type.details;
			this.setLabelsDone = true;
			return false;
		},

		initDom: function () {
			this.$el.removeAttr("open");
			//this.$el.removeClass("acc-group");
			this.$el.children("summary").removeClass("wb-toggle");
			//this.$el.children("summary").removeClass("tgl-tab");
			return false;
		},
		// customizing where the LOM-edit-view (the contextual buttons) appears
		// it needs to be inside the summary.
		appendEditBar: function () {
			this.$el.children("summary").append("<div class=\"LOM-delete-on-save LOM-edit-view\" tabindex=\"-1\"><span class=\"LOM-label\"></span></div>");
			return this.$el.children("summary").children(".LOM-edit-view").eq(0);
		},

		initDefaultDomValues: function ($template) {
			var label = this.labels.default.details;
			if (this.parent.subtype === "tabs") {
				label = this.labels.default.tabs;
			}
			if (this.subtype == "graphDesc") {
				label = this.labels.default.graphDesc;
			}

			if (this.parent.type == "accordion" && this.parent.subtype !== "tabs") {
				$template.find("details").addClass("acc-group");
				$template.find("summary").attr("data-toggle", '{"parent": "#' + this.parent.id + '", "group": ".acc-group"}');
			}

			$template.find(".LOM-editable").html(label);

			return $template;
		},
		//shouldnt this be something else ? 
		firstInitCustom: function () {
			var label = this.labels.default.details;
			if (this.parent.subtype === "tabs") {
				label = this.labels.default.tabs;
			}
			this.$el.find(".LOM-editable").html(label);
			return false;
		}


	});
});