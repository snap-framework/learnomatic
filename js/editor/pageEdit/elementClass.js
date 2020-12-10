define([
	'underscore',
	'jquery',
	'settings-core',
	'helpers/BaseClass',
	'utils',
	'./../pageEdit/editBoxObj',
	'./../../plugins/ckeditor/ckeditor',
	'./../themeEdit/style-manager'
], function (_, $, CoreSettings, BaseClass, Utils, EditBoxObj, CKEDITOR, StyleManager) {
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
			this.isFrame = false;
			this.idPrefix = "LOM_el_";

			options = options || {};
			this.options = options;
			this.params = options.params;


			/*------------------------- properties ---------------------*/
			this.isInitialized = false;
			this.isFirstLoad = false;
			this.id = (typeof options.id === "undefined") ? null : options.id;
			this.$el = (typeof options.$el !== "undefined") ? options.$el : null;
			this.type = (typeof options.type !== "undefined") ? options.type : this.getType();
			this.lang = Utils.lang;

			/*------------------------- customized params ---------------------*/
			this.subtype = null;
			this.getParams(options);

			//--------------relations
			this.parent = options.parent;
			this.parentFrame = this.findFrame();
			this.layout = this.parentFrame.parent;
			this.editor = this.parentFrame.parent.parent;
			this.editor.elements[this.editor.elements.length] = this;

			this.elements = [];
			this.autoLoaded = [];

			this.edits = [];

			//--------------content management

			this.$holder = null;
			this.reviews = [];

			//if it's nothing
			this.$target = (typeof options.$target === "undefined") ? null : options.$target;
			this.isModified = null;
			this.originalHtml = null;
			this.newHtml = null;
			this.autoAddElement = null;
			this.autoAddButton = true;

			this.labels = this.editor.labels.element;
			this.setLabelsDone = false;
			this.typeName = this.labels.type.default;

			this.creationMode = (typeof options.mode === "undefined") ? "existing" : options.mode;
			//----------------PERMISSIONS---------
			this.permissions = (typeof options.permissions !== "undefined") ? options.permissions : this.getPermissions();
			this.changePermissions();
			//preload all subElements into editor.
			this.preloadSubElements();

			//----------------
			that.initialize.apply(that, args);

			if (this.$el === null) {
				//lets create a new object ! 
				this.create();
			} else {
				//$el exists, we're initializing
				this.initExisting();
			}

		},
		/*---------------------------------------------------------------------------------------------
				-------------------------PERMISSIONS
		---------------------------------------------------------------------------------------------*/
		getPermissions: function () {
			var perms;
			perms = {
				editButtons: {
					add: false,
					edit: false,
					config: false,
					classPicker: false,
					style: false,
					review: true,
					delete: true
				},
				subElements: {
					text: false,
					image: false,
					custom: false,
					accordion: false,
					details: false,
					activity: false,
					exam: false,
					multiplechoice: false,
					radiobtn: false,
					checkbox: false,
					lightbox: false,
					audio: false,
					video: false,
					html: false,
					btngroup: false,
					button: false,
					faq: false,
					container: false,
					carousel: false,
					panel: false
				},
				sortable: true,
				functionalities: {
					delaySubElements: false

				}
			};
			return perms;
		},

		changePermissions: function () {
			return this.permissions;
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
		-------------------------INITIALIZE NEW
		---------------------------------------------------------------------------------------------*/


		//--------------------------get the template for new element---
		create: function () {
			var that = this;
			//get the HTML template. might or not exist
			var template = this.editor.findElementTemplate(this.type);
			if (template === false) {
				this.editor.addElementTemplate(this.type);
				template = this.editor.findElementTemplate(this.type);
			}


			if (template === false) {
				$.get("../../templates/LOM-Elements/element_" + this.type + ".html", function (data) {
					that.editor.subElements[that.type] = data;


					that.initNew(data);
				});
			} else {

				that.initNew(template);
			}


		},

		// init the new HTML
		initNew: function (templateHtml) {
			var $template = $("<div>");
			$template.append(templateHtml);
			//$el does NOT exist, we're creating from scratch
			this.id = this.editor.generateId(this.idPrefix);
			//get an ID for each editbox, right away
			for (var i = 0; i < $template.find(".LOM-editable").length; i++) {
				$template.find(".LOM-editable").eq(i).attr("id", this.editor.generateId("LOM-edit-" + this.id + "-" + i));

			}
			//add subtype is this needed?
			if (this.subtype !== null) {
				$template.children(".LOM-element").attr("data-LOM-subtype", this.subtype);
				this.$target.children(".LOM-element").last().attr("data-LOM-subtype", this.subtype);

			}
			// tweak the html before it reaches the DOM
			$template = this.initDefaultDomValues($template);
			//write HTML to page
			if (this.parent.isFrame) {
				//insert HTML into DOM if parent is a frame
				this.$target.children("button.ico-LOM-plus").before($template.html());
			} else {
				if (this.$target.children("button.ico-LOM-plus").length > 0) {
					//insert HTML into DOM if parent is element
					this.$target.children("button.ico-LOM-plus").before($template.html());
				} else {
					//insert HTML into DOM
					this.$target.append($template.html());
				}

			}

			var $children;
			$children = this.$target.children(".LOM-element").last();
			this.$el = $children.eq($children.length - 1);

			//add attribute ID
			this.$el.attr("id", this.id);

			//save 
			this.appendOriginalHtml($template.html());

			//DONE, better check everything is initialized;
			this.initExisting();
		},

		// write the html to the file 
		appendOriginalHtml: function (newHtml) {

			var $original = $("<div>");
			$original.append(this.editor.originalHtml);
			$original.find("#" + this.parent.holderId).append(newHtml);
			$original.find("#" + this.parent.holderId).children(".LOM-element").last().attr("id", this.id);
			this.editor.originalHtml = $original.html();

		},

		//this was originally initDom but gotta separate it.
		//this happens BEFORE the object is loaded into the actual DOM
		initDefaultDomValues: function ($template) {
			return $template;
		},

		addOriginalId: function () {
			var $temp = $("<div>");
			$temp.append(this.editor.originalHtml);
			if (this.parent.isFrame) {

				$temp.find("#" + this.parent.id).children(".LOM-element").eq(this.$el.index()).attr("id", this.id)
				this.editor.originalHtml = $temp.html();
			}

		},

		/*---------------------------------------------------------------------------------------------
		-------------------------INITIALIZE EXISTING
		---------------------------------------------------------------------------------------------*/

		initExisting: function () {
			//make sure we have an ID
			if (this.id === null) {
				if (typeof this.$el.attr("id") === "undefined") {
					// we got nothing
					this.id = this.editor.generateId(this.idPrefix);
					this.$el.attr("id", this.id);
					//need to update the originalHtml
					this.addOriginalId();

				} else {
					//we can pick from the element
					this.id = this.$el.attr("id");
				}
			}

			//get subtype
			if (this.subtype === null) {
				this.subtype = (typeof this.$el.attr("data-LOM-subtype") !== "undefined") ? this.$el.attr("data-LOM-subtype") : null;
			}
			//init the holder (that in which subElements go.)
			this.$holder = this.getHolder();
			//for custom dom initialization like onClick and stuff
			this.initDom();
			//how about initialize sub elements? if allowed of course
			this.initSubElements();

			this.setLabels();


			this.verifyInit();

			if (this.creationMode !== "existing") {
				//this might need to be removed but it's used in "load sub elements"
				this.creationMode = "existing";
			}
		},

		/*---------------------------------------------------------------------------------------------
		-------------------------DOM attach and set
		---------------------------------------------------------------------------------------------*/

		//consider destroying this... 
		connectDom: function () {
			this.$el = $("#" + this.id);
		},

		getHolder: function () {
			var $holder;
			var $bkp = this.getBkp();
			var holderSelector = this.getCustomHolderSelector();
			//check if it'S a child, otherwise, lets go
			if ($bkp.find("#" + this.id).eq(0).find(holderSelector).length > 0) {
				//ok so we have a holder;
				$holder = $("#" + this.id).eq(0).find(holderSelector).eq(0);
				//this is it, we found it! do we have an ID or do we build it?
				if (typeof $bkp.find("#" + this.id).eq(0).find(holderSelector).attr("id") !== "undefined") {
					this.holderId = $bkp.find("#" + this.id).find(holderSelector).attr("id");
				} else {
					//console.log("the holder is found but it has no ID!!")
					this.holderId = this.id + "_holder";
					$bkp.find("#" + this.id).eq(0).find(holderSelector).eq(0).attr("id", this.holderId);
					$holder.attr("id", this.holderId);
				}


			} else {
				this.holderId = this.id;
				$holder = this.$el;
			}
			this.updateBkp($bkp);
			return $holder;
		},

		getCustomHolderSelector: function () {
			return ".LOM-holder";
		},

		/*
		 * editor calls this to aim at where to put the new element
		 */
		getTarget: function () {
			var target;
			target = this.$holder;
			return target;
		},

		getType: function () {
			var type = null;
			type = this.$el.attr("data-lom-element");
			return type;
		},

		setAnimations: function () {
			this.$el.hide();
			this.$el.slideDown("swing", function () {
				// Animation complete.
				//WHY STORE VALUE HERE???
				//that.storeValue();
				//that.editor.activateEdits();
			});
		},


		/*---------------------------------------------------------------------------------------------
		-------------------------POST INITIALIZATION
		---------------------------------------------------------------------------------------------*/
		verifyInit: function () {
			var counter = 0;
			for (var i = 0; i < this.elements.length; i++) {
				counter = (this.elements[i].isInitialized) ? counter + 1 : counter;
			}
			if (counter === this.elements.length && !this.isInitialized) {
				this.isInitialized = true;
				this.parent.verifyInit();
				this.doneInit();

				if (!this.setLabelsDone) {
					this.setLabels();
				}
				this.initEditBar();
				this.autoAddBtn();
				if (this.permissions.sortable) {
					this.initSortable();
				}

				if (this.parent.isFrame) {
					this.initSortableHandle()
				} else if (this.parent.permissions.sortable) {
					this.initSortableHandle();
				}

				//after EVERYTHING is done.
				this.customAfterLoad();

			}
		},

		initDom: function () {
			return false;
		},

		setLabels: function () {
			this.setLabelsDone = true;
			return false;
		},

		doneInit: function () {
			return false;
		},

		customAfterLoad: function () {
			return false;
		},

		/*---------------------------------------------------------------------------------------------
				-------------------------House Keeping
		---------------------------------------------------------------------------------------------*/

		activateEdits: function () {
			for (var i = 0; i < this.edits.length; i++) {
				this.edits[i].activate();
			}
		},

		/*---------------------------------------------------------------------------------------------
		-------------------------EDIT BAR
		---------------------------------------------------------------------------------------------*/

		isInSmallFrame: function () {
			if (this.parentFrame.$el.hasClass("col-md-4") || this.parentFrame.$el.hasClass("col-md-3") || this.parentFrame.$el.hasClass("col-md-2") || this.parentFrame.$el.hasClass("col-md-1")) {
				return true;
			} else {
				return false;
			}
		},

		initEditBar: function () {
			//this.changePermissions();
			this.$el.children(".LOM-edit-view").remove();
			this.$editBar = this.appendEditBar();

			if (this.permissions.editButtons.add) {
				this.initAddBtn();
			}
			if (this.permissions.editButtons.edit) {
				this.initEditsBtn();
			}
			if (this.permissions.editButtons.config) {
				this.initConfigBtn();
			}
			if (this.permissions.editButtons.classPicker) {
				this.initClassPickerBtn();
			}
			if (this.permissions.editButtons.style) {
				this.styleManager = new StyleManager({
					parent: this,
					labels: this.labels
				})
				this.initStyleBtn();
			}
			if (this.permissions.editButtons.review) {
				this.initReviewBtn();
			}

			this.initCustomButton();

			if (this.permissions.editButtons.delete) {
				this.initDeleteBtn();
			}
		},
		appendEditBar: function () {
			this.$el.append("<div class=\"LOM-delete-on-save LOM-edit-view\" tabindex=\"-1\"><span class=\"LOM-label\"></span></div>");
			return this.$el.children(".LOM-edit-view").eq(0);
		},

		//-------------- ADD -----------
		initAddBtn: function () {
			var icon = "LOM-plus";
			var text = this.labels.editview.add;
			var $btn;
			var that = this;
			this.$editBar.append("<button class=\"snap-xs ico-" + icon + "\" title=\"" + text + "\">" + text + "</button>");
			$btn = this.$editBar.children("button.ico-" + icon + "");
			$btn.click(function () {
				that.addClicked();
			});

		},

		addClicked: function () {
			if (!this.editor.locked) {
				this.autoAdd();
			} else {
				this.editor.lockMessage();
			}
		},

		autoAdd: function () {
			if (this.autoAddElement !== null) {
				var $target = this.$holder;
				var options = {
					parent: this,
					$target: $target,
					type: this.autoAddElement,
					mode: "add"
				};
				this.editor.objElement(options);
				this.editor.refreshHtml();

			}
		},

		//-------------- EDIT -----------
		initEditsBtn: function () {
			var icon = "SNAP-edit";
			var text = this.labels.editview.edit + " " + this.typeName.toLowerCase();
			var that = this;
			var $btn;
			this.$editBar.append("<button class=\"snap-xs ico-" + icon + "\" title=\"" + text + "\">" + text + "</button>");
			$btn = this.$editBar.children("button.ico-" + icon + "");
			$btn.click(function () {
				that.editsClicked();
			});
			$btn.hover(
				function () {
					if (!that.isInSmallFrame()) {
						$(this).parent().children("span").text(text);
					}
				},
				function () {
					if (!that.isInSmallFrame()) {
						$(this).parent().children("span").text("");
					}
				}
			);
		},

		editsClicked: function () {
			return false
		},

		autoFocus: function () {
			this.edits[0].autoFocus();
		},

		//-------------- CONFIG -----------
		initConfigBtn: function () {
			var icon = "LOM-wrench";
			var text = this.labels.editview.config + " " + this.typeName.toLowerCase();
			var that = this;
			var $btn;
			this.$editBar.append("<button class=\"snap-xs ico-" + icon + "\"  title=\"" + text + "\">" + text + "</button>");
			$btn = this.$editBar.children("button.ico-" + icon + "");
			$btn.click(function () {
				that.configClicked();
			});
			$btn.hover(
				function () {
					if (!that.isInSmallFrame()) {
						$(this).parent().children("span").text(text);
					}
				},
				function () {
					if (!that.isInSmallFrame()) {
						$(this).parent().children("span").text("");
					}
				}
			);
		},

		configClicked: function () {
			if (!this.editor.locked) {
				this.autoConfig();
			} else {
				this.editor.lockMessage();
			}
		},

		autoConfig: function (parameters) {
			var params = (typeof parameters !== "undefined") ? parameters : null;
			this.popConfig();
			return params;
		},

		//-------------- Class picker -----------
		initClassPickerBtn: function () {
			var icon = "LOM-classPicker";
			var text = this.labels.editview.classPicker.btn;
			var that = this;
			var $btn;
			this.$editBar.append("<button class=\"snap-xs ico-" + icon + "\"  title=\"" + text + "\">" + text + "</button>");
			$btn = this.$editBar.children("button.ico-" + icon + "");
			$btn.click(function () {
				that.classPickerClicked();
			});
			$btn.hover(
				function () {
					if (!that.isInSmallFrame()) {
						$(this).parent().children("span").text(text);
					}
				},
				function () {
					if (!that.isInSmallFrame()) {
						$(this).parent().children("span").text("");
					}
				}
			);
		},

		classPickerClicked: function () {
			if (!this.editor.locked) {
				this.autoClassPicker();
			} else {
				this.editor.lockMessage();
			}

		},

		autoClassPicker: function (parameters) {
			var params = (typeof parameters !== "undefined") ? parameters : null;
			this.popClassPicker();
			return params;
		},
		//-------------- Style picker -----------
		initStyleBtn: function () {
			var icon = "LOM-theme";
			var text = this.labels.editview.style.btn;
			var that = this;
			var $btn;
			this.$editBar.append("<button class=\"snap-xs ico-" + icon + "\"  title=\"" + text + "\">" + text + "</button>");
			$btn = this.$editBar.children("button.ico-" + icon + "");
			$btn.click(function () {
				that.styleClicked();
			});
			$btn.hover(
				function () {
					if (!that.isInSmallFrame()) {
						$(this).parent().children("span").text(text);
					}
				},
				function () {
					if (!that.isInSmallFrame()) {
						$(this).parent().children("span").text("");
					}
				}
			);
		},

		styleClicked: function () {
			if (!this.editor.locked) {
				this.autoStyle();
			} else {
				this.editor.lockMessage();
			}
		},

		autoStyle: function (parameters) {
			this.styleManager.initLbx();

		},

		//-------------- Review button -----------
		initReviewBtn: function () {
			var icon = "LOM-review";
			var text = this.labels.editview.review.btn;
			var that = this;
			var $btn;
			this.$editBar.append("<button class=\"snap-xs ico-" + icon + "\"  title=\"" + text + "\">" + text + "</button>");
			$btn = this.$editBar.children("button.ico-" + icon + "");
			$btn.click(function () {
				that.reviewClicked();
			});
			$btn.hover(
				function () {
					if (!that.isInSmallFrame()) {
						$(this).parent().children("span").text(text);
					}
				},
				function () {
					if (!that.isInSmallFrame()) {
						$(this).parent().children("span").text("");
					}
				}
			);
		},

		reviewClicked: function () {
			if (!this.editor.locked) {
				this.autoReview();
			} else {
				this.editor.lockMessage();
			}
		},

		autoReview: function (parameters) {
			var params = (typeof parameters !== "undefined") ? parameters : null;
			//this.editor.social.reviewManager.popGeneralReviews(this);
			this.editor.social.reviewManager.popReviews(this);
			return params;
		},

		//-------------- DELETE -----------
		initDeleteBtn: function () {
			var that = this;
			var icon = "SNAP-delete";
			var text = this.labels.editview.delete + " " + this.typeName.toLowerCase();
			var $btn;
			this.$editBar.append("<button class=\"snap-xs ico-" + icon + "\" title=\"" + text + "\">" + text + "</button>");
			$btn = this.$editBar.children("button.ico-" + icon + "");

			$btn.hover(
				function () {
					if (!that.isInSmallFrame()) {
						$(this).parent().children("span").text(text);
					}
					$(this).parent().parent().addClass("LOM-pending-delete");
				},
				function () {
					if (!that.isInSmallFrame()) {
						$(this).parent().children("span").text("");
					}
					$(this).parent().parent().removeClass("LOM-delete-last").removeClass("LOM-pending-delete");
				}
			);

			$btn.click(function () {
				that.deleteClicked();
			});
		},

		deleteClicked: function () {
			var delText;
			//change the alert box to somethingf more fun
			if (!this.editor.locked) {
				if (this.typeName != this.labels.type.default) {
					delText = (Utils.lang === "en") ? "Delete this " + this.typeName.toLowerCase() + " element?" : "Supprimer cet élément " + this.typeName.toLowerCase() + "?";
				} else {
					delText = (Utils.lang === "en") ? "Delete this element?" : "Supprimer cet élément?";
				}
				if (confirm(delText)) {
					this.autoDelete();
					return false;
				}
			} else {
				this.editor.lockMessage();
			}
		},

		autoDelete: function (parameters) {
			var params = (typeof parameters !== "undefined") ? parameters : null;
			this.destroy();

			var $new = $("<div>");
			$new.append(this.editor.originalHtml);
			$new.find("#" + this.id).eq(0).remove();
			this.editor.originalHtml = $new.html();
			this.editor.refreshHtml();
			return params;
		},

		initCustomButton: function () {
			return false;
		},

		/*---------------------------------------------------------------------------------------------
		-------------------------LBX management
		---------------------------------------------------------------------------------------------*/
		defaultLbxSettings: function (title, action, save) {
			var params = {
				title: title,
				action: action,
				targetId: "custom_lbx",
				saveBtn: save,
				obj: this
			};
			if (action == "config") {
				return this.changeDefaultLbxSettings(params);
			} else {
				return params;
			}
		},

		changeDefaultLbxSettings: function (params) {
			return params;
		},

		configLbxSettings: function () {
			var that = this;
			var params = {
				$paramTarget: that.$el,
				selector: null,
				files: [
					//"../../templates/LOM-Elements/element_config_default.html"
				],
				attributes: {
					//"data-text":"Text Value",
					/*"data-options": [
					   "Option 1",
					   "Option 2"]*/
				}
			};
			return this.changeDefaultConfigSettings(params);
		},

		changeDefaultConfigSettings: function (params) {
			return params;
		},

		loadLbx: function (params) {
			var that = this;
			var title = params.lbx.title;
			var saveBtn = params.lbx.saveBtn;
			var targetId = params.lbx.targetId;
			//change the title
			$("#lbx-title").text(title);

			//change save Msg
			$("#" + targetId).parent().children(".modal-footer").html("<button class=\"snap-md ico-SNAP-save\">" + saveBtn + "</button></div>");

			switch (params.lbx.action) {
				case "config":
					// code block
					this.loadConfigLbx(params);
					$("#" + targetId).parent().children(".modal-footer").children("button").click(function () {
						that.submitConfig(params);
					});
					break;
				case "classPicker":
					// code block
					this.loadClassPickerLbx(params);
					$("#" + targetId).parent().children(".modal-footer").children("button").click(function () {
						that.submitClassPicker(params);
					});
					break;
				default:
				// code block
			}
		},

		closeLbx: function () {
			this.editor.closeLbx();
		},

		/*---------------------------------------------------------------------------------------------
		-------------------------CONFIGURATION
		---------------------------------------------------------------------------------------------*/
		popConfig: function () {
			var popParams = {};
			//send title and action
			var save = (Utils.lang === "en") ? "Save Configuration" : "Sauvegarder la configuration";
			popParams.lbx = this.defaultLbxSettings("Configuration", "config", save);
			popParams.config = this.configLbxSettings();

			this.editor.popLightbox(popParams);
		},

		loadConfigLbx: function (params) {
			//load files
			if (params.config.files.length > 0) {
				this.loadConfigFiles(params);
			}
			//load attributes
			this.loadConfigAttributes(params);

			this.loadConfigCustom(params);


		},

		/*
		 * this loads ajax files for the configuration
		 */
		loadConfigFiles: function (params) {
			var that = this;
			var files = params.config.files;
			var $target = $("#" + params.lbx.targetId);
			that.configPages = 0;
			that.configPagesCount = files.length;

			for (var i = 0; i < that.configPagesCount; i++) {
				$target.append("<div class='LOM-config-load'></div>");
				$target.children(".LOM-config-load").eq(i).load(files[i], function () {
					that.checkConfigFilesInit(params);
				});
			}
		},

		/*
		 * this relays after the config files were loaded
		 */
		checkConfigFilesInit: function (params) {
			var $target = $("#" + params.lbx.targetId);
			this.configPages++;

			if (this.configPages === this.configPagesCount) {
				this.editor.parent.initWbs($target);
				this.initializeConfigFiles(params);
				if ($target.children(".LOM-config-load").children(".config-action").length > 0) {
					this.initializeAction(params);
				}
				this.initializeCustomFiles(params);
			}
		},

		initializeCustomFiles: function (params) {
			//does this even exist?
			return true;
		},

		initializeConfigFiles: function (params) {
			return params;
		},

		loadConfigCustom: function () {
			return false;
		},

		submitConfig: function (params) {
			var $bkp = this.getBkp();

			var id = params.lbx.targetId;
			var $paramTarget = params.config.$paramTarget;

			//LOM-attr-value
			var $attributes = $("#" + id).find(".LOM-attr-value");
			var value;
			var name;

			for (var i = 0; i < $attributes.length; i++) {
				name = $attributes.eq(i).attr("name");
				value = $attributes.eq(i).val();
				if (!params.config.selector) {
					this.$el.attr(name, value);
					$bkp.find("#" + this.id).attr(name, value);
					$paramTarget.attr(name, value);
				} else {
					this.$el.find(params.config.selector).attr(name, value);
					$bkp.find("#" + this.id).find(params.config.selector).attr(name, value);
					$paramTarget.find(params.config.selector).attr(name, value);
				}


			}

			this.updateBkp($bkp);
			this.submitCustomConfig(params);
			this.closeLbx();
			this.editor.refreshHtml();
		},

		submitCustomConfig: function (params) {
			return params;
		},

		/*---------------------------------------------------------------------------------------------
		-------------------------CONFIGURATION ACTIONS
		---------------------------------------------------------------------------------------------*/
		initializeAction: function (params) {
			var $target = $("#" + params.lbx.targetId);
			var $actionDiv = $target.children(".LOM-config-load").children(".config-action");
			if ($actionDiv.length > 0) {
				//init Lightbox Buttons
				this.initActionLightbox(params);
				this.initActionNavigation(params);
				this.initActionOther(params);
				this.initActionCustom(params);
				//setting action override
				$actionDiv.find("[name='onclick']").html(this.$el.attr("onclick"));

			}
		},

		initActionLightbox: function (params) {
			var $btn;
			var script;
			var $target = $("#" + params.lbx.targetId);
			var $container = $target.find(".lbx-list");
			//save the button template
			var template = $container.html();
			$container.html("");
			//collection of lightboxes in the page
			var $lbx = $(CoreSettings.contentContainer).find("[data-lom-element='lightbox']");
			//loop through lightboxes
			if ($lbx.length > 0) {
				for (var i = 0; i < $lbx.length; i++) {
					//add the button template
					$container.append(template);
					$btn = $container.children("li").last().children("button");

					if ($lbx.eq(i).find(".modal-title").find("textarea.LOM-editable").length) {
						$btn.text(((Utils.lang === "en") ? "Select" : "Sélectionner") + " \"" + $lbx.eq(i).find(".modal-title").find("textarea.LOM-editable").text() + "\"");
					} else {
						$btn.text(((Utils.lang === "en") ? "Select" : "Sélectionner") + " \"" + $lbx.eq(i).find(".modal-title").text() + "\"");
					}

					$btn.attr("id", "lbx" + i);

					//GODDAMN WB ADD!!! i KNOW this is messy but direct click doenst work cuz of wb-tabs
					script = "masterStructure.editor.findElement('" + this.id + "').setActionLbx('" + $lbx.eq(i).attr("id") + "_lbx', '#lbx" + i + "', '#" + params.lbx.targetId + "');"
					$btn.attr("onclick", script);

					if ($("#" + this.id).find("button.LOM-btn").attr("onclick") && $("#" + this.id).find("button.LOM-btn").attr("onclick").indexOf($lbx.eq(i).attr("id") + "_lbx") >= 0) {
						$btn.addClass("currentLbx");
					}
				}
			} else {
				$container.html("<li><p class='ribbon warning'>" + ((Utils.lang === "en") ? "No Lightbox on this page" : "Aucune fenêtre contextuelle sur cette page") + "</p></li>");
			}
		},

		setActionLbx: function (targetId, id, target) {
			$(target).find(".lbx-list").find("li").find("button").removeClass("currentLbx");
			$(target).find(".nav-list").find("li").find("button").removeClass("currentNav");
			$(target).find(".other-list").find("li").find("button").removeClass("currentOther");
			$(target).find(".custom-script").find("button").removeClass("currentCustom");
			$(target).find(".lbx-list").find(id).addClass("currentLbx");

			$(".LOM-custom-script").removeClass("LOM-attr-value");

			var $bkp = this.getBkp();
			$("#" + this.id).find("button.LOM-btn").attr("onclick", "$.magnificPopup.open({ items: { src: '#" + targetId + "' }, type: 'inline', removalDelay: 500, callbacks: { beforeOpen: function() { this.st.mainClass = 'mfp-zoom-in'; } }, midClick: true }, 0);");
			$bkp.find("#" + this.id).find("button.LOM-btn").attr("onclick", "$.magnificPopup.open({ items: { src: '#" + targetId + "' }, type: 'inline', removalDelay: 500, callbacks: { beforeOpen: function() { this.st.mainClass = 'mfp-zoom-in'; } }, midClick: true }, 0);");
			this.saveBkp($bkp);

			return false;
		},

		initActionNavigation: function (params) {
			var $btn;
			var script;
			var $target = $("#" + params.lbx.targetId);
			var $container = $target.find(".nav-list");

			//save the button template
			var template = $container.html();
			$container.html("");

			//collection of pages in the course
			var pages = this.editor.parent.flatList;

			//loop through pages
			if (pages.length > 0) {
				if (pages.length == 1 && pages[0].sPosition == this.editor.parent.currentSub.sPosition) {
					$container.html("<li><p class='ribbon warning'>" + ((Utils.lang === "en") ? "No pages available" : "Aucune page disponible") + "</p></li>");
				} else {
					for (var i = 0; i < pages.length; i++) {
						if (pages[i].sPosition != this.editor.parent.currentSub.sPosition) {

							//add the button template
							$container.append(template);
							$btn = $container.children("li").last().children("button");

							$btn.text(((Utils.lang === "en") ? "Navigate to page " : "Naviguer vers la page ") + (pages[i].flatID + 1) + ((Utils.lang === "en") ? ": " : " : ") + this.getLocation(pages[i].sPosition, pages[i].title));
							$btn.attr("id", "page" + i);

							//GODDAMN WB ADD!!! i KNOW this is messy but direct click doenst work cuz of wb-tabs
							script = "masterStructure.editor.findElement('" + this.id + "').setActionNav('" + pages[i].sPosition + "', '#page" + i + "', '#" + params.lbx.targetId + "');"
							$btn.attr("onclick", script);

							if ($("#" + this.id).find("button.LOM-btn").attr("onclick") && $("#" + this.id).find("button.LOM-btn").attr("onclick").indexOf(pages[i].sPosition) >= 0) {
								$btn.addClass("currentNav");
							}
						}
					}
				}
			} else {
				$container.html("<li><p class='ribbon warning'>" + ((Utils.lang === "en") ? "No pages available" : "Aucune page disponible") + "</p></li>");
			}
		},

		getLocation: function (pos, title) {
			var list = this.editor.master.flatList;
			var sub, location;

			for (var i = 0; i < list.length; i++) {
				if (list[i].sPosition == pos) {
					sub = list[i];
				}
			}

			if (sub.parent) {
				location = sub.parent.title;

				if (sub.parent.parent) {
					location = sub.parent.parent.title + " > " + location;
				}
			} else {
				location = (Utils.lang === "en") ? "Course Root" : "Racine du cours"
			}

			location = location + " > " + title + " (" + pos + ")";

			return location;
		},

		setActionNav: function (targetPage, id, target) {
			$(target).find(".lbx-list").find("li").find("button").removeClass("currentLbx");
			$(target).find(".nav-list").find("li").find("button").removeClass("currentNav");
			$(target).find(".other-list").find("li").find("button").removeClass("currentOther");
			$(target).find(".custom-script").find("button").removeClass("currentCustom");
			$(target).find(".nav-list").find(id).addClass("currentNav")

			var $bkp = this.getBkp();
			$("#" + this.id).find("button.LOM-btn").attr("onclick", "fNav(\"" + targetPage + "\")");
			$bkp.find("#" + this.id).find("button.LOM-btn").attr("onclick", "fNav(\"" + targetPage + "\")");
			this.saveBkp($bkp);

			return false;
		},

		initActionOther: function (params) {
			var $target = $("#" + params.lbx.targetId);
			var $container = $target.find(".other-list");

			var $btns = $container.find("button");

			var that = this;
			$btns.each(function (i) {
				$(this).attr("id", "other" + i);

				var script = "masterStructure.editor.findElement('" + that.id + "').setActionOther('" + $(this).data("script") + "', '#other" + i + "', '#" + params.lbx.targetId + "');";
				$(this).attr("onclick", script);

				if ($("#" + that.id).find("button.LOM-btn").attr("onclick") && $("#" + that.id).find("button.LOM-btn").attr("onclick") == $(this).data("script")) {
					$(this).addClass("currentOther");
				}
			});
		},

		setActionOther: function (script, id, target) {
			$(target).find(".lbx-list").find("li").find("button").removeClass("currentLbx");
			$(target).find(".nav-list").find("li").find("button").removeClass("currentNav");
			$(target).find(".other-list").find("li").find("button").removeClass("currentOther");
			$(target).find(".custom-script").find("button").removeClass("currentCustom");
			$(target).find(".other-list").find(id).addClass("currentOther");

			var $bkp = this.getBkp();
			$("#" + this.id).find("button.LOM-btn").attr("onclick", script);
			$bkp.find("#" + this.id).find("button.LOM-btn").attr("onclick", script);
			this.saveBkp($bkp);

			return false;
		},

		initActionCustom: function (params) {
			var $target = $("#" + params.lbx.targetId);
			var $container = $target.find(".custom-script");

			if ($("#" + this.id).find("button.LOM-btn").attr("onclick")) {
				$target.find("#LOM-custom-script").html($("#" + this.id).find("button.LOM-btn").attr("onclick"))
			}

			var $btn = $container.find("button");

			var script = "masterStructure.editor.findElement('" + this.id + "').setActionCustom('#" + params.lbx.targetId + "');";
			$btn.attr("onclick", script);
		},

		setActionCustom: function (target) {
			$(target).find(".lbx-list").find("li").find("button").removeClass("currentLbx");
			$(target).find(".nav-list").find("li").find("button").removeClass("currentNav");
			$(target).find(".other-list").find("li").find("button").removeClass("currentOther");
			$(target).find(".custom-script").find("button").addClass("currentCustom");

			var customScript = $(target).find("#LOM-custom-script").val();

			var $bkp = this.getBkp();
			$("#" + this.id).find("button.LOM-btn").attr("onclick", customScript);
			$bkp.find("#" + this.id).find("button.LOM-btn").attr("onclick", customScript);
			this.saveBkp($bkp);

			return false;
		},

		/*---------------------------------------------------------------------------------------------
		-------------------------CONFIGURATION ATTRIBUTES
		---------------------------------------------------------------------------------------------*/

		loadConfigAttributes: function (params) {
			var that = this;
			var attr = params.config.attributes;
			var $target = $("#" + params.lbx.targetId);
			var oldValue;
			var newAttr;
			var value;
			var options;
			Object.keys(attr).forEach(function (key) {
				//whats the attr
				newAttr = key;
				oldValue = params.config.$paramTarget.attr(newAttr);
				switch (typeof attr[key]) {
					case "string":
						//------------------------ TEXT BOX
						//check if it exists
						if (typeof oldValue !== typeof undefined && oldValue !== false) {
							//replace old value
							value = oldValue;
						} else {
							//use the default
							value = attr[key];
						}
						that.loadConfigAttrString($target, newAttr, value);
						break;
					case "object":

						//whats the default
						value = attr[key];
						if (Array.isArray(value)) {
							options = value;
							//------------------------ ARRAY OF OPTIONS
							//check if it exists
							if (typeof oldValue !== typeof undefined && oldValue !== false) {
								//replace old value
								value = oldValue;
							} else {
								//use the default
								value = null;
							}


							that.loadConfigAttrOptions($target, newAttr, options, value);
						}
						break;
					default:

				}
			});
		},

		loadConfigAttrString: function ($target, newAttr, defaultValue) {
			//the the attr akready exist
			$target.append("<p><label class='LOM-attr-label LOM-attr-text'>" + newAttr + " : <input class=\"LOM-attr-value\" type=\"text\" name=\"" + newAttr + "\" value=\"" + defaultValue + "\"></label></p>");

		},

		loadConfigAttrOptions: function ($target, newAttr, options, oldValue) {
			var $container;
			var selected = "";
			// might be deleted
			$target.append("<p><label class='LOM-attr-label LOM-attr-select'>" + newAttr + " : </label></p>");

			$container = $target.children("p").last().children("label");
			$container.append("<select class=\"LOM-attr-value\" name=\"" + newAttr + "\"><option disabled>Choose</option></select");
			for (var i = 0; i < options.length; i++) {
				selected = (oldValue === options[i]) ? " selected" : "";
				$container.children("select").append("<option value=\"" + options[i] + "\" " + selected + ">" + options[i] + "</option>");
			}
		},

		/*---------------------------------------------------------------------------------------------
		-------------------------Class Picker
		---------------------------------------------------------------------------------------------*/

		popClassPicker: function () {
			var popParams = {};
			//send title and action
			popParams.lbx = this.defaultLbxSettings(this.labels.editview.classPicker.lbxTitle, "classPicker", this.labels.editview.save);
			popParams.config = this.configLbxSettings();

			this.editor.popLightbox(popParams);
		},

		loadClassPickerLbx: function (params) {
			var id = params.lbx.targetId;
			//var $paramTarget = params.config.$paramTarget;

			$("#" + id + ".modal-body").append("<div class=\"row\"><div class=\"col-md-6\"><h2>" + this.labels.editview.classPicker.current + "</h2><div class=\"classes\"></div></div><div class=\"col-md-6\"><h2>" + this.labels.editview.classPicker.add + "</h2><label for=\"add-class\">" + this.labels.editview.classPicker.label + "</label> <input type=\"text\" name=\"add-class\" id=\"add-class\"><input class=\"btn btn-default\" type=\"submit\" value=\"" + this.labels.editview.add + "\" name=\"submit-add-class\" id=\"submit-add-class\" style=\"margin-left: 5px;\"></div></div>");

			this.loadClasses(params);

			var that = this;
			$("#submit-add-class").click(function () {
				if ($("#add-class").val() != "") {
					$("#add-class").val($("#add-class").val().replace(/\ /g, '-'));
					that.addClass($("#add-class").val(), params);
					$("#add-class").val("");
				}
			});
		},

		loadClasses: function (params) {
			var id = params.lbx.targetId;
			var $paramTarget = params.config.$paramTarget;

			//Empty the list
			$("#" + id + " .classes").html("");

			var excludedClasses = ["LOM-element", "LOM-editable", "ui-sortable", "highlight", "wb-tabs", "qs-elearning-activity", "qs-exercise", "wb-mltmd", "img-responsive", "placeholder", "default", "snap-sm", "snap-md", "snap-lg"];

			if ($paramTarget.attr('class')) {

				//Get the list of classes
				var classList = $paramTarget.attr('class').split(/\s+/);

				//Remove the excluded ones
				classList = classList.filter(function (value) {
					for (var i = 0; i < excludedClasses.length; i++) {
						if (value == excludedClasses[i]) {
							return false;
						}
					}
					if (value.indexOf("ico-SNAP-") >= 0 || value.indexOf("ico-QS-") >= 0 || value.indexOf("ico-LOM-") >= 0) {
						return false;
					}
					return true;
				})
			}

			//Populate the list of classes
			if (classList && classList.length != 0) {
				$("#" + id + " .classes").append("<p>" + this.labels.editview.classPicker.currentClasses + " </p><ul>");

				var that = this;
				$.each(classList, function (index, item) {
					$("#" + id + " .classes").append("<li>" + item + " <button class=\"snap-xs ico-SNAP-delete\" title=\"" + that.labels.editview.classPicker.delete + " &ldquo;" + item + "&rdquo;\" data-remove-class=\"" + item + "\">" + that.labels.editview.classPicker.delete + " &ldquo;" + item + "&rdquo;</button></li>");
				});

				$("#" + id + " .classes").append("</ul>");
			}
			//If there is no classes, show a message
			else {
				$("#" + id + " .classes").append("<p>" + this.labels.editview.classPicker.noCurrent + "</p>");
			}

			$("#" + id + " .classes button.ico-SNAP-delete").click(function () {
				that.removeClass($(this).data("remove-class"), params);
			});
		},

		addClass: function (targetClass, params) {
			//var id = params.lbx.targetId;
			//create temp element to do the searching
			var $bkp = this.getBkp();
			$bkp.find("#" + this.id).addClass(targetClass);
			//save it
			this.saveBkp($bkp);
			//update the interface
			var $paramTarget = params.config.$paramTarget;
			$paramTarget.addClass(targetClass);
			//load the classes
			this.loadClasses(params);
		},

		removeClass: function (targetClass, params) {
			//var id = params.lbx.targetId;
			//create temp element to do the searching
			var $bkp = this.getBkp();
			$bkp.find("#" + this.id).removeClass(targetClass);
			//save it
			this.saveBkp($bkp);

			var $paramTarget = params.config.$paramTarget;
			$paramTarget.removeClass(targetClass);

			this.loadClasses(params);
		},

		submitClassPicker: function (params) {
			//var id = params.lbx.targetId;
			//var $paramTarget = params.config.$paramTarget;

			this.closeLbx();

			return params;
		},











		/*---------------------------------------------------------------------------------------------
		-------------------------Functionnality
		---------------------------------------------------------------------------------------------*/
		targetNewElement: function () {
			return this.$el;
		},

		findFrame: function () {
			var frame;

			if (!this.parent.isFrame) {
				frame = this.parent.findFrame();
			} else {
				frame = this.parent;
			}
			return frame;
		},

		/*---------------------------------------------------------------------------------------------
				-------------------------EDIT BOX
		---------------------------------------------------------------------------------------------*/
		detectEditBoxes: function () {
			//detect
			var that = this;

			//lets look for an edit element
			var $edits = this.$el.find(".LOM-editable").filter(function () {
				var newId = $(this).closest(".LOM-element").attr("id");
				if (newId === that.id) {

					return true;
				} else {
					return false;
				}
			});
			var foundEdit;

			for (var i = 0; i < $edits.length; i++) {
				foundEdit = this.editor.findEditor($edits.eq(i).attr("id"));

				//does it already exist
				if (!foundEdit) {
					//instanciate a new editbox
					this.edits[this.edits.length] = new EditBoxObj({
						id: $edits.eq(i).attr("id"),
						class: $edits.eq(i).attr("class"),
						$el: $edits.eq(i),
						parent: that.editor,
						parentElement: that
					});
					this.editor.edits[this.editor.edits.length] = this.edits[this.edits.length - 1];
					foundEdit = this.edits[this.edits.length - 1]


				} else {
					//it already exists (probably a rogue Edit)
					this.edits[this.edits.length] = foundEdit;
					foundEdit.parentElement = this;
				}

				foundEdit.activate();

			}

		},

		removeEdit: function ($deletable) {
			var $deleteThis = $deletable.find(".LOM-editable");
			var currentId;

			for (var i = 0; i < $deleteThis.length; i++) {
				currentId = $deleteThis.eq(i).attr("id");
				this.editor.findEditor(currentId).destroy();


			}

		},

		removeEditFromList: function (editBoxObj) {
			for (var i = 0; i < this.edits.length; i++) {
				if (editBoxObj === this.edits[i]) {
					this.edits.splice(i, 1);
				}
			}
		},

		/*---------------------------------------------------------------------------------------------
				-------------------------sub elements
		---------------------------------------------------------------------------------------------*/
		autoLoadElements: function () {
			var that = this;
			var elements = this.autoLoaded;
			//var id;
			if (elements.length > 0) {


				for (var i = 0; i < elements.length; i++) {

					this.createElementObj({
						parent: that,
						$target: that.$holder,
						type: elements[i],
						mode: "add"
					});
				}
			}

		},

		batchLoadElement: function (type, iterations) {
			var that = this;
			for (var i = 0; i < iterations; i++) {

				this.createElementObj({
					parent: that,
					$target: that.$holder,
					type: type,
					mode: "add"
				});
			}

		},

		preloadSubElements: function () {
			var that = this;
			var permissions = this.permissions.subElements;
			Object.keys(permissions).forEach(function (key) {
				if (permissions[key] && key !== "checkbox") {
					that.editor.addElementTemplate(key);
				}
			});
		},

		initSubElements: function () {
			var that = this;
			if (!this.permissions.functionalities.delaySubElements) {

				this.detectElements();
				if (this.creationMode !== "existing") {
					//if element has autoloaded sub elements (like default answers in a question)
					this.autoLoadElements();
				}

			} else {
				this.$el.find(this.getCustomHolderSelector()).children(".LOM-element").addClass("LOM-preload").hover(function () {

					if (that.elements.length === 0) {
						that.autoLoadElements();
					}
					that.createElementObj({
						parent: that,
						$el: $(this)
					});

					$(this).removeClass("LOM-preload");
					$(this).unbind('mouseenter mouseleave');
				});

				this.preload = setInterval(function () {

					var $firstElement = that.$el.find(".LOM-preload").eq(0);
					if ($firstElement.length > 0) {
						that.createElementObj({
							parent: that,
							$el: $firstElement
						});

						$firstElement.removeClass("LOM-preload");
						$firstElement.unbind('mouseenter mouseleave');

					} else {
						//DESTROY THIS
						clearInterval(that.preload);
					}


				}, 700); // ..every .7 seconds

			}

			//detect if there are editbox
			this.detectEditBoxes();
		},

		detectElements: function () {
			var that = this;
			var $newElements = this.$holder.children(".LOM-element");
			for (var i = 0; i < $newElements.length; i++) {
				//ask te editor to create the object
				this.createElementObj({
					parent: that,
					$el: $newElements.eq(i)
				});
			}

		},

		createElementObj: function (options) {

			this.editor.objElement(options);
		},

		createNewElement: function (type, $target, params) {
			var that = this;
			params = (typeof params === "undefined") ? {} : params;
			$target = (typeof $target === "undefined") ? this.$holder : $target;
			this.editor.unpopElementPicker();
			this.createElementObj({
				parent: that,
				target: $target
			}, params);
		},

		addElement: function () {
			this.editor.prepareElement(this.$el);
			this.editor.createElement("default");
		},

		destroy: function (preserve) {
			this.destroySubEdits();
			this.destroySubElements();
			var preserveIndex = (typeof preserve === "undefined") ? false : preserve;
			this.originalHtml = null;
			this.newHtml = null;
			for (var i = 0; i < this.parent.elements.length; i++) {
				if (this.parent.elements[i].id === this.id) {
					if (preserveIndex) {
						return i;
					} else {
						this.parent.elements.splice(i, 1);
					}
				}
			}
			this.$el.remove();
			//this.parent.storeValue();
			this.parent = null;
		},

		destroySubElements: function () {
			//destroy subElements
			for (var i = 0; i < this.elements.length; i++) {
				this.elements[i].destroy(true);
			}
		},

		destroySubEdits: function () {
			for (var i = 0; i < this.edits.length; i++) {
				this.edits[i].destroy(true);
			}
			this.edits = [];
		},

		autoAddBtn: function () {
			if (this.autoAddButton) {
				var val;
				var permissions = false;
				var permCount = 0;
				var permissionsList = this.permissions.subElements;
				Object.keys(permissionsList).forEach(function (key) {
					val = permissionsList[key];
					permissions = (val === true) ? true : permissions;
					if (val === true) {
						permCount++;
					}
				});
				if (permissions) {
					this.appendAddBtn();


				}
			}
			return permCount;
		},

		/*---------------------------------------------------------------------------------------------
				-------------------------SORTABLE
		---------------------------------------------------------------------------------------------*/
		initSortable: function () {
			var that = this;

			var $container = this.getSortableContainer();
			$container.sortable({
				axis: "y",
				//helper:"clone",
				handle: ".LOM-ui-handle",
				//containment: "parent",
				//cursor: "progress",
				items: "> .LOM-element",
				opacity: 0.1,
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
					//$("html").addClass("LOM-sortable-active");
					that.startSort();


				},
				stop: function () {
					//$("html").removeClass("LOM-sortable-active");
					that.stopSort();
					//event, ui

					//get old
					var $new = $("<div>");
					$new.append(that.editor.originalHtml);

					//console.log($new.find("#"+that.id).html())
					var html = that.reorderSubElements($new);
					$new.find("#" + that.holderId).html(html);
					that.editor.originalHtml = $new.html();
					that.editor.refreshHtml();
				}

			});
			//custom method when sorting starts. not used uet
		},

		startSort: function () {
			return false;
		},

		//custom method when sorting stops. not used uet
		stopSort: function () {
			return false;

		},

		getSortableContainer: function () {
			this.connectDom();
			var $container = this.$holder;
			return $container;
		},

		initSortableHandle: function () {
			var title = this.labels.editview.move;
			if (this.$el.find("h1").length <= 0) {
				this.$el.append("<div class='LOM-ui-handle LOM-delete-on-save' title='" + title + "'></div>");
			}
		},

		reorderSubElements: function ($originalHtml) {
			var $return = $("<div>");
			//just go grab the order
			var $children = $("#" + this.holderId).children(".LOM-element");
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
				-------------------------ADD BTN
		---------------------------------------------------------------------------------------------*/
		appendAddBtn: function () {
			var that = this;
			var iconSize;

			for (var i = 0; i < this.$holder.length; i++) {
				//for each holder separately
				iconSize = (this.$holder.children(".LOM-element").length === 0) ? "lg" : "md";
				if (this.$holder.eq(i).children("button.LOM-add-element").length === 0) {
					this.$holder.eq(i).append("<button class=\"LOM-add-element snap-" + iconSize + " align-left ico-LOM-plus LOM-delete-on-save subElement" + this.type + "\" title=\"" + this.addElementBtnTxt() + "\">" + this.addElementBtnTxt() + "</button>");
				}
			}
			this.$holder.children(".ico-LOM-plus").click(function () {
				that.editor.$target = that.$el.parent();
				//define the target
				that.editor.popElementPicker(this);
				return false;
			});
		},

		addElementBtnTxt: function () {
			return (Utils.lang === "en") ? "Add Element" : "Ajouter un élément";
		},

		/*---------------------------------------------------------------------------------------------
				-------------------------UTILS
		---------------------------------------------------------------------------------------------*/
		getBkp: function () {
			var $backup = $("<div>");
			$backup.append(this.editor.originalHtml);
			return $backup;
		},

		updateBkp: function ($backup) {
			this.editor.originalHtml = $backup.html();
			return false;
		},

		getThisBkp: function ($backup) {
			return $backup.find("#" + this.id);
		},

		saveBkp: function ($backup) {
			this.updateBkp($backup);
			this.editor.refreshHtml();
			return false;
		},

		findElement: function (objId) {
			var check = false;
			if (this.id === objId) {
				return this;
			} else {
				for (var i = 0; i < this.elements.length; i++) {
					check = this.elements[i].findElement(objId);
					if (check !== false) {
						return check;
					}
				}
			}
			return false;
		}
	});
});
