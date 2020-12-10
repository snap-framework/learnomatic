define([
	'modules/BaseModule',
	'jquery',
	'./courseObj'
], function (BaseModule, $, Course) {
	'use strict';
	return BaseModule.extend({
		initialize: function (options) {
			this.options = options;

			this.root = options.root;
			this.progressManager = options.progressManager;
			this.courses = [];
			this.courseList = [];
			this.$list = $(".courselist");

			this.reset();
			this.initDom();

			this.teams = [];
			this.teamsList = [];
		},

		/*----------------------------------------------------------------------------------------*/
		/*------------------------------------ Init Interface ------------------------------------*/
		/*----------------------------------------------------------------------------------------*/
		reset: function () {
			this.$list.html("");
		},

		setDom: function (label) {
			var that = this;
			$.get(this.root.relPath + "templates/command/interface-courses-edit.html", function (data) {
				var $container = $("main").children(".content");

				$container.html(data);
				$container.find("h2").eq(0).text(label);


				$container.children(".row").children(".LOM-course-manager").append("<ul class='courselist'></ul><button class='add-course ico-LOM-plus snap-md'>Add Course</button>");
				//that.root.teamManager.initInterface();
				that.initInterface();


				that.initDom();
			});
		},

		initDom: function () {
			var that = this;

			//Popup the course creation popup when you click on "Add Course"
			$(".add-course").click(function () {
				that.courseForm(false, null, false);
			});

			//Hide the upload form's submit button and show it when a file is selected
			$(".btn-submit").hide();
			$("#userfile").change(function () {
				if ($(this).val() === "") {
					$(".btn-submit").hide();
				} else {
					$(".btn-submit").show();
				}
			});

			//When the upload form's submit button is clicked
			$(".btn-submit").click(function (e) {
				e.preventDefault();

				//check if there's a file
				if (document.getElementById("userfile").files.length === 0) {

					//There is no file, ask for a file
					alert("No files selected");
				} else {

					//There is a file, pop the course creation popup
					that.courseForm(false, null, true);
				}
			});

			//When everything is OK, the form gets submitted, this is where the upload starts
			$("#upload").submit(function (evt) {
				evt.preventDefault();
				that.uploadCourse(this);
			});
		},

		initInterface: function () {
			this.generateList($(".courselist"));
			this.generateButtons($(".courselist"));

		},

		generateList: function ($target, sort) {

			$target.html("");
			var courseArray = this.courseList;
			courseArray = this.sortList(courseArray, sort);

			for (var i = 0; i < courseArray.length; i++) {

				courseArray[i].appendCourse($target);

			}
		},
		generateButtons: function ($target) {

			var courseArray = this.courseList;

			for (var i = 0; i < courseArray.length; i++) {

				courseArray[i].addButtons($target);

			}
		},


		sortList: function (courseArray, sort) {
			switch (sort) {
				default:
					// code block
					courseArray = courseArray.sort(function (a, b) { return (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1; });
			}

			return courseArray;
		},

		resetLocations: function () {
			var courseArray = this.courseList;

			for (var i = 0; i < courseArray.length; i++) {

				//courseArray[i].locations=[];
				courseArray[i].locationList = [];
			}
		},

		updateLocations: function () {
			var courseArray = this.courseList;

			for (var i = 0; i < courseArray.length; i++) {

				courseArray[i].updateLocations();
			}

		},




		/*-------------------------------------------------------------------------------------*/
		/*------------------------------------ Get Courses ------------------------------------*/
		/*-------------------------------------------------------------------------------------*/
		initCourses: function () {
			var that = this;
			var $gettingCoursesMsg;

			$.ajax({
				type: "POST",
				url: this.root.relPath + "editor.php",
				data: {
					action: "getCourseList",
					content: ""
				},
				beforeSend: function () {
					$gettingCoursesMsg = that.progressManager.showMessage("Getting courses list&hellip;", "status");
				},
				success: function (data) {

					var courses = JSON.parse(data);

					for (var i = 0; i < courses.length; i++) {
						that.createCourse(courses[i]);
					}
					that.coursesInited($gettingCoursesMsg);
				},
				fail: function (data, error, errortext) {
					that.progressManager.handleError(data, error, errortext, "Error while getting courses");
				}
			});
		},

		coursesInited: function ($gettingCoursesMsg) {
			this.progressManager.removeMessage($gettingCoursesMsg);

			//once courses and users are inited
			this.inited = true;
			this.root.initDone();
		},

		linkUsers: function () {
			for (var i = 0; i < this.courseList.length; i++) {
				this.courseList[i].linkUsers();
			}
		},

		/*----------------------------------------------------------------------------------------------*/
		/*------------------------------------ Create/Upload Course ------------------------------------*/
		/*----------------------------------------------------------------------------------------------*/
		uploadCourse: function (el) {
			var owner = this.root.session.user.username;
			var team = this.root.session.user.team.name;

			var formData = new FormData(el);

			var that = this;

			var $uploadingMsg, $uploadedMsg, $addedMsg;

			$.ajax({
				type: "POST",
				url: "upload.php",
				data: formData,
				cache: false,
				contentType: false,
				processData: false,
				xhr: function () {
					var xhr = new window.XMLHttpRequest();
					xhr.upload.addEventListener("progress", function (evt) {
						if (evt.lengthComputable) {
							var percentComplete = evt.loaded / evt.total * 100;
							percentComplete = percentComplete.toFixed(0)

							if (!$uploadingMsg) {
								$uploadingMsg = that.progressManager.showMessage("uploading package &ldquo;" + $("#userfile")[0].files[0].name + "&rdquo;&hellip;", "progress", percentComplete);
							} else if (percentComplete != 100) {
								that.progressManager.updateProgress($uploadingMsg, percentComplete);
							} else if (percentComplete == 100) {
								that.progressManager.removeMessage($uploadingMsg);
								$uploadedMsg = that.progressManager.showMessage("processing course from package &ldquo;" + $("#userfile")[0].files[0].name + "&rdquo;&hellip;", "status");
							}
						}
					}, false);

					return xhr;
				},
				success: function () {
					that.progressManager.removeMessage($uploadedMsg);
					$addedMsg = that.progressManager.showMessage("course &ldquo;" + $(el).find("#name").val() + "&rdquo; added!", "status");

					setTimeout(function () {
						that.progressManager.removeMessage($addedMsg);
					}, 3000);

					var newCourse = that.createCourse({
						name: $(el).find("#name").val(),
						code: $(el).find("#folder").val(),
						teams: [team],
						users: {}
					})

					newCourse.appendCourse($("ul.courselist[data-team=" + team + "]"));
				},
				fail: function (data, error, errortext) {
					that.progressManager.handleError(data, error, errortext, "Error while uploading package &ldquo;" + $("#userfile")[0].files[0].name + "&rdquo;")
				}
			});
		},

		addCourse: function (folder, name) {
			var owner = this.root.session.user.username;
			var team = this.root.session.user.team.name;
			var that = this;

			var $creatingMsg, $createdMsg;
			//call to PHP, copy the folder
			$.ajax({
				url: this.root.relPath + "editor.php",
				type: "POST",
				data: {
					action: "addcourses",
					content: folder,
					owner: owner,
					name: name,
					team: team,
					origin: this.root.settings.defaultCourse
				},
				beforeSend: function () {
					$creatingMsg = that.progressManager.showMessage("creating course &ldquo;" + name + "&rdquo;&hellip;", "status");
				},
				success: function () {
					that.progressManager.removeMessage($creatingMsg);
					//create the progress message
					$createdMsg = that.progressManager.showMessage("course &ldquo;" + name + "&rdquo; created!", "status");
					//remove the progress message
					setTimeout(function () {
						that.progressManager.removeMessage($createdMsg);
					}, 3000)
					//create course object
					var newCourse = that.createCourse({
						name: name,
						code: folder,
						teams: [team],
						users: {}
					})

					newCourse.appendCourse($("ul.courselist")); //append course to list
				},
				fail: function (data, error, errortext) {
					that.progressManager.handleError(data, error, errortext, "Error while creating course &ldquo;" + folder + "&rdquo;")
				}
			});
		},

		createCourse: function (course) {
			var newCourse = new Course({
				parent: this,
				name: course.name,
				code: course.code,
				teams: course.teams,
				users: course.users
			});

			this.courses[course.code] = newCourse;
			this.courseList[this.courseList.length] = newCourse;
			return newCourse;
		},

		/*------------------------------------ Information popup + validation ------------------------------------*/
		courseForm: function (isEdit, course, isUpload) {
			var that = this;

			//start the interface
			$.magnificPopup.open({
				items: {
					src: this.root.relPath + 'templates/command/course_edit.html'
				},
				type: 'ajax',
				removalDelay: 500,
				callbacks: {
					beforeOpen: function () {
						this.st.mainClass = "mfp-zoom-in";
					},
					ajaxContentAdded: function () {
						if (isEdit) {
							$(this.content).find(".LOM-course-name").val(course.name);
							$(this.content).find(".LOM-folder-name").val(course.code);
							$(this.content).find(".LOM-folder-name").prop("disabled", true);
							course.manageTeamsSetup($(this.content));
							$(this.content).find(".LOM-submit-course")
								.removeClass("ico-LOM-plus")
								.addClass("ico-SNAP-save")
								.html("Save Course Info")
								.removeAttr("disabled");
						}

						$(this.content).keyup(function () {
							that.validateCourse($(this), isEdit, course);
						});

						$(".LOM-submit-course").click(function () {
							that.submitCourse($(this), isEdit, course, isUpload);
						});

					}
				},
				midClick: true
			});
		},

		validateCourse: function ($popup, isEdit, course) {
			var $name = $popup.find(".LOM-course-name");
			var name = $name.val();
			var $folder = $popup.find(".LOM-folder-name");
			var folder = $folder.val();

			var nameValidation = this.validateName(name);
			if (nameValidation === true) {
				$name.attr("data-feedback", "true");
			} else {
				$name.attr("data-feedback", nameValidation);
			}

			if (!isEdit) {
				var folderValidation = this.validateFolder(folder);
				if (folderValidation === true) {
					$folder.attr("data-feedback", "true");
				} else {
					$folder.attr("data-feedback", folderValidation);
				}
			}

			var $feedback = $popup.find("[data-feedback]");

			var validationFlag = true;
			var feedback;
			for (var i = 0; i < $feedback.length; i++) {
				feedback = $feedback.eq(i).attr("data-feedback");
				if (feedback === "true") {
					//yayyy
					$feedback.eq(i).siblings(".LOM-feedback").html("");
				} else {
					validationFlag = false;
					$feedback.eq(i).siblings(".LOM-feedback").html(feedback);
				}
			}
			if (validationFlag) {
				//unlock
				$popup.find(".LOM-submit-course").removeAttr("disabled");
			} else {
				$popup.find(".LOM-submit-course").attr("disabled", "true");
			}
		},

		validateFolder: function (folder) {
			if (folder === "") {
				return "Please enter a folder name";
			}

			var folderString = this.validateFolderString(folder);
			if (folderString !== true) {
				return "Invalid Character '" + folderString + "'";
			}

			if ($("[data-course='" + folder + "']").length > 0) {
				return "Please use a unique folder name";
			}

			return true;
		},

		validateName: function (name) {
			if (name === "") {
				return "Please enter a course name";
			}

			return true;
		},

		validateFolderString: function (str) {
			var code;

			for (var i = 0; i < str.length; i++) {
				code = str.charCodeAt(i);
				if (!(code > 47 && code < 58)
					&& // numeric (0-9)
					!(code > 64 && code < 91)
					&& // upper alpha (A-Z)
					!(code > 96 && code < 123)
					&& !(code === 45 || code === 95)

				) { // lower alpha (a-z)
					return str.charAt(i);
				}
			}
			return true;
		},

		submitCourse: function ($btn, isEdit, course, isUpload) {
			var $name = $btn.parent().find(".LOM-course-name");
			var name = $name.val();
			var $folder = $btn.parent().find(".LOM-folder-name");
			var folder = $folder.val();

			if (isEdit) {
				course.name = name;
				$("[data-course=" + course.code + "]").find(".LOM-course-name:not([data-team])").html(name)
				course.saveInfo();
				//
			} else if (isUpload) {
				$("#folder").val(folder);
				$("#name").val(name);
				$("#upload").submit();
			} else {
				this.addCourse(folder, name);
			}

			$.magnificPopup.close();
		},
	});
});
