define([
	'jquery',
	'labels',
	'utils',
	'modules/BaseModule',
	'./roleObj',
	'./roles_definition'

], function ($, labels, Utils, BaseModule, RoleObj, RolesDefinition) {
	'use strict';

	return BaseModule.extend({
		initialize: function (options) {
			var that = this;
			that = this;

			this.root = options.root; //masterStructure.root
			this.master = this.root.parent; //masterStructure
			this.defaultRole = "user";

			this.labels = options.labels;

			this.roles = [];//RolesDefinition;
			this.roleList = [];
			this.initRoles(RolesDefinition);

			//this.role=this.getRole(this.defaultRole);
			//console.log("ROLES MANAGERS")
			//$("html").attr("data-role", this.defaultRole);

		},



		getRole: function (role) {
			var newRole = this.roles[role]
			newRole.select();
			return newRole;
			//return RolesDefinition[role];
		},
		initRoles: function () {
			var newRoleObj;
			var that = this;
			for (var key in RolesDefinition) {
				if (RolesDefinition.hasOwnProperty(key)) {
					newRoleObj = new RoleObj({
						parent: that,
						root: this.root,
						name: key,
						definition: RolesDefinition[key],
						template: RolesDefinition["admin"]

					});
					this.roles[key] = newRoleObj
					this.roleList[this.roleList.length] = newRoleObj;
				}
			}
		},

		doSomething: function () {

		}


	});
});

