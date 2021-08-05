define([
	'jquery',
	'labels',

	"settings-general",
	'settings-core',
	'utils',
	'modules/BaseModule',
	'./../../../courses/_default/core/settings/settings-presets'

], function ($, labels, SetGen, CoreSettings, Utils, BaseModule, Presets) {
	'use strict';

	return BaseModule.extend({
		initialize: function (options) {

			this.parent = options.parent; //masterStructure.editor

			this.name = options.name;
			this.labels = options.labels;
			// different values
			this.valueCore = options.defaultValue;
			this.valuePreset = this.getPresetsValue(Utils.presets);
			this.valueGeneral = this.getGeneral();

			this.value = this.computeValue(); //current computed value
			this.defaultValue = this.value; //first time this was computed since last save


			this.$template = null;
			this.isConnected = false;
			this.getTemplate();

			//this.trackValue("seriesTitle_en");

		},

		/*---------------------------------------------------------------------------------------------
				-------------------------HOUSE KEEPING
		---------------------------------------------------------------------------------------------*/
		pageLoaded: function () {

			//DO WHATEVER SHOULD BE DONE ONCE A PAGE IS LOADED... FOR NOW? NOTHING!

		},

		trackValue: function (name) {
			if (this.name === name) {
				console.log("---- Tracking " + name);
				console.log("core: ");
				console.log(this.valueCore);
				console.log("preset: ");
				console.log(this.valuePreset);
				console.log("general: ")
				console.log(this.valueGeneral)
				console.log("computed");
				console.log(this.value);
			}

		},

		/*---------------------------------------------------------------------------------------------
				-------------------------LOGICAL VALUES
		---------------------------------------------------------------------------------------------*/

		getGeneral: function () {
			if (this.name === "presets") {
				return Utils.presetsValue;
			}
			//(typeof SetGen[this.name] === "undefined") ? null : SetGen[this.name];
			if (typeof SetGen[this.name] === "undefined") {
				return null
			} else {
				return SetGen[this.name];
			}
		},

		computeValue: function (removeGeneral) {

			//start with the core
			var final = this.valueCore;

			//add the preset
			if (this.valuePreset !== null) {
				final = this.valuePreset;
			}
			//add the general setting
			if (this.valueGeneral !== null && removeGeneral !== true) {
				final = this.valueGeneral;
			}
			return final;
		},

		checkForm: function () {
			var exception;
			var value;
			var $el = $("[name=LOM-" + this.name + "]");
			if ($el.length > 0 || this.name === "presets") {
				//get the value from the form
				value = this.getValue();


			} else {
				//if this is an exception like presets or if it was already 

				value = this.valueGeneral
			}
			return value;
		},
		checkWrite: function (value) {
			if (value !== null) {
				//this's preset value

				this.valuePreset = this.getPresetsValue(this.parent.settingsName["presets"].value);

				var preGeneralValue = this.computeValue(true);

				if (preGeneralValue !== value) {
					return true;
				}


			} else {
				return false;
			}
		},

		/*---------------------------------------------------------------------------------------------
				-------------------------DOM
		---------------------------------------------------------------------------------------------*/
		getTemplate: function () {
			var $template = this.parent.$template.find("[name='LOM-" + this.name + "']").eq(0);
			if ($template.length > 0) {

				this.$template = $template;
				this.isConnected = true;
				this.connectTemplate();
			} else {
				this.isConnected = false;
			}


		},
		connectTemplate: function () {

			var type = this.$template.attr("type");
			this.type = type;
			this.$template.siblings("label").text(this.labels.name);
			this.$template.siblings(".LOM-desc").text(this.labels.description);
			this.setValue();


		},
		connectDom: function () {
			this.$el = $(CoreSettings.contentContainer).find("[name='LOM-" + this.name + "']").eq(0);
			if (this.name === "presets") {

				this.managePresets();
			}
		},
		/*---------------------------------------------------------------------------------------------
				-------------------------DOM VALUES
		---------------------------------------------------------------------------------------------*/
		setValue: function () {
			switch (this.type) {
				case "text":
					this.setValueText();
					break;
				case "checkbox":
					this.setValueCheckbox();
					break;
			}
		},



		getValue: function () {
			var value;
			var type = (this.name === "showToolbox") ? "toolbox" : this.type;
			if (this.name === "presets") {
				type = "presets"
			}

			switch (type) {
				case "text":
					value = this.getValueText();
					break;
				case "checkbox":
					value = this.getValueCheckbox();
					break;
				case "toolbox":
					value = this.getValueToolbox();
					break;
				case "presets":
					this.value = this.getPresets();
			}

			return value;
		},

		setValueText: function () {
			this.$template.attr("value", this.value);
		},
		setValueCheckbox: function () {

			this.$template.attr("checked", this.value);

		},
		updateValue: function (presets) {
			this.valuePreset = this.getPresetsValue(presets);
			this.value = this.computeValue(true);
			this.assignValueCheckBox();
		},
		assignValueCheckBox: function () {
			this.$el.prop('checked', this.value);

		},

		getValueText: function () {

			this.value = this.$el.val();
			return this.$el.val();
		},
		getValueCheckbox: function () {

			this.value = this.$el.prop("checked");

			return this.$el.prop("checked");
		},
		getValueToolbox: function () {
			//BLord 2020-08-13: Changed this as the toolbox needs to be always present because the favourites are always on
			//var value = ($("#LOM-showGlossary").is(":checked") || $("#LOM-showResources").is(":checked")) ? true : false;
			var value = true

			this.value = value;
			return value;
		},



		////////////////////////////////////////////////////////////////////////
		//update the course Live	
		updateDomLive: function () {

			switch (this.name) {
				case "courseTitle_" + Utils.lang:
					$("#wb-sttl>a>span").eq(0).text(this.value);
					break;
				case "courseSubtitle_" + Utils.lang:
					if (this.value !== "") {
						if ($("span.subtitle").length === 0) {
							$("#wb-sttl>a").append("<span class='subtitle'>" + this.value + "</span>");
						} else {
							$("#wb-sttl>a>span.subtitle").eq(0).text(this.value);
						}
					} else {
						$("#wb-sttl>a>span.subtitle").remove();
					}
					break;

				case "seriesTitle_" + Utils.lang:
					$("h2.series-title>a").eq(0).text(this.value);
					//update core settings
					CoreSettings["seriesTitle_" + Utils.lang] = this.value;
					break;
				case "showHome":
					this.toggleButton("home");
					break;
				case "showSitemap":
					this.toggleButton("sitemap");
					break;
				case "showExit":
					this.toggleButton("quit");
					break;
				case "showHelp":
					this.toggleButton("help");
					break;
				case "showGlossary":
					this.toggleButton("glossary");
					break;
				case "showResources":
					this.toggleButton("resources");
					break;
				case "showLangSwitch":
					this.toggleButton("lang");
					break;
				//case "showGlossary":
				//case "showResources":
				case "showToolbox":
					this.toggleButton("toolbox");
					break;


			}

		},
		toggleButton: function (className) {

			var $el = $("#wb-lng>ul li>a." + className).eq(0);
			if (this.value) {
				$el.removeClass("hide").parent().fadeIn();
			} else {

				$el.parent().fadeOut();
			}
		},

		/*---------------------------------------------------------------------------------------------
		-------------------------PRESETS
		---------------------------------------------------------------------------------------------*/
		managePresets: function () {
			var presets = this.value;
			var presetID, $preset;

			for (var key in presets) {

				presetID = "LOM-presets-" + key + "-selectbox"; //LOM-presets-general-selectbox
				$preset = $("#" + presetID);
				$preset.val(presets[key]);
			}

		},

		getPresetsValue: function (prCustom) {
			var presetValue;
			var newValue;
			var valueFlag;
			var prDefinition = Presets;
			var prGroupDef, prSet, prSetting
			//Presets
			//loop through current presets values and find matching overrides.

			for (var prCategory in prCustom) {
				prGroupDef = prDefinition[prCategory];

				if (typeof prGroupDef[prCustom[prCategory]] !== "undefined") {
					//get the value for this setting inside this preset
					presetValue = prGroupDef[prCustom[prCategory]][this.name];
					if (typeof presetValue !== "undefined") {
						valueFlag = true;
						newValue = presetValue;
					}
				}


			}

			if (valueFlag) {
				return newValue;
			} else {
				return null;
			}


		},

		getPresets: function () {

			//var setting = this.settingsName["presets"];
			//find presets
			var list = {};
			var $selectBox;
			var value;
			var flag;
			for (var key in Presets) {


				$selectBox = $("#LOM-presets-" + key + "-selectbox");
				value = $selectBox.val();
				if (value !== "") {
					list[key] = value;
					flag = true;
				}

			}
			//
			if (flag === true) {
				return list;
			} else {
				return {};
			}

		}




	});
});