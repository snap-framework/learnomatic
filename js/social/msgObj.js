define([

	'jquery',
	'settings-core',
	'./commClass'
], function ($, CoreSettings, CommClass) {
	'use strict';
	return CommClass.extend({
		initialize: function (options) {

			this.options = options;

			this.chat = null;
			this.manager = this.parent.chatManager;

			this.chatUser = this.root.userManager.users[this.findChatName()];
			this.manager.addMsg(this, this.root.userManager.users[this.findChatName()], options.refresh);

		},
		getDisplaySettings: function () {
			var settings = {
				fromWord: false,
				fromName: true,
				fromLink: true
			}
			return settings;
		},

		/* ************************************
		 * CHAT BOX
		 * ***********************************/


		findChatName: function () {
			if (this.senderUsername !== this.root.session.user.username) {
				return this.senderUsername;
			} else {
				return this.receiver.user[0];
			}
		},


		generateContent: function ($target) {
			this.displayList($target, false);
		},

		refreshCustom: function () {

		},

		customAfterAdded: function () {
			var $chatbox = $("#LOM-chatbox")
			if ($chatbox.length > 0) {
				//chatbox is open
				//that.chatManager.addMsg();
				this.generateContent(this.manager.activeChat.$content);
				this.manager.scrollDown();


			}
		},

		/* ************************************
		 * something else
		 * ***********************************/
		//-----------------------
		doSomething: function () {


		}
	});
});
