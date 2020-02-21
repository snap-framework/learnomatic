define([
	'underscore',
	'jquery',
	'settings-core',
	'helpers/BaseClass',
	'utils',
	'./../pageEdit/editBoxObj'
], function (_, $, CoreSettings, BaseClass, Utils, EditBoxObj) {
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

			//if it's nothing
			this.$target = (typeof options.$target === "undefined") ? null : options.$target;

			this.isModified = null;
			this.originalHtml = null;
			this.newHtml = null;
			this.autoAddElement = null;
			this.autoAddButton = true;

			this.labels = this.editor.labels.element;
			this.typeName = this.labels.type.default;


			this.creationMode = (typeof options.mode === "undefined") ? "existing" : options.mode;
			this.switchedElement = options.switchedElement;
			//----------------PERMISSIONS---------
			this.permissions = (typeof options.permissions !== "undefined") ? options.permissions : this.getPermissions();
			this.changePermissions();
			//preload all subElements into editor.
			this.preloadSubElements();

			//----------------
			that.initialize.apply(that, args);

			if (this.$el === null) {
				//lets create a new object ! 
				this.initNew();
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
					html: false
				},
				sortable: true,
				functionalities: {

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


		//--------------------------INITIALIZE/BUILD a new ELEMENT---
		initNew: function () {
			//$el does NOT exist, we're creating from scratch
			this.id = this.editor.generateId(this.idPrefix);
			this.fetchTemplate();
		},
		fetchTemplate: function () {
			var that = this;
			var template = this.editor.findElementTemplate(this.type);


			if (template === false) {
				this.editor.addElementTemplate(this.type);
				template = this.editor.findElementTemplate(this.type);
			}


			if (template === false) {
				$.get("../../templates/LOM-Elements/element_" + this.type + ".html", function (data) {
					that.editor.subElements[that.type] = data;

					that.finishInitNew(data);
				});
			} else {

				that.finishInitNew(template);
			}


		},
		finishInitNew: function (templateHtml) {
			//write HTML to page
			this.initNewElementHtml(templateHtml);
			if (this.creationMode === "add") {
				var $children;
				$children = this.$target.children(".LOM-element");
				this.$el = $children.eq($children.length - 1);
			} else {
				this.$el = this.$target;

			}
			this.$el.attr("id", this.id);
			//DONE, better check everything is initialized;
			this.initExisting();
		},
		/*
		 * write the HTML to the page
		 */
		initNewElementHtml: function (templateHtml) {

			this.isFirstLoad = true;
			this.$target.append(templateHtml);

			if (this.subtype !== null) {
				this.$target.children(".LOM-element").last().attr("data-LOM-subtype", this.subtype);

			}


		},

		/*---------------------------------------------------------------------------------------------
		-------------------------INITIALIZE EXISTING
		---------------------------------------------------------------------------------------------*/
		initExisting: function () {
			//first, we need an ID
			if (this.id === null) {
				if (this.creationMode === "existing") {
					this.id = this.$el.attr("id");
				} else {
					//generate the ID
					this.id = this.editor.generateId(this.idPrefix);
				}
			}
			this.refreshInfo();

			//get subtype

			if (this.subtype === null) {
				this.subtype = (typeof this.$el.attr("data-LOM-subtype") !== "undefined") ? this.$el.attr("data-LOM-subtype") : null;
			}


			this.$holder = this.getHolder();
			this.initDom();
			//how about initialize sub elements?
			this.initSubElements();
			this.setLabels();

			this.verifyInit();
			if (this.creationMode !== "existing") {


				this.refreshInfo();
				this.connectDom();
				this.firstInitCustom();
				this.creationMode = "existing";
			}
			this.storeValue();
		},
		firstInitCustom: function () {
			return false;
		},
		/*---------------------------------------------------------------------------------------------
		-------------------------DOM attach and set
		---------------------------------------------------------------------------------------------*/
		connectDom: function () {
			this.$el = $("#" + this.id);
			this.$holder = this.getHolder();

		},
		getHolder: function () {
			var that = this;
			var $holder = this.$el.find(".LOM-holder").filter(function () {
				if ($(this).closest(".LOM-element").attr("id") === that.$el.attr("id")) {
					return true;
				} else {
					return false;
				}

			});
			if ($holder.length > 0) {
				return $holder;
			} else {
				return this.$el;
			}
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
				if (this.creationMode === "existing") {
					this.addOnLoad();
				}

			}
		},
		initDom: function () {
			return false;
		},
		setLabels: function () {

			return false;
		},
		doneInit: function () {
			return false;
		},


		/*---------------------------------------------------------------------------------------------
				-------------------------House Keeping
		---------------------------------------------------------------------------------------------*/
		refreshInfo: function () {
			this.storeValue();

			this.$el.attr("id", this.id);


		},

		storeValue: function () {
			var storeEditsCheck;
			//lets take a look at whats in the page

			this.connectDom();
			this.newHtml = this.$el.html();
			//is there a change in edits?
			storeEditsCheck = this.storeEdits();


			if (storeEditsCheck || this.newHtml !== this.originalHtml) {
				this.originalHtml = this.newHtml;
				this.isModified = true;
				this.parent.storeValue();
			} else {
				//this is not inside an element
			}

		},
		storeElementsValues: function () {
			var element;
			for (var i = 0; i < this.elements.length; i++) {
				element = this.elements[i];
				element.storeValue();
			}
		},
		storeEdits: function () {
			var modified = false;
			//lets take care of edits
			//this.editor.deactivateEditors();
			for (var i = 0; i < this.edits.length; i++) {
				modified = (this.edits[i].storeValue()) ? true : modified;
			}

			return modified;
		},
		activateEdits: function () {
			for (var i = 0; i < this.edits.length; i++) {
				this.edits[i].activate();
			}
		},
		deactivateEdits: function () {
			for (var i = 0; i < this.edits.length; i++) {
				this.edits[i].deactivate();
			}
		},

		resetAll: function () {
			//refresh??
			this.refreshInfo();
			for (var i = 0; i < this.elements.length; i++) {
				this.elements[i].isModified = false;
				this.elements[i].resetAll();
			}
			this.addOnLoad();

		},
		addOnLoad: function () {
			this.initEditBar();
			this.autoAddBtn();
			if (this.permissions.sortable) {
				this.addSortable();
			}

			this.customAfterLoad();

		},
		customAfterLoad: function () {
			return false;
		},
		removeBeforeSave: function () {
			for (var i = 0; i < this.elements.length; i++) {
				this.elements[i].removeBeforeSave();
			}
			this.$el.children(".LOM-delete-on-save").remove();
			this.customRemoveBeforeSave();
		},
		customRemoveBeforeSave: function () {
			return false;
		},
		//this might not be used anymore
		beforeUpdate: function () {
			return false;
		},

		/*---------------------------------------------------------------------------------------------
		-------------------------EDIT BAR
		---------------------------------------------------------------------------------------------*/
		initEditBar: function () {
			this.changePermissions();
			this.$el.children(".LOM-edit-view").remove();
			this.$el.append("<div class=\"LOM-delete-on-save LOM-edit-view\" tabindex=\"-1\"><span class=\"LOM-label\"></span></div>");
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
            if (this.permissions.editButtons.ribbonPicker) {
				this.initRibbonPickerBtn();
			}
			if (this.permissions.editButtons.delete) {
				this.initDeleteBtn();
			}

		},
		//-------------- ADD -----------
		initAddBtn: function () {
			var icon = "LOM-plus";
			var text = this.labels.editview.add;
			var $btn;
			var that = this;
			$(this.$el).children(".LOM-edit-view").append("<button class=\"snap-xs ico-" + icon + "\" title=\"" + text + "\">" + text + "</button>");
			$btn = $(this.$el).children(".LOM-edit-view").children("button.ico-" + icon + "");
			$btn.click(function () {
				that.addClicked();
			});

		},
		addClicked: function () {
			this.autoAdd();
		},
		autoAdd: function () {
			if (this.autoAddElement !== null) {
				var $target = this.getHolder();
				var options = {
					parent: this,
					$target: $target,
					type: this.autoAddElement,
					mode: "add",
					switchedElement: null
				};
				this.editor.objElement(options);
				this.storeValue();
				this.editor.savePage();
			}
		},
		//-------------- EDIT -----------
		initEditsBtn: function () {
			var icon = "SNAP-edit";
			var text = this.labels.editview.edit + " " + this.typeName;
			var that = this;
			var $btn;
			$(this.$el).children(".LOM-edit-view").append("<button class=\"snap-xs ico-" + icon + "\" title=\"" + text + "\">" + text + "</button>");
			$btn = $(this.$el).children(".LOM-edit-view").children("button.ico-" + icon + "");
			$btn.click(function () {
				that.editsClicked();
			});
			$btn.hover(
				function () {
					$(this).parent().children("span").text(text);
				},
				function () {
					$(this).parent().children("span").text("");

				}
			);

		},
		editsClicked: function () {
			this.autoEdit();

		},
		autoEdit: function () {

		},
		autoFocus: function () {
			this.edits[0].autoFocus();
		},

		//-------------- CONFIG -----------
		initConfigBtn: function () {
			var icon = "LOM-wrench";
			var text = this.labels.editview.config + " " + this.typeName;
			var that = this;
			var $btn;
			$(this.$el).children(".LOM-edit-view").append("<button class=\"snap-xs ico-" + icon + "\"  title=\"" + text + "\">" + text + "</button>");
			$btn = $(this.$el).children(".LOM-edit-view").children("button.ico-" + icon + "");
			$btn.click(function () {
				that.configClicked();
			});
			$btn.hover(
				function () {

					$(this).parent().children("span").text(text);
				},
				function () {
					$(this).parent().children("span").text("");

				}
			);

		},
		configClicked: function () {
			this.autoConfig();

		},
		autoConfig: function (parameters) {
			var params = (typeof parameters !== "undefined") ? parameters : null;
			params = params;
			this.popConfig();
		},
        
        //-------------- Class picker -----------
		initClassPickerBtn: function () {
			var icon = "LOM-classPicker";
			var text = this.labels.editview.classPicker.btn;
			var that = this;
			var $btn;
			$(this.$el).children(".LOM-edit-view").append("<button class=\"snap-xs ico-" + icon + "\"  title=\"" + text + "\">" + text + "</button>");
			$btn = $(this.$el).children(".LOM-edit-view").children("button.ico-" + icon + "");
			$btn.click(function () {
				that.classPickerClicked();
			});
			$btn.hover(
				function () {
					$(this).parent().children("span").text(text);
				},
				function () {
					$(this).parent().children("span").text("");

				}
			);

		},
		classPickerClicked: function () {
			this.autoClassPicker();
		},
		autoClassPicker: function (parameters) {
			var params = (typeof parameters !== "undefined") ? parameters : null;
			params = params;
			this.popClassPicker();
		},
        
        //-------------- Ribbon picker -----------
		initRibbonPickerBtn: function () {
			var icon = "LOM-ribbonPicker";
			var text = this.labels.editview.ribbonPicker.btn;
			var that = this;
			var $btn;
			$(this.$el).children(".LOM-edit-view").append("<button class=\"snap-xs ico-" + icon + "\"  title=\"" + text + "\">" + text + "</button>");
			$btn = $(this.$el).children(".LOM-edit-view").children("button.ico-" + icon + "");
			$btn.click(function () {
				that.ribbonPickerClicked();
			});
			$btn.hover(
				function () {
					$(this).parent().children("span").text(text);
				},
				function () {
					$(this).parent().children("span").text("");

				}
			);

		},
		ribbonPickerClicked: function () {
			this.autoRibbonPicker();
		},
		autoRibbonPicker: function (parameters) {
			var params = (typeof parameters !== "undefined") ? parameters : null;
			params = params;
			this.popRibbonPicker();
		},
        
		//-------------- DELETE -----------
		initDeleteBtn: function () {
			var that = this;
			var icon = "SNAP-delete";
			var text = this.labels.editview.delete + " " + this.typeName;
			var $btn;
			$(this.$el).children(".LOM-edit-view").append("<button class=\"snap-xs ico-" + icon + "\" title=\"" + text + "\">" + text + "</button>");
			$btn = $(this.$el).children(".LOM-edit-view").children("button.ico-" + icon + "");

			$btn.hover(
				function () {

					$(this).parent().children("span").text(text);
					$(this).parent().parent().addClass("LOM-pending-delete");

				},
				function () {
					$(this).parent().children("span").text("");

					$(this).parent().parent().removeClass("LOM-delete-last").removeClass("LOM-pending-delete");
				}
			);

			$btn.click(function () {
				that.deleteClicked();
			});


		},
		deleteClicked: function () {

			var delText = "Delete this element?";
			if (confirm(delText)) {
				this.autoDelete();
				return false;
			}


		},
		autoDelete: function (parameters) {
			var params = (typeof parameters !== "undefined") ? parameters : null;
			params = params;
			this.destroy();
			this.editor.savePage();
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
            if(action == "config"){
                return this.changeDefaultLbxSettings(params);
            }
            else{
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
                case "ribbonPicker":
					// code block
					this.loadRibbonPickerLbx(params);
					$("#" + targetId).parent().children(".modal-footer").children("button").click(function () {
						that.submitRibbonPicker(params);
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
			popParams.lbx = this.defaultLbxSettings("Configuration", "config", "Save Configuration");
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
			this.configPages++;

			if (this.configPages === this.configPagesCount) {
				this.initializeConfigFiles(params);
			}

		},
		initializeConfigFiles: function (params) {

			return params;

		},
		loadConfigCustom: function () {
			return false;

		},


		submitConfig: function (params) {
			var id = params.lbx.targetId;
			var $paramTarget = params.config.$paramTarget;

			//LOM-attr-value
			var $attributes = $("#" + id).find(".LOM-attr-value");
			var value;
			var name;

			for (var i = 0; i < $attributes.length; i++) {
				name = $attributes.eq(i).attr("name");
				value = $attributes.eq(i).val();
				$paramTarget.attr(name, value);

			}
			this.submitCustomConfig(params);
			this.storeValue();
			this.closeLbx();
			this.editor.savePage();

		},

		submitCustomConfig: function (params) {
			return params;
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
			var $paramTarget = params.config.$paramTarget;
            
            $("#" + id + ".modal-body").append("<div class=\"row\"><div class=\"col-md-6\"><h2>" + this.labels.editview.classPicker.current + "</h2><div class=\"classes\"></div></div><div class=\"col-md-6\"><h2>" + this.labels.editview.classPicker.add + "</h2><label for=\"add-class\">" + this.labels.editview.classPicker.label + "</label> <input type=\"text\" name=\"add-class\" id=\"add-class\"><input class=\"btn btn-default\" type=\"submit\" value=\"" + this.labels.editview.add + "\" name=\"submit-add-class\" id=\"submit-add-class\"></div></div>");
            
            this.loadClasses(params);
            
            var that = this;
            $("#submit-add-class").click(function(e){
                if($("#add-class").val() != ""){
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
            
            var excludedClasses = ["LOM-element", "LOM-editable", "ui-sortable", "highlight", "wb-tabs", "qs-elearning-activity", "qs-exercise", "wb-mltmd", "img-responsive", "placeholder", "default"];
            
            if($paramTarget.attr('class')){
                
                //Get the list of classes
                var classList = $paramTarget.attr('class').split(/\s+/);
                
                //Remove the excluded ones
                classList = classList.filter(function(value){
                    for(var i = 0; i < excludedClasses.length; i++){                        
                        if(value == excludedClasses[i]){
                            return false;
                        }
                    }
                    return true;
                })
            }
            
            //Populate the list of classes
            if(classList && classList.length != 0){
                $("#" + id + " .classes").append("<p>" + this.labels.editview.classPicker.currentClasses + " </p><ul>");
                
                var that = this;
                $.each(classList, function(index, item){
                    $("#" + id + " .classes").append("<li>" + item + " <button class=\"snap-xs ico-SNAP-delete\" title=\"" + that.labels.editview.classPicker.delete + " &ldquo;" + item + "&rdquo;\" data-remove-class=\"" + item + "\">" + that.labels.editview.classPicker.delete + " &ldquo;" + item + "&rdquo;</button></li>");
                });
                
                $("#" + id + " .classes").append("</ul>");
            }
            //If there is no classes, show a message
            else{
                $("#" + id + " .classes").append("<p>" + this.labels.editview.classPicker.noCurrent + "</p>");
            }
            
            var that = this;
            $("#" + id + " .classes button.ico-SNAP-delete").click(function(e){
                that.removeClass($(this).data("remove-class"), params);
            });
		},
        
        addClass: function (targetClass, params) {
            var id = params.lbx.targetId;
			var $paramTarget = params.config.$paramTarget;
            
            $paramTarget.addClass(targetClass);
            
            this.loadClasses(params);
        },
        
        removeClass: function (targetClass, params) {
            var id = params.lbx.targetId;
			var $paramTarget = params.config.$paramTarget;
            
            $paramTarget.removeClass(targetClass);
            
            this.loadClasses(params);
        },
        
        submitClassPicker: function (params) {
			var id = params.lbx.targetId;
			var $paramTarget = params.config.$paramTarget;
            
			this.storeValue();
			this.closeLbx();
			this.editor.savePage();
		},
        
        
        /*---------------------------------------------------------------------------------------------
		-------------------------Ribbons Picker
		---------------------------------------------------------------------------------------------*/
        
        popRibbonPicker: function () {
			var popParams = {};
			//send title and action
			popParams.lbx = this.defaultLbxSettings(this.labels.editview.ribbonPicker.lbxTitle, "ribbonPicker", this.labels.editview.save);
			popParams.config = this.configLbxSettings();

			this.editor.popLightbox(popParams);
		},
        
        loadRibbonPickerLbx: function (params) {
			var id = params.lbx.targetId;
			var $paramTarget = params.config.$paramTarget;
            
            $("#" + id + ".modal-body").append("<div class=\"row\"><div class=\"col-md-12\"><p><label for=\"ribbon-toggle\">" + this.labels.editview.ribbonPicker.toggle + "</label> <input type=\"checkbox\" name=\"ribbon-toggle\" id=\"ribbon-toggle\"></p></div></div>");
            
            if(this.detectRibbon(params)){
                $("#ribbon-toggle").prop("checked", true);
                this.addRibbonSettings(params);
            }
            else{
                $("#ribbon-toggle").prop("checked", false);
                $(".ribbon-settings").remove();
            }
            
            var that = this
            $("#ribbon-toggle").change(function(){
                that.toggleRibbon(params, $(this).is(":checked"));
            })
		},
        
        detectRibbon: function (params) {            
			var id = params.lbx.targetId;
			var $paramTarget = params.config.$paramTarget;
            
            if($paramTarget.find(".LOM-editable").parent().parent().is(".content") && $paramTarget.find(".LOM-editable").closest(".content").parent().is(".instructions")){
                return true;
            }
            else{
                return false;
            }
		},
        
        toggleRibbon: function (params, onoff) {
            var id = params.lbx.targetId;
			var $paramTarget = params.config.$paramTarget;
            
            var editorId = $paramTarget.find(".LOM-editable").attr("id");
            
            var editors = this.editor.edits;
            var editorObj;
            $.each(editors, function(index, editor){            
                if(editor.options.$el.attr("id") == editorId){
                    editorObj = editor;
                }
            });
            
            //We want to ADD a ribbon
            if(onoff){
                //It does not have a ribbon yet
                if(!this.detectRibbon(params)){
                    editorObj.deactivate();
                    
                    $paramTarget.find(".LOM-editable").wrap("<div class=\"content\"></div>");
                    $paramTarget.find(".content").wrap("<div class=\"instructions\"></div>");
                    $paramTarget.find(".instructions").prepend("<div class=\"circle_icon click\"></div>");
                    
                    editorObj.activate();
                    
                    this.addRibbonSettings(params);
                    
                    if($("style#ribbonsStyle").length == 0){
                        $(CoreSettings.contentContainer).append("<style id=\"ribbonsStyle\">.instructions{display:table;margin-bottom:10px;margin-top:15px;position:relative}.instructions .circle_icon{display:table-cell;margin-bottom:0}.instructions .circle_icon+.content{vertical-align:middle;margin-left:70px;margin-top:14px}.instructions.small .content{font-size:14px}.circle_icon{content:\"\";background-repeat:no-repeat;background-image:url(theme/base/ribbon_icons.png);float:left;display:table-cell;position:relative;margin-bottom:10px;width:55px;height:55px}.circle_icon.click{background-position-x:-332px;background-position-y:-55px}.circle_icon.video{background-position-x:0;background-position-y:-164px}.circle_icon.dyk{background-position-x:-223px;background-position-y:-110px}.circle_icon.warning{background-position-x:-167px;background-position-y:0}.circle_icon.information{background-position-x:-277px;background-position-y:-55px}.circle_icon.clock{background-position-x:-332px;background-position-y:-110px}.circle_icon.summary{background-position-x:-112px;background-position-y:-110px}.circle_icon.objective{background-position:-57px;background-position-y:-111px}.circle_icon.exam{background-position:0;background-position-y:-55px}.circle_icon.video{background-position:0 75%}.circle_icon.activity{background-position:0;background-position-y:0}.circle_icon.example{background-position-x:-277px;background-position-y:-219px}.circle_icon.tip{background-position-x:-222px;background-position-y:0}.circle_icon.document{background-position-x:-332px;background-position-y:0}.circle_icon.graphic{background-position-x:-112px;background-position-y:-55px}.circle_icon.link{background-position-x:-387px;background-position-y:-55px}.circle_icon.moduleEnd{background-position-x:-57px;background-position-y:-55px}.circle_icon.courseEnd{background-position-x:0;background-position-y:-219px}</style>");
                    }
                }
            }
            //We want to REMOVE a ribbon
            else{
                //It does have a ribbon
                if(this.detectRibbon(params)){
                    editorObj.deactivate();
                    
                    $paramTarget.find(".LOM-editable").unwrap("<p class=\"content\"></p>");
                    $paramTarget.find(".LOM-editable").unwrap("<div class=\"instructions\"></div>");
                    $paramTarget.find(".circle_icon").remove();
                    
                    editorObj.activate();
                    
                    $(".ribbon-settings").remove();
                    
                    if($(".circle_icon").length == 0 && $(".instructions").length == 0){
                        $("style#ribbonsStyle").remove();
                    }
                }
            }
        },
        
        addRibbonSettings: function (params) {
            var id = params.lbx.targetId;
			var $paramTarget = params.config.$paramTarget;
            
            $("#" + id + ".modal-body").append("<div class=\"row ribbon-settings\"><div class=\"col-md-12\"><h2>" + this.labels.editview.ribbonPicker.settingsTitle + "</h2><p><label for=\"ribbon-type\">" + this.labels.editview.ribbonPicker.label + " </label> <select name=\"ribbon-type\" id=\"ribbon-type\"></select></p></div></div>");
            
            var ribbonTypes = ["click", "video", "dyk", "warning", "information", "clock", "objective", "exam", "activity", "example", "tip", "document", "graphic", "link", "moduleEnd", "courseEnd"];
            var ribbonLabels = [this.labels.editview.ribbonPicker.icons.click, this.labels.editview.ribbonPicker.icons.video, this.labels.editview.ribbonPicker.icons.dyk, this.labels.editview.ribbonPicker.icons.warning, this.labels.editview.ribbonPicker.icons.information, this.labels.editview.ribbonPicker.icons.clock, this.labels.editview.ribbonPicker.icons.objective, this.labels.editview.ribbonPicker.icons.exam, this.labels.editview.ribbonPicker.icons.activity, this.labels.editview.ribbonPicker.icons.example, this.labels.editview.ribbonPicker.icons.tip, this.labels.editview.ribbonPicker.icons.document, this.labels.editview.ribbonPicker.icons.graphic, this.labels.editview.ribbonPicker.icons.link, this.labels.editview.ribbonPicker.icons.moduleEnd, this.labels.editview.ribbonPicker.icons.courseEnd];
            
            $.each(ribbonTypes, function(index, type){
                $("select#ribbon-type").append("<option value=" + type + ">" + ribbonLabels[index] + "</option");
            });
            
            var $el = $paramTarget.find(".circle_icon");
            var classList = $paramTarget.find(".circle_icon").attr('class').split(/\s+/);

            var currentType = classList.filter(function(value){                     
                if(value == "circle_icon"){
                    return false;
                }
                return true;
            })
            
            $("select#ribbon-type option").removeAttr("selected");
            $("select#ribbon-type option").each(function(){
                if($(this).attr("value") == currentType){
                    $(this).attr("selected", true);
                }
            });
            
            var that = this;
            $("select#ribbon-type").change(function(){
                that.changeIcon(params, $("select#ribbon-type").val());
            })
        },

        
        changeIcon: function (params, type) {
            var id = params.lbx.targetId;
			var $paramTarget = params.config.$paramTarget;
            
            $paramTarget.find(".circle_icon").removeClass().addClass("circle_icon").addClass(type);
        },
        
        submitRibbonPicker: function (params) {
			var id = params.lbx.targetId;
			var $paramTarget = params.config.$paramTarget;
            
			//this.storeValue();
			this.closeLbx();
			this.editor.savePage();
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


				} else {
					//it already exists (probably a rogue Edit)
					this.edits[this.edits.length] = foundEdit;
					foundEdit.parentElement = this;
				}

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
			var id;
			for (var i = 0; i < elements.length; i++) {

				id = this.editor.generateId(this.idPrefix);
				//this.createElementObj({parent:that, $target:that.$holder, type:elements[i], mode:"add", id:id});
				this.createElementObj({
					parent: that,
					$target: that.$holder,
					type: elements[i],
					mode: "add"
				});
			}
			this.storeValue();
		},
		preloadSubElements: function () {
			var that = this;
			var permissions = this.permissions.subElements;
			Object.keys(permissions).forEach(function (key) {
				if (permissions[key]) {
					that.editor.addElementTemplate(key);
				}
			});
		},

		initSubElements: function () {
			this.detectElements();
			if (this.creationMode !== "existing") {
				this.autoLoadElements();
			}
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
			this.parent.storeValue();
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
				this.$holder = this.getHolder();
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


		},
		/*---------------------------------------------------------------------------------------------
				-------------------------SORTABLE
		---------------------------------------------------------------------------------------------*/
		addSortable: function () {
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
					$("html").addClass("LOM-sortable-active");
					that.startSort();


				},
				stop: function () {
					$("html").removeClass("LOM-sortable-active");
					that.stopSort();
					//event, ui
					that.refreshInfo();
					that.editor.savePage();
				}

			});

			this.addHandle();

		},
		startSort: function () {
			return false;
		},
		stopSort: function () {
			return false;

		},
		getSortableContainer: function () {

			this.connectDom();
			var $container = this.getHolder();
			return $container;
		},
		addHandle: function () {
			var $element = this.$holder.children(".LOM-element");
			var title = this.labels.editview.move;
			for (var i = 0; i < $element.length; i++) {
				if ($element.eq(i).find("h1").length <= 0) {
					if ($element.eq(i).children(".LOM-handle").length <= 0) {
						$element.eq(i).append("<div class='LOM-ui-handle LOM-delete-on-save' title='" + title + "'></div>");
					}
				}
			}
			return false;
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
			return "Add Element";
		},
		/*---------------------------------------------------------------------------------------------
				-------------------------UTILS
		---------------------------------------------------------------------------------------------*/
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
		},
		/*---------------------------------------------------------------------------------------------
				-------------------------CHANGING ELEMENT
		---------------------------------------------------------------------------------------------*/


		switchElement: function () {
			this.editor.elementMode = "switch";
			this.destroy(true);


		},
		firstLoad: function () {
			this.setAnimations();

		},
		postCleanup: function () {
			return false;
		},

		loadClean: function () {
			this.connectDom();
			this.$el.html(this.newHtml);
			this.postCleanup();
			this.$el.removeAttr("style");
			if (this.isFirstLoad) {
				this.isFirstLoad = false;
				this.firstLoad();
			} else {
				this.$el.removeAttr("style");
			}

		},

		cleanElements: function () {
			this.loadClean();
			for (var i = 0; i < this.elements.length; i++) {
				this.elements[i].cleanElements();
			}
		}


	});
});
