define([

	'jquery',
	'labels',
	'settings-core',
	'modules/BaseModule',
	'utils'
], function ($, labels, CoreSettings, BaseModule, Utils) {
	'use strict';

	return BaseModule.extend({
		initialize: function (options) {

			this.isFrame = true;
			this.id = options.id;
			this.class = options.class;
			this.parent = options.parent;
			this.editor = this.parent.parent;
			this.$el = options.$el;
			this.initialized = false;

			this.edits = []; //try to remove this

			this.isModified = null;

			this.elements = [];
			this.labels = options.labels;

			this.frameNumber = 0;
			this.holderId = this.id;

			this.originalHtml = this.$el.html();
			this.newHtml = this.originalHtml;
			this.detectElements();
			//drag and drop
			this.initSortable();

			this.verifyInit();

		},


		verifyInit: function () {
			var flag = true;

			if (!this.initialized) {
				for (var i = 0; i < this.elements.length; i++) {
					flag = (!this.elements[i].isInitialized) ? false : flag;
				}
				if (flag === true) {
					this.initialized = true;
					this.doneInit();
				}
			}

		},
		doneInit: function () {

			this.addOnLoad();
		},

		/*---------------------------------------------------------------------------------------------
				-------------------------HOUSE KEEPING
		---------------------------------------------------------------------------------------------*/
		connectDom: function () {
			this.$el = $("#" + this.id);
		},


		addOnLoad: function () {
			//console.log("add buttons for "+this.id);

			this.autoAddBtn();
		},


		autoAddBtn: function () {
			var that = this;
			var iconSize = "";
			var text = this.addElementBtnTxt()

			if (this.$el.find(".LOM-blankpage-layout").length === 0) {
				iconSize = (this.$el.children(".LOM-element:not([data-lom-subtype=\"title\"])").length === 0) ? "lg" : "md";
				this.$el.append("<button class=\"snap-" + iconSize + " align-left ico-LOM-plus LOM-delete-on-save\" title=\"" + text + "\">" + text + "</button>");
				this.$el.children(".ico-LOM-plus").click(function () {
					that.editor.popElementPicker(this);
					return false;
				});


			}
		},

		addElementBtnTxt: function () {
			return (Utils.lang === "en") ? "Add Element" : "Ajouter un élément";
		},

		initSortable: function () {
			var that = this;

			this.$el.sortable({
				//axis: "y",
				//helper:"clone",
				handle: ".LOM-ui-handle",
				//containment: "parent",
				cursor: "move",
				items: ">.LOM-element",
				opacity: 0.1,
				revert: true,
				placeholder: "sortable-placeholder",
				tolerance: "pointer",
				cursorAt: {
					left: 0,
					top: 0
				},
				connectWith: ".LOM-frame",

				classes: {
					"ui-sortable": "highlight"
				},

				start: function () {
					$(".LOM-frame > .ico-LOM-plus").hide()
					$(".LOM-frame").css({ minHeight: "100px" });
				},
				stop: function (event, ui) {
					var item = ui.item;
					var itemId = $(item).attr("id");
					var targetFrame = that.parent.findFrame($(item).parent().attr("id"));

					//make a copy of the page to work.
					var $new = $("<div>");
					$new.html(that.editor.originalHtml);

					//save the object
					var newHtml = targetFrame.reorderSubElements($new);
					if (targetFrame !== that) {
						//this is a move to another frame
						// remove the excess? to avoid duplicate
						$new.find("#" + that.id).find("#" + itemId).remove();

					}
					$new.find("#" + targetFrame.id).html(newHtml);


					//assign the html to the editor and refresh / save to html
					that.editor.originalHtml = $new.html()
					that.editor.refreshHtml();

					$(".LOM-frame > .ico-LOM-plus").show()
					$(".LOM-frame").css({ minHeight: "unset" });
				},
				update: function (event, ui) {
					that.$el.children(".ico-LOM-plus").remove();
					that.autoAddBtn();
				}
			});
		},


		/*---------------------------------------------------------------------------------------------
				-------------------------ELEMENTS
		---------------------------------------------------------------------------------------------*/
		detectElements: function () {
			//ONLY detect the elements that are directly under the frame.
			var $elements = this.$el.children(".LOM-element");
			for (var i = 0; i < $elements.length; i++) {

				this.createElement($elements.eq(i));
			}
		},
		/*
		 * create an element. blank ?
		 */
		createElement: function ($element) {
			var that = this;
			this.editor.objElement({
				parent: that,
				$el: $element
			});
		},
		blankElement: function ($element) {
			var that = this;
			this.editor.objElement({
				parent: that,
				$target: $element
			});

		},
		//whenever Add New Element is called, it'll need answers
		targetNewElement: function () {
			return this.$el;
		},

		addElement: function () {
			this.editor.prepareElement(this.$el);
			this.editor.createElement("default");
		},
		destroy: function () {
			$("#" + this.id).remove();
			for (var i = 0; i < this.elements.length; i++) {
				this.elements[i].destroy();
			}
			//just some cleanup;
			this.originalHtml = null;
			this.newHtml = null;
		},

		reorderSubElements: function ($originalHtml) {
			var $return = $("<div>");
			//just go grab the order
			var $children = $("#" + this.id).children(".LOM-element");
			var refID;
			//THE NEW WORLDFRAME ORDER
			for (var i = 0; i < $children.length; i++) {
				refID = $children.eq(i).attr("id");
				$return.append($originalHtml.find("#" + refID).outerHTML());

			}
			//this should return HTML
			return $return.html();
		},

		/*---------------------------------------------------------------------------------------------
				-------------------------CHANGING FRAME
		---------------------------------------------------------------------------------------------*/


		/*
		 * 
		 */

		addFrameNumber: function () {
			this.$el.removeAttr("data-frame-number");
			this.$el.find(".LOM-frame-number").remove();

			this.$el.attr("data-frame-number", this.frameNumber);
			this.$el.prepend("<div class=\"LOM-frame-number LOM-delete-on-save\">" + this.frameNumber + "</div>");
		},

		removeFrameNumber: function () {
			this.$el.removeAttr("data-frame-number");
			this.$el.find(".LOM-frame-number").remove();
			this.frameNumber = 0;
		},


		doSomethingElse: function () {

		}
	});
});
