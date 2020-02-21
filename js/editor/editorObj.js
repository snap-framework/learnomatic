define([

	'jquery',
	'labels',
	'settings-core',
	'utils',
	'./helpers/LOM-utils',
	'modules/BaseModule',
	'./ui/ui-manager',
	'./settings/settings-manager',
	'./LOM_labels',
	'./ui/LOM_ui_buttons',
	'./../plugins/ckeditor/ckeditor',
	'./pageEdit/editBoxObj',
	'./pageEdit/layoutObj',
	'./pageEdit/elementObj',
	'./roles/roles-manager',
	'./structure/structure-manager',
	'./themeEdit/themes-manager',
	'./../plugins/jquery-ui/ui/widgets/sortable'


], function ($, labels, CoreSettings, Utils, LOMUtils, BaseModule, UImanager, SettingsManager, LOMLabels, LOMButtons, CKEDITOR, EditBoxObj, LayoutObj, ElementObj, RolesManager, Structure, ThemeEditor, Sortable) {
	'use strict';

	return BaseModule.extend({
		initialize: function (options) {
			var that = this;
			this.parent = options.parent;
			this.master = this.parent;
			this.courseFolder = options.courseFolder;

			this.isPage404 = null;
			$.get(this.master.currentSub.pagePath(), function (data) {
				// my_var contains whatever that request returned
				that.originalHtml = data;
			});

			this.expertMode = null;

			$(this.parent).on("Framework:pageLoaded", function () {
				that.pageLoaded();
			});

			this.elements = [];
			this.subElements = {};
			this.targetElement = null;
			this.elementMode = null;
			this.edits = []; //all the editor boxes will be logged here
			this.layout = false;

			//------temp things
			this.labels = LOMLabels;

			//for when a popper is used
			this.initialized = false;
			this.targetParent = null;
			this.$target = null;
			this.lbxParams = null; // used to pass parameters to poppers

			this.$supermenu_en = null;
			this.$supermenu_fr = null;

			//append the css file for LOM
			$('head').append('<link rel="stylesheet" type="text/css" href="../../theme/editor.css">');
		},
		/*---------------------------------------------------------------------------------------------
				-------------------------INIT and SETUP
		---------------------------------------------------------------------------------------------*/

		/*
		 * @Fires up everytime the page is loaded
		 */

		pageLoaded: function () {
			var mode;
			if (!this.initialized) {
				this.initialized = true;
				this.firstPageLoad();
			} else {
				this.elements = [];
			}
			mode = this.ui.currentMode.name;
			//reset the page's default html
			this.originalHtml = $(CoreSettings.contentContainer).html();
			if (mode === "pageEdit") {
				this.reset();
				this.editBoxId();
				this.detectRogueEditors();
				this.layout = this.detectLayout();
				this.sortable = new Sortable();
				this.parent.resourcesManager.cleanUp();
				this.activateEditors();
				this.resetLbx();

			}
            
            $("#not-LOM-warning").remove();
            if($("html").hasClass("LOM-pageEdit-active")){
                this.detectLOMLayout();
            }

		},

		/*
		 * @first up once
		 */
		firstPageLoad: function () {
			$("html").addClass("LOM-active");
			this.setupRoles();
			this.setupUI();
			this.setupSettings();
			this.setupStructure();
			//this.setupThemes();
		},
        
        detectLOMLayout: function () {
			if($(".LOM-frame, .LOM-element").length == 0){
                this.addNotLOMWarning();
            }
            else if($(".LOM-frame.converted-page").length !== 0){
                this.addConvertedWarning();
            }
		},
        
        addNotLOMWarning: function(){
            var $warningBox = "<div class=\"bg-danger\" id=\"not-LOM-warning\"><p><span class=\"glyphicon glyphicon-warning-sign\"><span> This page's code structure is not ready for use with Learn-O-Matic. Try converting it:</p><p><button class=\"btn btn-default\" id=\"LOM-convert\">Convert</button><p>Note: the original page will be moved to the repository</p></div>";
            
            $(CoreSettings.contentContainer).append($warningBox);
            
            var that = this;
            
            $("#LOM-convert").click(function(){
                that.resetPageForConversion();
            });
        },
        
        addConvertedWarning: function(){
            var $warningBox = "<div class=\"bg-danger\" id=\"not-LOM-warning\"><p><span class=\"glyphicon glyphicon-warning-sign\"><span> This page's code structure has been converted to Learn-O-Matic's structure automatically. You can undo this conversion by selecting &ldquo;Undo&rdquo;:</p><p><button class=\"btn btn-default\" id=\"LOM-convert-undo\">Undo</button></div>";
            
            $(CoreSettings.contentContainer).append($warningBox);
            
            var that = this;
            
            $("#LOM-convert-undo").click(function(){
                that.undoConvertToLOM();
            });
        },

        resetPageForConversion: function(){
            var content = $(CoreSettings.contentContainer).html()
                
            var currentSub = this.master.currentSub;
            var sPosition = this.master.currentSub.sPosition;
            var title = this.master.currentSub.title;
            var altTitle = this.master.currentSub.altTitle;
            var isPage = this.master.currentSub.isPage;

            this.structure.initArchive();
            this.structure.findMoveRepository(currentSub, true);
            
            this.structure.addPage(sPosition, title, altTitle, isPage);

            fNav(sPosition);

            $(CoreSettings.contentContainer).html(this.previousContent);
        },
        
        startConversion: function(repositoryPos){
            var that = this;
            
            //Frames
            $(CoreSettings.contentContainer).find("[class^='col-md-']").each(function(){
                $(this).addClass("LOM-frame").addClass("ui-sortable").addClass("highlight").attr("id", that.generateId("LOMfr_"));
            });

            $(CoreSettings.contentContainer).find("[class^='col-md-']").eq(0).addClass("converted-page").attr("data-converted-page", repositoryPos);
            
            //Images
            $(CoreSettings.contentContainer).find("img").each(function(){
                $(this).removeAttr("width").removeAttr("height").addClass("img-responsive").attr("data-lom-element", "accordion");
                $(this).wrap("<section class=\"LOM-element ui-sortable highlight\" data-lom-element=\"image\">");
            });
            
            //Audio and Video elements
            $(CoreSettings.contentContainer).find(".wb-mltmd").each(function(){
                if($(this).find("video").length !== 0){
                    $(this).removeClass().addClass("wb-mltmd").addClass("LOM-element").attr("data-lom-element", "video");
                    
                    if (!$(this).parent().hasClass("LOM-frame")) {
                        $(this).unwrap();
                    }
                    
                    $(this).find(".wb-mm-cc").remove();
                    $(this).find(".wb-mm-ctrls").remove();
                    if($(this).find("video").parent().is(".display")){
                        $(this).find("video").unwrap();
                    }
                    
                    if($(this).find("details").parent().is(".accordion")){
                        $(this).find("details").unwrap();
                    }
                    
                    $(this).find("details").each(function(){
                        $(this).removeAttr("role");
                        $(this).addClass("LOM-holder").attr("id", "inline-captions");
                    }); 

                    $(this).find("summary").each(function(){
                        $(this).removeAttr("data-toggle").removeAttr("id").removeAttr("role").removeAttr("aria-selected").removeAttr("tabindex").removeAttr("aria-posinset").removeAttr("aria-setsize").removeClass("wb-toggle").removeClass("tgl-tab").removeClass("wb-details").removeClass("wb-toggle-inited");
                        $(this).addClass("wb-details").html("<div class=\"LOM-editable\">" + $(this).html() + "</div>");
                    }); 

                    $(this).find("details").find(".tgl-panel").children().eq(0).unwrap();
                    $(this).find("details").children().each(function(){
                        if(!$(this).is("summary")){
                            $(this).wrap("<div class=\"LOM-editable\">");
                            $(this).parent().wrap("<section class=\"LOM-element wb-tmtxt ui-sortable highlight\" data-lom-element=\"text\" id=\"LOM_el_3\" data-subtype=\"transcript\" data-begin=\"1.0s\" data-dur=\"3s\">");
                        }
                    });
                    
                    $(this).find("track").attr("src", "#inline-captions").attr("kind", "captions").attr("data-type","text/html").attr("srclang", "en").attr("label","English");
                }
                else if($(this).find("audio").length !== 0){
                    $(this).removeClass().addClass("wb-mltmd").addClass("LOM-element").attr("data-lom-element", "audio");
                    
                    if (!$(this).parent().hasClass("LOM-frame")) {
                        $(this).unwrap();
                    }
                    
                    $(this).find(".wb-mm-cc").remove();
                    $(this).find(".wb-mm-ctrls").remove();
                    if($(this).find("audio").parent().is(".display")){
                        $(this).find("audio").unwrap();
                    }
                    
                    if($(this).find("details").parent().is(".accordion")){
                        $(this).find("details").unwrap();
                    }
                    
                    $(this).find("details").each(function(){
                        $(this).removeAttr("role");
                        $(this).addClass("LOM-holder").attr("id", "inline-captions");
                    }); 

                    $(this).find("summary").each(function(){
                        $(this).removeAttr("data-toggle").removeAttr("id").removeAttr("role").removeAttr("aria-selected").removeAttr("tabindex").removeAttr("aria-posinset").removeAttr("aria-setsize").removeClass("wb-toggle").removeClass("tgl-tab").removeClass("wb-details").removeClass("wb-toggle-inited");
                        $(this).addClass("wb-details").html("<div class=\"LOM-editable\">" + $(this).html() + "</div>");
                    }); 

                    $(this).find("details").find(".tgl-panel").children().eq(0).unwrap();
                    $(this).find("details").children().each(function(){
                        if(!$(this).is("summary")){
                            $(this).wrap("<div class=\"LOM-editable\">");
                            $(this).parent().wrap("<section class=\"LOM-element wb-tmtxt ui-sortable highlight\" data-lom-element=\"text\" id=\"LOM_el_3\" data-subtype=\"transcript\" data-begin=\"1.0s\" data-dur=\"3s\">");
                        }
                    });
                    
                    $(this).find("track").attr("src", "#inline-captions").attr("kind", "captions").attr("data-type","text/html").attr("srclang", "en").attr("label","English");
                }
            });

            //Accordions
            $(CoreSettings.contentContainer).find(".accordion").each(function(){
                $(this).addClass("LOM-element").attr("data-lom-element", "accordion");

                $(this).find("details").each(function(){
                    $(this).removeAttr("role");
                    $(this).addClass("LOM-element").attr("data-lom-element", "details");
                }); 

                $(this).find("summary").each(function(){
                    $(this).removeAttr("data-toggle").removeAttr("id").removeAttr("role").removeAttr("aria-selected").removeAttr("tabindex").removeAttr("aria-posinset").removeAttr("aria-setsize").removeClass("wb-toggle").removeClass("tgl-tab").removeClass("wb-details").removeClass("wb-toggle-inited");
                    $(this).addClass("wb-details").html("<div class=\"LOM-editable\">" + $(this).html() + "</div>");
                }); 
                
                $(this).find(".tgl-panel").each(function(){
                    $(this).removeAttr("aria-labelledby").removeAttr("aria-expanded").removeAttr("aria-hidden").removeClass()
                    $(this).addClass("LOM-holder").addClass("ui-sortable").addClass("highlight");
                }); 
            });

            //Tabbed interfaces
            $(CoreSettings.contentContainer).find(".wb-tabs").each(function(){
                $(this).find("ul[role='tablist']").remove();

                $(this).removeClass().addClass("LOM-element").addClass("wb-tabs").attr("data-lom-element", "accordion").attr("data-lom-subtype", "tabs");

                $(this).find("details").each(function(){
                    if($(this).parent().is(".tabpanels")){
                        $(this).unwrap();
                    }
                    $(this).removeClass().removeAttr("role").removeAttr("aria-hidden").removeAttr("aria-expanded").removeAttr("aria-labelledby").removeAttr("tabindex");
                    $(this).addClass("LOM-element").attr("data-lom-element", "details");
                }); 

                $(this).find("summary").each(function(){
                    $(this).removeAttr("data-toggle").removeAttr("id").removeAttr("role").removeAttr("aria-selected").removeAttr("tabindex").removeAttr("aria-posinset").removeAttr("aria-setsize").removeAttr("aria-hidden").removeClass()
                    $(this).addClass("wb-details").html("<div class=\"LOM-editable\">" + $(this).html() + "</div>");
                });

                $(this).find(".tgl-panel").each(function(){
                    $(this).removeAttr("aria-labelledby").removeAttr("aria-expanded").removeAttr("aria-hidden").removeClass()
                    $(this).addClass("LOM-holder").addClass("ui-sortable").addClass("highlight");
                }); 
            });

            //Text elements
            $(CoreSettings.contentContainer).find("p, ul, ol, h1, h2, h3, h4, h5, h6").each(function(){
                if(!$(this).parent().is(".LOM-editable")){
                    $(this).wrap("<div class=\"LOM-editable\"></div>");
                }
            });

            //Create .LOM-element's + add IDs
            $(CoreSettings.contentContainer).find(".LOM-editable").each(function(){
                if($(this).parent().prop("tagName") != "SUMMARY" && !$(this).parent().is(".LOM-element")){
                    $(this).wrap("<section class=\"LOM-element ui-sortable highlight\" data-lom-element=\"text\"></section>");
                }
            });
            $(CoreSettings.contentContainer).find(".LOM-editable").each(function(){
                $(this).attr("id", that.generateId("LOM_edit_"));
            });
            $(CoreSettings.contentContainer).find(".LOM-element").each(function(){
                $(this).attr("id", that.generateId("LOM_el_"));
            });
            
            $(CoreSettings.contentContainer).find(".wb-mltmd").each(function(){
                $(this).find("video").attr("id", $(this).attr("id") + "-md");
                $(this).find("audio").attr("id", $(this).attr("id") + "-md");
            });
            
            $(CoreSettings.contentContainer).find(".LOM-element").each(function(){
                if($(this).closest(".LOM-frame").length == 0){
                    $(this).wrap("<section class=\"col-md-12 LOM-frame ui-sortable highlight\">");
                    $(this).parent().attr("id", that.generateId("LOMfr_"));
                }
            });
            
            $("#not-LOM-warning").remove();
            that.saveEdits();
        },
        
        undoConvertToLOM: function(){
            this.deactivateEditors();
            
            var previousPage = $("[data-converted-page]").data("converted-page");
            var sPosition = this.master.currentSub.sPosition;

            this.structure.initArchive();
            this.structure.findMoveRepository(this.master.currentSub, false);
            
            var subs = this.master.flatList;
            var previousPageSub;
            
            for(var i = 0; i < subs.length; i++){
                if(subs[i].sPosition == previousPage){
                    previousPageSub = subs[i];
                }
            }
            
            previousPageSub.move(sPosition);
            
            fNav(sPosition);
        },
        
		/*---------------------------------------------------------------------------------------------
				-------------------------MODES SETUP
		---------------------------------------------------------------------------------------------*/
		/*
		 * @start the UI manager, that deals with modes and tools
		 */		
		setupUI: function () {
			var that = this;
			this.ui = new UImanager({
				parent: that,
				modes: LOMButtons
			});

		},
		/*
		 * @start the settings managed
		 */		
		setupSettings: function () {
			var that = this;
			this.settings = new SettingsManager({
				parent: that,
				labels: that.labels.settingsmode
			});

		},
		/*
		 * @this will eventually start the themes manager
		 */		
		setupThemes: function () {
			//---------themes manager
			this.themes = new ThemeEditor({
				parent: this,
				labels: this.labels
			});

		},
		/*
		 * @start the structure manager for pages inside the supermenu
		 */		
		setupStructure: function () {
			//---------Structure manager
			this.structure = new Structure({
				parent: this,
				labels: this.labels
			});

		},
		/*
		 * @start up the roles manager
		 */		
		setupRoles: function () {
			this.roles = new RolesManager({
				parent: this,
				labels: this.labels
			});
		},
		resetLbx: function () {
			//only in text element;.
			var $lbx = $(CoreSettings.contentContainer).find("[data-lom-element='text']").find(".wb-lbx")
			$lbx.removeClass("wb-lbx");

		},
		/*---------------------------------------------------------------------------------------------
				-------------------------HOUSE KEEPING
		---------------------------------------------------------------------------------------------*/
		//reset the vars when we feel like it
		reset: function () {
			this.edits = [];
			this.layout = null;
			this.removeLomClasses();
		},
		/*
		 * @go through all the elemenets to reset them
		 */		
		resetAll: function () {
			this.layout.isModified = false;
			this.layout.resetAll();
		},
		removeEditFromList: function (editBoxObj) {
			for (var i = 0; i < this.edits.length; i++) {
				if (editBoxObj === this.edits[i]) {
					this.edits.splice(i, 1);
				}
			}
		},
		removeLomClasses: function () {
			var classes = ["LOM-delete-last"];
			var current;
			for (var i = 0; i < classes.length; i++) {
				current = classes[i];
				$("." + current).removeClass(current);
			}

		},
		generateId:function(prefix){
			return LOMUtils.generateId(prefix);
		},
		/*---------------------------------------------------------------------------------------------
				-------------------------DETECTORS
		---------------------------------------------------------------------------------------------*/
		/*
		 * @detect all the editors
		 */
		editBoxId:function(){
			var $edits=$(".LOM-editable:not([id])");
			var flag=($edits.length)?true:false;
			for (var i=0;i<$edits.length;i++){
				$edits.eq(i).attr("id", this.generateId("LOM-edit-"))
			}
			if (flag){
				this.originalHtml = $(CoreSettings.contentContainer).html();
			}
			
		},
		detectRogueEditors: function () {

			var $editbox = $(CoreSettings.contentContainer + " .LOM-editable");

			for (var i = 0; i < $editbox.length; i++) {
				if (!$editbox.eq(i).closest(".LOM-element").hasClass("LOM-element")) {
					//FOUND A ROGUE!
					this.edits[this.edits.length] = new EditBoxObj({
						id: $editbox.eq(i).attr("id"),
						class: $editbox.eq(i).attr("class"),
						$el: $editbox.eq(i),
						parent: this,
						isRogue: true
					});
				}

			}

		},

		/*
		 * @detect if there's a layout
		 */

		detectLayout: function () {

			var $frames = $(".LOM-frame");
			return new LayoutObj({
				parent: this,
				frames: $frames,
				labels: this.labels
			});


		},


		/*---------------------------------------------------------------------------------------------
				-------------------------ACTIVATE / DEACTIVATE EDITORS
		---------------------------------------------------------------------------------------------*/
		/*
		 * @activate all the editors
		 */

		activateEditors: function () {
			for (var i = 0; i < this.edits.length; i++) {
				if (!this.edits[i].isActivated) {
					this.edits[i].activate();
				}
			}
			return true;
		},
		/*
		 * @deactivate all the editors
		 */

		deactivateEditors: function () {
			for (var i = 0; i < this.edits.length; i++) {
				if (this.edits[i].isActivated) {
					this.edits[i].deactivate();
				}
			}
		},
		toggleEditors: function () {
			var $editToggles = $(".LOM-edit-toggle");
			var anythingActivated = false;

			for (var i = 0; i < this.edits.length; i++) {
				anythingActivated = (this.edits[i].isActivated) ? true : anythingActivated;
			}
			if (anythingActivated) {
				this.deactivateEditors();
				this.saveEdits();
				$editToggles.html("Enable Edit Mode").removeClass("LOM-save").addClass("LOM-edit");
			} else {
				this.activateEditors();
				$editToggles.html("Save").removeClass("LOM-edit").addClass("LOM-save");
			}
		},
		/*---------------------------------------------------------------------------------------------
				-------------------------Page 404
		---------------------------------------------------------------------------------------------*/
		page404: function () {
			var that = this;
			this.isPage404 = true;
			$(CoreSettings.contentContainer).load("../../templates/LOM-Layouts/404_editor.html", function () {
				var labels = that.labels.page404;
				$(".LOM-404").find(".gigantic").text(labels.title);
				$(".LOM-404").find(".pnf-404").text(labels.pagenotfound);
				$(".LOM-404").find(".editor-mode").text(labels.editormode);
				$(".LOM-404").find(".wwyltd").text(labels.whattodo);
				$(".LOM-404").find(".LOM-scratch").text(labels.createscratch);
				$(".LOM-404").find(".LOM-template").text(labels.createtemplate);

				that.ui.modes[1].select();
				that.ui.currentMode = that.ui.modes[1];

				$(".LOM-scratch").click(function () {
					that.blankPage();
				});
				$(".LOM-template").click(function () {
					that.popTemplatePicker();
				});
			});

		},
		//create a blank page
		blankPage: function () {
			var chooseLabel = this.labels.layout.choose;
			var html = "";
			html += "<!-- top banner with side-by-side underneath -->";
			html += "<section class=\"row\">";
			html += "<section class=\"col-md-12 LOM-frame\" id=\"LOMfr_1\">";
			html += "<section class=\"LOM-element placeholder default\" data-LOM-element=\"text\" id=\"LOM_el_1\" data-LOM-subtype=\"title\">";
			html += "<h1><div class=\"LOM-editable\" id=\"LOM-edit-1\">";

			html += this.parent.currentSub.title;

			html += "</div></h1>";
			html += "";
			html += "\n<!-- default Object, spawns an object picker -->";
			html += "\n<button class=\"snap-lg ico-LOM-layout LOM-blankpage-layout\" onclick=\"masterStructure.editor.popLayoutPicker();return false;\">" + chooseLabel + "</button>";
			html += "\n</section>";
			html += "</section>";
			html += "</section>	";
			html += "";


			$(CoreSettings.contentContainer).html(html);
			this.writeFile();
			$("html").removeClass("page404 ");
			this.pageLoaded();
		},
		popLayoutPicker: function () {

			$(document).trigger("open.wb-lbx", [
				[{
					src: "../../templates/LOM-Layouts/layout_picker.html",
					type: "ajax"
				}]
			]);
		},
		popTemplatePicker: function () {

			$(document).trigger("open.wb-lbx", [
				[{
					src: "../../templates/LOM-Layouts/template_picker.html",
					type: "ajax"
				}]
			]);
		},
		loadLayoutList: function () {
			var defaultFolder = "../../templates/LOM-Layouts/";
			var customFolder = "content/templates/layouts/";


			var that = this;

			$("#layoutpicker").find("button[data-id]").click(function () {
				that.loadChosenLayout(defaultFolder + $(this).attr("data-id") + ".html");
			});


			$.post('../../editor.php', {
				action: "readfolder",
				filename: 'courses/' + this.courseFolder + '/' + customFolder,
				regex: "/^.*\.(html|htm)$/i"
			}, function (data) {
				//parse the jSON
				//console.log(data);
				if (data !== "false") {
					that.loadCustomLayouts(data.slice(0, -1), customFolder);
				}


			}).fail(function () {
				alert("Posting failed while reading folder.");
			});

		},
		loadTemplateList: function () {
			$("#templatepicker").prepend("<section id='LOM_language_template'></section>");
			var customFolder = "content/templates/pages/";
			var that = this;
			$.post('../../editor.php', {
				action: "readfolder",
				filename: 'courses/' + this.courseFolder + '/' + customFolder,
				regex: "/^.*\.(html|htm)$/i"
			}, function (data) {
				//parse the jSON
				if (data !== "false" && typeof data !== "undefined" && data !== "") {
					that.loadCustomPages(data.slice(0, -1), customFolder);
				}


			}).fail(function () {
				alert("Posting failed while loading template list.");
			});
			var targetPath = this.master.currentSub.pagePath();
			if (Utils.lang === "fr") {
				targetPath = targetPath.replace("_fr", "_en");
			} else {
				targetPath = targetPath.replace("_en", "_fr");
			}


			$.ajax({

				url: targetPath,
				error: function () {
					//alert('file does not exists');
				},
				success: function (data) {
					//alert('file exists');
					var $holder = $("#LOM_language_template");
					$holder.append("<h3>Default Page Templates</h3>");
					var otherlang = (Utils.lang === "fr") ? "english" : "french";


					var title = $($.parseHTML(data)).find('h1').children(".LOM-editable").text();


					$holder.append("<button class=\"snap-lg ico-LOM-language-template\" data-id=\"\">Load " + otherlang + " version: \"" + title + "\"</button>");

					$holder.find(".ico-LOM-language-template").click(function () {

						$(CoreSettings.contentContainer).html(data);
						that.finishLoadingPageTemplate();
					});
				}
			});

		},
		loadChosenLayout: function (filename) {
			//maybe I need to save content?
			this.layout.change(filename);
			//close the popper
			$.magnificPopup.close();

		},
		loadCustomLayouts: function (pages, folder) {
			var that = this;
			var aPages = pages.split(",");
			$("#layoutpicker").prepend("<section id='LOM_custom_layouts'></section>");
			var $holder = $("#LOM_custom_layouts");
			$holder.append("<h3>Custom Layouts</h3>");

			for (var i = 0; i < aPages.length; i++) {
				//console.log(aPages[i]);
				//
				$holder.append("<button class=\"snap-lg ico-LOM-custom\" data-id=\"" + aPages[i] + "\">" + aPages[i] + "</button>");
			}
			$holder.find(".ico-LOM-custom").click(function () {
				that.loadChosenLayout(folder + $(this).attr("data-id"));
			});


		},
		loadCustomPages: function (pages, folder) {
			var that = this;
			var aPages = pages.split(",");
			$("#templatepicker").append("<section id='LOM_custom_templates'></section>");
			var $holder = $("#LOM_custom_templates");
			$holder.append("<h3>Saved Page  Templates</h3>");

			for (var i = 0; i < aPages.length; i++) {
				//
				$holder.append("<button class=\"snap-lg ico-LOM-custom\" data-id=\"" + aPages[i] + "\">" + aPages[i] + "</button>");
			}
			$holder.find(".ico-LOM-custom").click(function () {
				that.loadChosenPage(folder + $(this).attr("data-id"));
			});


		},
		loadChosenPage: function (filename) {
			var that = this;
			//maybe I need to save content?
			$(CoreSettings.contentContainer).load(filename,
				function (responseText, textStatus) {
					if (textStatus === "success") {
						that.finishLoadingPageTemplate();

					}
					if (textStatus === "error") {
						// oh noes!
					}
				});
			//close the popper


		},
		finishLoadingPageTemplate: function () {
			$.magnificPopup.close();
			this.resetPageTextValues();
			this.pageLoaded();
			this.savePage();
			this.ui.modes[1].activate(); //select ? 

		},
		resetPageTextValues: function () {
			var that = this;
			var resetText = this.labels.interface.prompts.resetTextValue;

			if (confirm(resetText)) {

				$(CoreSettings.contentContainer).find(".LOM-editable").each(function () {
					var lorem;
					var $parentElement = $(this).closest(".LOM-element");
					var elementType = $parentElement.attr("data-lom-element");
					switch (elementType) {
						case "details":

							lorem = "[ACCORDION TITLE]";
							break;
						case "radiobtn":

							lorem = "[Option xxxx]";
							break;
						case "multiplechoice":
							if ($(this).closest("legend").length > 0) {
								//this is a question text
								lorem = (Utils.lang === "fr") ? "[Insérer le texte de question]" : "[Insert Question Text]";
							}
							if ($(this).closest(".qs-right").length > 0) {
								//this is a bad feedback
								lorem = (Utils.lang === "fr") ? "<p>Bonne réponse.</p>" : "<p>Correct.</p>";
							}
							if ($(this).closest(".qs-wrong").length > 0) {
								//this is a bad feedback
								lorem = (Utils.lang === "fr") ? "<p>Mauvaise réponse.</p>" : "<p>Incorrect.</p>";
							}
							if ($(this).closest(".qs-generic").length > 0) {
								//this is a bad feedback
								lorem = (Utils.lang === "fr") ? "<p>Rétroaction générique</p><p>Passez à la prochaine question.</p>" : "<p>Generic feedback</p><p>Next Question.</p>";
							}
							if ($(this).closest(".qs-start-activity").length > 0) {
								//this is a bad feedback
								lorem = (Utils.lang === "fr") ? "<p>Instructions... la note de passage est 70%.</p>" : "<p>Instructions ... Passing mark is 70%</p>";
							}

							break;
						case "text":

							lorem = that.lorem(1, true, true);
							//page title
							if ($parentElement.attr("data-lom-subtype") === "title") {
								lorem = that.master.currentSub.title;
							}
							break;
						default:
							lorem = $(this).html();
					}
					$(this).html(lorem);

				});


			}
		},

		/*---------------------------------------------------------------------------------------------
				-------------------------UTILS
		---------------------------------------------------------------------------------------------*/
		/*
		 * @returns the editor with the assigned ID
		 */
		findEditor: function (objId) {
			//var flag=false;

			for (var i = 0; i < this.edits.length; i++) {
				if (this.edits[i].id === objId) {
					return this.edits[i];
				}
			}
			return false;
		},
		/*
		 * @returns the editor with the assigned ID
		 */
		findElement: function (objId) {
			var frames = this.layout.frames;
			var elements;
			var found = false;
			for (var i = 0; i < frames.length; i++) {
				//if(this.edits[i].id===objId){return this.edits[i];}
				elements = frames[i].elements;
				for (var j = 0; j < elements.length; j++) {
					found = frames[i].elements[j].findElement(objId);
					if (found) {
						return found;
					}
				}

			}
			return false;
		},
		/*
		 * @returns qty lines of LOREM IPSUM
		 */
		lorem: function (qty, pTag, reminder) {
			var endString = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
			//add a p Tag. add a reminder
			var pTagHtml = (reminder) ? "<p class='LOM-reminder'>" : "<p>";
			endString = (pTag) ? pTagHtml + endString + "</p>" : endString;
			qty = (typeof qty === "undefined") ? 1 : qty;
			if (qty > 1) {
				endString += "\n" + this.lorem(qty - 1);
			}

			return endString;

		},

		/*---------------------------------------------------------------------------------------------
				-------------------------LIGHTBOX POPPERS
		---------------------------------------------------------------------------------------------*/
		popLightbox: function (params) {            
			this.lbxParams = params;
			// POP!
			$(document).trigger("open.wb-lbx", [
				[{
					src: "../../templates/LOM-Elements/lbx.html",
					type: "ajax"
				}]
			]);

		},
		loadLbx: function () {
			var params = this.lbxParams;

			this.lbxParams.lbx.obj.loadLbx(params);


			this.lbxParams = null;
		},
		closeLbx: function () {
			$.magnificPopup.close();
		},
		/*---------------------------------------------------------------------------------------------
				-------------------------ELEMENTS
		---------------------------------------------------------------------------------------------*/
		objElement: function (options) {
			new ElementObj(options);
		},

		/*
		 *
		 *
		 */
		prepareElement: function (obj) {
			//define the target
			var $holderElement = $(obj).closest(".LOM-element,.LOM-frame");
			var element;

			if ($holderElement.hasClass("LOM-frame")) {
				//frame
				//let the frame handle where it wants it ... hihihi
				this.targetParent = this.layout.findFrame($holderElement.attr("id"));
				this.$target = this.targetParent.targetNewElement();
			} else {
				//element
				element = this.findElement($holderElement.attr("id"));
				this.targetParent = element;
				this.$target = element.getTarget(obj);

			}
		},


		//creates a default element
		autoAddElement: function (obj) {
			var id;
			var $parent;
			if (typeof obj === 'string') {
				//this is most likelky an ID
				id = obj;
				$parent = $("#" + id);
			} else {
				//tis is most like NOT an id
				$parent = $(obj).closest(".LOM-element,.LOM-frame");
				id = $parent.attr("id");
			}
			this.elementMode = "add";
			if ($parent.hasClass("LOM-frame")) {
				this.layout.findFrame(id).addElement();
			} else {
				//this is an element
				this.findElement(id).addElement();
			}


		},

		createElement: function (type, params) {
			var parent = this.targetParent;
			this.targetParent = null;
			var switchedElement;
			var $target = this.$target;
			this.$target = null;
			params = (typeof params !== "undefined") ? params : null;

			var options; // this will be transfered to the object as options

			this.unpopElementPicker();
			if ((this.elementMode === "switch")) {
				switchedElement = this.findElement($target.attr("id"));
			} else {
				switchedElement = null;
			}
			//create the options
			options = {
				parent: parent,
				$target: $target,
				type: type,
				mode: this.elementMode,
				switchedElement: switchedElement,
				params: params
			};

			this.objElement(options);
			this.savePage();
			this.elementMode = "";
		},
		getElementsByType: function (type) {
			var elementStack = [];
			for (var i = 0; i < this.elements.length; i++) {
				if (this.elements[i].type === type) {
					elementStack[elementStack.length] = this.elements[i];
				}
			}
			return elementStack;
		},

		/*---------------------------------------------------------------------------------------------
				-------------------------ELEMENT PICKERS
		---------------------------------------------------------------------------------------------*/
		/*
		 * popElementPicker: pops the lightbox to pick elements
		 * pass the obj to prepare
		 * pass the mode ("add" or "switch" ... altghou switch seems to be on its way out)
		 */
		popElementPicker: function (obj, mode) {
			mode = (typeof mode === "undefined") ? "add" : mode;
			//define the mode.
			this.elementMode = mode;
			//prepare the targts and all
			this.prepareElement(obj);


			// POP!
			$(document).trigger("open.wb-lbx", [
				[{
					src: "../../templates/LOM-Elements/element_picker.html",
					type: "ajax"
				}]
			]);
		},
		unpopElementPicker: function () {
			$.magnificPopup.close();
		},
		/*
		 * once the popper for the elements is loaded
		 * add some buttons and remove what's not supposed to be there
		 */

		loadElementList: function () {

			var that = this;
			var $pickBox = $("#elementpicker");
			var $chooseElement = $pickBox.find("button[data-element-type]");
			var isElement = !that.targetParent.isFrame;
			var elemType;
			var perms;
			//remove the useless ones
			for (var i = 0; i < $chooseElement.length; i++) {
				elemType = $chooseElement.eq(i).attr("data-element-type");
				if (isElement) {
					//check out all the permissions of this element
					perms = this.targetParent.permissions.subElements;

				} else {
					perms = {
						text: true,
						image: true,
						custom: true,
						details: true,
						activity: true,
						exam: true,
						multiplechoice: false,
						checkbox: false,
						lightbox: true
					};
				}
				for (var key in perms) {
					if (elemType === key && perms[key] !== true) {
						//if this is the same element type AND it's false
						$chooseElement.eq(i).remove();
					}
				}
			}
			if (isElement) {

				$chooseElement = $pickBox.find("button[data-element-type]");

				var element;

				for (var j = 0; j < $chooseElement.length; j++) {
					$chooseElement.eq(j).attr("class", $chooseElement.eq(j).attr("class").replace("snap-md", "snap-lg"));
					element = $chooseElement.eq(j).detach();
					$pickBox.append(element);
					//$chooseElement.eq(j)
					//$("#elementpicker").append()
				}
				$pickBox.children(".LOM-element-picker-sorted").remove();
			}

			$pickBox.find("button[data-element-type]").click(function () {
				var params;
				var dParams = (typeof $(this).attr("data-params") === "undefined") ? "{}" : $(this).attr("data-params");
				params = $.parseJSON(dParams);

				that.createElement($(this).closest('[data-element-type]').attr('data-element-type'), params);

			});
			if ($chooseElement.length === 1) {
				//$chooseElement.eq(0).click();
			}
			return false;

		},
		/*---------------------------------------------------------------------------------------------
				-------------------------Sub Elements manager
		---------------------------------------------------------------------------------------------*/
		addElementTemplate: function (type) {

			//check for the template
			//store it
			var template = this.findElementTemplate(type);
			if (!template) {
				this.storeElementTemplate(type);
				return false;
			} else {
				return true;
			}


		},
		/*
		 * will search for a template
		 * will return if found
		 * will create if not and return
		 */
		getElementTemplate: function (type) {
			var template = this.findElementTemplate(type);

			if (!template) {
				template = this.storeElementTemplate(type);
			}

			return template;
		},

		/*
		 * look to make sure the element does or doesn't exist 
		 *  return its value
		 */

		findElementTemplate: function (type) {
			var templates = this.subElements;
			var template = "";
			var flag = false;
			Object.keys(templates).forEach(function (key) {
				if (type === key) {
					flag = true;
					template = templates[key];
				}
			});
			if (flag) {
				return template;
			} else {
				return false;
			}
		},
		storeElementTemplate: function (type) {
			var templates = this.subElements;
			$.ajax({
				url: "../../templates/LOM-Elements/element_" + type + ".html",
				type: 'GET',
				async: false,
				cache: false,
				timeout: 30000,
				error: function () {

					return true;
				},
				success: function (msg) {
					templates[type] = msg;
				}
			});
			return templates[type];
		},
		/*---------------------------------------------------------------------------------------------
				-------------------------PAGE TEMPLATES
		---------------------------------------------------------------------------------------------*/
		saveTemplate: function () {
			var filename = LOMUtils.promptFilename(this.labels.interface.prompts.getfilename, this.parent.currentSub.sPosition + "_" + Utils.lang);
			//sending "something" to savepage gives it that extra templat-ey feel
			if (filename !== false) {

				this.savePage(filename);
			}

		},


		/*---------------------------------------------------------------------------------------------
				-------------------------CLEANUP AND SAVE
		---------------------------------------------------------------------------------------------*/


		lastCleanBeforeSave: function () {
			var $blanklayout = $(".LOM-blankpage-layout");
			if ($blanklayout.length > 0) {
				$(".LOM-blankpage-layout").remove();
			}

			//$( ".LOM-frame" ).sortable( "destroy" );

			this.layout.removeBeforeSave();
			$(".LOM-delete-on-save").remove();
			
			$(CoreSettings.contentContainer).find(".LOM-element[style]").removeAttr("style");
			this.cleanClass("highlight");
			this.cleanClass("ui-sortable");
		},
		
		cleanClass:function(cleanClass){
			
			$(CoreSettings.contentContainer).find("."+cleanClass).removeClass(cleanClass);
			
		},
		refreshInfo: function () {
			for (var i = 0; i < this.edits.length; i++) {
				this.edits[i].refreshInfo();
			}
			this.layout.refreshInfo();
		},


		/*
		 * this will clean everything out, 
		 * load some fresh code, then 
		 * send out to PHP and init WB again
		 */
		saveEdits: function () {
			if (this.layout !== false) {
				this.layout.storeFrameValue();
			}
			this.savePage();
		},

		/*
		 * LOAD CLEAN (could come in handy separately)
		 */
		loadClean: function () {
			var modifiedFlag = false;
			var i;
			//start by disabling the editors
			this.deactivateEditors();


			//if there IS a layout... 
			if (this.layout !== false) {
				//load clean layout html
				if (this.layout.isModified) {
					this.layout.loadClean();
					modifiedFlag = true;
				}
				//load clean frames html
				for (i = 0; i < this.layout.frames.length; i++) {
					if (this.layout.frames[i].isModified || this.layout.isModified) {

						this.layout.frames[i].loadClean();
						modifiedFlag = true;
					}
					this.layout.frames[i].cleanElements();
				}
			}

			//load Clean Editboxes
			//this has already been done when we disabled them.

			this.lastCleanBeforeSave();
		},

		/*
		 * rewrites the whole page to save
		 * if getTemplate is true, don't save, just return it
		 */
		savePage: function (getTemplate) {
			getTemplate = (typeof getTemplate !== "undefined") ? getTemplate : false;
			this.loadClean(); //reloads all the layouts, frames elements and edits
			//write the file and init WB back to life
			this.writeFile(getTemplate);
			if (this.layout !== false) {
				this.resetAll();
			}
			this.activateEditors();
			return true;

		},
		/*
		 * @write to PHP
		 */
		writeFile: function (getTemplate) {
			//call the file;

			var content = $(CoreSettings.contentContainer).html();
			//var bkp=content;
	
			if (typeof getTemplate !== "undefined" && getTemplate !== false && getTemplate !== "false" && getTemplate !== null) {

				content = $(CoreSettings.contentContainer).html();
				this.originalHtml = content;
				this.updateHtml("content/templates/pages/" + getTemplate + ".html");
			} else {
				this.originalHtml = content;
				this.updateHtml();
			}


		},
		updateHtml: function (templatefilename) {	
			var that = this;
			var content = this.originalHtml;
			var filename = (typeof templatefilename === "undefined") ? this.parent.currentSub.pagePath() : templatefilename;

			this.roles.checkSessions();
			this.originalHtml = content;
			console.log("-----------save--------------");
			$.post('../../editor.php', {
				action: "page",
				filename: "courses/" + this.courseFolder + "/" + filename,
				content: content
			}, function (data) {
				//$(CoreSettings.contentContainer).html(bkp);
				//parse the jSON
				data = data;
				//console.log(data);
				that.parent.initWbs();
				that.resetLbx();

			}).fail(function () {
				alert("Posting failed while updating html.");
			});
		},
		deletePage: function () {
			//this.clearDataCKE();

			if (confirm(this.labels.tools.deleteconfirm)) {
				var that = this;
				var filename = this.parent.currentSub.pagePath();
				var content = "";
				$.post('../../editor.php', {
					action: "delete",
					filename: "courses/" + this.courseFolder + "/" + filename,
					content: content
				}, function (data) {
					data = data;

					

					//parse the jSON
					//data = jQuery.parseJSON( data );
					//Reload the page
					$("html").addClass("page404");
					that.page404();
				}).fail(function () {
					alert("Posting failed while deleting page.");
				});
			}

		},
		/*---------------------------------------------------------------------------------------------
				-------------------------File management
		---------------------------------------------------------------------------------------------*/
		moveFile: function (filename) {
			if (filename.length > 0) {
				$.post('../../editor.php', {
					action: "moveFiles",
					filename: filename,
					content: "",
					folder: this.courseFolder
				}, function (data) {}).fail(function (xhr, status, error) {
					console.log(error);
					alert("Posting failed while moving files.");
				});
			}
		},


		uploadFile: function (params) {


			var that = this;
			var accept = params.accept; //accept=\""+accept+"\"
			var id = params.id;
			params.$container.append("<h3>" + params.title + "</h3>");
			params.$container.append("<label>Select File (max " + params.maxKb + "kb file size) <input type='file' name='file' id='" + id + "' accept='" + accept + "'/></label><p>Upload status: <span class=\"upload-status\"></span></p><!--span id='uploaded_file'></span-->");
			// accept='"+accept+"'
			params.$container.append("<button class='snap-sm ico-LOM-upload'>Upload</button");

			params.$container.children("button").hide();
			var $file = $("#" + id);

			$file.on("change", function () {
				var fichier = this.files[0];
				var filename = fichier.name;
				var filext = filename.split('.').pop().toLowerCase();
				if (jQuery.inArray(filext, params.filetype) === -1) {
					alert("wrong file type");
                    params.$container.find(".upload-status").html("Error - \"Wrong file type.\"");
                    params.$container.find(".upload-status").css({color: "#800000"});
					return false;
				} else {
					if (fichier.size > (params.maxKb * 1000)) {
						alert("File too big");
                        params.$container.find(".upload-status").html("Error - \"File too big.\"");
                        params.$container.find(".upload-status").css({color: "#800000"});
						return false;
					} else {
						var form_data = new FormData();
						form_data.append("file", fichier);
						form_data.append("action", "upload_image");
						form_data.append("location", params.folder);
						form_data.append("filename", that.courseFolder);
						form_data.append("extention", filext);
						$.ajax({
							url: "../../editor.php",
							method: "POST",
							data: form_data,
							contentType: false,
							cache: false,
							processData: false,
							beforeSend: function () {
								$("#uploaded_file").html("Image Uploading ... ");
                                
                                params.$container.find(".upload-status").html("Uploading...");
                                params.$container.find(".upload-status").css({color: "#000000"});
							},
							success: function (data) {
								data = JSON.parse(data);
                                
                                if(!data.uploaded){
                                    params.$container.find(".upload-status").html("An error has occurred in the upload process!");
                                    params.$container.find(".upload-status").css({color: "#800000"});
                                }
                                else{
                                    params.obj.fileUploaded(data);

                                    params.$container.find(".upload-status").html("Upload successful!");
                                    params.$container.find(".upload-status").css({color: "#008000"});
                                }
							},
                            xhr: function() {
                                var xhr = new window.XMLHttpRequest();
                                xhr.upload.addEventListener("progress", function(evt) {
                                    if (evt.lengthComputable) {
                                        var percentComplete = evt.loaded / evt.total * 100;
                                        percentComplete = percentComplete.toFixed(0)
                                        //Do something with upload progress here
                                        //params.$container.find(".upload-status").html("Uploading... " + percentComplete + "%");
                                        params.$container.find(".upload-status").html("<progress value=\"" + percentComplete + "\" max=\"100\"></progress><span> " + percentComplete + "%</span>");
                                    }
                               }, false);

                               /*xhr.addEventListener("progress", function(evt) {
                                   if (evt.lengthComputable) {
                                       var percentComplete = evt.loaded / evt.total;
                                       //Do something with download progress
                                   }
                               }, false);*/

                               return xhr;
                            },
                            error: function (data, error, errortext) {
								switch(error){
                                    case "timeout":
                                        params.$container.find(".upload-status").html("Error - \"The request timed out.\"");
                                        break;
                                    case "error":
                                        params.$container.find(".upload-status").html("Error - \"" + errortext + "\"");
                                        break;
                                    case "abort":
                                        params.$container.find(".upload-status").html("Error - \"The request aborted.\"");
                                        break;
                                    case "parsererror":
                                        params.$container.find(".upload-status").html("Error - \"There has been a parsing error.\"");
                                        break;
                                }
                                params.$container.find(".upload-status").css({color: "#800000"});
							}
						});
					}


				}
			});

		}
	});
});
