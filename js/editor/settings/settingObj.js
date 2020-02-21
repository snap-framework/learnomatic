define([
	'jquery',
	'labels',
	'settings-core',
	'utils',
	'modules/BaseModule'

], function ($, labels, CoreSettings, Utils, BaseModule) {
	'use strict';

	return BaseModule.extend({
		initialize: function (options) {

			this.parent = options.parent; //masterStructure.editor

			this.name = options.name;
			this.labels = options.labels;

			this.defaultValue = options.defaultValue;
			this.value = options.value;
			this.isChanged = (this.defaultValue !== this.value);

			this.$template = null;
			this.isConnected = false;
			this.getTemplate();

			if (this.isChanged) {
				//console.log(this);
			}
		},

		/*---------------------------------------------------------------------------------------------
				-------------------------HOUSE KEEPING
		---------------------------------------------------------------------------------------------*/
		pageLoaded: function () {

			//DO WHATEVER SHOULD BE DONE ONCE A PAGE IS LOADED... FOR NOW? NOTHING!

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
		},
		/*---------------------------------------------------------------------------------------------
				-------------------------VALUES
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
			}
			return value;
		},

		setValueText: function () {
			this.$template.attr("value", this.value);
		},
		setValueCheckbox: function () {

			this.$template.attr("checked", this.value);
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
			var value = ($("#LOM-showGlossary").is(":checked") || $("#LOM-showResources").is(":checked")) ? true : false;
			this.value = value;
			return value;
		},
		////////////////////////////////////////////////////////////////////////
		//Close structure editor module
		isException: function () {
			if (
				this.name === "microLearning"
				|| (this.name === "connectionMode" && this.value === "offline")
				|| this.name === "environment"
			) {
				return true;
			} else {
				return false;
			}

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
		}


	});
});
