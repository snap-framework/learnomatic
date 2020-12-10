define([

	'jquery',
	'labels',
	'settings-core',
	'./../LOM-settings',
	'utils',
	'./helpers/LOM-utils',
	'modules/BaseModule',

	'./../session/sessionObj',
	'./../command/progress-Manager',
	'./../command/team-Manager',
	'./../command/user-Manager',
	'./../command/course-Manager',
	'./../social/social-Manager',
	'./../session/roles-Manager',
	'./../session/traffic-controller',


	'./ui/ui-manager',
	'./settings/settings-manager',
	'./LOM_labels',
	'./ui/LOM_ui_buttons',
	'./../plugins/ckeditor/ckeditor',
	'./pageEdit/editBoxObj',
	'./pageEdit/layoutObj',
	'./pageEdit/elementObj',
	'./structure/structure-manager',
	'./themeEdit/themes-manager',
	'./resourcesEdit/resources-manager',
	'./searchReplace/searchReplaceObj',
	'./../plugins/jquery-ui/ui/widgets/sortable'


], function ($, labels, CoreSettings, LomSettings, Utils, LOMUtils, BaseModule, Session, ProgressManager, TeamManager, UserManager, CourseManager, SocialManager, RolesManager, TrafficController, UImanager, SettingsManager, LOMLabels, LOMButtons, CKEDITOR, EditBoxObj, LayoutObj, ElementObj, Structure, ThemeEditor, ResourcesEditor, searchReplaceObj, Sortable) {
	'use strict';

	return BaseModule.extend({
		initialize: function (options) {
			this.type = "editor";
			this.version = "1.0.3";
			var that = this;
			this.parent = options.parent;
			this.master = this.parent;
			this.courseFolder = options.courseFolder;
			this.relPath = "../../";
			this.settings = LomSettings;

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

			this.reloadTarget = null;

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
			$('head').append('<link rel="stylesheet" type="text/css" href="../../theme/LOM_editor.css">');

			//we need to move this somewhere
			$.fn.outerHTML = function () {

				// IE, Chrome & Safari will comply with the non-standard outerHTML, all others (FF) will have a fall-back for cloning
				return (!this.length) ? this : (this[0].outerHTML || (
					function (el) {
						var div = document.createElement('div');
						div.appendChild(el.cloneNode(true));
						var contents = div.innerHTML;
						div = null;
						return contents;
					})(this[0]));

			}

			//Used to know if CKE is loaded properly
			this.CKELoaded = false;
			var timer = setInterval(function () {
				if (CKEDITOR.on) {
					clearInterval(timer);
					CKEDITOR.on("loaded", function () {
						that.CKELoaded = true;
					});
				}
			}, 100);

			this.setupUI();
			this.initCommandCenter();

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
				mode = "preview";
			} else {
				this.elements = [];
				mode = this.ui.currentMode.name;
			}

			$("#not-LOM-warning").remove();

			//reset the page's default html
			this.originalHtml = $(CoreSettings.contentContainer).html();
			if (mode === "pageEdit") {
				$(CoreSettings.contentContainer).first("h1").find("span.wb-inv").remove();

				$(".qs-question").attr("data-random-answers", false).addClass("random-answers-removed");

				this.reset();
				this.editBoxId();
				//this.detectRogueEditors();
				this.layout = this.detectLayout();
				this.sortable = new Sortable();
				this.parent.resourcesManager.cleanUp();
				this.resetLbx();

				$.each(this.master.editor.layout.frames, function (index) {
					this.frameNumber = index + 1;
					this.addFrameNumber();
				});

				this.detectLOMLayout();
			}
			if (this.locked) {
				this.lock();
			}
		},

		/*
		 * @first up once
		 */
		firstPageLoad: function () {

			$("html").addClass("LOM-active");

			//this.setupUI();
			this.setupSettings();
			this.setupStructure();
			//this.setupThemes();
			this.setupResources();
			this.initDone();
		},

		detectLOMLayout: function () {
			if ($(".LOM-frame, .LOM-element").length == 0) {
				this.addNotLOMWarning();
			} else if ($(".LOM-frame.converted-page").length !== 0) {
				this.addConvertedWarning();
			}
		},
		/*---------------------------------------------------------------------------------------------
				-------------------------LOCKING SYSTEM
		---------------------------------------------------------------------------------------------*/

		lock: function () {
			//console.log("LOCKED");
			$("html").addClass("LOM-editing-locked");
			this.locked = true;
			this.lockEdits();
		},
		unlock: function () {
			//console.log("UNLOCKED");
			$("html").removeClass("LOM-editing-locked");
			this.locked = false;
			this.unlockEdits();
		},

		lockMessage: function (location) {
			var params = {};
			var title, msg;
			if (Utils.lang === "en") {
				title = "Locked";
				location = (location === "course") ? "course" : "page";
				msg = "The function is Locked because the following users are in the same " + location;
			} else {
				title = "Verrouillé";
				location = (location === "course") ? "dans le même cours" : "sur la même page";
				msg = "Cette fonction est verrouillé parce que les utilisateurs suivants sont " + location;
			}
			params.lbx = {
				title: title,
				action: "locked",
				targetId: "custom_lbx",
				saveBtn: "ok",
				obj: null,
				msg: msg,
				location: location
			};
			params.config = {
				$paramTarget: null,
				selector: null,
				files: [],
				attributes: {}
			};
			this.popLightbox(params);

		},
		lockEdits: function () {
			this.deactivateEditors();
		},
		unlockEdits: function () {
			this.activateEditors();
		},
		/*---------------------------------------------------------------------------------------------
				-------------------------PAGE CONVERTER
		---------------------------------------------------------------------------------------------*/
		addNotLOMWarning: function () {
			var $warningBox = "<div class=\"bg-danger\" id=\"not-LOM-warning\"><p><span class=\"glyphicon glyphicon-warning-sign\"><span> This page's code structure is not ready for use with Learn-O-Matic. Try converting it:</p><p><button class=\"btn btn-default\" id=\"LOM-convert\">Convert</button><p>Note: the original page will be moved to the repository</p></div>";

			$(CoreSettings.contentContainer).append($warningBox);

			var that = this;

			$("#LOM-convert").click(function () {
				that.resetPageForConversion();
			});
		},

		addConvertedWarning: function () {
			var $warningBox = "<div class=\"bg-danger\" id=\"not-LOM-warning\"><p><span class=\"glyphicon glyphicon-warning-sign\"><span> This page's code structure has been converted to Learn-O-Matic's structure automatically. You can undo this conversion by selecting &ldquo;Undo&rdquo;:</p><p><button class=\"btn btn-default\" id=\"LOM-convert-undo\">Undo</button></div>";

			$(CoreSettings.contentContainer).append($warningBox);

			var that = this;

			$("#LOM-convert-undo").click(function () {
				that.undoConvertToLOM();
			});
		},

		resetPageForConversion: function () {
			var content = $(CoreSettings.contentContainer).html()

			var currentSub = this.master.currentSub;
			var sPosition = this.master.currentSub.sPosition;
			var title = this.master.currentSub.title;
			var altTitle = this.master.currentSub.altTitle;
			var isPage = this.master.currentSub.isPage;

			this.structure.initArchive();
			this.structure.findMoveRepository(currentSub, true);

			this.structure.addPage(sPosition, title, altTitle, isPage);

			window.fNav(sPosition);

			$(CoreSettings.contentContainer).html(content);
		},

		startConversion: function (repositoryPos) {
			var that = this;

			$(CoreSettings.contentContainer).find("[class^='col-md-']").each(function () {
				$(this).addClass("LOM-frame").addClass("ui-sortable").addClass("highlight").attr("id", that.generateId("LOMfr_"));
			});

			//Images
			$(CoreSettings.contentContainer).find("img").each(function () {
				$(this).removeAttr("width").removeAttr("height").addClass("img-responsive");
				$(this).wrap("<section class=\"LOM-element ui-sortable highlight\" data-lom-element=\"image\">");
			});

			//Audio and Video elements
			$(CoreSettings.contentContainer).find(".wb-mltmd").each(function () {
				if ($(this).find("video").length !== 0) {
					$(this).removeClass().addClass("wb-mltmd").addClass("LOM-element").attr("data-lom-element", "video");

					if (!$(this).parent().hasClass("LOM-frame")) {
						$(this).unwrap();
					}

					$(this).find(".wb-mm-cc").remove();
					$(this).find(".wb-mm-ctrls").remove();
					if ($(this).find("video").parent().is(".display")) {
						$(this).find("video").unwrap();
					}

					if ($(this).find("details").parent().is(".accordion")) {
						$(this).find("details").unwrap();
					}

					$(this).find("details").each(function () {
						$(this).removeAttr("role");
						$(this).addClass("LOM-holder").attr("id", "inline-captions");
					});

					$(this).find("summary").each(function () {
						$(this).removeAttr("data-toggle").removeAttr("id").removeAttr("role").removeAttr("aria-selected").removeAttr("tabindex").removeAttr("aria-posinset").removeAttr("aria-setsize").removeClass("wb-toggle").removeClass("tgl-tab").removeClass("wb-details").removeClass("wb-toggle-inited");
						$(this).addClass("wb-details").html("<div class=\"LOM-editable\">" + $(this).html() + "</div>");
					});

					$(this).find("details").find(".tgl-panel").children().eq(0).unwrap();
					$(this).find("details").children().each(function () {
						if (!$(this).is("summary")) {
							$(this).wrap("<div class=\"LOM-editable\">");
							$(this).parent().wrap("<section class=\"LOM-element wb-tmtxt ui-sortable highlight\" data-lom-element=\"text\" id=\"LOM_el_3\" data-subtype=\"transcript\" data-begin=\"1.0s\" data-dur=\"3s\">");
						}
					});

					$(this).find("track").attr("src", "#inline-captions").attr("kind", "captions").attr("data-type", "text/html").attr("srclang", "en").attr("label", "English");
				} else if ($(this).find("audio").length !== 0) {
					$(this).removeClass().addClass("wb-mltmd").addClass("LOM-element").attr("data-lom-element", "audio");

					if (!$(this).parent().hasClass("LOM-frame")) {
						$(this).unwrap();
					}

					$(this).find(".wb-mm-cc").remove();
					$(this).find(".wb-mm-ctrls").remove();
					if ($(this).find("audio").parent().is(".display")) {
						$(this).find("audio").unwrap();
					}

					if ($(this).find("details").parent().is(".accordion")) {
						$(this).find("details").unwrap();
					}

					$(this).find("details").each(function () {
						$(this).removeAttr("role");
						$(this).addClass("LOM-holder").attr("id", "inline-captions");
					});

					$(this).find("summary").each(function () {
						$(this).removeAttr("data-toggle").removeAttr("id").removeAttr("role").removeAttr("aria-selected").removeAttr("tabindex").removeAttr("aria-posinset").removeAttr("aria-setsize").removeClass("wb-toggle").removeClass("tgl-tab").removeClass("wb-details").removeClass("wb-toggle-inited");
						$(this).addClass("wb-details").html("<div class=\"LOM-editable\">" + $(this).html() + "</div>");
					});

					$(this).find("details").find(".tgl-panel").children().eq(0).unwrap();
					$(this).find("details").children().each(function () {
						if (!$(this).is("summary")) {
							$(this).wrap("<div class=\"LOM-editable\">");
							$(this).parent().wrap("<section class=\"LOM-element wb-tmtxt ui-sortable highlight\" data-lom-element=\"text\" id=\"LOM_el_3\" data-subtype=\"transcript\" data-begin=\"1.0s\" data-dur=\"3s\">");
						}
					});

					$(this).find("track").attr("src", "#inline-captions").attr("kind", "captions").attr("data-type", "text/html").attr("srclang", "en").attr("label", "English");
				}
			});

			//Accordions
			$(CoreSettings.contentContainer).find(".accordion").each(function () {
				$(this).addClass("LOM-element").attr("data-lom-element", "accordion");

				$(this).find("details").each(function () {
					$(this).removeAttr("role");
					$(this).addClass("LOM-element").attr("data-lom-element", "details");
				});

				$(this).find("summary").each(function () {
					$(this).removeAttr("data-toggle").removeAttr("id").removeAttr("role").removeAttr("aria-selected").removeAttr("tabindex").removeAttr("aria-posinset").removeAttr("aria-setsize").removeClass("wb-toggle").removeClass("tgl-tab").removeClass("wb-details").removeClass("wb-toggle-inited");
					$(this).addClass("wb-details").html("<div class=\"LOM-editable\">" + $(this).html() + "</div>");
				});

				$(this).find(".tgl-panel").each(function () {
					$(this).removeAttr("aria-labelledby").removeAttr("aria-expanded").removeAttr("aria-hidden").removeClass()
					$(this).addClass("LOM-holder").addClass("ui-sortable").addClass("highlight");
				});
			});

			//Tabbed interfaces
			$(CoreSettings.contentContainer).find(".wb-tabs").each(function () {
				$(this).find("ul[role='tablist']").remove();

				$(this).removeClass().addClass("LOM-element").addClass("wb-tabs").attr("data-lom-element", "accordion").attr("data-lom-subtype", "tabs");

				$(this).find("details").each(function () {
					if ($(this).parent().is(".tabpanels")) {
						$(this).unwrap();
					}
					$(this).removeClass().removeAttr("role").removeAttr("aria-hidden").removeAttr("aria-expanded").removeAttr("aria-labelledby").removeAttr("tabindex");
					$(this).addClass("LOM-element").attr("data-lom-element", "details");
				});

				$(this).find("summary").each(function () {
					$(this).removeAttr("data-toggle").removeAttr("id").removeAttr("role").removeAttr("aria-selected").removeAttr("tabindex").removeAttr("aria-posinset").removeAttr("aria-setsize").removeAttr("aria-hidden").removeClass()
					$(this).addClass("wb-details").html("<div class=\"LOM-editable\">" + $(this).html() + "</div>");
				});

				$(this).find(".tgl-panel").each(function () {
					$(this).removeAttr("aria-labelledby").removeAttr("aria-expanded").removeAttr("aria-hidden").removeClass()
					$(this).addClass("LOM-holder").addClass("ui-sortable").addClass("highlight");
				});
			});

			//Lightboxes
			$(CoreSettings.contentContainer).find(".modal-dialog").each(function () {
				$(this).wrap("<section class=\"LOM-element\" data-lom-element=\"lightbox\">");

				$(this).find(".modal-title").each(function () {
					$(this).html("<div class=\"LOM-editable\">" + $(this).html() + "</div>");
				});

				$(this).find(".modal-body").each(function () {
					$(this).addClass("LOM-holder");
				});
			});

			//Text elements
			$(CoreSettings.contentContainer).find("p, ul, ol, h1, h2, h3, h4, h5, h6").each(function () {
				if (!$(this).parent().is(".LOM-editable") && !$(this).parent().is(".modal-header")) {
					$(this).wrap("<div class=\"LOM-editable\"></div>");
				}
			});

			//Create .LOM-element's + add IDs
			$(CoreSettings.contentContainer).find(".LOM-editable").each(function () {
				if ($(this).parent().prop("tagName") != "SUMMARY" && !$(this).parent().is(".modal-title") && !$(this).parent().is(".LOM-element")) {
					$(this).wrap("<section class=\"LOM-element ui-sortable highlight\" data-lom-element=\"text\"></section>");
				}
			});
			$(CoreSettings.contentContainer).find(".LOM-editable").each(function () {
				$(this).attr("id", that.generateId("LOM_edit_"));
			});
			$(CoreSettings.contentContainer).find(".LOM-element").each(function () {
				$(this).attr("id", that.generateId("LOM_el_"));
			});

			$(CoreSettings.contentContainer).find(".wb-mltmd").each(function () {
				$(this).find("video").attr("id", $(this).attr("id") + "-md");
				$(this).find("audio").attr("id", $(this).attr("id") + "-md");
			});

			$(CoreSettings.contentContainer).find(".LOM-element[data-lom-element=\"lightbox\"]").each(function () {
				$(this).find(".modal-dialog").attr("id", $(this).attr("id") + "_lbx");
				$(this).find(".modal-body").attr("id", $(this).attr("id") + "_holder");
			});

			$(CoreSettings.contentContainer).find(".LOM-element").each(function () {
				if ($(this).closest(".LOM-frame").length == 0) {
					$(this).wrap("<section class=\"col-md-12 LOM-frame ui-sortable highlight\">");
					$(this).parent().attr("id", that.generateId("LOMfr_"));
				}
			});

			$(CoreSettings.contentContainer).find("[class^='col-md-']").eq(0).addClass("converted-page").attr("data-converted-page", repositoryPos);

			$("#not-LOM-warning").remove();

			this.originalHtml = $(CoreSettings.contentContainer).html();
			this.refreshHtml();
		},

		undoConvertToLOM: function () {
			this.deactivateEditors();

			var previousPage = $("[data-converted-page]").data("converted-page");
			var sPosition = this.master.currentSub.sPosition;

			this.structure.initArchive();
			this.structure.findMoveRepository(this.master.currentSub, false);

			var subs = this.master.flatList;
			var previousPageSub;

			for (var i = 0; i < subs.length; i++) {
				if (subs[i].sPosition == previousPage) {
					previousPageSub = subs[i];
				}
			}

			previousPageSub.move(sPosition);

			window.fNav(sPosition);
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
				modes: LOMButtons,
				interface: "editor"
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
		 * @this will eventually start the resources manager
		 */
		setupResources: function () {
			//---------themes manager
			this.resourcesEdit = new ResourcesEditor({
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

		//might need to remove this now
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
		generateId: function (prefix) {
			return LOMUtils.generateId(prefix);
		},
		/*---------------------------------------------------------------------------------------------
				-------------------------DETECTORS
		---------------------------------------------------------------------------------------------*/
		/*
		 * @detect all the editors
		 */
		editBoxId: function () {
			var $edits = $(".LOM-editable:not([id])");
			var flag = ($edits.length) ? true : false;
			for (var i = 0; i < $edits.length; i++) {
				$edits.eq(i).attr("id", this.generateId("LOM-edit-"))
			}
			if (flag) {
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
				that.ui.modeList[1].select();
				that.ui.currentMode = that.ui.modeList[1];

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
			this.originalHtml = html;
			this.refreshHtml();
			$("html").removeClass("page404 ");
			this.pageLoaded();
		},
		popLayoutPicker: function () {
			/*$(document).trigger("open.wb-lbx", [
				[{
					src: "../../templates/LOM-Layouts/layout_picker_" + Utils.lang + ".html",
					type: "ajax"
				}]
			]);*/

			// POP with animation!!
			var that = this;
			$.magnificPopup.open({
				items: {
					src: "../../templates/LOM-Layouts/layout_picker_" + Utils.lang + ".html"
				},
				type: "ajax",

				removalDelay: 500,
				callbacks: {
					beforeOpen: function () {
						this.st.mainClass = "mfp-zoom-in";
					},
					ajaxContentAdded: function () {
						this.content.find(".modal-title").attr("id", "lbx-title");
						that.loadLayoutList()
					}
				},
				midClick: true
			}, 0);
		},
		popTemplatePicker: function () {
			/*$(document).trigger("open.wb-lbx", [
				[{
					src: "../../templates/LOM-Layouts/template_picker_" + Utils.lang + ".html",
					type: "ajax"
				}]
			]);*/

			// POP with animation!!
			var that = this
			$.magnificPopup.open({
				items: {
					src: "../../templates/LOM-Layouts/template_picker_" + Utils.lang + ".html"
				},
				type: "ajax",

				removalDelay: 500,
				callbacks: {
					beforeOpen: function () {
						this.st.mainClass = "mfp-zoom-in";
					},
					ajaxContentAdded: function () {
						this.content.find(".modal-title").attr("id", "lbx-title");
						that.loadTemplateList()
					}
				},
				midClick: true
			}, 0);
		},
		loadLayoutList: function () {
			var defaultFolder = "../../templates/LOM-Layouts/";
			var customFolder = "content/templates/layouts/";


			var that = this;

			$("#layoutpicker").find("button[data-id]").click(function () {
				that.loadChosenLayout(defaultFolder + $(this).attr("data-id") + ".html");
			});


			$.post(this.relPath + 'editor.php', {
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
					$holder.append("<h3>" + ((Utils.lang === "en") ? "Default Page Templates" : "Modèles de page par défaut") + "</h3>");
					var otherlang = (Utils.lang === "en") ? "Load French version:" : "Charger la version anglaise :";


					var title = $($.parseHTML(data)).find('h1').children(".LOM-editable").text();


					$holder.append("<button class=\"snap-lg ico-LOM-language-template\" data-id=\"\">" + otherlang + " \"" + title + "\"</button>");

					$holder.find(".ico-LOM-language-template").click(function () {
						data = that.resetPageTextValues(data);

						var $data = $("<div>" + data + "</div>");
						$data.find(".qs-elearning-activity h2").html(that.labels.element.type.activity);
						$data.find(".LOM-element[data-lom-subtype=\"exam\"] .qs-elearning-activity h2").html(that.labels.element.type.exam);
						$data.find(".qs-question h3 .qs-select-correct").html(that.labels.element.editview.QS.selectCorrect);
						$data.find(".qs-feedback-final h3").html(that.labels.element.editview.QS.results);
						$data.find(".qs-feedback-final .yougot").html(that.labels.element.editview.QS.yougot);
						$data.find(".qs-feedback-final .scoreof").html(that.labels.element.editview.QS.scoreof);
						$data.find(".LOM-element[data-lom-element=\"custom\"] h2").html(that.labels.element.default.customTitle);
						$data.find(".LOM-btn-title").html(that.labels.element.default.button);

						data = $data.html();

						$(CoreSettings.contentContainer).html(data);
						that.originalHtml = data;
						that.finishLoadingPageTemplate();
						that.refreshHtml();
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
			$holder.append("<h3>" + ((Utils.lang === "en") ? "Custom Layouts" : "Dispositions personnalisées") + "</h3>");

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
			$holder.append("<h3>" + ((Utils.lang === "en") ? "Saved Page Templates" : "Modèles de page sauvegardés") + "</h3>");

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

			$.get(filename, function (data) {
				data = that.resetPageTextValues(data);
				$(CoreSettings.contentContainer).html(data);
				that.originalHtml = data;
				that.refreshHtml();
				that.finishLoadingPageTemplate();
			});


		},
		finishLoadingPageTemplate: function () {
			$.magnificPopup.close();
			this.elements = [];
			this.pageLoaded();


		},
		resetPageTextValues: function (html) {
			var that = this;
			var $old = $("<div>");
			$old.append(html);
			var resetText = this.labels.interface.prompts.resetTextValue;

			if (confirm(resetText)) {

				$old.find(".LOM-editable").each(function () {
					var lorem;
					var $parentElement = $(this).closest(".LOM-element");
					var elementType = $(this).closest(".LOM-element").attr("data-lom-element");
					switch (elementType) {
						case "details":
							if ($parentElement.closest(".LOM-element[data-lom-subtype]").attr("data-lom-subtype") == "tabs") {
								lorem = that.labels.element.default.tabs;
							} else if ($parentElement.parents(".LOM-element").attr("data-lom-element") == "image" && $parentElement.attr("data-lom-subtype") == "graphDesc") {
								lorem = that.labels.element.default.graphDesc;
							} else {
								lorem = that.labels.element.default.details;
							}
							break;
						case "radiobtn":

							lorem = "[Option xxxx]";
							break;
						case "multiplechoice":
							if ($(this).closest("legend").length > 0) {
								//this is a question text
								lorem = this.labels.editview.QS.insertText;
							}
							if ($(this).closest(".qs-right").length > 0) {
								//this is a bad feedback
								lorem = this.labels.editview.QS.right;
							}
							if ($(this).closest(".qs-wrong").length > 0) {
								//this is a bad feedback
								lorem = this.labels.editview.QS.wrong;
							}
							if ($(this).closest(".qs-second-chance").length > 0) {
								//this is a bad feedback
								lorem = this.labels.editview.QS.secondChance;
							}
							if ($(this).closest(".qs-generic").length > 0) {
								//this is a bad feedback
								lorem = this.labels.editview.QS.generic;
							}

							break;
						case "text":

							lorem = that.lorem(1, true, true);
							//page title
							if ($parentElement.attr("data-lom-subtype") === "title") {
								lorem = that.master.currentSub.title;
							}
							break;
						case "activity":
							if ($(this).closest(".qs-start-activity").length > 0) {
								//this is a bad feedback
								lorem = (Utils.lang === "fr") ? "<p>Maintenant que vous avez terminé les premiers modules, vous devez passer l’examen.</p><p>Pour réussir cet examen, qui comprend 20 questions, vous devez obtenir une note d’au moins <strong>70 %</strong>. Les questions vous seront présentées l’une après l’autre et elles seront accompagnées d’instructions. Vous n’avez aucune limite de temps. Toutefois, <strong>si vous devez quitter avant la fin</strong>, vous devrez recommencer l’examen depuis le début lorsque vous rouvrirez le cours.</p><p>Votre note s’affichera à la fin de l’examen. Si vous n’avez pas obtenu la note de passage, vous serez invité à réessayer.</p>" : "<p>Now that you have completed the first modules, please complete the exam.</p><p>The exam includes&nbsp;<strong>20&nbsp;questions</strong>&nbsp;and the pass grade is&nbsp;<strong>70%</strong>. The questions will be presented one at a time with instructions along the way. There is no time limit, however,&nbsp;<strong>if you have to exit before completion</strong>, you will be required to restart the exam from the beginning when you re-enter the course.</p><p>Upon completion you will be shown your score. If you have not obtained a passing grade, you will be asked to try again.</p>";
							}
							if ($(this).closest(".qs-final-positive-feedback").length > 0) {
								//this is a bad feedback
								lorem = (Utils.lang === "fr") ? "<p>Félicitations! Vous avez complété l'examen avec succès.</p><p>Le cours sera conservé dans votre compte GCcampus. Vous pouvez le consulter à tout moment.</p><p>Pour imprimer votre certificat, suivez les instructions qui sont indiquées dans <a href=\"https://learn-apprendre.csps-efpc.gc.ca/application/fr/content/comment-imprimer-un-certificat-et-voir-vos-formations-completees\" rel=\"external\" target=\"_blank\" title=\"Comment imprimer un certificat et voir vos formations complétées\">GCcampus</a>.</p><p>Si le certificat ne s’affiche pas, essayez de désactiver le système de blocage des fenêtres contextuelles de votre navigateur. Si vous ne parvenez pas à imprimer vos certificats malgré cela, communiquez avec l’équipe responsable des technologies de l’information.</p>" : "<p>Congratulations! You have successfully completed the exam.</p><p>This course will remain in your GCcampus account, and you may refer to it at any time.</p><p>To learn how to print your certificate, follow the instructions provided in <a href=\"https://learn-apprendre.csps-efpc.gc.ca/application/en/content/how-print-certificate-or-see-your-transcripts\" rel=\"external\" target=\"_blank\" title=\"How to print a certificate or see your Transcripts\">GCcampus</a>.</p><p>If the certificate does not appear, you may need to turn off your browser’s pop up blocker. If you are still experiencing difficulties in printing your certificate, please contact your IT team.</p>";
							}
							if ($(this).closest(".qs-final-negative-feedback").length > 0) {
								//this is a bad feedback
								lorem = (Utils.lang === "fr") ? "<p>Vous avez échoué à l’examen. Vous devez obtenir une cote d’au moins 70 %. Passez de nouveau en revue les documents de formation, puis réessayez.</p>" : "<p>You have not successfully completed the exam. You must achieve a score of 70% or higher. Please review the course material and try again.</p>";
							}

							break;
						case "lightbox":
							if ($(this).closest(".modal-title").length > 0) {
								//this is a bad feedback
								lorem = that.labels.element.default.lbxTitle;
							}
							break;
						case "custom":
							lorem = that.labels.element.default.customContent;
							break;
						default:
							if ($(this).closest(".wb-mltmd").length > 0) {
								lorem = that.labels.element.default.transcript;
							} else {
								lorem = $(this).html();
							}
					}
					$(this).html(lorem);

				});
				return $old.html();

			} else {
				return html;
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

			var pTagHtml = (reminder) ? "<p class='LOM-reminder'>" : "<p>";

			qty = (typeof qty === "undefined") ? 1 : qty;
			if (qty > 1) {
				endString += "\n" + this.lorem(qty - 1);
			}

			endString = (pTag) ? pTagHtml + endString + "</p>" : endString;

			return endString;
		},

		/*---------------------------------------------------------------------------------------------
				-------------------------LIGHTBOX POPPERS
		---------------------------------------------------------------------------------------------*/
		popLightbox: function (params) {
			this.lbxParams = params;

			// POP!
			/*$(document).trigger("open.wb-lbx", [
				[{
					src: "../../templates/LOM-Elements/lbx.html",
					type: "ajax"
				}, ],
			]);*/

			// POP with animation!!
			var that = this;
			$.magnificPopup.open({
				items: {
					src: "../../templates/LOM-Elements/lbx.html"
				},
				type: "ajax",

				removalDelay: 500,
				callbacks: {
					beforeOpen: function () {
						this.st.mainClass = "mfp-zoom-in";
					},
					ajaxContentAdded: function () {
						this.content.find(".modal-title").attr("id", "lbx-title");
						that.loadLbx()
					}
				},
				midClick: true
			}, 0);
		},
		loadLbx: function () {
			var params = this.lbxParams;
			if (this.lbxParams.lbx.obj === null || this.lbxParams.lbx.obj === this) {
				this.afterLoadLbx(params);

			} else {
				this.lbxParams.lbx.obj.loadLbx(params);
			}

			this.lbxParams = null;
		},
		afterLoadLbx: function (params) {
			var that = this;
			var title = params.lbx.title;
			var saveBtn = params.lbx.saveBtn;
			var targetId = params.lbx.targetId;
			//change the title
			$("#lbx-title").text(title);

			//change save Msg
			$("#" + targetId).parent().children(".modal-footer").html("<button class=\"snap-md ico-SNAP-save\">" + saveBtn + "</button></div>");

			switch (params.lbx.action) {
				case "locked":
					//-----------LOCKED POP UP
					var samecourse = (params.lbx.location === "course") ? " LOM-same-course" : "";
					$("#" + targetId).append("<p>" + params.lbx.msg + "</p>");
					$("#" + targetId).append("<ul class='LOM-watcher" + samecourse + "'></ul>");

					$("#" + targetId).parent().children(".modal-footer").children("button")
						.removeClass("ico-SNAP-save")
						.addClass("ico-QS-check")
						.click(function () {
							that.closeLbx();
						});
					this.traffic.checkOtherSessions();
					break;


				default:
				// code block
			}

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

		createElement: function (type, params, dismissPopup) {
			var parent = this.targetParent;
			this.targetParent = null;
			var $target = this.$target;
			this.$target = null;
			params = (typeof params !== "undefined") ? params : null;

			var options; // this will be transfered to the object as options
			if (dismissPopup) {
				this.unpopElementPicker();
			}

			//create the options
			options = {
				parent: parent,
				$target: $target,
				type: type,
				mode: this.elementMode,
				params: params
			};

			this.objElement(options);
			// save the new element


			this.elementMode = "";
			this.refreshHtml();

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
			/*$(document).trigger("open.wb-lbx", [
				[{
					src: "../../templates/LOM-Elements/element_picker_" + Utils.lang + ".html",
					type: "ajax"
				}]
			]);*/

			// POP with animation!!
			var that = this;
			$.magnificPopup.open({
				items: {
					src: "../../templates/LOM-Elements/element_picker_" + Utils.lang + ".html"
				},
				type: "ajax",

				removalDelay: 500,
				callbacks: {
					beforeOpen: function () {
						this.st.mainClass = "mfp-zoom-in";
					},
					ajaxContentAdded: function () {
						this.content.find(".modal-title").attr("id", "lbx-title");
						that.loadElementList();
					}
				},
				midClick: true
			}, 0);
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
						html: true,
						details: true,
						activity: true,
						exam: true,
						multiplechoice: false,
						button: false,
						checkbox: false,
						lightbox: true,
						btngroup: true,
						faq: true,
						video: true,
						audio: true
					};
					if (that.targetParent.$el.hasClass("col-md-6") || that.targetParent.$el.hasClass("col-md-5")) {
						perms.faq = false;
						perms.activity = false;
						perms.exam = false;
						perms.lightbox = false;
					}
					if (that.targetParent.$el.hasClass("col-md-4") || that.targetParent.$el.hasClass("col-md-3") || that.targetParent.$el.hasClass("col-md-2") || that.targetParent.$el.hasClass("col-md-1")) {
						perms.faq = false;
						perms.video = false;
						perms.lightbox = false;
						perms.activity = false;
						perms.exam = false;
					}
				}
				for (var key in perms) {
					if (elemType === key && perms[key] !== true) {
						//if this is the same element type AND it's false
						if ($chooseElement.eq(i).parent().find("button[data-element-type]").length > 1) {
							$chooseElement.eq(i).remove();
						} else {
							$chooseElement.eq(i).parent().remove();
						}
					}
				}
				if (this.targetParent.type == "faq") {
					$pickBox.find("button[data-element-type=\"button\"]").text((Utils.lang === "en") ? "Filter" : "Filtre")
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

				that.createElement($(this).closest('[data-element-type]').attr('data-element-type'), params, true);

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
			//sending "something" to save page gives it that extra templat-ey feel
			if (filename !== false) {

				this.updateHtml("content/templates/pages/" + filename + ".html");


			}

		},

		/*---------------------------------------------------------------------------------------------
				-------------------------Search/Replace
		---------------------------------------------------------------------------------------------*/
		openSearchReplace: function () {
			/*$(document).trigger("open.wb-lbx", [
				[{
					src: "../../templates/search_replace_" + Utils.lang + ".html",
					type: "ajax"
				}]
			]);*/

			// POP with animation!!
			//var that = this;
			$.magnificPopup.open({
				items: {
					src: "../../templates/search_replace_" + Utils.lang + ".html"
				},
				type: "ajax",

				removalDelay: 500,
				callbacks: {
					beforeOpen: function () {
						this.st.mainClass = "mfp-zoom-in";
					},
					ajaxContentAdded: function () {
						this.content.find(".modal-title").attr("id", "lbx-title");
						//that.loadLbx()
					}
				},
				midClick: true
			}, 0);
		},

		initSearchReplace: function ($lbx) {
			this.$lbx = $lbx;
			var that = this;

			$lbx.find("button.startSearchReplace").click(function () {
				that.searchReplace();
			})
		},

		searchReplace: function () {
			this.search = this.$lbx.find("#search").val();
			this.replace = this.$lbx.find("#replace").val();
			this.searchin = this.$lbx.find("#searchin").val();
			this.caseSensitive = this.$lbx.find("#case").is(":checked");

			this.$lbx.find(".display").addClass("hidden");
			this.$lbx.find(".no-results").removeClass("hidden");
			this.$lbx.find(".display").find(".result").remove();

			if (this.search != "") {
				if ((this.replacing() && confirm((Utils.lang === "en") ? "Are you sure you want to replace this content EVERYWHERE in the course ?" : "Êtes-vous sûr(e) de vouloir remplacer ce contenu PARTOUT dans le cours ?")) || !this.replacing()) {
					var pages = this.master.flatList;
					this.objs = [];

					for (var i = 0; i < pages.length; i++) {
						if (pages[i].sPosition.indexOf("m98") < 0) {
							var obj = new searchReplaceObj({
								page: pages[i].sPosition,
								pageTitle: pages[i].title,
								search: this.search,
								replace: this.replace,
								searchin: this.searchin,
								caseSensitive: this.caseSensitive,
								editor: this
							});
							this.objs.push(obj);
						}
					}
				} else {
					this.$lbx.find(".no-results").addClass("hidden");
				}
			} else {
				this.$lbx.find(".no-results").addClass("hidden");
				alert((Utils.lang === "en") ? "Please enter a search value" : "Veuillez entrer une valeur à rechercher");
			}
		},

		replacing: function () {
			var replacing = this.replace.replace(/\s/g, '') != "";
			if (this.caseSensitive) {
				if (this.search == this.replace) {
					replacing = false;
				}
			} else {
				if (this.search.toLowerCase() == this.replace.toLowerCase()) {
					replacing = false;
				}
			}
			return replacing;
		},

		displayResults: function (obj) {
			for (var i = 0; i < obj.results.length; i++) {
				this.$lbx.find(".display").append("<div class=\"row result\"><div class=\"col-md-4\"><p>" + this.getLocation(obj.page, obj.pageTitle) + "</p></div><div class=\"col-md-4\"><p>" + obj.results[i] + "</p></div><div class=\"col-md-4\"><p>" + ((obj.replacedResults.length > 0) ? obj.replacedResults[i] : "-") + "</p></div></div>");
			}
			if (obj.results.length > 0) {
				this.$lbx.find(".no-results").addClass("hidden");
				this.$lbx.find(".display").removeClass("hidden");
			}
		},

		getLocation: function (pos, title) {
			var list = this.master.flatList;
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
		/*---------------------------------------------------------------------------------------------
				-------------------------COMMAND CENTER
		---------------------------------------------------------------------------------------------*/

		stopTicker: function () {
			this.ticker = false;
		},
		startTicker: function () {
			this.ticker = true;
		},

		initCommandCenter: function () {

			//console.log("init command centerish")
			this.progressManager = new ProgressManager({
				root: this,
				window: window
			});
			this.roleManager = new RolesManager({
				root: this,
				labels: this.labels
			});
			this.session = new Session({
				root: this,
				progressManager: this.progressManager,

				labels: this.labels
			});
			this.teamManager = new TeamManager({
				root: this,
				progressManager: this.progressManager
			});
			this.userManager = new UserManager({
				root: this,
				progressManager: this.progressManager
			});

			this.courseManager = new CourseManager({
				root: this,
				progressManager: this.progressManager
			});

			this.traffic = new TrafficController({
				root: this,
				progressManager: this.progressManager
			});

			this.progressManager.initInterface();
			this.courseManager.initCourses();
			this.userManager.initUsers();
		},

		initDone: function () {
			if (this.courseManager.inited && this.userManager.inited && this.session.inited && this.initialized) {


				this.session.loggedIn();
				this.social = new SocialManager({
					root: this,
					progressManager: this.progressManager
				});
			}
		},
		socialLoaded: function () {
			this.ui.getStarted();
			//this.updateInterface();
		},

		/*---------------------------------------------------------------------------------------------
				-------------------------PHP file saving
		---------------------------------------------------------------------------------------------*/
		modifyById: function (ID, html) {
			var $bkp = $("<div>");
			$bkp.append(this.originalHtml);
			$bkp.find("#" + ID).html(html);
			this.originalHtml = $bkp.html();
			this.refreshHtml();

			$("#" + ID).html(html);

		},
		refreshHtml: function () {
			//console.log(this.originalHtml);
			this.updateHtml();
		},

		updateHtml: function (templatefilename) {
			var content = this.originalHtml;
			var filename = (typeof templatefilename === "undefined") ? this.parent.currentSub.pagePath() : templatefilename;
			this.traffic.checkOtherSessions();
			this.originalHtml = content;
			//console.log("---refreshHtml---");
			$.post('../../editor.php', {
				action: "page",
				filename: "courses/" + this.courseFolder + "/" + filename,
				content: content
			}, function () {

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
				}, function () {
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
				}, function () { }).fail(function () {
					alert("Posting failed while moving files.");
				});
			}
		},


		uploadFile: function (params) {


			var that = this;
			var accept = params.accept; //accept=\""+accept+"\"
			var id = params.id;
			params.$container.append("<h3>" + params.title + "</h3>");
			params.$container.append("<label style='margin-bottom: 20px;'>" + ((Utils.lang === "en") ? "Select File (max " : "Sélectionner un fichier (taille maximale : ") + params.maxKb + ((Utils.lang === "en") ? "kb file size)" : "Ko)") + "<br><input style='margin-top: 5px;' type='file' name='file' id='" + id + "' accept='" + accept + "'/></label><p>" + ((Utils.lang === "en") ? "Upload status" : "Status du téléversement ") + ": <span class=\"upload-status\"></span></p><!--span id='uploaded_file'></span-->");
			// accept='"+accept+"'
			params.$container.append("<button class='snap-sm ico-LOM-upload'>" + ((Utils.lang === "en") ? "Upload" : "Téléverser") + "</button");

			params.$container.children("button").hide();
			var $file = $("#" + id);

			$file.on("change", function () {
				var fichier = this.files[0];
				var filename = fichier.name;
				var filext = filename.split('.').pop().toLowerCase();
				if (jQuery.inArray(filext, params.filetype) === -1) {
					alert("wrong file type");
					params.$container.find(".upload-status").html("Error - \"Wrong file type.\"");
					params.$container.find(".upload-status").css({
						color: "#800000"
					});
					return false;
				} else {
					if (fichier.size > (params.maxKb * 1000)) {
						alert("File too big");
						params.$container.find(".upload-status").html("Error - \"File too big.\"");
						params.$container.find(".upload-status").css({
							color: "#800000"
						});
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
								params.$container.find(".upload-status").css({
									color: "#000000"
								});
							},
							success: function (data) {
								data = JSON.parse(data);

								if (!data.uploaded) {
									params.$container.find(".upload-status").html("An error has occurred in the upload process!");
									params.$container.find(".upload-status").css({
										color: "#800000"
									});
								} else {
									params.obj.fileUploaded(data);

									params.$container.find(".upload-status").html("Upload successful!");
									params.$container.find(".upload-status").css({
										color: "#008000"
									});
								}
							},
							xhr: function () {
								var xhr = new window.XMLHttpRequest();
								xhr.upload.addEventListener("progress", function (evt) {
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
								switch (error) {
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
								params.$container.find(".upload-status").css({
									color: "#800000"
								});
							}
						});
					}


				}
			});

		}
	});
});
