define([
	'jquery',
	'labels',
	'settings-core',
	'utils',
	'modules/BaseModule'

], function ($, labels, CoreSettings, Utils, BaseModule) {
	'use strict';

	return BaseModule.extend({
		initialize: function (options) {

			this.parent = options.parent; //masterStructure.editor

			this.name = options.name;
			this.labels = options.labels;
			this.permissions = options.obj;

		},
		select: function () {
			this.setStyle();
		},
		setStyle: function () {
			$("html").attr("data-role", this.name);
		},


	});
});
