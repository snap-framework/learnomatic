define([
	'jquery',
	'modules/BaseModule'

], function ($, BaseModule) {
	'use strict';
	return BaseModule.extend({
		initialize: function (options) {
			this.options = options;

			this.root = options.root;
			this.parent = options.parent;
			this.progressManager = options.progressManager;

			this.user = options.user;
			this.lastStamp;

			this.msgList = [];

			this.$userBtn = null;
			this.$content = null;
			this.viewed = true;

			this.mostRecentMsg;

		},
		addMsg: function (msgObj, refresh) {
			this.msgList[this.msgList.length] = msgObj;
			msgObj.chat = this;
			if (refresh) { this.refresh(msgObj); }
			if (!msgObj.viewed) {
				this.initViewed();
			}

		},
		initChat: function () {
			if (this.msgList.length > 0) {
				this.$userBtn = this.moveUserToChats();
				if (!this.viewed) { this.$userBtn.addClass("LOM-chat-notification") }
				this.generateContent();
				this.initButtonClick();
			}

		},
		preInit: function () {
			var un = this.user.username;
			this.$userBtn = this.parent.$userList.children("li[data-username='" + un + "']");
			this.preGenerateContent();
			this.initButtonClick();

		},

		initButtonClick: function () {
			var that = this;
			this.$userBtn.click(function () {
				that.buttonClicked();
			});
		},
		buttonClicked: function () {
			this.activate();
		},

		moveUserToTop: function () {
			return this.$userBtn.prependTo(this.parent.$chatList)
		},
		moveUserToBottom: function () {
			return this.$userBtn.prependTo(this.parent.$chatList)
		},

		moveUserToChats: function () {
			var un = this.user.username;
			this.$userBtn = this.parent.$userList.find("[data-username='" + un + "']");
			return this.$userBtn.prependTo(this.parent.$chatList)

		},
		moveUserToUsers: function () {
			var un = this.user.username;
			this.$userBtn = this.parent.$chatList.find("[data-username='" + un + "']");
			return this.$userBtn.prependTo(this.parent.$userList)

		},

		preGenerateContent: function () {
			var un = this.user.username;
			this.parent.$content.append("<ul class='LOM-chat-content' data-user-content='" + un + "'></ul>")
			this.$content = this.parent.$content.children("[data-user-content='" + un + "']")

		},

		generateContent: function () {
			this.preGenerateContent();
			var desc = this.sortByDate("asc");
			this.mostRecent = desc[0];
			for (var i = 0; i < desc.length; i++) {
				desc[i].generateContent(this.$content);
			}
			//console.log("moving this to top "+this.user.username);
			this.moveUserToTop();
		},

		activate: function () {
			var that = this;

			this.parent.deactivateAll();

			if (this.msgList.length === 0) {
				this.$userBtn = this.moveUserToChats()
			}
			//change the display and stuff
			this.parent.activeChat = this;
			this.$userBtn.addClass("LOM-chat-active");
			this.$content.show();
			this.parent.scrollDown();
			this.parent.$chatField.val("");
			setTimeout(function () {
				that.parent.$chatField.focus();
			}, 50);
			this.markMsgViewed();
			//console.log(this.parent.parent)
		},

		deactivate: function () {

			if (this.msgList.length === 0) {
				this.moveUserToUsers()
			}

			this.$userBtn.removeClass("LOM-chat-active");
			if (this.$content !== null) {
				this.$content.hide();
			}
		},

		refresh: function (msg) {
			if (this.$content !== null) {
				//this.moveUserToChats();
				//this.moveUserToTop();
				msg.generateContent(this.$content);
				this.parent.scrollDown();
			}
		},

		initViewed: function () {
			this.viewed = false;
		},

		markMsgViewed: function () {
			for (var i = 0; i < this.msgList.length; i++) {
				this.msgList[i].setViewed();
			}
			this.viewed = true;
			this.$userBtn.removeClass("LOM-chat-notification");

		},

		sortByDate: function (order) {
			var dateArray = [];
			for (var i = 0; i < this.msgList.length; i++) {
				dateArray[dateArray.length] = this.msgList[i].id;
			}

			if (order === "asc") {
				dateArray = dateArray.sort();
			} else {

				dateArray = dateArray.sort(function (a, b) { return b - a; });
			}

			var newArray = [];

			for (var j = 0; j < dateArray.length; j++) {
				newArray[newArray.length] = this.root.social.comms[dateArray[j]];
			}
			return newArray;

		}


	});
});
