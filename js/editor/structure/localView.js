define([
	'jquery',
	'labels',
	'settings-core',
	'utils',
	'modules/BaseModule',
	'modules/objSub/objSub-utils',
	'./../../plugins/jquery-ui/ui/widgets/sortable'

], function ($, labels, CoreSettings, Utils, BaseModule, ObjSubUtils, Sortable) {
	'use strict';

	return BaseModule.extend({
		initialize: function (options) {
			//var that=this;

			this.parent = options.parent; //masterStructure.editor
			this.editor = this.parent.parent;
			this.master = this.parent.parent.parent; //masterStructure

			this.labels = options.labels;

			this.currentParent = this.master;

			this.reloadNecessary = false;
		},

		/*---------------------------------------------------------------------------------------------
				-------------------------HOUSE KEEPING
		---------------------------------------------------------------------------------------------*/

		initView: function () {
			$(".backnext").hide();
			$(".menu.supermenu").hide();

			$(CoreSettings.contentContainer).append("<h1>" + this.labels.structureMode.title + "</h1>");
			$(CoreSettings.contentContainer).append("<h2><span>" + ((Utils.lang === "en") ? CoreSettings.courseTitle_en : CoreSettings.courseTitle_fr) + "</span><span></span><span></span></h2>");
			$(CoreSettings.contentContainer).append("<div id=\"folder-view-container\"></div>");
			$("#folder-view-container").append("<section class=\"LOM-folder-view ui-sortable\" id=\"LOM-structure0\"></section");
			$("#folder-view-container").append("<section class=\"LOM-folder-view ui-sortable\" id=\"LOM-structure1\"></section");
			$("#folder-view-container").append("<section class=\"LOM-folder-view ui-sortable\" id=\"LOM-structure2\"></section");


			this.changeLevel(this.master);

			this.initAddButton();


		},
		/*---------------------------------------------------------------------------------------------
				------------------------- LOCAL VIEW NAVIGATION
		---------------------------------------------------------------------------------------------*/
		changeLevel: function (parent) {

			this.generateList(parent);
			this.currentParent = parent;
			this.initRepositoryButtons();
		},

		generateList: function (parent) {

			var level = this.getLevel(parent);
			var folder = parent.subs;
			var $target = $("#LOM-structure" + level);

			$target.html("");
			var $element;

			//create all the subs (pages/folders)
			for (var i = 0; i < folder.length; i++) {

				$element = (folder[i].isPage) ? this.getPageHtml(folder[i]) : this.getFolderHtml(folder[i]);
				$element.children().addClass("LOM-local-element");
				$target.append($element.html());

			}
			//add all the required buttons
			this.initButtons($target, level);
			//add the sortable handle and initialize.
			this.setSortable($target);


		},

		initButtons: function ($target, level) {
			var that = this;
			//----- ADD PAGE/FOLDER
			$target.append("<button class=\"snap-sm ico-SNAP-page\" style=\"margin-top: 25px;\">" + this.labels.structureMode.addPage + "</button>");
			$target.find(".ico-SNAP-page").click(function () {
				if (!that.editor.notAlone) {
					that.addPageLbx();
				} else {
					that.editor.lockMessage("course");
				}
			});
			if (level < 2) {
				$target.append("<button class=\"snap-sm ico-SNAP-folder\" style=\"margin-top: 25px;\">" + this.labels.structureMode.addFolder + "</button>");
				$target.find(".ico-SNAP-folder").click(function () {
					if (!that.editor.notAlone) {
						that.addFolderLbx();
					} else {
						that.editor.lockMessage("course");
					}
				});
			}

			//------ ROLLBACK
			if (level > 0) {
				$target.prepend("<button class=\"LOM-structure-rollback\">rollback</button>");
			}
			$target.find(".LOM-structure-rollback").click(function () {
				that.rollback();
			});

			//----- OPEN FOLDER
			$target.find(".LOM-folder-open").click(function () {
				that.openFolder($(this).parent().attr("data-id"));
			});


			//EDIT PAGE/FOLDER BUTTON
			$target.find(".LOM-local-isPage").find(".ico-SNAP-edit").click(function () {
				if (!that.editor.notAlone) {
					that.editLbx("editpage", this);
				} else {
					that.editor.lockMessage("course");
				}
			});
			$target.find(".LOM-local-isFolder").find(".ico-SNAP-edit").click(function () {
				if (!that.editor.notAlone) {
					that.editLbx("editfolder", this);
				} else {
					that.editor.lockMessage("course");
				}
			});
			$target.find(".ico-SNAP-edit").hover(
				function () {
					$(this).siblings(".LOM-label").text($(this).text());
				},
				function () {
					$(this).siblings(".LOM-label").text("");
				}
			);

			//----- DELETE 
			//disable the delete if it's the only entry (except m98)
			if (
				level === 0 &&
				(
					this.master.subs.length === 1 ||
					(this.master.subs.length === 2 && this.master.subs[1].sPosition === "m98")
				)
			) {
				$("#LOM-structure0").find(".ico-SNAP-delete").eq(0).attr("disabled", true);
			} else {
				$target.find(".ico-SNAP-delete").click(function () {

					if (!that.editor.notAlone) {
						that.delete(this);
					} else {
						that.editor.lockMessage("course");
					}


				});
				$target.find(".ico-SNAP-delete").hover(
					function () {
						$(this).siblings(".LOM-label").text($(this).text());
					},
					function () {
						$(this).siblings(".LOM-label").text("");
					}
				);
			}
		},

		// opens the folder that is clicked on.
		openFolder: function (sPosition) {

			var aPosition = Utils.getArrayFromString(sPosition);
			var newItem = ObjSubUtils.findSub(aPosition);

			var leavingNum = this.getLevel(this.currentParent);
			var enteringNum = this.getLevel(newItem);


			var $leaving = $("#LOM-structure" + leavingNum);
			var $entering = $("#LOM-structure" + enteringNum);

			if (leavingNum === (enteringNum - 1)) {

				this.folderInLeft($entering, $leaving);
				this.changeLevel(newItem);
				$("h2>span").eq(enteringNum).html(" > " + this.currentParent.title).hide().fadeIn();
			}


			//lets create the new folder


		},
		//move back one folder;
		rollback: function () {
			var currentParent = this.currentParent;
			var currentLevel = this.getLevel(currentParent);

			var newParent = this.getParent(currentParent);
			var newLevel = this.getLevel(newParent);

			this.changeLevel(newParent);
			this.folderInRight($("#LOM-structure" + newLevel), $("#LOM-structure" + currentLevel)); // entering leaving
			$("h2>span").eq(currentLevel).fadeOut();
			return false;
		},

		initRepositoryButtons: function () {

			if (this.currentParent.sPosition === "m98") {
				$(".ico-SNAP-folder").remove();
			}
			$("[data-id='m98']").find(".LOM-edit-view,.LOM-ui-handle").remove();
		},


		/*---------------------------------------------------------------------------------------------
				-------------------------UTILS
		---------------------------------------------------------------------------------------------*/
		getLevel: function (item) {
			var isMaster = (typeof item.depth === "undefined") ? true : false;
			var level = (isMaster) ? 0 : item.depth + 1;

			return level;
		},
		getParent: function (item) {
			var parent = (item.depth === 0) ? this.master : item.parent;
			return parent;
		},
		delete: function (obj) {
			if ($(obj).parent().parent().attr("data-id") == this.master.currentSub.sPosition || ($(obj).parent().parent().hasClass("LOM-local-isFolder") && this.master.currentSub.sPosition.indexOf($(obj).parent().parent().attr("data-id")) >= 0)) {
				this.reloadNecessary = true;
			}
			this.parent.deleteSub(obj);
		},
		/*---------------------------------------------------------------------------------------------
				-------------------------LIGHTBOX
		---------------------------------------------------------------------------------------------*/
		loadLbx: function ($lbx, params) {
			var that = params.obj;
			switch (params.lbx.action) {
				case "addpage":
					that.loadAddElementScreen($lbx, params);

					break;
				case "addfolder":
					that.loadAddElementScreen($lbx, params);

					break;
				case "editpage":
					$lbx.load("../../templates/LOM-Elements/structure_newpage_" + Utils.lang + ".html", function () {
						that.editPageScreen(params);
					});
					break;
				case "editfolder":
					$lbx.load("../../templates/LOM-Elements/structure_newfolder_" + Utils.lang + ".html", function () {
						that.editFolderScreen(params);
					});
					break;
			}


		},

		addPageLbx: function () {
			var that = this;
			var params = {
				title: (Utils.lang === "en") ? "New Page" : "Nouvelle page",
				obj: this,
				action: this.loadLbx,
				lbx: {
					action: "addpage",
					saveBtn: (Utils.lang === "en") ? "Save" : "Sauvegarder"
				}
			};
			that.editor.lbxController.pop(params);

		},
		addFolderLbx: function () {
			var that = this;
			var params = {

				title: (Utils.lang === "en") ? "New Folder" : "Nouveau dossier",
				obj: this,
				action: this.loadLbx,
				lbx: {
					action: "addfolder",
					saveBtn: (Utils.lang === "en") ? "Save" : "Sauvegarder"
				}
			};
			that.editor.lbxController.pop(params);
		},
		editLbx: function (action, obj) {
			var sPosition = $(obj).parent().parent().attr("data-id");
			var aPosition = Utils.getArrayFromString(sPosition);
			var sub = ObjSubUtils.findSub(aPosition);

			var that = this;
			that.editor.lbxController.pop({

				title: (Utils.lang === "en") ? "Edit Structure Element" : "Édition d'un élément de structure",
				obj: this,
				action: this.loadLbx,
				lbx: {
					action: action,
					saveBtn: (Utils.lang === "en") ? "Save" : "Sauvegarder",
					sub: sub
				}
			});

		},
		/*---------------------------------------------------------------------------------------------
				------------------------- PAGE/FOLDER SCREENS
		---------------------------------------------------------------------------------------------*/

		loadAddElementScreen: function ($lbx, params) {
			var that = this;


			if (params.lbx.action === "addpage") {
				//Load screen New Page
				$lbx.load(this.editor.relPath + "templates/LOM-Elements/structure_newpage_" + Utils.lang + ".html", function () {
					that.newPageScreen(params);
				});
			} else {
				//Load screen New FOLDER
				$lbx.load(this.editor.relPath + "templates/LOM-Elements/structure_newfolder_" + Utils.lang + ".html", function () {
					that.newFolderScreen(params);
				});
			}
		},

		//------------------NEW XXX SCREEN-----------
		newPageScreen: function (params) {
			this.configScreen(params);
			$("select#location").closest(".row").hide();
		},
		newFolderScreen: function (params) {
			this.configScreen(params);
			$("select#location").closest(".row").hide();
		},
		//------------------EDIT XXX SCREEN-----------

		editPageScreen: function (params) {
			var sub = params.lbx.sub;
			var title_en = (Utils.lang === "en") ? sub.title : sub.altTitle;
			var title_fr = (Utils.lang === "fr") ? sub.title : sub.altTitle;
			var keywords = sub.$el.attr("data-keywords");
			this.configScreen(params);


			$("#LOM-structure-keywords").val(keywords);
			$("#title_en").val(title_en);
			$("#title_fr").val(title_fr);

			var folderList = this.listOfFolders();
			var selected;
			var noneSelected = true;
			for (var i = 0; i < folderList.length; i++) {
				if (sub.parent && sub.parent.sPosition == folderList[i][1].sPosition) {
					selected = folderList[i][1].sPosition;
					noneSelected = false;
				} else if (noneSelected) {
					selected = "root";
				}
			}
			for (var j = 0; j < folderList.length; j++) {
				var isSelected = (selected == folderList[j][1].sPosition) ? "selected" : "";
				$("select#location").append("<option value=\"" + folderList[j][1].sPosition + "\"" + isSelected + ">" + folderList[j][0] + "</option>");
			}

			this.changingFolder = false;
			var that = this;
			$("select#location").change(function () {
				if ($(this).val() != selected) {
					that.changingFolder = $(this).val();
				} else {
					that.changingFolder = false;
				}
			});
		},

		listOfFolders: function (isFolder) {
			isFolder = (typeof isFolder === "undefined") ? false : isFolder;
			var list = this.master.subs;

			var returnList = [];

			for (var i = 0; i < list.length; i++) {
				if (!list[i].isPage && list[i].sPosition.indexOf("m98") < 0) {
					var desc = list[i].title;

					if (list[i].parent) {
						desc = list[i].parent.title + " > " + desc;

						if (list[i].parent.parent) {
							desc = list[i].parent.parent.title + " > " + desc;
						}
					}
					returnList[returnList.length] = [desc, list[i]];

					if (list[i].subs.length != 0 && !isFolder) {
						var list2 = list[i].subs;

						for (var j = 0; j < list2.length; j++) {
							if (!list2[j].isPage && list2[j].sPosition.indexOf("m98") < 0) {
								var desc = list2[j].title;

								if (list2[j].parent) {
									desc = list2[j].parent.title + " > " + desc;

									if (list2[j].parent.parent) {
										desc = list2[j].parent.parent.title + " > " + desc;
									}
								}
								returnList[returnList.length] = [desc, list2[j]];
							}
						}
					}
				}
			}
			return returnList;
		},

		editFolderScreen: function (params) {
			var sub = params.lbx.sub;

			var title_en = (Utils.lang === "en") ? sub.title : sub.altTitle;
			var title_fr = (Utils.lang === "fr") ? sub.title : sub.altTitle;
			var keywords = sub.$el.attr("data-keywords");
			this.configScreen(params);

			$("#title_en").val(title_en);
			$("#title_fr").val(title_fr);
			$("#LOM-structure-keywords").val(keywords);

			var folderList = this.listOfFolders(true);

			for (var i = 0; i < folderList.length; i++) {
				if (folderList[i][1].sPosition == sub.sPosition) {
					folderList.splice(i, 1);
				}
			}

			var selected;
			var noneSelected = true;
			for (var i = 0; i < folderList.length; i++) {
				if (sub.parent && sub.parent.sPosition == folderList[i][1].sPosition) {
					selected = folderList[i][1].sPosition;
					noneSelected = false;
				} else if (noneSelected) {
					selected = "root";
				}
			}
			for (var j = 0; j < folderList.length; j++) {
				var isSelected = (selected == folderList[j][1].sPosition) ? "selected" : "";
				$("select#location").append("<option value=\"" + folderList[j][1].sPosition + "\"" + isSelected + ">" + folderList[j][0] + "</option>");
			}

			this.changingFolder = false;
			var that = this;
			$("select#location").change(function () {
				if ($(this).val() != selected) {
					that.changingFolder = $(this).val();
				} else {
					that.changingFolder = false;
				}
			});
		},


		//------------------edit screens utils-----------
		configScreen: function (params) {

			$(".modal-title").text(params.lbx.title);
			this.multiSave(params);
			$(".modal-footer").remove();

			var that = this;
			$("#title_en, #title_fr").on("keypress", function (e) {
				if (e.which == "13") {
					that.enterPressed(params);
				}
			});
		},

		enterPressed: function (params) {
			if ($("#" + params.lbx.targetId).find(".ico-LOM-editpage.LOM-edit-structure").length !== 0) {
				$("#" + params.lbx.targetId).find(".ico-LOM-editpage.LOM-edit-structure").click();
			} else if ($("#" + params.lbx.targetId).find(".ico-SNAP-save.LOM-save-structure").length !== 0) {
				$("#" + params.lbx.targetId).find(".ico-SNAP-save.LOM-save-structure").click();
			}
		},

		multiSave: function (params) {

			var that = this;
			$(".ico-LOM-editpage.LOM-edit-structure").click(function () {
				that.saveAndEdit(params);
			});
			$(".ico-SNAP-save.LOM-save-structure").click(function () {
				that.saveAndClose(params);
			});


		},


		/*---------------------------------------------------------------------------------------------
				-------------------------
		---------------------------------------------------------------------------------------------*/
		getPageHtml: function (sub) {
			var $page = $("<div></div>");
			$page.append("<div data-id='" + sub.sPosition + "'></div>");
			var $element = $page.children();
			var editLabel = this.labels.structureMode.editpage;
			var deleteLabel = this.labels.structureMode.deletepage;

			$element.addClass("LOM-local-isPage");
			//$element.append("<span> "+sub.title+" ("+sub.sPosition+")</span>");
			$element.append("<span> " + sub.title + "</span>");

			$element.append("<div class=\"LOM-edit-view\" tabindex=\"-1\"><span class=\"LOM-label\"></span><button class=\"snap-xs ico-SNAP-edit\">" + editLabel + "</button><button class=\"snap-xs ico-SNAP-delete\">" + deleteLabel + "</button></div>");
			$element.append("<div class=\"LOM-ui-handle\"></div>");

			return $page;
		},
		getFolderHtml: function (sub) {
			var folderLength = sub.subs.length;

			var $folder = $("<div></div>");
			$folder.append("<div data-id='" + sub.sPosition + "'></div>");
			var $element = $folder.children();
			var editLabel = this.labels.structureMode.editfolder;
			var deleteLabel = this.labels.structureMode.deletefolder;

			$element.addClass("LOM-local-isFolder");
			$element.append("<button class=\"LOM-folder-open\"> " + sub.title + " (" + sub.sPosition + ")(" + folderLength + ")</button>");
			$element.append("<div class=\"LOM-edit-view\" tabindex=\"-1\"><span class=\"LOM-label\"></span><button class=\"snap-xs ico-SNAP-edit\">" + editLabel + "</button><button class=\"snap-xs ico-SNAP-delete\">" + deleteLabel + "</button></div>");
			$element.append("<div class=\"LOM-ui-handle\"></div>");


			return $folder;
		},
		/*---------------------------------------------------------------------------------------------
				-------------------------animations
		---------------------------------------------------------------------------------------------*/

		folderInLeft: function ($entering, $leaving) {
			$entering
				.css("margin-left", "100%")
				.css("opacity", "0")
				.animate({

					"margin-left": "0%",
					"opacity": "1"

				}, 500, function () {
					// Animation complete.
				});

			$leaving.animate({

				"margin-left": "-100%",
				"opacity": "0"

			}, 300, function () {
				// Animation complete.
			});
		},
		folderInRight: function ($entering, $leaving) {
			$entering
				.css("margin-left", "-100%")
				.css("opacity", "0")
				.animate({

					"margin-left": "0%",
					"opacity": "1"

				}, 500, function () {
					// Animation complete.
				});

			$leaving.animate({

				"margin-left": "100%",
				"opacity": "0"

			}, 300, function () {
				// Animation complete.
			});
		},
		/*---------------------------------------------------------------------------------------------
				-------------------------SORTING
		---------------------------------------------------------------------------------------------*/
		setSortable: function ($target) {
			var that = this;
			this.sortable = new Sortable();
			$target.sortable({
				axis: "y",
				//helper:"clone",
				handle: ".LOM-ui-handle",
				//containment: "parent",
				//cursor: "progress",
				items: "> .LOM-local-element:not('[data-id=m98]')",
				opacity: 0.6,
				revert: true,
				placeholder: "sortable-placeholder",
				tolerance: "pointer",
				cursorAt: {
					left: 0,
					top: 0
				},
				//connectWith: ".LOM-frame",

				classes: {
					"ui-sortable": "highlight"
				},

				start: function () {
					//that.startSort();


				},
				stop: function (event, ui) {
					that.stopSort(ui);
					//event, ui

				}

			});
		},
		stopSort: function (obj) {

			// do we need all this?
			var sPosition = $(obj.item).attr("data-id");
			var aPosition = Utils.getArrayFromString(sPosition);
			var sub = ObjSubUtils.findSub(aPosition);
			var newPosition;

			var $nextObj = $(obj.item).next();
			var $prevObj = $(obj.item).prev();

			// lets find out

			if (typeof $nextObj.attr("data-id") === "undefined") {

				//last object
				var newArray = Utils.getArrayFromString($prevObj.attr("data-id"));
				newArray[this.getLevel(this.currentParent)]++;
				newPosition = Utils.getStringFromArray(newArray);
			} else {
				newPosition = $nextObj.attr("data-id");
			}

			sub.move(newPosition);
			this.generateList(this.currentParent);
		},
		/*---------------------------------------------------------------------------------------------
				-------------------------SAVE
		---------------------------------------------------------------------------------------------*/
		saveAndEdit: function (params) {
			var newSub = this.save(params);
			this.editor.lbxController.close();
			window.fNav(newSub.sPosition);
		},
		saveAndClose: function (params) {
			this.save(params);

			if (this.changingFolder) {
				var newPosition;
				if (this.changingFolder == "root") {
					//MASTER STRUCTURE
					newPosition = (this.master.subs[this.master.subs.length - 1].sPosition === "m98") ? "m98" : "m" + (this.master.subs.length);
				} else {
					//SUB
					var folders = this.listOfFolders();
					var sub;
					for (var i = 0; i < folders.length; i++) {
						if (folders[i][1].sPosition == this.changingFolder) {
							sub = folders[i][1];
						}
					}
					newPosition = this.changingFolder + "-" + sub.subs.length;
				}
				params.lbx.sub.move(newPosition);
				this.generateList(this.currentParent);

				if (params.lbx.sub.sPosition == this.master.currentSub.sPosition) {
					this.reloadNecessary = true;
				}
			}

			this.editor.lbxController.close();
		},
		save: function (params) {
			var title = (Utils.lang === "en") ? $("#title_en").val() : $("#title_fr").val();
			var altTitle = (Utils.lang === "en") ? $("#title_fr").val() : $("#title_en").val();
			var keywords = $("#LOM-structure-keywords").val();
			var newPosition;
			var sub;
			var isPage;

			//is it a new page?
			if (params.lbx.action === "addpage" || params.lbx.action === "addfolder") {
				if (typeof this.currentParent.depth === "undefined") {
					//MASTER STRUCTURE
					newPosition = (this.master.subs[this.master.subs.length - 1].sPosition === "m98") ? "m98" : "m" + (this.master.subs.length);
				} else {
					//SUB
					newPosition = this.currentParent.sPosition + "-" + this.currentParent.subs.length;
				}
				isPage = (params.lbx.action === "addpage") ? true : false;
				sub = this.parent.addPage(newPosition, title, altTitle, isPage, keywords);
				this.generateList(this.currentParent);
				$("[data-id='" + sub.sPosition + "']").hide().slideDown("swing", function () {});

				/*var currentPageNum;
				for(var i = 0; i < this.master.flatList.length; i++){
					if(this.master.flatList[i].sPosition == this.master.currentSub.sPosition){
						currentPageNum = i + 1;
					}
				}
				$(".backnext").children("span").html(" <span class='pagelbl'>" + labels.vocab.pageLbl + "</span> " + currentPageNum + " " + labels.vocab.pageOf + " " + this.master.flatList.length + " ");*/

				if (params.lbx.action === "addpage") {
					this.reloadNecessary = true;
				}

				return sub;
			} else if (params.lbx.action === "editpage" || params.lbx.action === "editfolder") {
				sub = params.lbx.sub;
				sub.title = title;
				sub.altTitle = altTitle;
				sub.keywords = keywords;
				this.generateList(this.currentParent);
				$(".menu.supermenu>li>ul").html("");
				this.master.generateSupermenu();
				return sub;
			}


			//save new title to sub

		},
		/*---------------------------------------------------------------------------------------------
				-------------------------HOUSE KEEPING
		---------------------------------------------------------------------------------------------*/
		initAddButton: function () {


		}


	});
});