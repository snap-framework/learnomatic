//consider replacing this with PHP?

define([
	'jquery',
	'settings-core',
	'modules/BaseModule',
	'./msgObj',
	'./announcementObj',
	'./postObj',
	'./reviewObj',
	'./notificationObj'
], function ($, CoreSettings, BaseClass, CommMsgObj, CommAnnouncementObj, CommPostObj, CommReviewObj, CommNotificationObj) {
	'use strict';
	return BaseClass.extend({
		initialize: function (options) {

			this.options = options;
			this.parent = options.parent;
			//options.parent=this;

			//detect comm type. if one is passed through
			if (typeof options.type !== "undefined") {
				this.commType = options.type;
			} else {
				this.commType = "default";
			}

			//decide which object type
			var newObj;
			//console.log(this.commType);
			switch (this.commType) {
				case "message":
					newObj = new CommMsgObj(options);
					break;
				case "announcement":
					newObj = new CommAnnouncementObj(options);
					break;
				case "post":
					newObj = new CommPostObj(options);
					break;
				case "review":
					newObj = new CommReviewObj(options);
					break;
				case "notification":
					newObj = new CommNotificationObj(options);
					break;
				/*
message: (direct message between two users)
sender : username
receiver : parameter( usernames)
message : text
dateSend : timestamp
viewed : bool

post (in team board or course board)
sender : username
receiver : parameters
message : text
datesend: timestamp
viewed : parameters

announcement: (from the system admins)
sender: system
receiver : parameters?
message : text, maybe both languages
dateSend : timestamp
viewed : parameters (usernames)

notification: (something new is happening somewhere)
sender : system
receiver: parameters
message : generated
datesend :timestamp
viewed : parameters (usernamex)

review : (a person left a review note in a course)
sender : username
receiver : parameters
message : text
datesend: timestamp
viewed : parameters (usernamex)					
				*/


				/*
								case "checkbox":
									options.type = "radiobtn";
									options.params = {
										"subtype": "checkbox"
									};
									//console.log(params)
									//newObj = new commRadiobtnObj(options);
									break;
				*/
				default:
					//default

					break;
			}
			//return newObj;
			this.parent.commList[this.parent.commList.length] = newObj;
			this.parent.comms[options.id] = newObj;


			if (typeof this.parent.commsByType[options.type] === "undefined") {
				this.parent.commsByType[options.type] = [];
			}
			this.parent.commsByType[options.type][this.parent.commsByType[options.type].length] = newObj;

		}
	});
});
