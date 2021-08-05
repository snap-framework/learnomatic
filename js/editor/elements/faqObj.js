define([
	'jquery',
	'settings-core',
	'./../pageEdit/elementClass',
	'utils'
], function ($, CoreSettings, ElementClass, Utils) {
	'use strict';
	return ElementClass.extend({
		initialize: function (options) {
			this.options = options;
			this.autoAddButton = true;
		},
		changePermissions: function () {
			this.permissions.editButtons.config = true;
			this.permissions.subElements.button = true;
		},

		setLabels: function () {
			this.typeName = this.labels.type.faq;
			this.setLabelsDone = true;
			return false;
		},


		configSettings: function () {
			var config = this.defaultConfigSettings();
			config.attributes = {
				"data-filter-view": [
					"visible",
					"hidden",
					"notext"
				]

			};

			return config;

		},
		initDefaultDomValues: function ($template) {
			$template.attr("data-filter-view", "Hidden");
			$template.find(".LOM-element[data-lom-element=\"button\"] .LOM-btn-title").html(((Utils.lang === "en") ? "See Everything" : "Voir tout"));
			return $template;
		},

		getCustomHolderSelector: function () {
			return ".LOM-faq-questions.LOM-holder";
		},
		addElementBtnTxt: function () {
			return (Utils.lang === "en") ? "Add Filter" : "Ajouter un filtre";
		},
		customAfterLoad: function () {
			this.generatePageList();
			return false;
		},
		//-------------------------

		generatePageList: function () {
			var $new = $("<div>");
			var pages = this.editor.parent.flatList;
			var modules = this.editor.parent.subs;
			var menuKeywords;
			$new.append("<h2>" + ((Utils.lang === "en") ? "Topics" : "Sujets") + "</h2>");
			var btnId;
			var btnScript;
			var favScript;
			for (var i = 0; i < modules.length; i++) {
				//	<section>

				$new.append("<section></section>");
				$new.children("section").eq(i).append("<h3>" + ((Utils.lang === "en") ? "Topic" : "Sujet") + " " + (i + 1) + " " + modules[i].title + "</h3>");
				$new.children("section").eq(i).append("<ul class='list-unstyled'></ul>")
				for (var j = 0; j < pages.length; j++) {
					if (pages[j].aPosition[0] === modules[i].aPosition[0]) {
						btnId = this.id + "_" + pages[j].sPosition
						menuKeywords = this.getKeywords(pages[j]);
						btnScript = "<button id=\"" + btnId + "\" onclick='fNav(\"" + pages[j].sPosition + "\")' class='ico-QS-right snap-sm LOM-faq-link'>Page " + (pages[j].flatID + 1) + " : <span class='LOM-faq-desc'>" + pages[j].title + "</span></button>";
						favScript = "<a data-fav=\"#" + btnId + "\" class='favbtntest'>toggle favourite</a>";
						$new.children("section").eq(i).children("ul").append("<li>" + btnScript + " <span class='LOM-faq-keywords wb-inv'>" + menuKeywords + "</span>" + favScript + "</li>");
					}

				}

			}

			this.$el.children(".wb-filter").html($new.html());

			var $bkp = this.getBkp();
			$bkp.find("#" + this.id).children(".wb-filter").html($new.html());
			this.saveBkp($bkp);
		},

		//fetch the keywords from the menu
		getKeywords: function (sub) {
			var menuKeywords = (typeof sub.$el.attr("data-keywords") === "undefined") ? " " + " " + sub.title : sub.$el.attr("data-keywords") + " " + sub.title;
			//lets put a loop up the sub's parents to get all the keywords
			if (sub.depth > 0) {
				//get the parent
				menuKeywords += this.getKeywords(sub.parent);
			}

			return menuKeywords;

		},
		/*---------------------------------------------------------------------------------------------
		-------------------------FILTERS
		---------------------------------------------------------------------------------------------*/
		updateButtonToFilter: function (obj) {

			obj.changePermissions = function () {
				this.permissions.editButtons.classPicker = false;
				this.permissions.editButtons.config = true;
			};


			obj.changeDefaultLbxSettings = function (params) {
				params.title = (Utils.lang === "en") ? "Filter Configuration" : "Configuration du filtre"
				return params;
			};

			obj.changeDefaultConfigSettings = function (params) {
				params.selector = "button.LOM-btn";
				params.files = [
					"../../templates/LOM-Elements/config_iconpack_" + Utils.lang + ".html",
					"../../templates/LOM-Elements/config_filter_" + Utils.lang + ".html"
				];
				params.attributes = {
					"data-faq-filter": ""
				}
				return params;
			};

			obj.initDefaultDomValues = function ($template) {
				var script = "$('.wb-fltr-inpt').val($(this).attr('data-faq-filter'));var e = jQuery.Event('keyup');$('.wb-fltr-inpt').trigger(e);return false;";
				$template.find("button").attr("onclick", script);
				$template.find("button").addClass("ico-LOM-faq");

				return $template;
			}

		},
		doSomething: function () {


		}
	});
});