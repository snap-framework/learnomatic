define([
	'jquery',
	'labels',
	'utils',
	'modules/BaseModule',
	'settings-core',
	'./color_label'

], function ($, labels, Utils, BaseModule, CoreSettings, Labels) {
	'use strict';

	return BaseModule.extend({
		initialize: function (options) {

			this.parent = options.parent; //masterStructure.editor
			this.editor = this.parent.editor;
			this.root = this.editor;
			this.master = this.parent.master; //masterStructure
			this.set = this.parent;
			this.scheme = this.set.parent;
			this.manager = this.scheme.parent;

			this.name = options.data.variable;

			this.id = this.cleanName(this.name);
			this.value = null;
			this.type = null;
			this.isColor = true;

			this.words = Labels.colorwords;
			this.setLabels();

			this.init(options);
			//this.specialStatusMsg();
		},
		/*---------------------------------------------------------------------------------------------
		-------------------------init VARS
		---------------------------------------------------------------------------------------------*/


		init: function (options) {
			this.originalValue = options.data.value;
			this.checkMissing();
			this.changed = (this.originalValue === this.value) ? false : true;
			this.custom = (options.custom === true) ? true : false;

			//#fff -> #ffffff
			if (this.value.length === 4 && this.value.charAt(0) === "#") {
				var newVal = "#";
				for (var i = 1; i < this.value.length; i++) {
					newVal += this.value.charAt(i);
					newVal += this.value.charAt(i);
				}

				this.value = newVal;
				this.type = "hex";


			} else if (this.value.charAt(0) !== "#") {
				// is it a word color
				var newWord = this.words[this.value.toLowerCase()];
				//console.log(newWord);
				if (typeof newWord === "undefined") {
					if (this.value.toLowerCase() === "transparent") {
						this.type = "transparent";
					} else if (this.value.charAt(0) === "$") {
						this.type = "variable";
					} else {
						this.type = "other";//like rgba
					}
				} else {
					this.type = "word";
				}
			} else {
				this.type = "hex";
			}



		},

		setLabels: function () {
			var labelName = this.name.substring(1).replace(/-/g, '');
			var label = Labels.vars[labelName]

			if (typeof label === "undefined") {
				this.label = this.name.substring(1).replace(/-/g, ' ');
				this.subGroup = "general";
				this.visible = (this.set.name.toLowerCase() === "custom") ? true : false;

			} else {
				this.label = label.label;
				this.varType = label.type;
				this.subGroup = (typeof label.subgroup === "undefined") ? "general" : label.subgroup;
				this.visible = true;
			}
		},
		/*---------------------------------------------------------------------------------------------
		-------------------------init VARS
		---------------------------------------------------------------------------------------------*/
		cleanName: function (name) {
			return name.replace(/[^0-9a-z]/gi, '');

		},

		checkMissing: function () {
			this.value = this.originalValue;
			//console.log(this.scheme.options.newData);
			if (typeof this.scheme.options.newData[this.name] !== "undefined") {
				//this.scheme.options.newData[this.name].found = true;
				this.value = this.scheme.options.newData[this.name].value;
				if (this.originalValue !== this.value) {
					this.changed = true;
				}
			} else {
				//console.log(this.name + " is missing")
				this.missing = true;
				this.changed = false;
			}
			this.obsolete = (this.options.obsolete === true) ? true : false;


		},

		specialStatusMsg: function () {

			if (this.changed) {
				console.log("Changed color (" + this.name + ":" + this.value + ";)");
			}
			if (this.custom) {
				console.log("Custom color (" + this.name + ":" + this.value + ";)");
			}
			if (this.missing) {
				console.log("Missing color (" + this.name + ":" + this.value + ";)");
			}
			if (this.obsolete) {
				console.log("Obsolete color (" + this.name + ":" + this.value + ";)");
			}
		},

		setSpecialStatus: function () {
			this.$el
				.removeClass("LOM-color-custom")
				.removeClass("LOM-color-missing")
				.removeClass("LOM-color-changed")
				.removeClass("LOM-color-obsolete")
			if (this.custom) {
				this.$el.addClass("LOM-color-custom")
			}
			if (this.missing) {
				this.$el.addClass("LOM-color-missing")
			}
			if (this.changed) {
				this.$el.addClass("LOM-color-changed")
			}
			if (this.obsolete) {
				this.$el.addClass("LOM-color-obsolete")
			}
		},

		domInterface: function ($where) {
			var that = this;
			//what kind of color is it and what does it mean ? 
			//var style = this.getStyle();
			$where.append("<fieldset id='LOM-color-edit-" + this.id + "'></fieldset>");

			//link ROW
			this.$el = $where.children("fieldset").last();
			this.$el.attr("data-type", this.type);
			this.$el.attr("data-color-name", this.name);
			//setup datalist
			if (this.set.name.toLowerCase() === "global" || this.set.name.toLowerCase() === "custom") {
				if (this.type === "hex" || this.type === "word" || this.type === "transparent") {
					var value = (this.type === "word") ? this.words[this.value] : this.value;
					//check if it'S already in the list
					if (this.scheme.$datalist.children("option:contains('" + value + "')").length === 0) {
						//if not, add to choices
						this.scheme.$datalist.append("<option>" + value + "</option>")
					}
				}

			}
			//set type
			this.$el.addClass("row")
			//ADD THE NAME
			this.$el.append("<span class='LOM-color-name'>" + this.label + "</span>");
			this.$el.children("span.LOM-color-name").addClass("col-sm-4")


			//add preview
			this.$el.children("span.LOM-color-name").prepend("<div class='LOM-color-preview'></div>");
			this.$preview = this.$el.children("span.LOM-color-name").children(".LOM-color-preview");
			this.updateColorPreview();
			//editing spaaaace
			this.$el.append("<div class='LOM-color-edit col-sm-3'></div><div class='LOM-color-buttons col-sm-1'></div>");
			//edit directly in the textfield
			this.$el.append("<label class='LOM-color-display col-sm-4'><input type='text' class='LOM-colors-details' value='" + this.value + "' disabled></label>");
			this.$textfield = this.$el.children(".LOM-color-edit").children(".LOM-color-display").children("[type='text']");
			//color picker
			this.$el.children(".LOM-color-edit").append("<label class=''><input type='color' list='color_datalist'/></label>");
			this.$picker = this.$el.children(".LOM-color-edit").children("label").children("[type='color']");
			//update the color picker with current value
			this.getColorPick(this.$picker);
			this.$el.attr("data-color-type", this.type);
			//add TRANSPARENT as abtn
			this.$el.children(".LOM-color-edit").append("<button class='LOM-set-transparent'>transparent</button>");
			this.$transparent = this.$el.children(".LOM-color-edit").children("button.LOM-set-transparent")

			this.setSpecialStatus();

			if (this.visible === false) {
				this.$el.addClass("LOM-color-extended");
				//this.$el.hide();
				//this.$el.css("opacity", "0.5");
			}
			this.$picker.change(function () {
				that.selectColor($(this));
			});
			this.$transparent.click(function () {
				that.selectTransparent($(this));
			})
		},

		updateDemo: function () {
			var that = this

			var imgName = "LOM-color-edit-" + this.id;
			var imgPath = this.editor.relPath + "theme/images/demo_final/" + imgName + ".gif";

			if (this.set.name === "Toolbar") {
				//this.$el.html(this.id)
				var $demo = that.$el.parent().siblings(".LOM-subgroup-demo");
				var $img = $demo.children("img");
				this.$el.hover(
					function () {
						$img.attr("src", imgPath);
						$img.addClass("LOM-demo-highlight");
					}, function () {
						$img.attr("src", $img.attr("data-original-src"));

						$img.removeClass("LOM-demo-highlight");
					}
				);
				//LOM-color-edit-headerbuttoncolor
			}


		},

		selectColor: function ($btn) {
			var value;

			//if btn is the color picker
			if ($btn.attr("type") === "color") {
				//get the value in hex
				value = $btn.val();



				this.value = this.encodeValue(value);

			}
			this.updateColorPreview();
			this.updateTextValue();
			this.$el.addClass("LOM-color-changed");
			this.modified = true;
		},



		selectTransparent: function ($btn) {
			this.value = "transparent";
			this.type = "transparent";
			this.updateColorPreview();
			this.updateTextValue();
			$btn.prev("label").children("input").val("#000000");
			this.$el.addClass("LOM-color-changed");
			this.modified = true;


		},

		updateColorPreview: function () {
			var style = this.getStyle();
			this.$preview.attr("style", style);
			this.updateDemo();

		},

		updateTextValue: function () {
			this.$textfield.val(this.value);

		},

		findColorObject: function ($colorName) {
			var found = this.scheme.colors[$colorName];
			if (found.type === "variable") {
				found = found.findColorObject(found.value);
			} else {
				found = found;
			}
			return found;
		},
		findColor: function () {
			var found;
			if (this.type === "variable") {
				var found = this.scheme.colors[this.value];
				found = found.findColor();
			} else {
				found = this.value
			}
			return found;
		},
		/*---------------------------------------------------------------------------------------------
		-------------------------encode decode values
		---------------------------------------------------------------------------------------------*/
		getStyle: function () {
			var style = null;


			if (this.type === "word") {
				style = "background-color:" + this.words[this.value] + ";";
			} else if (this.type === "hex") {

				style = "background-color:" + this.value + ";";
			} else if (this.type === "transparent") {
				style = "background-image:url(\"../../theme/images\/transparent.jpg\");background-repeat:repeat;"

			} else if (this.type === "variable") {

				var colorObj = this.findColorObject(this.value);
				style = colorObj.getStyle();
			}


			return style;
		},

		decodeValue: function () {
			var value = null;


			if (this.type === "word") {
				value = this.words[this.value];
			} else if (this.type === "hex") {

				value = this.value;
			} else if (this.type === "transparent") {
				value = "transparent";

			} else if (this.type === "variable") {

				var colorObj = this.findColorObject(this.value);
				value = colorObj.decodeValue();
			}


			return value;
		},

		encodeValue: function (value) {
			//look for word color
			var word = this.reverseColorFind(value);
			//check if it exists... 
			if (typeof this.scheme.globalColors[value] !== "undefined") {
				//type variable
				value = this.scheme.globalColors[value].name;
				this.type = "variable";
			} else if (word !== false) {
				//type WORD
				value = word;
				this.type = "word";
			} else {
				this.type = "hex";
			}
			return value;
		},
		/*---------------------------------------------------------------------------------------------
		-------------------------
		---------------------------------------------------------------------------------------------*/
		presave: function () {
			this.originalValue = this.value;
			this.changed = false;
			this.missing = false;
			this.setSpecialStatus();

		},
		reset: function () {
			this.value = this.originalValue;
			//SET status ... 
			this.setSpecialStatus();

		},
		fetchCode: function () {
			return "\n" + this.name + " : " + this.originalValue + ";";
		},
		/*---------------------------------------------------------------------------------------------
		-------------------------
		---------------------------------------------------------------------------------------------*/
		getColorPick: function ($el) {
			var $value;
			switch (this.type.toLowerCase()) {
				case "hex":
				case "transparent":
					$el.attr("value", this.value);
					break;
				case "word":
					$el.attr("value", this.words[this.value]);
					break;
				case "variable":
					var obj = this.findColorObject(this.value);
					$el.attr("value", obj.value);
					break;
				default:
					$el.attr("value", "#ffffff");
				// code block
			}
		},

		reverseColorFind: function (hex) {
			var returnColor = false;
			//this.words
			$.each(this.words, function (key, color) {
				if (color.toLowerCase() === hex.toLowerCase()) {
					returnColor = key;

				}

			});
			return returnColor;

		}


	});
});

