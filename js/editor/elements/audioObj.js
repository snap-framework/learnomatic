define([
	'jquery',
	'settings-core',
	'./../pageEdit/elementClass',
	'utils'
], function ($, CoreSettings, ElementClass, Utils) {

	'use strict';
	return ElementClass.extend({

		initialize: function (options) {
			this.options = options;
			this.courseFolder = "courses/" + this.editor.courseFolder;
			this.folder = "content/medias/audios/";

		},

		changePermissions: function () {
			this.permissions.editButtons.add = false;
			this.permissions.editButtons.config = true;
			this.permissions.editButtons.classPicker = true;
			this.permissions.subElements.text = true;
			this.permissions.subElements.audio = false;
		},

		setLabels: function () {
			this.typeName = this.labels.type.audio;
			this.setLabelsDone = true;
			return false;
		},

		initDefaultDomValues: function ($template) {
			$template.find("#inline-captions summary .LOM-editable").html(this.labels.default.transcript)

			return $template;
		},

		customAfterLoad: function () {
			var that = this;

			this.player = this.$el.find("audio").get(0)
			this.$el.children("figcaption").prepend("<div class='markers LOM-delete-on-save'></div>");
			if (this.$holder.children(".LOM-element").length > 0) {
				this.player.oncanplay = function () {
					for (var i = 0; i < that.elements.length; i++) {
						that.elements[i].setMarker();
					}
				};
			}

			return false;
		},



		/*---------------------------------------------------------------------------------------------
		-------------------------CONFIGURATION
		---------------------------------------------------------------------------------------------*/

		changeDefaultLbxSettings: function (params) {
			params.title = (Utils.lang === "en") ? "Audio Configuration" : "Configuration du fichier audio";
			return params;
		},

		changeDefaultConfigSettings: function (params) {

			params.$paramTarget = this.$el.find("audio");

			params.attributes = {
				"title": ""

			};
			return params;

		},

		loadConfigCustom: function (params) {
			$("#" + params.lbx.targetId).append("<section id='LOM-audio-files' class='row'><div class='col-md-6'><h3>" + ((Utils.lang === "en") ? "Available Audio Files" : "Fichiers audio disponibles") + "</h3><div class='audio-files'></div></div></section>");
			this.loadAudioList(params);
			/*No longer needed poster*/
			/*
				  $("#"+params.lbx.targetId).append("<details id='LOM-img-gallery'><summary>Audio Poster</summary></details>");
			this.loadImageList(params);
			*/
		},

		initDom: function () {
			initWbAdd(".wb-mltmd");
		},

		/*---------------------------------------------------------------------------------------------
		-------------------------AUDIO LIST
		---------------------------------------------------------------------------------------------*/

		loadAudioList: function (params) {
			var that = this;
			$.post('../../editor.php', {
				action: "readfolder",
				filename: this.courseFolder + "/" + this.folder,
				regex: "/^.*\.(mp3)$/i"
			}, function (data) {
				//parse the jSON
				//console.log(data);
				//that.loadPosters(data, params);
				that.loadAudios(data, params);


			}).fail(function () {
				alert("Posting failed while loading audio list.");
			});

		},

		loadAudios: function (list, params) {

			var aAudios = list.split(",");
			aAudios = this.cleanGallery(aAudios);
			this.generateAudioList(aAudios, params);
		},

		generateAudioList: function (aAudio, params) {
			var that = this;

			var $btnHolder = $("#LOM-audio-files").find(".audio-files");
			var btnSelected, fileValue, filePath;


			//var $vid;
			if (typeof this.$el.find("audio").children("source").attr("src") !== "undefined") {
				filePath = this.$el.find("audio").children("source").attr("src");
				fileValue = filePath.substring(filePath.lastIndexOf("/") + 1);

			}

			if (aAudio.length > 0) {
				for (var i = 0; i < aAudio.length; i++) {
					btnSelected = (fileValue === aAudio[i]) ? " btn-selected" : "";
					$btnHolder.append("<button class='snap-lg ico-LOM-audio" + btnSelected + "' value='" + aAudio[i] + "'>" + aAudio[i] + "</button>");

				}
			}
			else {
				$btnHolder.append("<p>" + ((Utils.lang === "en") ? "There are no availables files, please upload files using the option on the right." : "Il n'y a aucun fichier disponible, veuillez téléverser des fihiers en utilisant la fonction à droite.") + "</p>")
			}

			$btnHolder.children("button").click(function () {
				that.selectAudio($(this).attr("value"));
			});


			$("#LOM-audio-files").append("<div class='col-md-6' id='LOM-audio-upload'></div>");
			var $upload = $("#LOM-audio-upload");
			this.createUploadAudio($upload);
		},

		selectAudio: function (filename) {
			var $buttons = $("#LOM-audio-files").find(".ico-LOM-audio");
			var $selected = $("#LOM-audio-files").find(".ico-LOM-audio[value=\"" + filename + "\"]");

			var $bkp = this.getBkp();

			this.$el.find("audio").children("source").attr("src", "content/medias/audios/" + filename);
			$bkp.find("#" + this.id).find("audio").children("source").attr("src", "content/medias/audios/" + filename);

			this.saveBkp($bkp);

			$(".wb-mltmd").trigger("wb-init.wb-mltmd");

			$buttons.removeClass("btn-selected");
			$selected.addClass("btn-selected");

		},
		/*---------------------------------------------------------------------------------------------
		-------------------------IMAGE  GALLRY
		---------------------------------------------------------------------------------------------*/
		loadImageList: function (params) {

			var that = this;
			$.post('../../editor.php', {
				action: "readfolder",
				filename: this.courseFolder + "/" + this.folder + "posters/",
				regex: "/^.*\.(jpg|jpeg)$/i"
			}, function (data) {
				//parse the jSON
				//console.log(data);
				that.loadPosters(data, params);


			}).fail(function () {
				alert("Posting failed while loading image list.");
			});

		},

		loadPosters: function (images, params) {
			var aImages = images.split(",");

			//remove folders
			aImages = this.cleanGallery(aImages);
			this.generateGallery(aImages, params);


		},

		cleanGallery: function (aImages) {
			var newArray = [];
			for (var i = 0; i < aImages.length; i++) {

				if (aImages[i].indexOf(".") >= 0) {
					newArray[newArray.length] = aImages[i];
				}

			}
			return newArray;
		},

		generateGallery: function (aImages, params) {
			var that = this;
			var modulo = (aImages.length % 6 === 0) ? 6 : 4;
			var lineCounter = 1;
			var $gallery = $("#LOM-img-gallery");
			var $row;
			var $img;
			var bootstrap = (modulo === 6) ? "col-md-2" : "col-md-3";
			var obj = params.lbx.obj;
			var src = obj.$el.find("audio").attr("poster");

			$gallery.append("<input type='hidden' class='LOM-attr-value' id='LOM-data-poster' name='poster' value='" + src + "'>");


			for (var i = 0; i < aImages.length; i++) {
				if (lineCounter === 1) {
					$gallery.append("<div class='row'></div>");
					$row = $gallery.children(".row").last();
				}


				$row.append("<div class='LOM-img-btn " + bootstrap + "'><button><img src='" + this.folder + "posters/" + aImages[i] + "' class='img-responsive'></button></div>");
				$img = $row.children(".LOM-img-btn").last();

				//check if this is selected
				if ($img.children("button").children("img").attr("src") === src) {
					$img.addClass("LOM-gallery-selected");
				} else {
					$img.removeClass("LOM-gallery-selected");
				}

				if (lineCounter % modulo === 0 && lineCounter !== 0) {
					lineCounter = 1;
				} else {
					//CHECK ALSO IF LAST
					lineCounter++;

				}


			}
			$gallery.append("<div class='row'><div class='col-md-3' id='LOM-img-upload'></div></div>");

			var $upload = $("#LOM-img-upload");
			this.createUpload($upload);


			$(".LOM-img-btn").click(function () {
				that.imageSelected(this);

			});


		},

		imageSelected: function (obj) {
			var newSrc = $(obj).find("img").attr("src");
			$("#LOM-data-poster").attr("value", newSrc);
			$(".LOM-gallery-selected").removeClass("LOM-gallery-selected");
			$(obj).addClass("LOM-gallery-selected");
		},

		createUpload: function ($container) {
			var params = {
				"id": this.id + "_poster",
				"title": "Upload Poster",
				$container: $container,
				"filetype": ['jpg', 'jpeg', 'png', 'gif'],
				"obj": this,
				"folder": "content/medias/audios/posters/",
				"maxKb": 500,
				"accept": ".jpg,.jpeg,.gif/.png"
			};
			this.editor.uploadFile(params);


		},

		createUploadAudio: function ($container) {

			var params = {
				"id": this.id + "_vid",
				"title": ((Utils.lang === "en") ? "Upload Audio File" : "Téléverser un fichier audio"),
				$container: $container,
				"filetype": ['mp3'],
				"obj": this,
				"folder": "content/medias/audios/",
				"maxKb": 100000,
				"accept": "audio/*"
			};
			this.editor.uploadFile(params);


		},

		fileUploaded: function (data) {
			var file = data.location + data.filename;
			var params = {};
			var save = ((Utils.lang === "en") ? "Save Configuration" : "Sauvegarder la configuration")
			params.lbx = this.defaultLbxSettings("Configuration", "config", save);
			params.config = this.configLbxSettings();

			if (data.extention === "jpg" || data.extention === "jpeg") {
				$("#uploaded_file").html("<img src=\"" + file + "\" >");
				$("#LOM-img-gallery").html("<summary>Audio Poster</summary>");
				this.loadImageList(params);
			} else if (data.extention === "mp4") {
				this.loadAudioList(params);
				$("#LOM-audio-files").children(".col-md-6").html("");
				this.selectAudio(data.filename);
			}
			else if (data.extention === "mp3") {
				this.loadAudioList(params);
				$("#LOM-audio-files").find(".audio-files").html("");
				$("#LOM-audio-files #LOM-audio-upload").html("");
				this.selectAudio(data.filename);
			}

		},

		submitCustomConfig: function () {
			console.log("tihs is happening trigger");
		},

		/*---------------------------------------------------------------------------------------------
		-------------------------TRANSCRIPTS
		---------------------------------------------------------------------------------------------*/
		updateTextToTranscript: function (obj) {
			obj.changeDefaultLbxSettings = function (params) {
				params.title = "Transcript Configuration";
				return params;
			};

			obj.changeDefaultConfigSettings = function (params) {
				params.$paramTarget = this.$el;
				params.attributes = {
					"data-begin": "0s",
					"data-dur": "3"
				};
				return params;

			};
			obj.loadConfigCustom = function (params) {
				var that = this;
				$("#" + params.lbx.targetId).append("<div id='LOM-is-CC'></div>");
				var $values = $(".LOM-attr-value");
				var vName, vAttr, vValue, numericValue, barMax;
				for (var i = 0; i < $values.length; i++) {
					vName = $values.eq(i).attr("name");
					vAttr = $values.eq(i).attr(vName);
					vValue = $values.eq(i).val();

					numericValue = this.strInt(vValue); //parseInt(vValue.replace("s", ""), 10);

					barMax = (vName === "data-begin") ? this.parent.getDuration() : 8;
					$values.eq(i).after("<input type=\"range\" min=\"0\" max=\"" + barMax + "\" value=\"" + numericValue + "\" class=\"slider LOM-attr-value\" name=\"" + vName + "\" " + vName + "=\"" + vValue + "\">");
					if (vName === "data-begin") {
						$values.eq(i).before("<span>" + this.convertSecToMinute(numericValue) + " / " + this.convertSecToMinute(this.parent.getDuration()) + "</span>");
					} else {
						$values.eq(i).before("<span>" + this.convertSecToMinute(numericValue) + "</span>");
					}


				}
				$values.next().on("change", function () {
					var numericValue = parseInt($(this).val(), 10);


					if ($(this).attr("name") === "data-begin") {
						$(this).siblings("span").html(that.convertSecToMinute(numericValue) + " / " + that.convertSecToMinute(that.parent.getDuration()));
					} else {
						$(this).siblings("span").html(that.convertSecToMinute(numericValue));
					}
				});
				$values.remove();
				//CHANGE to sliders

				var $cc = $("#LOM-is-CC");
				var isCC = (this.$el.hasClass("wb-tmtxt")) ? "checked" : "";
				$cc.append("<label>Is this Close Caption? : <input type=\"checkbox\" id=\"closedcaption\" " + isCC + " name=\"scales\">");
				$cc.children("label").children("#closedcaption").on("change", function () {

					if (this.checked) {
						that.$el.addClass("wb-tmtxt");
					} else {
						that.$el.removeClass("wb-tmtxt");

					}

				});


			};

			obj.convertSecToMinute = function (time) {
				// Hours, minutes and seconds

				var mins = Math.floor((time % 3600) / 60);
				var secs = Math.floor(time - (mins * 60));
				var ret = "";


				ret += "" + mins + ":" + (secs < 10 ? "0" : "");
				ret += "" + secs;
				return ret;
			};

			obj.submitCustomConfig = function (params) {
				var dur, beg;
				dur = this.$el.attr("data-dur");
				beg = this.$el.attr("data-begin");
				this.begin = parseInt(beg, 10);
				dur += ".0s";
				beg += ".0s";
				this.$el.attr("data-dur", dur);
				this.$el.attr("data-begin", beg);

				return params;
			};

			obj.initDom = function () {
				if (this.$el.attr("data-subtype") !== "transcript") {
					this.$el.attr("data-subtype", "transcript");
					this.$el.addClass("wb-tmtxt");

					//------ get last
					if (this.parent.elements.length > 0) {
						var lastBegin, lastDur, $lastEl;

						$lastEl = this.parent.elements[this.parent.elements.length - 1].$el;


						lastBegin = this.strInt($lastEl.attr("data-begin"));
						lastDur = this.strInt($lastEl.attr("data-dur"));

						this.begin = lastBegin + lastDur;
					} else {
						this.begin = 1;
					}

					this.$el.attr("data-begin", this.intStr(this.begin));
					this.$el.attr("data-dur", "3s");


				} else {

					this.begin = this.strInt(this.$el.attr("data-begin"));
				}


			};

			obj.strInt = function (vStr) {
				vStr = vStr.replace("s", "");
				var vFloat = parseInt(vStr, 10);
				var vInt = Math.floor(vFloat);
				return vInt;
			};

			obj.intStr = function (vInt) {
				var vStr = vInt + ".0s";
				return vStr;

			};

			obj.setMarker = function () {
				if ($("#LOM_marker_" + this.id).length < 1) {
					var $markers = this.parent.$el.find(".markers");
					var text = this.$el.children("form").children("div").text();
					$markers.append("<button id='LOM_marker_" + this.id + "' class='marker'><span>" + text + "</span></button>");


					this.$marker = $("#LOM_marker_" + this.id);

					var that = this;
					var total = Math.floor((this.begin / this.parent.getDuration()) * 100);
					this.$marker.css("left", total + "%");
					this.$marker.click(function () {
						that.parent.player.currentTime = that.begin;
						that.parent.player.play();
					});
					this.$marker.hover(
						function () {
							that.$el.addClass("marker-hover");
						},
						function () {
							that.$el.removeClass("marker-hover");
						}
					);
				}
			};
		},

		/*---------------------------------------------------------------------------------------------
		-------------------------AUDIO SPECIFIC
		---------------------------------------------------------------------------------------------*/

		getDuration: function () {
			return this.$el.find("audio").eq(0).prop("duration");
		}
	});
});
