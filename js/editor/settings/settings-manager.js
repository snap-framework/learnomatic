define([
	'jquery',
	'labels',
	'settings-core',
	"settings-general",
	'./../../../courses/_default/core/settings/settings-core',
	'utils',
	'modules/BaseModule',
	'./../settings/settingObj',

	'./../../../courses/_default/core/settings/settings-presets',
	'./../settings/labelsPresets'

], function ($, labels, CoreSettings, GeneralSettings, OriginalSettings, Utils, BaseModule, SettingObj, Presets, LabelsPresets) {
	'use strict';

	return BaseModule.extend({
		initialize: function (options) {
			var that = this;
			that = that;
			this.parent = options.parent; //masterStructure.editor
			this.editor = this.parent;
			this.master = this.parent.parent; //masterStructure

			this.settings = [];
			this.settingsName = [];

			this.$template = null;
			this.labels = options.labels;

			this.initTemplate();


		},
		/*---------------------------------------------------------------------------------------------
				-------------------------DOM INIT
		---------------------------------------------------------------------------------------------*/
		setDom: function () {
			var that = this;
			$(CoreSettings.contentContainer).html(this.$template.html()).hide().fadeIn();
			$(CoreSettings.contentContainer).find(".LOM-save-settings").click(function () {
				that.saveSettings();
				that.master.editor.ui.addVisualFeedback(this);
			});


			this.managePresets();
			this.connectDom();
		},
		connectDom: function () {

			for (var i = 0; i < this.settings.length; i++) {
				this.settings[i].connectDom();
			}
		},
		/*---------------------------------------------------------------------------------------------
				-------------------------INIT
		---------------------------------------------------------------------------------------------*/
		initTemplate: function () {
			var that = this;
			$.ajax({
				url: "../../templates/settings-ui.html",
				type: 'GET',
				async: true,
				cache: false,
				timeout: 30000,
				error: function () {
					return true;
				},
				success: function (tpl) {
					that.$template = $(tpl);

					//Translating the interface
					that.$template.find("h1").html(that.labels.settingsTitle)
					that.$template.find("h2#main").html(that.labels.mainSettingsTitle)
					that.$template.find("h2#toolbar").html(that.labels.toolbarTitle)
					that.$template.find("h3#lang").html(that.labels.langTitle)
					that.$template.find("h3#mainBtns").html(that.labels.mainBtnsTitle)
					that.$template.find("h3#toolbox").html(that.labels.toolboxTitle)
					that.$template.find(".LOM-save-settings").html(that.labels.save)

					that.initSettings();
				}
			});
		},
		initSettings: function () {
			var that = this;
			var setting;
			var settingValue;

			//need to split the original settings from the settings post-preset

			for (var key in OriginalSettings) {
				settingValue = (key === "presets") ? Utils.presetsValue : OriginalSettings[key];
				if (1 === 1) { //just in case I need to filter out unwanted properties
					setting = new SettingObj({
						parent: that,
						name: key,
						labels: this.labels[key],
						defaultValue: settingValue
					});
					this.settings[this.settings.length] = setting;
					this.settingsName[key] = setting;
				}

			}


		},
		fileWrite: function (content) {
			$.post('../../editor.php', {
				action: "page",
				filename: "courses/" + this.editor.courseFolder + "/settings/settings-general.js",
				content: content
			}, function (data) {
				//$(CoreSettings.contentContainer).html(bkp);
				//parse the jSON
				//console.log(data);


			}).fail(function () {
				alert("Posting failed while writing settings file.");
			});
		},
		saveSettings: function () {
			var saveList = {};
			var setting, final, value;


			for (var i = 0; i < this.settings.length; i++) {

				setting = this.settings[i];
				value = setting.checkForm();
				if (setting.checkWrite(value)) {
					saveList[setting.name] = setting.value;

				}
				setting.updateDomLive();


			}
			final = "'use strict';\ndefine(" + JSON.stringify(saveList, null, 2) + ");";
			this.fileWrite(final);
		},

		/*---------------------------------------------------------------------------------------------
		-------------------------PRESETS
		---------------------------------------------------------------------------------------------*/
		managePresets: function () {
			var that = this;
			//#LOM-settings-presets-holder
			this.$presets = $("#LOM-settings-presets-holder");
			var $preset, presetID, title;
			var def = (Utils.lang === "en") ? "Default" : "Valeur par défaut";

			for (var key in Presets) {

				title = (Utils.lang === "en") ? LabelsPresets[key].title_en : LabelsPresets[key].title_fr;
				presetID = "LOM-presets-" + key;
				this.$presets.append("<div class='row' id='" + presetID + "'><label class='col-md-3'>" + title + "</label></div>");
				$preset = $("#" + presetID);
				$preset.append("<select  class='col-md-3' data-presetname='" + key + "' id='" + presetID + "-selectbox'><option value=''>Default</option></select>");
				$preset.children("select#" + presetID + "-selectbox").change(function () {

					that.changePresets(this);
				});
				for (var subkey in Presets[key]) {

					title = (Utils.lang === "en") ? LabelsPresets[key][subkey].title_en : LabelsPresets[key][subkey].title_fr;
					$preset.children("select").append("<option value='" + subkey + "'>" + title + "</option");

				}
			}

		},

		changePresets: function (obj) {

			var presetName = $(obj).attr("data-presetname")
			var value = $(obj).val()
			var currentSetting;
			Utils.presets[presetName] = (value === "") ? {} : value;
			for (var key in OriginalSettings) {

				currentSetting = this.settingsName[key];
				if (currentSetting.type === "checkbox") {
					currentSetting.updateValue(Utils.presets);
				}
			}

		}


	});
});