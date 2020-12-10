define([
	'jquery',
	'labels',
	'settings-core',
	'utils',
	'modules/BaseModule',
	'modules/objSub/objSub-utils',
	'modules/objSub/objSub',
	'./../structure/globalView',
	'./../structure/localView'

], function ($, labels, CoreSettings, Utils, BaseModule, ObjSubUtils, ObjSub, Global, Local) {
	'use strict';

	return BaseModule.extend({
		initialize: function (options) {

			this.parent = options.parent; //masterStructure.editor
			this.editor = this.parent;
			this.master = this.parent.parent; //masterStructure

			this.labels = options.labels;

			this.global = new Global({
				parent: this
			});

			this.local = new Local({
				parent: this,
				labels: this.labels
			});

			this.appendSupermenu();


		},

		/*---------------------------------------------------------------------------------------------
				-------------------------HOUSE KEEPING
		---------------------------------------------------------------------------------------------*/


		initLocalView: function () {
			this.local.initView();


		},
		initGlobalView: function () {

			this.global.initView();
		},

		////////////////////////////////////////////////////////////////////////
		//Close structure editor module
		exitStructureEditor: function () {
			//Clean DOM from structure editor
			$('#LOM-editable-structure-holder, #LOM-editable-items-holder').remove();

			if (this.local.reloadNecessary) {
				location.href = location.href.substr(0, location.href.indexOf("?"));
			}
			else {
				$(".backnext").show();
				$(".menu.supermenu").show();
			}
		},

		moveSub: function (fromArray, toString) {
			ObjSubUtils.findSub(fromArray).move(toString);
		},
		deleteSub: function (obj) {
			var sPosition = $(obj).parent().parent().attr("data-id");
			var sub = ObjSubUtils.findSub(Utils.getArrayFromString(sPosition));
			this.initArchive();
			this.findMoveRepository(sub, false);
		},

		addPage: function (sPosition, title, altTitle, isPage, keywords) {
			//
			var href = (isPage) ? "javascript:;" : "#";
			$("[data-id=nav1]").eq(0).append("<li><a href='" + href + "' data-target='m97' tabindex='-1' role='menuitem' data-keywords='" + keywords + "'>" + title + "</a></li>");
			this.master.levels[0].subs[this.master.levels[0].subs.length] = new ObjSub({
				depth: 0,
				parentLevel: this.master.levels[0],
				el: $("a[data-target=m97").eq(0),
				router: this.master.router,
				master: this.master,
				wetMenu: cspsWetMenu
			});

			var newSub = ObjSubUtils.findSub([97]);

			newSub.altTitle = altTitle;
			newSub.move(sPosition);
			newSub.keywords = keywords;
			//dont know why;
			newSub.viewed = true;
			return newSub;
		},
		initArchive: function () {
			this.archiveSub = ObjSubUtils.findSub([98]);
			if (!this.archiveSub) {
				$("[data-id=nav1]").eq(0).append("<li><a href='#' data-target='m98' tabindex='-1' role='menuitem'>" + ((Utils.lang === "en") ? "Repository" : "Dépôt") + "</a></li>");
				this.master.levels[0].subs[this.master.levels[0].subs.length] = new ObjSub({
					depth: 0,
					parentLevel: this.master.levels[0],
					el: $("a[data-target=m98").eq(0),
					router: this.master.router,
					master: this.master,
					wetMenu: cspsWetMenu
				});
				var newSub = ObjSubUtils.findSub([98]);
				newSub.altTitle = ((Utils.lang === "en") ? "Dépôt" : "Repository");
				newSub.viewed = true;
				this.archiveSub = newSub;
			} else {
				return true;
			}
		},
		findMoveRepository: function (sub, conversion) {
			var that = this;


			$.post('../../editor.php', {
				action: "findrepository",
				folder: "courses/" + this.editor.courseFolder + "/content/"
			}, function (data) {
				sub.move(data);

				//generate 
				that.local.generateList(that.local.currentParent);

				if (conversion) {
					that.editor.startConversion(data);
				}

			}).fail(function () {
				alert("Posting failed while moving repository.");
			});
		},


		updateSuperMenu: function (en_content, fr_content) {
			var file_en = "courses/" + this.editor.courseFolder + "/content/supermenu/supermenu_en.html";
			var file_fr = "courses/" + this.editor.courseFolder + "/content/supermenu/supermenu_fr.html";

			$.post('../../editor.php', {
				action: "page",
				filename: file_en,
				content: en_content
			}, function () { }).fail(function () {
				alert("Posting failed while updating supermenu in main language.");
			});
			$.post('../../editor.php', {
				action: "page",
				filename: file_fr,
				content: fr_content
			}, function () { }).fail(function () {
				alert("Posting failed while updating supermenu in main language.");
			});
		},

		appendSupermenu: function () {
			this.master.generateSupermenu = function () {

				var notice = "";
				var topicsMenu_en = "Topics Menu";
				var topicsMenu_fr = "Mon menu";
				notice += "\n<!-- Web Experience Toolkit (WET) / Boîte à outils de l'expérience Web (BOEW)";
				notice += "\nwet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html -->";
				notice += "\n<!-- DataAjaxFragmentStart -->"

				var heading = "";
				heading += "\n<div class=\"pnl-strt container visible-md visible-lg nvbar\">";
				heading += "\n\t<h2 id=\"supermenu\">" + topicsMenu_en + "</h2>";
				heading += "\n\t<div class=\"row\">";
				heading += "\n\t\t<ul class=\"list-inline menu supermenu\" role=\"menubar\" aria-labelledby=\"supermenu\">";


				heading += "</ul>";
				heading += "\n\t\t<div class=\"backnext\" style=\"float: right;\"><a href=\"#\" class=\"back\"></a><span></span><a href=\"#\" class=\"next\"></a></div>";
				heading += "\n\t</div>";
				heading += "\n</div>";

				var ending = "";
				ending += "\n<!-- DataAjaxFragmentEnd -->	";

				var $html = $("<div></div>");
				//var $finalhtml_en;
				//var $finalhtml_fr;

				$html.append("<section lang='en'></section><section lang='fr'></section>");
				var $en = $html.children("[lang='en']");
				var $fr = $html.children("[lang='fr']");

				$en.append(notice);
				$fr.append(notice);

				$en.append(heading);
				$fr.append(heading.replace(topicsMenu_en, topicsMenu_fr));

				for (var i = 0; i < this.levels.length; i++) {
					$html = this.levels[i].generateSupermenu($html);
				}
				$en.append(ending);
				$fr.append(ending);

				var en_content = $en.html();//</li></ul></li>
				var fr_content = $fr.html();

				en_content = en_content.replace(/<\/ul><\/li>/g, "\n\t\t\t\t</ul>\n\t\t\t</li>\n");
				fr_content = fr_content.replace(/<\/ul><\/li>/g, "\n\t\t\t\t</ul>\n\t\t\t</li>\n");

				this.editor.structure.updateSuperMenu(en_content, fr_content);
			};

			this.master.moveFiles = function () {
				var currentSub;
				var filename = this.actionStack;
				//console.error("action stack - app.js call to PHP");
				this.editor.moveFile(filename);
			};
		}






	});
});
