define([
	'modules/BaseModule',
	'jquery',
	'utils',
	'./commObj',
	'./chat-manager',
	'./review-manager'
], function (BaseModule, $, Utils, CommObj, ChatManagerObj, ReviewManagerObj) {
	'use strict';
	return BaseModule.extend({
		initialize: function (options) {
			this.options = options;

			this.root = options.root;
			this.progressManager = options.progressManager;

			this.comms = [];
			this.commList = [];
			this.commsByType = [];
			this.newComms = [];

			this.$chatBtn = $(".LOM-socialboard").find(".ico-LOM-chat");

			this.getComms();
		},
		/* *******************************************
		 * GET COMMS AND INIT OBJECTS
		 * ******************************************/
		getComms: function () {
			var that = this;
			//var $savingMsg, $savedMsg;
			var session = this.root.session.user;
			var userInfo = session.getUserInfoSocial();
			this.setupChatManager();
			this.setupReviewManager();
			$.ajax({
				type: "POST",
				url: this.root.relPath + "editor.php",
				data: {
					action: "getCommsList",
					userInfo: userInfo
				},

				success: function (data) {
					var tempData = $.parseJSON(data);
					that.lastComm = tempData.lastComm;
					//console.log(that.lastComm);
					delete tempData["lastComm"];
					that.initComms(tempData);
					that.reviewManager.refreshDisplay();
				},
				fail: function (data, error, errortext) {
					that.progressManager.handleError(data, error, errortext, "Error while loading Comms");
				}
			});


		},

		receivedWarning: function () {
			var that = this;
			//first shut off the warning
			$.ajax({
				type: "POST",
				url: this.root.relPath + "editor.php",
				data: {
					action: "removeWarning",
					userInfo: this.root.session.user.getUserInfoSocial()
				},

				success: function (data) {
					//alert("NEW MESSAGE!!!");

					var tempData = $.parseJSON(data);
					that.lastComm = tempData.lastComm;
					delete tempData["lastComm"];
					that.initComms(tempData, true);


				},
				fail: function (data, error, errortext) {
					that.progressManager.handleError(data, error, errortext, "Error while loading Comms");
				}
			});
		},


		initComms: function (commsList, refresh) {

			for (var key in commsList) {

				for (var nComm in commsList[key]) {
					this.addComm(commsList[key][nComm], refresh);

				}
			}
			if (refresh) {
				this.refreshComms(commsList);
			} else {
				this.root.socialLoaded();
			}
			this.checkNotifications();
		},

		refreshComms: function (commsList) {

		},
		removeViewed: function (commObj) {
			var removeIndex = 0;

			for (var i = 0; i < this.newComms.length; i++) {
				if (this.newComms[i] === commObj) {
					removeIndex = i;
				}
			}
			this.newComms.splice(removeIndex, 1);
			this.checkNotifications();
		},
		addComm: function (commInfo, refresh) {
			new CommObj({
				parent: this,
				root: this.root,
				type: commInfo.type,
				id: commInfo.id,
				sender: commInfo.sender,
				receiver: commInfo.receiver,
				content: commInfo.content,
				refresh: refresh
			});

		},

		checkNotifications: function () {
			var msgFlag;
			for (var i = 0; i < this.newComms.length; i++) {
				if (this.newComms[i].type === "message") {
					msgFlag = true;
				}
			}
			if (msgFlag) {
				this.$chatBtn.addClass("LOM-social-notification")
			} else {
				this.$chatBtn.removeClass("LOM-social-notification")
			}

			// IF ALL FLAGS
			if (this.newComms.length === 0) {
				//console.log("UPDATE NOTIFICATIONS")
			}
		},
		/* *******************************************
		 * REVIEWS

		 * REVIEWS INTERFACE
		 * ************************************************************/

		setupReviewManager: function () {
			this.reviewManager = new ReviewManagerObj({
				parent: this,
				root: this.root

			});
		},
		/* *******************************************
		 * ANNOUNCEMENTS
		 * ******************************************/
		displayAnnouncements: function ($target) {
			var currentComm;
			$target.html("");
			for (var i = 0; i < this.commsByType["announcement"].length; i++) {

				currentComm = this.commsByType["announcement"][i];
				currentComm.displayList($target);

			}
		},
		/* *******************************************
		 * MESSAGES
		 * ******************************************/
		addMsgInteraction: function ($target) {
			var that = this;
			if (($target.prop("tagName") === "A" || $target.prop("tagName") === "BUTTON") && $target.closest("#LOM-chatbox").length === 0) {

				//var that = this;
				var user = $target.closest("[data-usermsg]").attr("data-usermsg");

				$target.addClass("LOM-msg-user");
				$target.click(function (e) {
					e.preventDefault();
					e.stopPropagation();
					that.chatManager.startChatMode(user);
				});

			}
		},
		/* *******************************************************
		 * CHAT INTERFACE
		 * ************************************************************/

		setupChatManager: function () {
			this.chatManager = new ChatManagerObj({
				parent: this,
				root: this.root

			});
		},


		/* *******************************************************
		 * CREATE NEW COMMS
		 * ************************************************************/
		newMsg: function (params) {
			var content = params.content;

			var emptyCheck = content.length === 0;
			var nullCheck = content === null

			if (!emptyCheck && !nullCheck) {
				this.createMessage(params.content, [params.username]);
			}
			return content;

		},
		createReview: function (newContent, course, location) {
			this.createNewComm("review", newContent, this.root.session.user.username, {
				course: [course],
				location: location
			})

		},
		createAnnouncement: function (newContent) {
			this.createNewComm("announcement", newContent, this.root.session.user.username, {
				user: ["all"]
			})
		},
		createMessage: function (newContent, receiver) {
			this.createNewComm("message", newContent, this.root.session.user.username, {
				user: receiver
			})
		},

		createNewComm: function (type, newContent, sender, receiver) {
			//updateComm
			var that = this;
			//var $savingMsg, $savedMsg;
			var session = this.root.session.user;
			var userInfo = session.getUserInfoSocial();

			//'{ "type": "announcement", "sender": "sjomphe", "receiver": { "user": [ "all" ] }, "content": "stef can now create new announcements" }');
			var commInfo = {
				type: type,
				sender: sender,
				receiver: receiver,
				content: newContent
			}
			$.ajax({
				type: "POST",
				url: this.root.relPath + "editor.php",
				data: {
					action: "createComm",
					userInfo: userInfo,
					commInfo: commInfo
				},

				success: function (data) {
					var commInfo = $.parseJSON(data);
					var newCommInfo = {
						type: commInfo.type,
						id: commInfo.id,
						sender: commInfo.sender,
						receiver: commInfo.receiver,
						content: commInfo.content
					}
					that.addComm(newCommInfo);
					var newObj = that.commList[that.commList.length - 1]



					newObj.afterAdded();

				},
				fail: function (data, error, errortext) {
					that.progressManager.handleError(data, error, errortext, "Error while loading Comms");
				}
			});
		},


		deleteComm: function (commObj) {

			var that = this;
			var session = this.root.session.user;
			var userInfo = session.getUserInfoSocial();
			var commInfo = {
				id: commObj.id,
				type: commObj.type
			}
			$.ajax({
				type: "POST",
				url: this.root.relPath + "editor.php",
				data: {
					action: "deleteComm",
					userInfo: userInfo,
					commInfo: commInfo
				},

				success: function (data) {

					//var commInfo = $.parseJSON(data);
					//SPLICE THINGS
					that.removeCommFromArrays(commObj);
					commObj.commDeleted();


				},
				fail: function (data, error, errortext) {
					that.progressManager.handleError(data, error, errortext, "Error while loading Comms");
				}
			});
		},
		removeCommFromArrays: function (commObj) {
			var i;
			var newArray = [];


			newArray = [];
			for (i = 0; i < this.commsByType[commObj.type].length; i++) {
				if (this.commsByType[commObj.type][i] === commObj) {
					delete this.commsByType[commObj.type][i];

				} else {
					newArray[newArray.length] = this.commsByType[commObj.type][i];
				}
			}
			this.commsByType[commObj.type] = newArray;

			newArray = [];
			for (i = 0; i < this.commList.length; i++) {
				if (!this.commList[i].delete) {
					newArray[newArray.length] = this.commList[i];
				}
			}

			//for (var key in this.comms) {
			delete this.comms[commObj.id]
			//}

		}


	});
});
