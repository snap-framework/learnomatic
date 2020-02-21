define([

	'jquery',
	'settings-core',
	'./../pageEdit/elementClass'
], function ($, CoreSettings, ElementClass) {
	'use strict';
	return ElementClass.extend({
		initialize: function (options) {

			this.options = options;
			if (this.parent.type === "video") {
				this.parent.updateTextToTranscript(this);
			}


		},
		changePermissions: function () {
			this.permissions.editButtons.add = false;
			this.permissions.editButtons.config = (this.parent.type === "video") ? true : false;
			this.permissions.editButtons.classPicker = true;
			this.permissions.editButtons.ribbonPicker = true;
			this.permissions.subElements = {
				text: false,
				image: false,
				custom: false,
				details: false
			};

		},

		initDom: function () {
			if (this.$el.find("h1").length > 0 && this.subtype === "title") {
				this.permissions.editButtons.delete = false;
			}
			return false;
		},


		setLabels: function () {
			switch (this.subtype) {
				case "title":
					this.typeName = this.labels.type.title;
					break;
				default:

					this.typeName = this.labels.type.text;
			}
			return false;
		},
		autoEdit: function () {
			var $editView = this.$el.children(".LOM-edit-view");
			if ($editView.children("button.ico-SNAP-edit").length > 0) {
				//activate this edit
				this.edits[0].activate();
				this.$el.addClass("LOM-editing");
				$editView.children("button.ico-SNAP-edit").addClass("ico-SNAP-save").removeClass("ico-SNAP-edit");
				this.autoFocus();
			} else {
				$editView.children("button.ico-SNAP-save").addClass("ico-SNAP-edit").removeClass("ico-SNAP-save");
				this.edits[0].deactivate();
				this.editor.savePage();
			}
		},

		/*---------------------------------------------------------------------------------------------
		-------------------------CONFIGURATION
		---------------------------------------------------------------------------------------------*/

		//-------------------------
		doSomething: function () {


		}
	});
});
