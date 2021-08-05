define([
	'jquery',
	'labels',
	'utils',
	'modules/BaseModule',
	'./LOM-versions'

], function ($, labels, Utils, BaseModule, Versions) {
	'use strict';

	return BaseModule.extend({
		initialize: function (options) {
			var that = this;
			that = this;
			this.root = options.root;
			this.version = "2.0.4";
			this.vArray = this.version.split(".");
			this.levels = ["major", "minor", "revision"]


			if (this.root.type === "editor") {
				this.master = this.root.parent; //masterStructure
				that.systemReady();
			}
		},
		/* *****************************************************
		 * SYSTEM READY (SNAP editor)
		 * ****************************************************/
		systemReady: function () {
			this.compareVersion(this.master.version);


		},
		/* ****************************************************
		 * COMPARE VERSION
		 * receive the course version and compare it to LOM version
		 * ***************************************************/
		compareVersion: function (courseVersion) {
			var that = this;
			//var courseVersion = this.master.version;
			var courseVersion = this.equivalent(courseVersion);
			var level;
			if (this.version === courseVersion) {

				level = -1;
			} else {


				var vArray = courseVersion.split(".");
				//check version difference level (major=0, minor = 1, revision = 2)
				for (var ver = 0; ver <= 2; ver++) {
					if (vArray[ver] !== this.vArray[ver]) {
						level = ver;
						if (vArray[ver] > this.vArray[ver]) {
							this.updateLOM();
						}
					}
				}

				if (level >= 0) {


					var $adminInfo = $("#adminMode").children(".infos");
					$adminInfo.append("<br><button class='ico-ribbons-warning snap-md LOM-version-conflict'>Update SNAP</button>");
					$adminInfo.children(".LOM-version-conflict").click(function () {
						that.loopVersions(courseVersion);
					});
					return level;

				}


			}
		},
		/* *********************************************
		 * EQUIVALENT (1.8.3 -> 2.0.3)
		 * ********************************************/
		equivalent: function (version) {

			// versions 1.8.x are equivalent to 2.0.x
			if (version.includes("1.8.")) {
				version = version.replace("1.8.", "2.0.")
			}
			return version;
		},

		loopVersions: function (old) {
			var updateLog = "Updates:";
			var checkList = [];
			var finalList = [];
			var engage = false;
			var i, j;
			//gather pertinent versions to check
			var keys = Object.keys(Versions);
			for (i = 0; i < keys.length; i++) {
				var key = keys[i];
				//
				if (engage) {
					//console.log(key, Versions[key]);

					var mods = Versions[key].modified;
					for (j = 0; j < mods.length; j++) {
						checkList[checkList.length] = mods[j];
						updateLog += "\n" + key + " " + mods[j];
					}
				}
				//if this is the current version, then all next versions are selected
				engage = (key === old) ? true : engage;
			}
			//clean up the list
			checkList = this.simplifyList(checkList);
			//generic lightbox pop
			this.root.lbxController.pop({
				title: "Version Control Updates",
				action: this.displayChangeList,
				checkList: checkList,
				courseVersion: old,
				obj: this
			});
		},
		/* *********************************
		 * remove duplicates
		 * ********************************/
		simplifyList: function (list) {
			//reorder the list of updates alphabetically
			list.sort(function (a, b) {
				return a.toLowerCase().localeCompare(b.toLowerCase());
			});
			var chunk = list[0];
			var newList = [list[0]];
			for (var i = 1; i < list.length; i++) {
				//for each modificaiton in version switch
				if (list[i].indexOf(chunk) === -1) {
					//previous chunk is absent (this is a new thing)
					chunk = list[i];
					//add to list
					newList[newList.length] = list[i];
				}
			}
			return newList;
		},
		/* ***************************************************
		 * DISPLAY CHANGE LIST
		 * shows list of things to be changed
		 * **************************************************/
		displayChangeList: function ($modal, params) {
			var isManual;
			var checkList = params.checkList;
			var item;
			var classif;
			var courseVersion = params.obj.equivalent(params.courseVersion);
			$modal.append("<div class='LOM-version-explained'></div>");
			$modal.children(".LOM-version-explained").append("<p>Course Version: " + courseVersion + " => LOM Version " + params.obj.version + "</p>");
			$modal.children(".LOM-version-explained").append("<p>These files/folders are out of date: </p>");
			$modal.append("<div class='row LOM-update-list'></div>");
			$modal.children(".row").append("<details class='col-sm-9'><summary>Root Files updates</summary><div id='LOM-version-root'></div></details>");
			$modal.children(".row").append("<details class='col-sm-9'><summary>Core updates</summary><div id='LOM-version-core'></div></details>");
			$modal.children(".row").append("<details class='col-sm-9'><summary>Content updates</summary><div id='LOM-version-content'></div></details>");
			$modal.children(".row").append("<details class='col-sm-9'><summary>Theme updates</summary><div id='LOM-version-theme'></div></details>");

			for (var i = 0; i < checkList.length; i++) {
				item = checkList[i];
				isManual = (item.slice(-1) === "#") ? true : false;
				if (isManual) {
					item = item.slice(0, -1);
				}
				if (item.indexOf("/") >= 0) {
					//does it contain theme
					if (item.indexOf("scss") >= 0 || item.indexOf("theme") >= 0) {
						classif = "theme";
					} else {
						classif = item.split("/")[0];
					}


				} else {
					classif = "root"
				}
				$modal.find("#LOM-version-" + classif).append("<p>" + item + "</p>");
				if (isManual) {
					$modal.find("#LOM-version-" + classif).children().last().addClass("LOM-update-manual").append("<span> (Update manually!)</span>");
					$modal.find("#LOM-version-" + classif).parent().addClass("LOM-update-manual-group")
				}


			}
		}

	});
});

