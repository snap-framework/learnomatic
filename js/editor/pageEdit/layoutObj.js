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


			/*
			//reset things
			this.frames = [];
			this.editor.elements = [];
			*/
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
				-------------------------
		---------------------------------------------------------------------------------------------*/
		/*
		 * 
		 */
		doSomethingElse: function () {

		}
	});
});
