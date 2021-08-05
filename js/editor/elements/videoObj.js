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
			this.courseFolder = "courses/" + this.editor.courseFolder;
			this.folder = "content/medias/videos/";

		},
		changePermissions: function () {
			this.permissions.editButtons.add = false;
			this.permissions.editButtons.config = true;
			this.permissions.editButtons.classPicker = true;
			this.permissions.subElements.text = false;
			this.permissions.subElements.video = false;


		},

		setLabels: function () {
			this.typeName = this.labels.type.video;
			this.setLabelsDone = true;
			return false;
		},

		initDefaultDomValues: function ($template) {
			$template.find("#inline-captions summary .LOM-editable").html(this.labels.default.transcript)

			return $template;
		},


		initDom: function () {
			this.initWb();
		},

		initWb: function () {
			initWbAdd(".wb-mltmd");

		},
		/*---------------------------------------------------------------------------------------------
		-------------------------CONFIGURATION
		---------------------------------------------------------------------------------------------*/

		changeDefaultLbxSettings: function (params) {
			params.title = (Utils.lang === "en") ? "Video Configuration" : "Configuration de la vidéo";
			return params;
		},


		configSettings: function () {
			var config = this.defaultConfigSettings();
			config.attributes = {
				"title": ""

			};

			config.$paramTarget = this.$el.find("video");
			return config;

		},


		loadConfigCustom: function ($lbx, params) {
			var that = this;
			var $bkp = this.getBkp();
			var $this = this.getThisBkp($bkp);
			//((Utils.lang === "en") ? "Available Video Files" : "Fichiers vidéo disponibles")
			$lbx.append("<section id='LOM-videosettings' class='row'></section>");
			var linkValue = $this.find("source").attr("src");
			var typeValue = $this.find("source").attr("type");
			var ccValue = $this.find("track").attr("src");


			$lbx.children("#LOM-videosettings").load("../../templates/LOM-Elements/config_video_" + Utils.lang + ".html", function () {
				//console.log();
				that.updateLinkType(linkValue, $lbx);

				//VIDEO LINK
				$("#LOM-video-src-link").val(linkValue).change(function () {

					that.updateLinkType($(this).val(), $lbx);
				});
				//VIDEO TYPE
				$("#LOM-video-type").val(typeValue);

				//video CC
				$("#LOM-cc-src-link").val(ccValue);
			})






		},

		updateLinkType: function (linkValue, $lbx) {
			//get the current type from the dom

			var $bkp = this.getBkp();
			var $this = this.getThisBkp($bkp);
			var currentType = $this.find("source").attr("type");
			var $cc = $lbx.find("#LOM-cc-src-link");
			var $type = $lbx.find("#LOM-video-type");
			//does it contain youtube?
			if (linkValue.indexOf("youtu") >= 0) {
				//this should be a youtube link

				if (currentType.toLowerCase() !== "video/youtube") {

					//destroy the caption, lock it
					$cc.val("");
					$type.val("video/youtube");

				}
				$cc.prop("disabled", true); // now enabled.

			} else {
				//other, probably kaltura

				//is it changed?
				if (currentType.toLowerCase() !== "video/mp4") {
					$type.val("video/mp4");

				}

				$cc.prop("disabled", false); // now enabled.
			}
		},

		//https://www.youtube.com/watch?v=XVFRnepLO4Q
		//<source type="video/mp4" src="https://video.csps-efpc.gc.ca/p/101/sp/10100/serveFlavor/entryId/0_rm6ughwl/v/2/flavorId/0_weoaxq26/name/a.mp4" />
		//<track src="https://video.csps-efpc.gc.ca/api_v3/index.php/service/caption_captionAsset/action/serve/captionAssetId/0_l8ydvmd6/ks/Y2JjYzNkYmZlMDY4MzY0ZTE1MTVjZmNlYjVmZDA5MTQ3MGNhNWE2N3wxMDE7MTAxOzE2MTY3NjQ0MjY7MDsxNjE2Njc4MDI2LjI3ODg7O2Rvd25sb2FkOjBfcm02dWdod2wsZGlzYWJsZWVudGl0bGVtZW50Zm9yZW50cnk6MF9ybTZ1Z2h3bCxzdmlldzowX3JtNnVnaHdsOzs=/.xml" kind="captions" data-type="application/ttml+xml" srclang="en" label="English" />

		submitCustomConfig: function ($lbx, params) {

			//save
			var $bkp = this.getBkp();
			var $this = this.getThisBkp($bkp);
			var title = $bkp.find("#" + this.id).attr("title");


			//save link
			$bkp.find("#" + this.id).find("source").attr("src", $("#LOM-video-src-link").val());
			//save type
			$bkp.find("#" + this.id).find("source").attr("type", $("#LOM-video-type").val());
			//save CC
			$bkp.find("#" + this.id).find("track").attr("src", $("#LOM-cc-src-link").val());
			// save title
			$bkp.find("#" + this.id).find("video").attr("title", title)

			this.updateBkp($bkp);
			this.$el.children("div.wb-mm-ctrls,div.wb-mm-cc,div.display").remove();
			this.$el.prepend("<video>" + $this.children("video").html() + "</video>")
			this.$el.attr("class", "wb-mltmd LOM-element");
			this.$el.attr("title", title);
			this.$el.find("video").attr("title", title);
			this.initWb();
		}

	});
});