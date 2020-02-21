define([

	'jquery',
	'settings-core',
	'./../pageEdit/elementClass'
], function ($, CoreSettings, ElementClass) {
	'use strict';
	return ElementClass.extend({
		initialize: function (options) {
			this.options = options;
		},

		initDom: function () {

			this.$activite = this.$el.children(".qs-elearning-activity");
			this.$exercise = this.$activite.children(".qs-exercise");

			this.$activite.attr("id", this.id + "_act");
			this.$exercise.attr("id", this.id + "_ex1");

			switch (this.subtype) {
				case "exam":
					this.domExam();
					break;
				default:
					this.domActivity();
			}
			return false;
		},

		setLabels: function () {
			switch (this.subtype) {
				case "exam":
					this.typeName = this.labels.type.exam;
					this.labels.yougot = (this.lang === "en")
						? "You got"
						: "Vous avez obtenu";
					this.labels.begin = (this.lang === "en")
						? "Begin Exam"
						: "Débuter l'examen";
					break;
				default:

					this.typeName = this.labels.type.activity;
			}
			return false;
		},
		changePermissions: function () {
			this.permissions.editButtons.add = false;
			this.permissions.editButtons.config = true;
			this.permissions.editButtons.classPicker = true;
			this.permissions.subElements.multiplechoice = true;
			this.permissions.subElements.checkbox = true;

		},

		addElementBtnTxt: function () {
			return "Add Question";
		},
		/*---------------------------------------------------------------------------------------------
		-------------------------CONFIGURATION
		---------------------------------------------------------------------------------------------*/
		changeDefaultLbxSettings: function (params) {
			params.title = "Activity Configuration";
			return params;
		},
		changeDefaultConfigSettings: function (params) {
			params.$paramTarget = this.$el.find(".qs-elearning-activity");
			//params.files=["../../templates/LOM-Elements/element_config_activity.html"];
			params.attributes = {
				"data-random-answers": [
					"True",
					"False"
				]
			};
			return params;

		},
		/*---------------------------------------------------------------------------------------------
		-------------------------MODIFY activity to be an exam
		---------------------------------------------------------------------------------------------*/
		domExam: function () {

			this.$el.removeClass("activity").addClass("exam");
			this.$activite.children("h2").text(this.labels.type.exam);
			this.$activite.find(".yougot").text(this.labels.yougot);
			this.$activite.find(".qs-start").attr("value", this.labels.begin);
			this.$activite.children(".qs-exercise").attr("data-feedback-type", "none");

		},
		domActivity: function () {
			//only for activities
			this.$activite.children(".qs-start-activity,.qs-feedback-final").remove();
			this.$activite.children("h2").text(this.labels.type.activity);
		},
		/*---------------------------------------------------------------------------------------------
		-------------------------
		---------------------------------------------------------------------------------------------*/

		//-------------------------
		doSomething: function () {


		}
	});
});
