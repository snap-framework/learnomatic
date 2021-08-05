define([

	'jquery',
	'labels',
	'settings-core',
	'utils',
	'modules/BaseModule',
	'./../pageEdit/frameObj'
], function ($, labels, CoreSettings, Utils, BaseModule, FrameObj) {
	'use strict';

	return BaseModule.extend({
		initialize: function (options) {
			this.isModified = null;
			this.parent = options.parent;
			this.editor = this.parent;
			this.labels = options.labels;
			this.frames = [];
			this.initFrames(options.frames);
		},

		/*
		 * @init all the frames
		 */

		initFrames: function ($frames) {
			for (var i = 0; i < $frames.length; i++) {
				this.frames[this.frames.length] = new FrameObj({
					parent: this,
					$el: $frames.eq(i),
					id: $frames.eq(i).attr("id"),
					class: $frames.eq(i).attr("class"),
					labels: this.labels
				});
			}

		},


		/*---------------------------------------------------------------------------------------------
				-------------------------CHANGING LAYOUT
		---------------------------------------------------------------------------------------------*/
		change: function (filename) {

			var that = this;
			$.get(filename, function (data) {
				that.loadLayout(data);
			});
			//this.parent.addFrameNumbers();
		},

		loadLayout: function (html) {

			//make a backup of the current content
			var $old = $("<div>");
			$old.append(this.editor.originalHtml);
			$old.find(".ico-LOM-layout").remove();

			//save the new layout
			var $new = $("<div>");
			$new.append(html)

			$new.find(".LOM-frame").html("");

			//loop through new frames
			for (var i = 0; i < $new.find(".LOM-frame").length; i++) {

				//do frames match?
				if ($old.find(".LOM-frame").eq(i).length !== 0) {

					//just transfer onto the equivalent frame
					$new.find(".LOM-frame").eq(i).html($old.find(".LOM-frame").eq(i).html());
				}
			}

			if ($new.find(".LOM-frame").length < $old.find(".LOM-frame").length) {

				//loop through exceeding frames
				for (var j = $new.find(".LOM-frame").length; j < $old.find(".LOM-frame").length; j++) {

					//transfer the content of the exceeding frame in the last frame of the new layout
					$new.find(".LOM-frame").eq($new.find(".LOM-frame").length - 1).append($old.find(".LOM-frame").eq(j).html());
				}
			}

			//save the page
			this.editor.originalHtml = $new.html();
			this.editor.refreshHtml();

			//inject html to DOM
			$(CoreSettings.contentContainer).html($new.html());
			this.editor.pageLoaded();


			//this.initFrames($(CoreSettings.contentContainer).find(".LOM-frame"));
		},


		/*---------------------------------------------------------------------------------------------
				-------------------------Creating/deleting new frames/elements and wrapping
		---------------------------------------------------------------------------------------------*/


		wrapLayout: function () {
			//figure the ID out			
			var id = "LOMfr_1";

			var oldContent = $(CoreSettings.contentContainer).html();

			$(CoreSettings.contentContainer).html("<!-- Layout 1 frame -->" + this.generateFrameHtml(id, oldContent));
			this.initFrames($("#LOMfr_1"));
			return true;

		},
		createFrame: function () {
			var id = "LOMfr_" + (this.frames.length + 1);

			$(CoreSettings.contentContainer).append(this.generateFrameHtml(id));
			this.initFrames($("#" + id));
			return true;

		},


		generateFrameHtml: function (id, content) {
			//check if there's old stuff
			var newContent = (typeof content === "undefined") ? this.createElement() : content;
			//crete the html
			var newHtml = "<section class='row'><section class='col-md-12 LOM-frame' id='" + id + "'>" + newContent + "</section></section>";


			return newHtml;
		},
		destroyLastFrame: function () {
			//which frame to destroy
			var indexDelete = (this.frames.length) - 1;
			//tell the frame to go ... 
			this.frames[indexDelete].destroy();
			//delete the reference from the layout
			this.frames.splice(indexDelete, 1);
			return false;

		},

		//----------------------------------------INSERT ELEMENT TECHNOLOGY HERE

		createElement: function () {
			var html = ""; //"<button class=\"snap-lg ico-LOM-plus\" onclick=\"masterStructure.editor.popElementPicker('switch', this);return false;\">Add Element</button>";
			return html;
		},

		/*---------------------------------------------------------------------------------------------
				-------------------------UTILS
		---------------------------------------------------------------------------------------------*/
		/*
		 * @do something
		 */
		findFrame: function (objId) {


			for (var i = 0; i < this.frames.length; i++) {
				if (this.frames[i].id === objId) {
					return this.frames[i];
				}
			}
			return false;
		},
		/*---------------------------------------------------------------------------------------------
				------------------------- LAYOUT picker
		---------------------------------------------------------------------------------------------*/
		popPicker: function () {
			var title = (Utils.lang === "en") ? "Choose Your Layout" : "Choisissez votre disposition";

			this.editor.lbxController.pop({
				file: "templates/LOM-Layouts/layout_picker_" + Utils.lang + ".html",
				title: title,
				action: this.loadList,
				obj: this

			});
		},

		loadList: function ($lbx, params) {
			var that = params.obj;
			var defaultFolder = "../../templates/LOM-Layouts/";
			var customFolder = "content/templates/layouts/";
			var courseFolder = that.editor.courseFolder;


			$lbx.find("button[data-id]").click(function () {
				that.initLayouts(defaultFolder + $(this).attr("data-id") + ".html");
			});

			$.post(that.editor.relPath + 'editor.php', {
				action: "readfolder",
				filename: 'courses/' + courseFolder + '/' + customFolder,
				regex: "/^.*\.(html|htm)$/i"
			}, function (data) {
				//parse the jSON
				if (data !== "false") {
					that.loadCustomLayouts(data.slice(0, -1), customFolder);
				}


			}).fail(function () {
				alert("Posting failed while reading folder.");
			});
		},

		initLayouts: function (filename) {
			//maybe I need to save content?
			this.change(filename);
			//close the popper
			this.editor.lbxController.close();

		},

		loadCustomLayouts: function (pages, folder) {
			var that = this;
			var aPages = pages.split(",");
			$("#layoutpicker").prepend("<section id='LOM_custom_layouts'></section>");
			var $holder = $("#LOM_custom_layouts");
			$holder.append("<h3>" + ((Utils.lang === "en") ? "Custom Layouts" : "Dispositions personnalisées") + "</h3>");

			for (var i = 0; i < aPages.length; i++) {
				//console.log(aPages[i]);
				//
				$holder.append("<button class=\"snap-lg ico-LOM-custom\" data-id=\"" + aPages[i] + "\">" + aPages[i] + "</button>");
			}
			$holder.find(".ico-LOM-custom").click(function () {
				that.loadLayout(folder + $(this).attr("data-id"));
			});


		},

		/*---------------------------------------------------------------------------------------------
				------------------------- LAYOUT EDITOR new version
		---------------------------------------------------------------------------------------------*/
		/*
		 * 
		 */
		addRowBtn: function () {
			if ($(".LOM-blankpage-layout").length === 0 && $(".LOM-add-row").length === 0) {
				var that = this;
				if ($(CoreSettings.contentContainer).next("div.LOM-addrow-container").length === 0) {
					$(CoreSettings.contentContainer).after("<div class='LOM-addrow-container row'><button class='LOM-add-row snap-lg ico-LOM-layout'>Add a Row</button></div>");

					var $btn = $(CoreSettings.contentContainer).next("div.row").children("button.LOM-add-row");
					//on click, start mag popup
					$btn.click(function () {
						//pop lightbox, pass title action, file to open and object
						that.editor.lbxController.pop({
							action: that.initRowInterface,
							file: "templates/LOM-Layouts/row_picker_" + Utils.lang + ".html",
							obj: that
						});
					})
				}
			}

		},
		/* ************************************
		 * INIT ROW INTERFACE
		 * after lightbox open, setup buttons
		 * ***********************************/
		initRowInterface: function ($lbx, params) {
			var that = params.obj;
			//initialize the buttons
			var $btns = $lbx.find("button[data-cols]")
			//add th row on click
			$btns.click(function () {
				that.addRow($(this));
			})

		},
		//add the row
		addRow: function ($btn) {
			//get the new row layout from button
			var aCols = $btn.attr("data-cols").split("-");
			//get the current layout
			var $backup = this.getLayout();
			//add a row (both in original and dom)
			$backup.append("<section class='row'></section>");
			$(CoreSettings.contentContainer).append("<section class='row'></section>");
			var frameId;
			for (var i = 0; i < aCols.length; i++) {
				frameId = this.editor.generateId("LOMfr_");
				//add the columns both in original and DOM
				$backup.children(".row").last().append("<section id='" + frameId + "' class='col-md-" + aCols[i] + " LOM-frame'></section>");
				$(CoreSettings.contentContainer).children(".row").last().append("<section id='" + frameId + "' class='col-md-" + aCols[i] + " LOM-frame'></section>");
			}

			//swap the content into the new layout
			this.loadLayout($backup.html());

			//close the popper
			this.editor.lbxController.close();
			$btn.focus();
		},

		getLayout: function () {
			var $backup = $("<div>");
			$backup.append(this.parent.originalHtml);

			//$backup.find(".LOM-frame").html("");
			return $backup;

		}
	});
});