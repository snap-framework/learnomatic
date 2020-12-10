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

		changePermissions: function () {
			this.permissions.subElements = {};
			this.permissions.editButtons.classPicker = false;
		},

		setLabels: function () {
			this.typeName = this.labels.type.answer;
			this.setLabelsDone = true;
			return false;
		},

		initDefaultDomValues: function ($template) {
			//set ID
			$template.find("input").attr("id", "answer_" + this.id);
			//set NAME
			$template.find("input").attr("name", "q-" + this.parent.id);
			//change TYYPE
			if (this.subtype === "checkbox") {
				$template.find("input").attr("type", "checkbox");
			}
			return $template;

		},


		setRadioClick: function () {
			var that = this;
			var $radio = this.$el.children("input");
			$radio.click(function () {
				if (!that.editor.locked) {
					if ($(".sortable-placeholder").length === 0) {
						that.parent.submitCorrectAnswer(that.id);
					}
				} else {
					this.editor.lockMessage();
				}
			});


		},
		setCorrect: function (isCorrect) {
			var $bkp = this.getBkp();

			switch (this.subtype) {
				case "checkbox":
					var $check = this.$el.children("input");

					if (isCorrect) {
						if (!$check.hasClass("ra")) {
							$check.removeClass("wa").addClass("ra");
							this.$el.attr("data-ra", "ra");
							$bkp.find("#" + this.id).attr("data-ra", "ra");
							$bkp.find("#" + this.id).children("input").removeClass("wa").addClass("ra");
						} else {
							$check.removeClass("ra").addClass("wa");
							this.$el.attr("data-ra", "wa");
							$bkp.find("#" + this.id).attr("data-ra", "wa");
							$bkp.find("#" + this.id).children("input").removeClass("ra").addClass("wa");

						}
					} else {

						if (!$check.hasClass("wa") && !$check.hasClass("ra")) {
							$check.addClass("wa");
							this.$el.attr("data-ra", "wa");
							$bkp.find("#" + this.id).children("input").addClass("wa");
							$bkp.find("#" + this.id).attr("data-ra", "wa");
						}
					}

					break;
				default:
					var correctClass = (isCorrect) ? "ra" : "wa";
					this.$el.children("input").removeClass("ra").removeClass("wa").addClass(correctClass);
					this.$el.attr("data-ra", correctClass);
					$bkp.find("#" + this.id).attr("data-ra", correctClass);
					$bkp.find("#" + this.id).children("input").removeClass("ra").removeClass("wa").addClass(correctClass);

			}


			//this.$el.prop("checked", false);
			this.updateBkp($bkp);
		},

		//deprecated
		customAfterLoad: function () {
			this.setRadioClick();
		},



		//-------------------------
		doSomething: function () {


		}
	});
});
