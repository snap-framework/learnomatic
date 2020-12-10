define([

	'jquery',
	'./../helpers/tools',
	'./commClass'
], function ($, Tools, CommClass) {
	'use strict';
	return CommClass.extend({
		initialize: function (options) {

			this.options = options;
			this.page = null;
			this.element = null;
			this.manager = this.parent.reviewManager;

			this.checkPosition();

			this.title = this.getTitle();

			this.canDelete = this.checkCanDelete();


		},

		/* ************************************************
		 * GETTING REVIEW INFO
		 * **********************************************/

		checkPosition: function () {

			var tempArray = this.receiver.location.split("#");
			this.course = this.receiver.course[0];
			this.page = tempArray[0];
			this.elementId = tempArray[1];

		},

		checkFilter: function (course, page, id) {
			if (typeof course !== "undefined") {
				//course is worth something
				if (this.course !== course) {
					//if the course doesnt match
					return false;
				} else {
					//course is fine
					if (typeof page !== "undefined") {
						//page is woreth something
						if (this.page !== page) {
							//page doesnt match
							return false;
						} else {
							//page is fine
							if (typeof id !== "undefined") {
								//ID is worth something
								if (this.elementId !== id) {
									return false;
								}
							}
						}
					}

				}


			}
			return true;
		},
		/* ************************************************
		 * DOM
		 * **********************************************/
		generateContent: function ($target, level) {
			level = (typeof level === "undefined") ? 3 : level;
			var $elem = this.displayList($target, level);
			var $reviewBox = $elem.closest("#LOM-review-box");

			if ($reviewBox.hasClass("LOM-review-element")) {
				var reviewedElement = $reviewBox.attr("data-review-element");
				var uniqueId = this.course + "?" + this.page + "#" + this.elementId;


				if (reviewedElement !== uniqueId) {

					$elem.remove();
					return false;
				} else {
					$elem.attr("data-unique-element-id", uniqueId)
				}
			}



			return $elem;



		},

		generateHtml: function ($target) {

			var $elem = this.displayList($target);
			return $elem;
		},
		customElementAction: function ($target, element) {
			var that = this;
			if (element.type === "text") {
				var icon = "QS-check";
				$target.prepend("<button class='snap-xs ico-" + icon + " apply-" + this.type + "' title='Apply " + this.type + "'>Apply " + this.type + "</button>");
				var $delBtn = $target.children("button.ico-" + icon + "");

				var elValue = $.trim(element.edits[0].$el.next().html())
				var content = $.trim(this.content);
				if (elValue === content) {
					this.lockApply($target.parent())
				}

				$delBtn.click(function () {
					that.lockApply($target.parent());
					element.changeContent(that.content)

				});


			}

			return false;
		},

		lockApply: function ($review) {

			$review.find("button.apply-" + this.type).prop('disabled', true);
			//
			$review.addClass("is-applied");//children(":not(.LOM-comm-btn-holder)").add("opacity","0.5");
		},

		/* ************************************************
		 * DELETING REVIEWS
		 * **********************************************/

		// action on add
		customAfterAdded: function () {

			this.manager.reviewAdded(this);
		},

		/* ************************************************
		 * DELETING REVIEWS
		 * **********************************************/
		checkCanDelete: function () {
			var username = this.root.session.user.username;
			var perms = this.root.session.user.role.permissions;
			var canSee = perms.seeReviews;
			var canDelete = (perms.deleteAllReviews || this.senderUsername === username) ? true : false;
			return (canSee && canDelete);

		},

		customDeleteActions: function () {
			this.manager.refreshDisplay();
			this.manager.afterDelete();
		},


		/* ************************************************
		 * 
		 * **********************************************/
		//-----------------------
		doSomething: function () {


		}
	});
});
