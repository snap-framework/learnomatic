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
			this.permissions.editButtons.style = true;
			this.permissions.subElements = {
				text: false,
				image: false,
				custom: false,
				details: false
			};
			if (this.subtype === "html") {
				this.permissions.editButtons.add = false;
				this.permissions.editButtons.config = false;
				this.permissions.editButtons.classPicker = false;
			}
			if (this.parent.subtype === "graphDesc") {
			}
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
				case "html":
					this.typeName = this.labels.type.html;
					break;
				default:
					this.typeName = this.labels.type.text;
					break;
			}

			this.setLabelsDone = true;
			return false;
		},

		initDefaultDomValues: function ($template) {
			$template.find(".LOM-default-text").html(this.labels.default.text)

			return $template;
		},
		/*---------------------------------------------------------------------------------------------
		-------------------------CONTENT UPDATING
		---------------------------------------------------------------------------------------------*/
		changeContent: function (newContent) {
			var edit = this.edits[0];
			var $edit = edit.$el;
			$edit.html(newContent);
			$edit.next().html(newContent);
			edit.saveUpdate();
		},

		/*---------------------------------------------------------------------------------------------
		-------------------------CONFIGURATION
		---------------------------------------------------------------------------------------------*/

		//-------------------------
		doSomething: function () {


		}
	});
});
