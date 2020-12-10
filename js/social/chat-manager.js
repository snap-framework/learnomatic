define([
	'modules/BaseModule',
	'jquery',
	'./chatObj'
], function (BaseModule, $, ChatObj) {
	'use strict';
	return BaseModule.extend({
		initialize: function (options) {
			this.options = options;

			this.root = options.root;
			this.parent = options.parent;
			this.progressManager = options.progressManager;

			this.chatsByUser = [];
			this.chatList = [];
			this.activeChat = null;

			this.$popper;
			this.$chatList;
			this.$userList;
			this.$chatField;
			this.$chatSend;

		},

		addMsg: function (msgObj, chatUser, refresh) {
			if (typeof chatUser === "undefined") {
				chatUser = this.activeChat.user;
			}

			if (typeof this.chatsByUser[chatUser.username] === "undefined") {
				this.addChat(chatUser);
			}

			this.chatsByUser[chatUser.username].addMsg(msgObj, refresh);

		},

		addChat: function (chatUser) {
			var newChatObj = new ChatObj({
				parent: this,
				root: this.root,
				user: chatUser
			})
			this.chatsByUser[chatUser.username] = newChatObj;
			this.chatList[this.chatList.length] = newChatObj;
			return newChatObj;
		},

		startChatMode: function (specificUser) {
			var that = this;
			$.magnificPopup.open({
				items: {
					src: this.root.relPath + 'templates/social/chatBox.html'
				},
				type: 'ajax',
				removalDelay: 500,
				callbacks: {
					beforeOpen: function () {
						this.st.mainClass = "mfp-zoom-in";
					},
					ajaxContentAdded: function () {
						that.$popper = $(this.content);
						that.$popper.children("header").children("h2").html("Chat Box");
						// initiate jquery stuff
						that.setDom();
						//add all the usernames
						that.populateUserList(that.$userList);
						//the converastions
						that.initChats();
						that.orderChats("asc");
						var firstUser = that.$chatList.children().eq(0).attr("data-username")
						//the would-be conversations
						that.preInitChats();
						//the SEND button and stuff
						that.initTextfield();
						var username = (typeof specificUser === "undefined") ? firstUser : specificUser;
						that.activateChat(username);

					}
				},
				midClick: true
			});


		},



		setDom: function () {
			this.$userList = this.$popper.find(".LOM-chat-fulluserlist");
			this.$chatList = this.$popper.find(".LOM-chat-userlist");
			this.$content = this.$popper.find(".LOM-chat-container");
			this.$chatField = this.$popper.find(".LOM-chat-textbox").children("div").children("input");
			this.$chatSend = this.$popper.find(".LOM-chat-textbox").children("div").children("button");
		},

		populateUserList: function ($target) {
			this.root.userManager.generateList($target);
		},

		initChats: function () {
			for (var i = 0; i < this.chatList.length; i++) {
				this.chatList[i].initChat();
			}
		},

		preInitChats: function () {

			var username;
			for (var i = 0; i < this.$userList.children("li").length; i++) {
				username = this.$userList.children("li").eq(i).attr("data-username");
				var user = this.root.userManager.users[username];
				var newChat = this.addChat(user);
				newChat.preInit();
			}

		},

		orderChats: function (order) {
			var msgList = this.parent.commsByType["message"];


			for (var i = 0; i < msgList.length; i++) {
				if (order === "asc") {
					msgList[i].chat.moveUserToTop();
				} else {
					msgList[i].chat.moveUserToBottom();
				}
			}


		},

		initTextfield: function () {
			var that = this;

			this.$popper.find("form").submit(function (event) {
				//alert( "Handler for .submit() called." );
				event.preventDefault();

				var msg = that.$chatField.val();
				that.$chatField.val("");

				var params = {
					content: msg,
					username: that.activeChat.user.username
				}
				that.parent.newMsg(params);
				var chat = that.chatsByUser[that.activeChat.user.username];
				chat.moveUserToTop();

			});
		},

		scrollDown: function () {
			this.$content.animate({ scrollTop: this.$content.eq(0).prop("scrollHeight") }, 1000);
		},

		activateChat: function (username) {
			this.chatsByUser[username].activate();

		},

		deactivateAll: function () {
			this.activeChat = null;
			for (var i = 0; i < this.chatList.length; i++) {
				this.chatList[i].deactivate();
			}

		}

	});
});
