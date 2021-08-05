define([
	'jquery',
	'labels',
	'utils',
	'modules/BaseModule',
	'settings-core'

], function ($, labels, Utils, BaseModule, CoreSettings) {
	'use strict';

	return BaseModule.extend({
		initialize: function (options) {
			var that = this;
			that = that;

			this.parent = options.parent; //masterStructure.editor
			this.editor = this.parent.editor;
			this.root = this.editor;
			this.master = this.parent.master; //masterStructure
			this.set = this.parent;
			this.scheme = this.set.parent;
			this.manager = this.scheme.parent;


			this.isComment = true;
			this.value = options.data.comment;
			this.cleanValue();


		},

		cleanValue: function () {

			var labelName = this.value.substring(2).replace(/-/g, ' ');
			this.label = labelName;
			this.subGroup = this.value.substring(2).replace(/[^0-9a-z]/gi, '').toLowerCase();
			this.subGroupId = this.parent.name + "_" + this.subGroup;

		},

		fetchCode: function () {
			return "\n\n" + this.value + "";
		},

		connectDom: function () {
		}



	});
});

