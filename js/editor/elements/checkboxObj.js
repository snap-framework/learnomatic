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

		initDom: function () {
			var $radio;

			$radio = this.$el.children("input");
			$radio.attr("id", "answer_" + this.id);
			$radio.attr("name", "q-" + this.parent.id);

			return false;
		},

		postCleanup: function () {

			var $radio = this.$el.children("input");
			$radio.removeAttr("disabled");


		},
		setRadioClick: function () {
			var that = this;
			var $radio = this.$el.children("input");
			$radio.click(function () {
				if ($(".sortable-placeholder").length === 0) {
					//$(this).attr("checked", false);
					//$(this).prop("checked", false);
					that.parent.submitCorrectAnswer(that.id);

					//that.editor.savePage();
				}
			});


		},
		setCorrect: function (isCorrect) {
			var correctClass = (isCorrect) ? "ra" : "wa";
			this.$el.children("input").removeClass("ra").removeClass("wa").addClass(correctClass);
			this.$el.attr("data-ra", correctClass);
			//this.$el.prop("checked", false);

			this.storeValue();
		},
		customAfterLoad: function () {
			this.setRadioClick();
		},

		//-------------------------
		doSomething: function () {


		}
	});
});
