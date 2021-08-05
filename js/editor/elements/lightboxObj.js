define([

	'jquery',
	'settings-core',
	'./../pageEdit/elementClass',
	'utils',
], function ($, CoreSettings, ElementClass, Utils) {
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
			this.permissions.subElements.html = true;
		},

		setLabels: function () {
			this.typeName = this.labels.type.lightbox;
			this.setLabelsDone = true;
			return false;
		},

		initDefaultDomValues: function ($template) {
			$template.find(".modal-dialog").attr("id", this.id + "_lbx");
			$template.find(".modal-title .LOM-editable").html(this.labels.default.lbxTitle);

			if (Utils.lang === "fr") {
				$template.find(".modal-footer").replaceWith("<div class=\"modal-footer\"><button type=\"button\" id=\"ftrClose\" class=\"btn btn-sm btn-primary pull-left popup-modal-dismiss\" title=\"Fermer&nbsp;: Portable (touche d'échappement)\">Fermer<span class=\"wb-inv\"> Fermer&nbsp;: Portable (touche d'échappement)</span></button></div>");
				$template.find(".modal-header button.mfp-close").replaceWith("<button title=\"Fermer&nbsp;: Portable (touche d'échappement)\" class=\"mfp-close overlay-close\">×<span class=\"wb-inv\"> Fermer&nbsp;: Portable (touche d'échappement)</span></button>");
			}

			return $template;
		},
		initDom: function () {
			this.$el.children(".modal-content").children(".modal-header").prepend("<div class='LOM-delete-on-save LOM-popup-ID'>" + this.id + "_lbx</div>");
		},
		getCustomHolderSelector: function () {
			return ".modal-body.LOM-holder";
		}
	});
});
