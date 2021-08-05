define([
	'modules/BaseModule',
	'jquery',
	'./userObj'
], function (BaseModule, $, User) {
	'use strict';
	return BaseModule.extend({
		initialize: function (options) {
			this.options = options;

			this.root = options.root;
			this.progressManager = options.progressManager;

			this.users = [];
			this.userList = [];
			this.$list = $(".userlist");

		},

		reset: function () {
			this.$list.html("");
		},

		initUsers: function () {
			var that = this;
			$.post(this.root.relPath + 'editor.php', {
				action: "getUsers"
			}, function (data) {
				var users = $.parseJSON(data);

				for (var key in users) {
					users[key].username = key;
					that.createUser(users[key]);
				}
				that.inited = true;
				that.root.session.checkSession(); // start loading the session
				that.root.initDone();
				//that.modifyPermissions();
				//that.setupUserManagement();
			}).fail(function () {
				alert("Posting failed while initializing user.");
			});
		},

		createUser: function (options, isSession) {
			options.parent = this;
			this.users[options.username] = new User(options);
			this.userList[this.userList.length] = this.users[options.username];

		},

		initInterface: function () {
			this.generateList($(".userlist"));
			this.initUserManagement($(".userlist"));
		},

		initDom: function (label) {
			var that = this;
			$.get(this.root.relPath + "templates/command/interface-users-edit.html", function (data) {
				var $container = $("main").children(".content");

				$container.html(data);
				$container.find("h2").eq(0).text(label);

				that.initInterface();
			});
		},

		generateList: function ($target, sort) {
			$target.html("");
			var userArray = this.userList;
			userArray = this.sortList(userArray, sort);

			for (var i = 0; i < userArray.length; i++) {

				userArray[i].appendUser($target);

			}
		},

		sortList: function (userArray, sort) {
			//sort = (typeof sort === "undefined") ? "fullname" : sort;
			//userArray=userArray.sort((a, b) => (a.fullname > b.fullname) ? 1 : -1);
			switch (sort) {
				case "level-name":
					userArray = userArray.sort(function (a, b) {
						return (a.role.level > b.role.level) ? 1 : (a.role.level === b.role.level) ? ((a.fullname.toLowerCase() > b.fullname.toLowerCase()) ? 1 : -1) : -1
					});
					break;

				case "team-name":
					userArray = userArray.sort(function (a, b) {
						return (a.team.name.toLowerCase() > b.team.name.toLowerCase()) ? 1 : (a.team.name.toLowerCase() === b.team.name.toLowerCase()) ? ((a.fullname.toLowerCase() > b.fullname.toLowerCase()) ? 1 : -1) : -1
					});
					break;
				default:
					// code block
					userArray = userArray.sort(function (a, b) {
						return (a.fullname.toLowerCase() > b.fullname.toLowerCase()) ? 1 : -1
					});
			}
			//use THIS syntax to avoid confusing IE;

			return userArray;
		},

		initUserManagement: function ($target) {
			var userArray = this.userList;

			for (var i = 0; i < userArray.length; i++) {

				userArray[i].addButtons($target.children("[data-username=" + userArray[i].username + "]"), this.root.session.user.role);
			}
		},


		resetLocations: function () {
			var userArray = this.userList;

			for (var i = 0; i < userArray.length; i++) {

				userArray[i].location = null;
			}

		}


	});
});
