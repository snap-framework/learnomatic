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

			this.parent = options.parent; //roles manager
			this.root = options.root;

			this.name = options.name;
			this.permissions = [];
			this.permissionList = [];

			this.definition = options.definition;
			this.level = parseInt(this.definition.level, 10);

			this.setPermissions(options.template);


		},
		select: function () {
			this.setStyle();
		},
		setStyle: function () {
			$("html").attr("data-role", this.name);
		},
		setPermissions: function (template) {

			var permissionTitle;
			for (var category in template) {
				for (var permission in template[category]) {
					permissionTitle = (permission === "default") ? category : permission;
					this.permissions[permissionTitle] = (typeof this.definition[category][permission] === "undefined") ? this.definition[category]["default"] : this.definition[category][permission];
				}
			}

		},

		checkPermission: function (permName) {
			return this.permissions[permName];
		}

	});
});
