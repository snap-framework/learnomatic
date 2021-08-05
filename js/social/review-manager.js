define([
	'modules/BaseModule',
	'jquery',
	'utils'
], function (BaseModule, $, Utils) {
	'use strict';
	return BaseModule.extend({
		initialize: function (options) {
			this.options = options;

			this.root = options.root;
			this.parent = options.parent;
			this.progressManager = options.progressManager;

			this.pages = [];


			var that = this;
			if (this.root.type === "editor") {

				$(this.root.parent).on("Framework:pageLoaded", function () {

					that.pageLoaded();
				});
				that.pageLoaded();
			}

		},

		/** ***************************************
		 * POPUP review listings
		 * **********************************************/
		popReviews: function (element) {
			var that = this;
			this.root.lbxController.pop({
				action: this.reviewPopped,
				obj: this,
				title: "Reviews",
				file: "templates/social/reviewLbx-ui_en.html",
				element: element
			});


		},

		reviewPopped: function ($popper, params) {
			var that = params.obj;
			var element = params.element;
			that.$modal = $popper;
			that.setupNav();

			that.setupMain();

			that.populate();
			that.setupGoto();

			//modify the display
			if (typeof element !== "undefined") {
				that.$modal.addClass("LOM-review-element").attr("data-element-id", element.id);
				that.activateElement(element);
			} else {
				var uid = that.$pages.children("li").eq(0).attr("data-page-uid")
				that.activatePage(uid);
			}

			that.setupAddReview();


		},


		/* ********************************************************
		 * INTERFACE GENERATING
		 * *******************************************************/

		setupNav: function () {
			this.$nav = this.$modal.children("div.row").children("nav.LOM-rev-nav");

			this.$nav.addClass("row").html("")
			this.$nav.append("<div class='col-sm-4 review-courses'><h3>Course List</h3><ul class='courselist'></ul></div>");
			this.$nav.append("<div class='col-sm-8 review-pages'><h3>Pages</h3><ul class='pagelist'></ul></div>");

			this.$courses = this.$nav.children(".review-courses").children("ul");
			this.generateCourseList();
			this.$pages = this.$nav.children(".review-pages").children("ul");

		},


		generateCourseList: function () {
			var that = this;
			this.$courses.html("");
			this.root.courseManager.generateList(this.$courses);
			this.$courses.children("li").children("a").attr("href", "#").click(function (e) {
				e.preventDefault();
				e.stopPropagation();

				var courseCode = $(this).parent().attr("data-course");
				var pageUid = that.$pages.children("li[data-page-uid*=\"" + courseCode + "?\"]").eq(0).attr("data-page-uid");
				that.activatePage(pageUid);

				return false;
			});

		},


		setupMain: function () {
			this.$main = this.$modal.children("div.row").children("main.LOM-rev-content").children("ul.reviews");
		},

		/* ********************************************************
		 * POPULATE
		 * *******************************************************/
		populate: function () {
			var revList = this.parent.commsByType["review"];
			if (typeof revList !== "undefined") {
				for (var i = 0; i < revList.length; i++) {
					//appendPage
					this.appendPage(revList[i].course, revList[i].page);
					//create page reviews
					this.appendReview(revList[i], this.$main);

				}
				if (this.root.type === "editor") {
					var location = this.root.session.user.location;

					//check if the page exists
					if (this.$pages.children("[data-page-uid='" + location.code + "']").length === 0) {

						// create a page that doesnt exist.
						this.appendPage(location.course.code, location.page);
					}

				}
			}
		},

		appendPage: function (courseCode, page) {
			var that = this;
			var pageUID = courseCode + "?" + page;
			var $page = this.$pages.children("[data-page-uid='" + pageUID + "']");
			if ($page.length === 0) {
				this.$pages.prepend("<li class='review-page' data-page-uid='" + pageUID + "'><a href='#'><span>" + page + "</span></a></li>");
				$page = this.$pages.children("[data-page-uid='" + pageUID + "']");
				//this.$main.prepend("<ul class='reviews' data-review-page-uid='"+pageUID+"'></ul>")
			}
			this.$courses.children("li[data-course='" + courseCode + "']").addClass("LOM-review-course")
			$page.click(function () {
				that.activatePage(pageUID);
				return false;
			});

			//return this.$main.children("[data-review-page-uid='"+pageUID+"']");
		},


		appendReview: function (review, $page) {
			var $review = review.generateHtml($page);
			var uid = review.course + "?" + review.page + "#" + review.elementId;
			$review.attr("data-review-element-uid", uid);

			//generateElementAction


		},

		/* ********************************************************
		 * INTERFACE INTERACTIONS
		 * *******************************************************/

		addClicked: function () {
			this.$addBtn.hide();
			this.$new.show();
		},

		confirmClicked: function (fieldId) {
			//RESET THE VALUES
			this.$addBtn.show();
			this.$new.hide();

			var newContent = "<title>" + $("#title").val() + "</title>" + this.getReviewValue(fieldId);
			var userLoc = this.root.session.user.location;
			var elementId = this.$modal.attr("data-element-id");

			elementId = (typeof elementId === "undefined") ? "LOM_el_1" : elementId;
			var location = userLoc.page + "#" + elementId;
			this.parent.createReview(newContent, userLoc.course.code, location);
			//SKIP TO REVIEWADDED();

		},

		gotoClicked: function ($btn) {
			var courseCode = $btn.attr("data-goto-course");
			var pageCode = $btn.attr("data-goto-page");
			var location = this.root.session.user.location;
			if (location.course.code === courseCode) {

				if (location.page === pageCode) {
					//no action
					return false;
				} else {
					//same course, different page
					this.root.ui.modes["pageEdit"].modeClicked();
					window.fNav(pageCode);
					return true;
				}
			} else {
				//DIFFERENT COURSE
				var url = "./../" + courseCode + "/index_" + Utils.lang + ".html?state=" + pageCode;
				window.location.href = url;

				return true;
			}
		},

		// ---------------- INTERACTION SETUP

		setupAddReview: function () {

			var that = this;
			var fieldId = "LOM-review-content-CKE";
			//decalre DOM objects
			this.$addBtn = this.$main.siblings("button.add-review");
			this.$new = this.$main.siblings("div.LOM-new-review").hide();
			//labels
			var title = (Utils.lang === "en") ? "Title" : "Titre";
			var review = (Utils.lang === "en") ? "Review" : "Révision";
			var defaultcontent = (Utils.lang === "en") ? "Insert the content of your review here" : "Inserer le contenu de votre révision ici";
			var addMsg = (Utils.lang === "en") ? "Add a review" : "Ajouter une révision";
			//append to dom
			this.$new.append("<p><label>" + title + ": <input type=\"text\" id=\"title\" value=\"" + review + "\"></label></p>")
			this.$new.append("<p><label>Content: <div class=\"review-content\"><textarea id=\"" + fieldId + "\">[" + defaultcontent + "]</textarea></div></label></p>")
			this.$new.append("<p><button class=\"snap-sm ico-QS-check\">" + addMsg + "</button></p>")

			//initialize CKE
			window.CKEDITOR.inline(fieldId, this.configCKEForReview());
			this.$confirmNew = this.$new.find("button");

			var createPerm = that.root.session.user.role.permissions.createReviews;
			if (createPerm) {

				this.$addBtn.show();
			} else {
				this.$addBtn.hide();
			}
			//INIT ONCLICK
			this.$addBtn.click(function () {
				that.addClicked();
			});
			//INIT ONCLICK CONFIRM
			this.$confirmNew.click(function () {
				that.confirmClicked(fieldId);
			});

		},


		setupGoto: function () {
			var that = this;
			this.$gotoBtn = this.$main.siblings(".LOM-goto-container").children("a.LOM-goto");
			this.$gotoBtn.click(function () {
				that.gotoClicked($(this));
			})
		},

		// ---------------- AFTER ACTIONS

		afterDelete: function () {
			var uid = this.$pages.children("li.LOM-page-active").attr("data-page-uid");
			this.activatePage(uid);
		},
		reviewAdded: function (review) { //add reviewObj to variables
			this.$main.children(".LOM-empty-review").hide();
			this.appendReview(review, this.$main);
			this.refreshDisplay();
		},


		/* ********************************************************
		 * ACTIVATE NAVIGATION
		 * *******************************************************/
		activatePage: function (uid) {
			var courseCode = uid.split("?")[0];
			var pageCode = uid.split("?")[1];

			//ACTIVATE THE PARENT COURSE
			this.activateCourse(courseCode);

			//ACTIVATE THE CURRENT PAGE
			var $li = this.$pages.children("li[data-page-uid='" + uid + "']");
			this.$pages.children().removeClass("LOM-page-active");
			$li.addClass("LOM-page-active");

			//SHOW HIDE REVIEWS
			var $reviews = this.$main.children("li[data-review-element-uid*='" + uid + "']");
			this.$main.children("li").hide();
			$reviews.show();
			if ($reviews.length === 0) {
				this.$main.children(".LOM-empty-review").show();
			}
			this.$gotoBtn.attr("data-goto-page", pageCode)
			this.$gotoBtn.attr("data-goto-course", courseCode);

		},
		activateCourse: function (courseCode) {


			// ACTIVATE THIS COURSE. 
			var $li = this.$courses.children("li[data-course='" + courseCode + "']");
			this.$courses.children("li").removeClass("LOM-course-active");
			$li.addClass("LOM-course-active");

			// HIDE/SHOW PAGES
			var $pages = this.$pages.children("li[data-page-uid*='" + courseCode + "?']");
			this.$pages.children().hide();
			$pages.show();

			//hide / show reviews

			var $reviews = this.$main.children("li[data-review-element-uid*='" + courseCode + "']");
			this.$main.children("li").hide();
			$reviews.show();
		},

		activateElement: function (element) {
			var location = this.root.session.user.location;

			//var courseCode=location.course.code;
			//var page=location.page;
			var pageUid = location.code;

			var uid = pageUid + "#" + element.id;

			this.$pages.hide();
			this.$courses.hide();
			this.$main.children("li").hide();
			var $reviews = this.$main.children("[data-review-element-uid='" + uid + "']");
			$reviews.show();
			if ($reviews.length === 0) {
				this.$main.children(".LOM-empty-review").show();
			}

		},
		/** ***************************************
		 * EDITOR INTERFACE 
		 * **********************************************/
		pageLoaded: function () {
			this.refreshDisplay();
		},

		refreshDisplay: function () {
			var courseCode = this.root.courseFolder;
			var revList = [];
			if (this.root.type === "editor") {
				var pageCode = this.root.parent.currentSub.sPosition;
				revList = this.getReviews(courseCode, pageCode);
				$(".LOM-has-review").removeClass("LOM-has-review");

				for (var i = 0; i < revList.length; i++) {
					$("#" + revList[i].elementId).addClass("LOM-has-review");
				}

			} else {
				revList = this.getReviews(courseCode);

			}


		},

		getReviews: function (course, page, id) {
			var rList = [];
			rList = this.parent.commsByType["review"];
			var reviewArray = [];
			var flag;
			if (typeof rList !== "undefined") {
				for (var i = 0; i < rList.length; i++) {
					flag = rList[i].checkFilter(course, page, id);
					if (flag) {
						reviewArray[reviewArray.length] = rList[i];
					}

				}
				return reviewArray;

			} else {
				return [];
			}

		},
		/* *******************************************************************
		 * UTILITY
		 * ****************************************************************/

		getReviewValue: function (id) {
			return window.CKEDITOR.instances[id].getData();
		},

		configCKEForReview: function () {
			var editorConfig = {
				toolbar: []
			};
			//FULL TEXT
			editorConfig.toolbar.push({
				name: 'cutpaste',
				items: ['Copy', 'Cut', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo']
			});
			editorConfig.toolbar.push({
				name: 'basicstyles',
				items: ['Bold', 'Italic', 'Subscript', 'Superscript', '-', 'Language', 'SpecialChar']
			});
			editorConfig.toolbar.push({
				name: 'paragraph',
				items: ['NumberedList', 'BulletedList' /*, '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock' */]
			});

			editorConfig.toolbar.push("/");

			editorConfig.toolbar.push({
				name: 'resources',
				items: [ /*'Abbr', 'Glossary', 'ext-links'*/]
			});

			editorConfig.extraPlugins = "abbr, glossary, ext-links";

			return editorConfig;
		}


	});
});