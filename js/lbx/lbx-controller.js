define([
	'jquery',
	'labels',
	'utils',
	'modules/BaseModule'

], function ($, labels, Utils, BaseModule) {
	'use strict';

	return BaseModule.extend({
		initialize: function (options) {
			var that = this;
			that = this;

			this.root = options.root;
			this.master = this.root.parent; //masterStructure


			//this.pop("wow", this.dothis);
		},
		/* *******************************************
		 * create the popup
		 * syntax 
			this.root.lbxController.pop("title", this.afterPopFunction, {params:params});
			this.afterpop should have parameters ($modalbody, params) 
		 * ******************************************/
		pop: function (params) {
			var that = this;
			var file = (typeof params.file === "undefined") ? "templates/generic_lbx_" + Utils.lang + ".html" : params.file;
			var title = (typeof params.title === "undefined") ? "Lightbox" : params.title;
			$.magnificPopup.open({
				items: {
					src: this.root.relPath + file
				},
				type: "ajax",

				removalDelay: 500,
				callbacks: {
					beforeOpen: function () {
						this.st.mainClass = "mfp-zoom-in";
					},
					ajaxContentAdded: function () {
						that.$title = this.content.find(".modal-title");
						that.setTitle(title);
						that.$content = this.content.find(".modal-body");
						that.params = params;
						that.params.targetId = "generic_LBX";
						if (that.params.type !== "prompt") {
							if (typeof params.action !== "undefined") {
								that.params.action(that.$content, params);
							}
						} else {
							that.setPrompt(params);
						}

					},
					close: function () {
						if (typeof params.onclose !== "undefined") {
							//this should be an action.
							params.onclose(params);

						}
					}
				},
				midClick: true
			}, 0);
		},

		//set the title of the popoup
		setTitle: function (title) {
			this.$title.html(title);

		},

		close: function () {
			$.magnificPopup.close();
		},
		setPrompt: function () {
			var that = this;
			var $pop = this.$content;
			$pop.append("<label>" + that.params.msg + "<br><span class='LOM-prompt-err'></span> <input type='text' id=\"LOM_prompt\"/>");
			var $input = $("#LOM_prompt");
			$input.focus();
			var btnOk = "<button class='snap-sm ico-QS-check LOM-prompt-confirm'>Confirm</buttom>";
			var btnCancel = "<button class='snap-sm ico-SNAP-delete LOM-prompt-cancel'>Cancel</buttom>";
			$(".modal-footer").html(btnOk + btnCancel);
			$(".LOM-prompt-confirm").click(function () {
				//also get the value
				var value = $("#LOM_prompt").val();
				var valid = that.validation(value);
				if (valid) {
					that.promptConfirmed(value);
				}
			});
			$(".LOM-prompt-cancel").click(function () {
				that.promptCancelled();

			});
			$input.focus(function () {
				$(this).siblings(".LOM-prompt-err").html("");
			});
		},

		validation: function (value) {
			//console.log(typeof params.validation);
			var returnValue = null;
			switch (typeof this.params.validation) {
				case "function":
					// code block
					returnValue = this.params.validation(value, this.params);
					break;
				case "string":
					// code block
					break;
				case "undefined":
				default:
					// code block
					//undefined
					returnValue = true;

			}
			if (returnValue === true) {
				return returnValue;

			} else {
				this.promptError(returnValue);
				return false;
			}
		},

		promptError: function (msg) {
			var $err = $(".LOM-prompt-err");
			$err.html("(" + msg + ")").css("color", "#bb0000");

		},

		promptConfirmed: function (value) {
			var params = this.params;
			params.value = value;
			params.confirm = true;
			params.action(params);
			this.close();
		},
		promptCancelled: function (value) {
			var params = this.params;
			params.value = value;
			params.confirm = false;
			params.action(params);
			this.close();

		},

		dothis: function () {
			console.log("this is done");
		}


	});
});