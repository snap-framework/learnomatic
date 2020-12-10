define([

	'jquery',
	'labels',
	'settings-core',
	'utils',
	'modules/BaseModule',
	'./../../plugins/ckeditor/ckeditor',
	'./../LOM_labels',
], function ($, labels, CoreSettings, Utils, BaseModule, CKEDITOR, LOMLabels) {
	'use strict';

	return BaseModule.extend({
		initialize: function (options) {
			this.parent = options.parent;
			this.editor = this.parent;
			this.parentElement = (typeof options.parentElement === "undefined") ? null : options.parentElement;

			this.$el = options.$el;
			if (typeof options.id === "undefined") {
				this.id = this.editor.generateId("LOM-edit-");
				this.$el.attr("id", this.id);
			} else {
				this.id = options.id;
			}
			//this.id = (typeof options.id === "undefined") ? this.editor.generateId("LOM-edit-") : options.id;
			this.ckeInstance = null;


			this.isModified = null;
			this.isActivated = null;
			this.isRestricted = false;
			this.isRogue = (typeof options.isRogue !== "undefined") ? options.isRogue : false;

			//CKE creates these
			this.ckeId = "cke_" + this.id;

			this.class = options.class;

			this.originalHtml = this.$el.html();
			this.newHtml = this.originalHtml;

			this.boxType = this.detectBoxType();
			//this.nesting();
			this.config = this.configCke();
			if (!this.isRogue) {
				//this.parentElement.storeValue();
			}
		},


		/*---------------------------------------------------------------------------------------------
				-------------------------get value
		---------------------------------------------------------------------------------------------*/
		getValue: function () {
			return CKEDITOR.instances[this.id].getData();
		},

		saveUpdate: function () {
			var value = this.getValue();
			var $editBoxContent = this.editBox;
			//are there any calls to lightboxes here?
			if ($editBoxContent.find("a[href*=_lbx]").length > 0) {

				value = this.updateLightbox($editBoxContent);
				//update value!

			}

			var $old = $("<div>");
			$old.append(this.editor.originalHtml);
			var oldValue = $old.find("#" + this.id).html();



			if (oldValue !== value) {
				$old.find("#" + this.id).html(value);
				this.editor.originalHtml = $old.html();
				this.editor.refreshHtml();
			}





			return false;
		},
		/*---------------------------------------------------------------------------------------------
				-------------------------LAUNCH CKE
		---------------------------------------------------------------------------------------------*/

		activate: function () {
			var that = this;

			if (!this.editor.CKELoaded) {
				setTimeout(function () {
					that.activate();
				}, 50);
			}
			else {
				if (!that.isActivated) {
					this.refreshInfo();

					this.$el.find("span.qs-get-current-question").html("{" + LOMLabels.element.editview.QS.nbQuestion + "}");
					this.$el.find("span.qs-get-nb-questions").html("{" + LOMLabels.element.editview.QS.nbTotal + "}");

					this.makeEditable();
					this.initCKE();
					this.isActivated = true;
					this.refreshInfo(); //why twice??

					this.instance.on("instanceReady", function () {
						if (that.parentElement.subtype && that.parentElement.subtype == "html") {
							that.editBox = $("#" + that.ckeId).find("textarea.cke_source");
						}
						else {
							that.editBox = that.$el.next();
						}


						that.editBox.change(function (e) {
							that.keyPress(e);
						});

						that.editBox.on('keyup change paste keypress', function (e) {

							if (that.isRestricted) {
								//prevent space from messing up the details
								if (e.type === "keyup" && e.keyCode === 32) {
									e.preventDefault();
								}
								//prevent chariot return
								if (e.type === "keypress" && e.keyCode === 13) {
									e.preventDefault();
									//save on enter key if it'S a single-line

								}
							} else {
								that.keyPress(e);
							}
						});
						if (!that.editor.locked) {
							that.checkOverflow();
						}
					});
				}
				this.instance.on("instanceReady", function () {
					that.editBox.focusout(function (e) {
						that.focusOut(e);
					});
				});
			}
		},
		deactivate: function () {
			if (this.isActivated) {
				this.makeUneditable();
				this.isActivated = false;
				this.refreshInfo();
				this.storeValue();
				//this.parentElement.storeValue();
				if (!this.isRogue) {
					this.parentElement.$el.removeClass("LOM-editing");
				}
			}
		},


		initCKE: function () {
			if (this.parentElement.subtype == "html") {
				CKEDITOR.replace(this.id, this.config);
			}
			else {
				CKEDITOR.inline(this.id, this.config);
			}
		},

		// configuration for CKE
		detectBoxType: function () {
			if (this.$el.is("span")) {
				return "span";
			} else {
				return "div";
			}
		},
		focusOut: function () {

			//var currentValue
			this.saveUpdate();


		},
		autoFocus: function () {

			//this.instance.focusManager.focus();
			//somehow this doesn'T work


		},
		/*---------------------------------------------------------------------------------------------
				-------------------------CLEANUP AND PREP
		---------------------------------------------------------------------------------------------*/
		// prepares the html code to allow CKE to do its thing
		makeEditable: function () {

			//var that=this;
			var $original = this.$el;

			$original.before("<form onclick='return false;'><textarea class='" + this.class + "' id='" + this.id + "' style='display:inherit;'>" + $original.html() + "</textarea></form>");
			$original.remove();


		},

		// make the html uneditable, back to how it was.
		makeUneditable: function () {
			//define what will soon be deleted
			var $textarea = $("#" + this.id);

			//save whats now in the ID is the textarea
			if (this.parentElement.subtype == "html") {
				this.newHtml = $("#" + this.ckeId).find("textarea.cke_source").val();
			}
			else {
				this.newHtml = $textarea.next().html();
			}

			$("#" + this.ckeId).remove();

			//create the new object
			$textarea.parent().before("<" + this.boxType + " class='" + this.class + "' id='" + this.id + "'>" + this.newHtml + "</" + this.boxType + ">");

			//remove the excess
			$textarea.parent().remove();

		},
		//refresh the connection between the $el and the real deal
		refreshInfo: function () {
			this.instance = CKEDITOR.instances[this.id];
			this.$el = $("#" + this.id);
		},
		storeValue: function () {

			if (this.originalHtml !== this.newHtml && this.newHtml !== null) {

				this.isModified = true;
				this.originalHtml = this.newHtml;
				if (!this.isRogue) {
					this.parentElement.isModified = true;
				}
			} else {
				this.isModified = this.isModified;
			}
			return this.isModified;
		},

		destroy: function (preserve) {

			$("#" + this.id).remove();
			this.parent.removeEditFromList(this);
			if (!this.isRogue && !preserve) {
				this.parentElement.removeEditFromList(this);
			}
			//jsut some cleanup;
			this.parentElement = null;

			this.$el = null;
			this.class = null;
			this.originalHtml = null;
			this.newHtml = null;
			this.config = null;

		},
		updateLightbox: function ($content) {
			var $lbxList = $content.find("a[href*='_lbx']");
			var $lbx;

			for (var i = 0; i < $lbxList.length; i++) {
				$lbx = $lbxList.eq(i);
				if ($($lbx.attr("href")).length > 0) {
					$lbx.addClass("wb-lbx").removeClass("wb-lbx-inited");

					//this.editBox.find("a[href*='_lbx']").addClass("wb-lbx-inited")
				}
			}

			return $content.html();
		},

		/*---------------------------------------------------------------------------------------------
				-------------------------CONFIGURATION FOR CKE
		---------------------------------------------------------------------------------------------*/
		configCke: function () {

			var editorConfig = {
				toolbar: []
				/*,
								language: lang*/

			};
			if (this.parentElement && this.parentElement.subtype == "html") {
				/*editorConfig.toolbar.push({
					name: 'HTML',
					items: ['Source']
				});*/
				editorConfig.startupMode = 'source';
				//editorConfig.tabSpaces = 4;

				/*editorConfig.toolbar.push({
					name: 'cutpaste',
					groups: ['selection'],
					items: ['Copy', 'Cut', 'Paste', 'SelectAll', '-', 'Undo', 'Redo'],
				});
				editorConfig.toolbar.push({
					name: 'searchreplace',
					groups: ['find'],
					items: [ 'Find', 'Replace']
				});*/

				editorConfig.toolbar.push({
					name: 'SelectAll',
					groups: ['selection'],
					items: ['SelectAll'],
				});
			}
			else {
				if (!this.isRogue) {
					if (this.parentElement && this.parentElement.type === "custom") {

						//if the user is in export mode
						editorConfig.toolbar.push({
							name: 'Expert',
							items: ['Sourcedialog']
						});
						//return editorConfig;
					}
				}
				if (this.$el.parent().is("h2, h3, h4, summary, label")) {
					this.isRestricted = true;
					//RESTRICTED
					editorConfig.enterMode = CKEDITOR.ENTER_BR;
					editorConfig.allowedContent = true;
					editorConfig.keystrokes = [
						[13 /* Enter */, 'john'],
						[CKEDITOR.SHIFT + 13 /* Shift + Enter */, 'blur']
					];
				} else {
					//FULL TEXT
					editorConfig.toolbar.push({
						name: 'cutpaste',
						groups: ['selection'],
						items: ['Copy', 'Cut', 'Paste', 'PasteText', 'PasteFromWord', 'SelectAll', '-', 'Undo', 'Redo']
					});
					editorConfig.toolbar.push({
						name: 'basicstyles',
						items: ['Bold', 'Italic', 'Underline', 'Subscript', 'Superscript', 'CopyFormatting']
					});
					editorConfig.toolbar.push({
						name: 'paragraph',
						items: ['NumberedList', 'BulletedList' /*, '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock' */]
					});
					editorConfig.toolbar.push({
						name: 'table',
						groups: ['table', 'tablerow', 'tablecolumn', 'tablecellmergesplit'],
						items: ['Table', 'tablerowinsertbefore', 'tablerowinsertafter', 'tablerowdelete', 'tablecolumninsertbefore', 'tablecolumninsertafter', 'tablecolumndelete', 'tablecellsmerge', 'tableproperties']
					});
					editorConfig.toolbar.push({
						name: 'SpecialChar',
						items: ['SpecialChar']
					});
					editorConfig.toolbar.push({
						name: 'searchreplace',
						groups: ['find'],
						items: ['Find', 'Replace']
					});
					editorConfig.toolbar.push({
						name: 'spellcheck',
						groups: ['spellchecker'],
						items: ['Language', 'Scayt']
					});
					/*editorConfig.toolbar.push({
						name: 'links',
						items: ['Link', 'Unlink', 'Anchor']
					});*/
					editorConfig.toolbar.push("/");
					editorConfig.toolbar.push({
						name: 'document',
						items: ['Format']
					});

					var items;
					if (Object.keys(this.editor.master.resourcesManager.exts).length > 0) {
						items = ['ext-links', 'linktopage']
					}
					else {
						items = ['Link', 'linktopage']
					}
					if (Object.keys(this.editor.master.resourcesManager.abbrs).length > 0) {
						items.push('Abbr');
					}
					if (this.editor.master.resourcesManager.getGlossaryArray().length > 0) {
						items.push('Glossary');
					}
					editorConfig.toolbar.push({
						name: 'resources',
						items: items,
					});

					if (this.parentElement.type === "multiplechoice" && this.$el.parent().hasClass("qs-text")) {
						editorConfig.toolbar.push({
							name: 'QS',
							items: ['nb-question-button', 'nb-total-button']
						});
					}
				}

				//if detected a form
				/*
				if(this.$el.closest("form").length>0){
					editorConfig.toolbar.push({ name: 'forms', items: [ 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button' ] });
				}
				*/
				editorConfig.extraPlugins = "abbr, glossary, ext-links, table, tableresize, tableselection, tabletools, colordialog, pastefromexcel, tabletoolstoolbar, linktopage, QS";
				if (Object.keys(this.editor.master.resourcesManager.exts).length > 0) {
					editorConfig.removePlugins = "link, uploadfile";
				}
				else {
					editorConfig.removePlugins = "uploadfile";
				}
				editorConfig.extraAllowedContent = "a(*); span(*)";
			}

			return editorConfig;

		},
		/*---------------------------------------------------------------------------------------------
				-------------------------
		---------------------------------------------------------------------------------------------*/
		keyPress: function () {
			this.checkOverflow();
		},
		checkOverflow: function () {
			var maxchar = 3000;
			var maxParagraphs = 7;

			var totalText = this.editBox.html().length;
			var warningFlag = false;


			if (totalText > maxchar) {
				warningFlag = true;
				//alert("Wo! That's enough text now, champ!\n\n(review msg)");
			}
			if (this.editBox.children("p").length > maxParagraphs) {

				warningFlag = true;
				//alert("Slow down on those paragraphs, cowboy!\n\n(review msg)");
			}
			if (warningFlag) {
				this.$el.parent().addClass("LOM-overflow-warning");
			} else {
				this.$el.parent().removeClass("LOM-overflow-warning");

			}
		},
		/*
		 * 
		 */
		doSomethingElse: function () {

		}
	});
});
