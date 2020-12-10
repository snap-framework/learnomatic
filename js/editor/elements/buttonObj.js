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

			if (this.parent.type === "faq") {
				this.parent.updateButtonToFilter(this);
			}
		},
		changePermissions: function () {
			this.permissions.editButtons.add = false;
			this.permissions.editButtons.classPicker = true;
			this.permissions.editButtons.config = true;
			this.permissions.editButtons.review = false;
		},

		setLabels: function () {
			if (this.parent.type == "faq") {
				this.typeName = (Utils.lang === "en") ? "Filter" : "Filtre";
			}
			else {
				this.typeName = this.labels.type.button;
			}
			this.setLabelsDone = true;
			return false;
		},

		initDefaultDomValues: function ($template) {
			$template.find(".LOM-btn-title").html(this.labels.default.button)

			return $template;
		},

		changeDefaultConfigSettings: function (params) {

			params.files = [
				"../../templates/LOM-Elements/config_action_" + Utils.lang + ".html",
				"../../templates/LOM-Elements/config_iconpack_" + Utils.lang + ".html"
			];
			return params;
		},


		loadConfigCustom: function (params) {
			var $bkp = this.getBkp();
			//$("#" + params.lbx.targetId).append("<div id='LOM-img-gallery'></div>");
			var titleText = $bkp.find("#" + this.id).find("button.LOM-btn").text();
			$("#" + params.lbx.targetId).prepend("<label>" + ((Utils.lang === "en") ? "Label" : "Libellé ") + ": <input type='text' class='btn-title-text' value='" + titleText + "'></label>");

		},
		initDom: function () {

			//disable the button in edit view
			this.$el.find("button.LOM-btn").prop('disabled', true);
		},

		/*---------------------------------------------------------------------------------------------
		-------------------------CONFIGURATION
		---------------------------------------------------------------------------------------------*/
		//change save button text
		changeDefaultLbxSettings: function (params) {
			params.title = (Utils.lang === "en") ? "Button Configuration" : "Configuration du bouton"
			return params;
		},
		//initialize the "swap icon" sub config file
		initializeCustomFiles: function (params) {
			var that = this;
			//sorry about that... WB did it.
			var script = "masterStructure.editor.findElement('" + this.id + "').swapIcons(this);";
			var $btns = $("#" + params.lbx.targetId).find(".config-iconpack").find(".snap-md");
			var currentClass;

			var thisSize = this.$el.find("button.LOM-btn").attr("class").match(/\w*snap-\w*/)[0];

			$(".config-size").children("button." + thisSize).addClass("currentSize");
			var $sizeBtns = $(".config-size").children("button");

			$sizeBtns.click(function () {
				that.swapSize(this);
			});

			for (var i = 0; i < $btns.length; i++) {
				currentClass = $btns.eq(i).attr("class");
				currentClass = currentClass.match(/\w*ico-\w*-\w*/)[0];
				if (this.$el.find("button.LOM-btn").hasClass(currentClass)) {
					$btns.eq(i).addClass("currentIcon");
				}
				if (!$btns.eq(i).hasClass(thisSize)) {
					$btns.eq(i).removeClass("snap-sm snap-md snap-lg").addClass(thisSize);
				}

				$btns.eq(i).attr("onclick", script)
			}
		},
		swapIcons: function (obj) {
			var $bkp = this.getBkp();
			//icons to add and remove
			var addIcon = $(obj).attr("class").match(/\w*ico-\w*-\w*/)[0];
			var removeIcon = this.$el.find("button.LOM-btn").attr("class").match(/\w*ico-\w*-\w*/);
			//is there already an icon?
			if (removeIcon === null) {
				//console.log("first time,just add "+addIcon);
			} else {
				//console.log("second time, add "+addIcon+" and remove "+removeIcon[0]);
				this.$el.find("button.LOM-btn").removeClass(removeIcon[0]);
				$bkp.find("#" + this.id).find("button.LOM-btn").removeClass(removeIcon[0]);
			}
			//add the new icon
			this.$el.find("button.LOM-btn").addClass(addIcon);
			$bkp.find("#" + this.id).find("button.LOM-btn").addClass(addIcon);
			//save to file
			this.saveBkp($bkp);
			//adjust current icon marker
			$(".currentIcon").removeClass("currentIcon");
			$(obj).addClass("currentIcon");


		},
		swapSize: function (obj) {
			//what size to move to and remove
			//var newClass=($(obj).hasClass("snap-md"))?"snap-md":"snap-lg";
			var newClass;
			if ($(obj).hasClass("snap-sm")) {
				newClass = "snap-sm";
			} else if ($(obj).hasClass("snap-lg")) {
				newClass = "snap-lg";

			} else {
				newClass = "snap-md";

			}

			var removeClass = ($(obj).hasClass("snap-md")) ? "snap-lg" : "snap-md";
			//get the backup
			var $bkp = this.getBkp();
			//remove and add class on DOM and bkp

			$bkp.find("#" + this.id).find("button.LOM-btn").removeClass("snap-sm").removeClass("snap-md").removeClass("snap-lg").addClass(newClass);
			this.$el.find("button.LOM-btn").removeClass("snap-sm").removeClass("snap-md").removeClass("snap-lg").addClass(newClass);
			//save it
			this.saveBkp($bkp);
			//toggle
			$(".currentSize").removeClass("currentSize");
			$(obj).addClass("currentSize");
			//$(".config-size").children("button").hide();
			//$(".config-size").children("button."+removeClass).show();

			//swap all icons ? 
			$(".config-iconpack").find("button").removeClass("snap-sm").removeClass("snap-md").removeClass("snap-lg").addClass(newClass);

		},
		submitCustomConfig: function (params) {

			var $bkp = this.getBkp();

			var title = $("#" + params.lbx.targetId).find(".btn-title-text").val();
			$bkp.find("#" + this.id).find("button.LOM-btn").children("span.LOM-btn-title").text(title)
			this.$el.find("button.LOM-btn").children("span.LOM-btn-title").text(title);
			this.updateBkp($bkp);

			return params;
		}
	});
});
