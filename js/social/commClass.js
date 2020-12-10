define([
	'underscore',
	'jquery',
	'helpers/BaseClass',
	'utils',
	'./../helpers/tools',

], function (_, $, BaseClass, Utils, Tools) {
	'use strict';

	// Usage: var Module = BaseModule.extend({});
	// ...
	// var myModule = new Module({options});


	return BaseClass.extend({
		//Base init.
		//This will be called *before* the init of the module extending this class
		//
		//Note: options here are attached from the Module instantiation. e.g.: new Module(options)
		__initialize: function (options) {
			var that = this;
			var args = arguments;
			//module id
			//creates a unique id for the module in case
			this.mid = _.uniqueId();

			//-------------------CONSTANTS-------------

			options = options || {};
			this.options = options;
			//this.params = options.params;


			/*------------------------- properties ---------------------*/
			this.id = options.id;
			this.type = options.type;
			this.lang = Utils.lang;

			this.viewed = true;

			this.date = new Date(this.id * 1000);
			//console.log(this.date.toLocaleString());
			/*------------------------- customized params ---------------------*/
			this.subtype = null;


			//--------------relations
			this.parent = options.parent;
			this.root = options.root

			this.senderUsername = options.sender;
			this.receiver = options.receiver;
			this.isFromMe = (this.senderUsername === this.root.session.username);
			//--------------content management
			this.content = options.content;

			this.displaySettings = this.getDisplaySettings();


			this.viewed = this.initViewed();

			//----------------
			that.initialize.apply(that, args);


			if (options.refresh) {
				this.refresh();
			}
		},

		/*---------------------------------------------------------------------------------------------
		-------------------------PARAMETERS definition
		---------------------------------------------------------------------------------------------*/
		getParams: function (options) {
			if (typeof options.params !== "undefined") {
				this.subtype = (typeof options.params.subtype !== "undefined") ? options.params.subtype : null;

			}

		},

		/*---------------------------------------------------------------------------------------------
		-------------------------update
		---------------------------------------------------------------------------------------------*/
		afterAdded: function () {

			this.customAfterAdded();
		},

		refreshContent: function (content) {
			this.content = content;
			var commInfo = {
				id: this.id,
				content: content
			};
			this.saveInfo(commInfo);
		},

		//this MIGHT not be needed much
		saveInfo: function (commInfo) {
			//updateComm
			var that = this;
			//var $savingMsg, $savedMsg;
			var session = this.root.session.user;
			$.ajax({
				type: "POST",
				url: this.root.relPath + "editor.php",
				data: {
					action: "updateComm",
					userInfo: session.getUserInfoSocial(),
					commInfo: commInfo //'{ "id": "1598576471", "sender": "sjomphe", "receiver": { "user": [ "all" ] }, "content": "Warning: incoming Game" }'
				},

				success: function () {
					//console.log(data);
					//that.masterCommList=$.parseJSON(data);

				},
				fail: function (data, error, errortext) {
					that.progressManager.handleError(data, error, errortext, "Error while loading Comms");
				}
			});
		},




		refresh: function () {
			this.customRefresh();

		},


		initViewed: function () {
			var lastViewed = parseInt(this.parent.lastComm, 10);
			var thisTime = parseInt(this.id, 10);
			var diff = thisTime - lastViewed;

			if (diff > 0 && this.senderUsername !== this.root.session.username) {
				this.addNewComm();
				return false;
			}
			return true;

		},

		setViewed: function () {
			this.removeComm();
		},

		addNewComm: function () {
			this.parent.newComms[this.parent.newComms.length] = this;
			this.refresh();

		},
		removeComm: function () {
			this.viewed = true;
			this.parent.removeViewed(this);
		},
		/* *******************************************
		 * DISPLAY
		 * ******************************************/

		displayList: function ($target, level) {
			var $el;
			var fromMe = (this.isFromMe) ? " LOM-comm-From" : "";
			level = (typeof level === "undefined") ? "4" : level;

			//make the container
			$target.append("<li id='comm_" + this.id + "' class='LOM-" + this.type + fromMe + "'></li>")
			$el = $("#comm_" + this.id);
			//heading, is there a title?
			var header = this.getCommHeader();

			if (typeof this.title !== "undefined") {
				$el.append("<h" + level + ">" + this.title + "</h" + level + ">");
				$el.append("<p class='smaller'>" + header + "</p>")
			} else {
				$el.append("<h" + level + ">" + header + "</h" + level + ">");
			}
			//add "click to chat"
			this.parent.addMsgInteraction($el.find(".LOM-comm-from-link"));
			//add interaction holder
			$el.append("<div class='LOM-comm-btn-holder'></div>")
			//create the content
			$el.append("<section class='LOM-" + this.type + "-content'>" + this.content + "</section>");



			//add buttons
			this.customDisplayAddButtons();
			if (this.canDelete) {
				this.appendDeleteButton($el.children(".LOM-comm-btn-holder"));
			}
			return $el;
		},


		getTitle: function () {
			var $content = $("<div>");
			$content.html(this.content);
			var title = $content.children("title").text();
			$content.children("title").remove();
			this.content = $content.html();
			return title;
		},
		appendDeleteButton: function ($target) {
			var that = this;
			$target.append("<button class='snap-xs ico-SNAP-delete delete-" + this.type + "' title='Delete " + this.type + "'>Delete " + this.type + "</button>");
			var $delBtn = $target.children("button.ico-SNAP-delete");
			$delBtn.click(function () {
				$target.closest(".LOM-" + that.type).fadeOut(300, function () {
					var $container = $target.closest("ul");
					$(this).remove();
					that.deleteComm($container);
				});


			});
			return false;
		},
		deleteComm: function ($target) {
			this.delete = true;
			this.parent.deleteComm(this);
			if ($target.children().length === 0) {
				this.customDeleteLast($target);
			}

		},

		commDeleted: function () {
			this.customDeleteActions();

		},


		generateElementAction: function ($target, element) {
			this.customElementAction($target, element);
		},

		/* *******************************************
		 * COMM HEADER
		 * ******************************************/
		getDisplaySettings: function () {
			var settings = {
				fromWord: true,
				fromName: true,
				fromLink: true
			}
			return settings;
		},
		getCommHeader: function () {
			var from = this.getHeaderFrom();
			var date = this.getHeaderDate();

			return from + " " + date;

		},
		getHeaderFrom: function () {
			var string = "";
			if (this.displaySettings.fromWord) {
				string += "<span class='LOM-comm-from-word'>From </span>";
			}
			if (this.displaySettings.fromName) {
				var session = this.root.session.user;
				var senderUsername = this.senderUsername;
				var diffUser = (senderUsername !== session.username) ? true : false;


				if (this.displaySettings.fromLink && diffUser) {
					var fullname = this.root.userManager.users[senderUsername].fullname;
					string += "<a href='#' class='LOM-comm-from-link LOM-msg-user' data-usermsg='" + senderUsername + "'>" + fullname + "</a>";
				} else {
					string += "<span class='LOM-comm-from-link'>" + ((diffUser) ? session.fullname : "You") + "</span>";
				}
			}
			return string;
		},
		getHeaderDate: function () {
			var string = "";
			string += "<span class='LOM-comm-from-date'>" + this.date.toLocaleString() + "</span>";
			return string;
		},
		/* *****************************************************************************
		 * CUSTOM METHODS
		 * ****************************************************************************/
		// action on add
		customAfterAdded: function () {
			return false;
		},
		// action depends on element
		customElementAction: function () {
			return false;
		},
		customRefresh: function () {
			return false;
		},
		// action on delete
		customDeleteActions: function () {
			return false;
		},
		// action on delete last
		customDeleteLast: function () {
			return false;
		},
		// add an ADD button
		customDisplayAddButtons: function () {
			return false;
		}

	});
});
