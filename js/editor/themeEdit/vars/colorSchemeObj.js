define([
	'jquery',
	'labels',
	'utils',
	'modules/BaseModule',
	'settings-core',
	'./colorSetObj',
	'./colorObj'

], function ($, labels, Utils, BaseModule, CoreSettings, ColorSet, ColorObj) {
	'use strict';

	return BaseModule.extend({
		initialize: function (options) {
			var that = this;
			that = that;
			this.options = options;

			this.parent = options.parent; //masterStructure.editor
			this.editor = this.parent.editor;
			this.root = this.editor;
			this.master = this.parent.master; //masterStructure
			this.manager = this.parent;

			this.labels = options.labels;

			this.list = [];
			this.colorSets = [];
			this.colorSetList = [];
			this.colors = [];
			this.globalColors = [];
			this.comments = [];

			this.initData(options.data);


		},
		/*---------------------------------------------------------------------------------------------
		-------------------------init VARS
		---------------------------------------------------------------------------------------------*/
		init: function () {

		},

		initData: function (data) {
			var that = this;
			var colorSet;
			$.each(data.groups, function (key, set) {
				colorSet = new ColorSet({
					parent: that,
					data: data.groups[key]
				});
				that.colorSetList[that.colorSetList.length] = colorSet;
				that.colorSets[colorSet.name] = colorSet;

				colorSet.initColors(colorSet.options.data);
			})
			this.newColor();



			//then check the new one for updates.
			//cycle through, if it exists, update value, 

			//if it doesnt exist, append it.

		},


		findSameColor: function () {

		},
		findSameVar: function () {

		},

		newColor: function () {

			var data = this.options.newList;
			var customSet = this.colorSets["Custom"];
			for (var i = 0; i < data.length; i++) {
				if (typeof this.colors[data[i].variable] === "undefined") {
					var obsolete = (data[i].group.toLowerCase() !== "custom") ? true : false;
					//this is a custom color
					var colorObj = new ColorObj({
						parent: customSet,
						data: data[i],
						obsolete: obsolete
					});
					//add the type
					customSet.appendColor(colorObj);
				}
			}

		},
		/* **********************************************
		 * DISPLAY
		 * show list of all colors
		 * *********************************************/
		display: function ($target) {
			var that = this;
			var group, color;
			var $main;
			$target.append("<datalist id='color_datalist'></datalist>");
			this.$datalist = $target.children("datalist");



			for (var i = 0; i < this.colorSetList.length; i++) {
				group = this.colorSetList[i];
				$target.append("<section data-group='" + group.name + "'><h2>" + group.name + "</h2></section>");
				//$target.append("<button class='ico-SNAP-save snap-md'>Save Color Scheme</button>")
				$main = $("section[data-group='" + group.name + "']").last();
			}
			var item = null;
			for (var j = 0; j < this.list.length; j++) {
				item = this.list[j];
				$main = $("section[data-group='" + item.parent.name + "']").last();
				$main = this.domSubGroup(item, $main);
				if (item.isColor) {

					item.domInterface($main);
				}
				if (item.isComment) {
					$main.append("<h3>" + item.label.toLowerCase() + "</h3>");
				}
			}
			var $subgroups = $("[data-subgroup]:not(:has(fieldset))");
			$subgroups.remove();

			var addBtnCustom = "<button class='snap-md ico-LOM-plus LOM-themeedit-addcolor'>Add Custom Color</buttom>";
			$("[data-subgroup='Custom_general']").children(".LOM-subgroup-list").append(addBtnCustom);
			var $addBtn = $(".LOM-themeedit-addcolor");
			$addBtn.click(function () {
				that.addCustomColorClicked();
			});

		},
		//clicked on ADD CUSTOM COLOR 
		addCustomColorClicked: function () {
			//creatr the prompt
			this.editor.lbxController.pop({
				type: "prompt",
				title: "Name Your Color",
				msg: "This name must be unique and only include letters and dashes(-)<br>Ex: color-var-name ",
				obj: this,
				action: this.addCustomColor,
				validation: this.validateColor
			})

		},
		//this is called from the prompt (lightbox controller);
		validateColor: function (value, params) {
			var defaultValue = value;
			var ret = ""; if (value.length < 2) {
				//near- empty string
				ret += "Did you not write anything?";
			} else {
				//check only dollardsign on position 1
				if (value.indexOf("$") === 0) {


					value = value.substring(1);
				}
				if (typeof params.obj.colors["$" + value] !== "undefined") {
					ret += "Name already in use";
				}
				//strip dashes
				if (value.indexOf("-") >= 0) {
					if (value.indexOf("-") === 0) {
						ret += "cannot put a dash(-) in the beginning";
					} else if (value.indexOf("-") === (value.length - 1)) {
						ret += "Finishing dash(-) not allowed";
					} else if (value.indexOf("--") > 0) {
						ret += "double dashes not allowed (--)";
					} else {
						value = value.replace("-", "");
					}
				}
				//analyze string
				if (!/^[a-zA-Z]+$/.test(value)) {
					ret += "Unauthorized characters.";
				}
				//check if it exists

			}
			ret = (ret === "") ? true : ret;
			return ret;
		},
		//add the custom color, it'S been validated.
		addCustomColor: function (params) {
			//console.log("how does this work " + value);
			if (params.confirm) {
				//console.log(value);
				//alright, lets create it!
				//console.log(params.obj.colorSet);
				var customSet = params.obj.colorSets["Custom"];
				var data = { value: "#ffffff", variable: "$" + params.value, comment: "", isColor: true, group: "Custom" }
				//first create  the object.
				var colorObj = new ColorObj({
					parent: customSet,
					data: data
				});
				customSet.appendColor(colorObj);
				//then nest it.
			}
		},

		domSubGroup: function (item, $target) {
			var that = this;
			//does the subGroup exist
			var subGroupName = item.parent.name + "_" + item.subGroup;
			var $subGroup = $("[data-subgroup='" + subGroupName + "']").last();
			var imgPath, imgName;


			if (item.isComment) {
				//console.log(item.parent.name + " " + item.subGroup)
			}
			if ($subGroup.length === 0) {
				imgName = subGroupName;
				imgPath = this.editor.relPath + "theme/images/demo_final/demos_" + imgName + ".gif";
				$target.append("<section data-subgroup=\"" + subGroupName + "\" class='row'></section>")
				$subGroup = $("[data-subgroup='" + subGroupName + "']").last();
				$subGroup.append("<div class='LOM-subgroup-list col-sm-7'></div><div class='LOM-subgroup-demo col-sm-5'></div>");
				//Toolbar_general
				if (item.set.name === "Toolbar") {
					//add image demo
					$subGroup.children(".LOM-subgroup-demo").html("<img src='" + imgPath + "' data-original-src='" + imgPath + "'>");
				}


			}
			var $return = $subGroup.children("div.LOM-subgroup-list").last();
			return $return;
		},

		loadAllDemos: function () {
			for (var i = 0; i < this.list.length; i++) {
				if (this.list[i].isColor) {
					this.list[i].updateDemo();
				}
			}

		},
		/* ****************************************************
		 * fixes
		 * ***************************************************/


		preventOrderProblem: function () {
			var aVars = [];
			var item;

			for (var i = 0; i < this.list.length; i++) {
				item = this.list[i];
				if (item.isColor) {
					if (item.type === "variable" && !aVars.includes(item.value)) {
						item.comments = "// color was originally " + this.value;
						item.value = item.findColor();

						item.switched = true;
						item.type = "other";
						item.presave();
						console.log(item.originalValue)

					}
					aVars.push(item.name)
				}
			}
		},
		/* ****************************************************
		 *
		 * ***************************************************/

		save: function () {
			this.preventOrderProblem();
			var obj;
			var varsFile = "";
			var group = "";
			for (var i = 0; i < this.list.length; i++) {
				obj = this.list[i];
				if (obj.isColor) {
					obj.presave();
				}
				if (obj.set.name !== group) {
					group = obj.set.name;
					varsFile += obj.set.fetchCode();
				}
				varsFile += obj.fetchCode();
			}
			//FILE SHOULD BE COMPILED NOW
			this.manager.saveVars(varsFile);
		},
		connectDom: function () {
		}



	});
});

