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
			var that = this;
			that = that;
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

		addPage: function (sPosition, title, altTitle, isPage) {
            //
			var href = (isPage) ? "javascript:;" : "#";
			$("[data-id=nav1]").eq(0).append("<li><a href='" + href + "' data-target='m97' tabindex='-1' role='menuitem'>" + title + "</a></li>");
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
			//dont know why;
			newSub.viewed = true;
			return newSub;
		},
		initArchive: function () {
			this.archiveSub = ObjSubUtils.findSub([98]);
			if (!this.archiveSub) {
				$("[data-id=nav1]").eq(0).append("<li><a href='#' data-target='m98' tabindex='-1' role='menuitem'>Repository</a></li>");
				this.master.levels[0].subs[this.master.levels[0].subs.length] = new ObjSub({
					depth: 0,
					parentLevel: this.master.levels[0],
					el: $("a[data-target=m98").eq(0),
					router: this.master.router,
					master: this.master,
					wetMenu: cspsWetMenu
				});
				var newSub = ObjSubUtils.findSub([98]);
				newSub.altTitle = "Dépôt";
				newSub.viewed = true;
				this.archiveSub = newSub;
			} else {
				return true;
			}
		},
		findMoveRepository: function (sub, conversion) {
			var that = this;
			var sub = sub;
            var repositoryPos;

			$.post('../../editor.php', {
				action: "findrepository",
				folder: "courses/" + this.editor.courseFolder + "/content/"
			}, function (data) {
				//move to repository
                repositoryPos = data.toString();
                
				sub.move(data);

				//generate 
				that.local.generateList(that.local.currentParent);
                
                if(conversion){
                    that.editor.startConversion(repositoryPos);
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
			}, function () {}).fail(function () {
				alert("Posting failed while updating supermenu in main language.");
			});
			$.post('../../editor.php', {
				action: "page",
				filename: file_fr,
				content: fr_content
			}, function () {}).fail(function () {
				alert("Posting failed while updating supermenu in main language.");
			});
		},


	});
});
