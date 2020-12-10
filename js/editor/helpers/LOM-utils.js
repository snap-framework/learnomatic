define(['jquery', './../LOM_labels'], function ($, LOMLabels) {
	'use strict';

	return {
		promptFilename: function (msg, defaultMsg) {

			var value = prompt(msg, defaultMsg);
			if (value !== null) {
				var validation = this.validateFilename(value);
				if (validation === true) {
					return value;
				} else {
					return this.promptFilename(validation, value);
				}
			}
			return false;

		},
		generateId: function (prefix) {
			var currentId;
			var flag = false;
			var i = 0;
			while (!flag) {
				currentId = prefix + (i + 1);
				if ($("#" + currentId).length <= 0) {
					flag = true;
					return currentId;//this.$el.attr("id", currentId);
				} else if (i === 500) {
					flag = true;
				}
				i++;
			}
			return currentId;

		},

		validateFilename: function (filename) {
			if (this.validateEmpty(filename)) {
				var validCharacter = this.validateCharacters(filename);
				if (validCharacter === true) {
					return true;
				} else {
					return LOMLabels.interface.prompts.invalidChar + " \"" + validCharacter + "\". " + LOMLabels.interface.prompts.enterValid + "([A-Z, 0-9, _ , -])";
				}

			} else {
				return LOMLabels.interface.prompts.noEmpty;
			}

		},
		validateEmpty: function (str) {
			var result = (str.length < 1) ? false : true;
			//does it contain something
			return result;
		},
		validateCharacters: function (str) {
			var code;
			for (var i = 0; i < str.length; i++) {
				code = str.charCodeAt(i);
				if (!(code > 47 && code < 58)
					&& // numeric (0-9)
					!(code > 64 && code < 91)
					&& // upper alpha (A-Z)
					!(code > 96 && code < 123)
					&& !(code === 45 || code === 95)
				) { // lower alpha (a-z)
					return str.charAt(i);
				}
			}
			return true;
		},
		whichChild: function (elem) {
			var i = 0;
			while ((elem = elem.previousSibling) != null) ++i;
			return i;
		}
	};
});
