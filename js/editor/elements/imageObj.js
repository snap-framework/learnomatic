define([

	'jquery',
	'settings-core',
	'./../pageEdit/elementClass'
], function ($, CoreSettings, ElementClass) {
	'use strict';
	return ElementClass.extend({
		initialize: function (options) {
			this.options = options;
			this.courseFolder = "courses/" + this.editor.courseFolder;
			this.folder = "content/medias/images/";

		},
		changePermissions: function () {
			this.permissions.editButtons.add = false;
			//this.permissions.editButtons.config=true;
			this.permissions.editButtons.classPicker = true;
            

		},

		connectDom: function () {
			var that = this;
			this.$el = $("#" + this.id);
			this.$holder = this.getHolder();
			this.$el.find("img").click(function () {
				that.configClicked();
			});
		},
		customRemoveBeforeSave: function () {
			if (this.$el.children().is("a")) {
				var $link = this.$el.children("a[data-lom-lbx");
				$link.removeClass("wb-lbx-inited");
				$link.addClass("wb-lbx");

			}
		},
		customAfterLoad: function () {
			if (this.$el.children().is("a")) {
				var $link = this.$el.children("a[data-lom-lbx]");
				$link.removeClass("wb-lbx");

			}
			return false;
		},
		/*---------------------------------------------------------------------------------------------
		-------------------------CONFIGURATION
		---------------------------------------------------------------------------------------------*/
		changeDefaultLbxSettings: function (params) {
			params.title = "Image Configuration";
			return params;
		},
		changeDefaultConfigSettings: function (params) {

			params.$paramTarget = this.$el.find("img");

			params.attributes = {
				"alt": ""

			};
			return params;

		},
		loadConfigCustom: function (params) {

			$("#" + params.lbx.targetId).append("<div id='LOM-img-gallery'></div>");
			var that = this;
			$.post('../../editor.php', {
				action: "readfolder",
				filename: this.courseFolder + "/" + this.folder,
				regex: "/^.*\.(jpg|jpeg|png|gif|svg)$/i"
			}, function (data) {
				//parse the jSON
				//console.log(data);
				that.loadGallery(data, params);

				that.configClickable();


			}).fail(function () {
				alert("Posting failed while loading custom config.");
			});
		},

		/*---------------------------------------------------------------------------------------------
		-------------------------IMAGE  GALLRY
		---------------------------------------------------------------------------------------------*/
		loadGallery: function (images, params) {
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
			var src = obj.$el.find("img").attr("src");

			$gallery.append("<input type='hidden' id='LOM-src' class='LOM-attr-value' name='src' value='" + src + "'>");


			for (var i = 0; i < aImages.length; i++) {
				if (lineCounter === 1) {
					$gallery.append("<div class='row'></div>");
					$row = $gallery.children(".row").last();
				}


				$row.append("<div class='LOM-img-btn " + bootstrap + "'><button><img src='" + this.folder + aImages[i] + "' class='img-responsive'></button></div>");
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
				var newSrc = $(this).find("img").attr("src");
				$("#LOM-src").attr("value", newSrc);
				$(".LOM-gallery-selected").removeClass("LOM-gallery-selected");
				$(this).addClass("LOM-gallery-selected");

			});
			$(".LOM-img-btn").dblclick(function () {
				var popParams = {};
				//send title and action
				popParams.lbx = that.defaultLbxSettings("Configuration", "config", "Save Configuration");
				popParams.config = that.configLbxSettings();
				that.submitConfig(popParams);

			});

		},

		changeImage: function (filename) {
			this.$el.find("img").attr("src", filename);
			this.storeValue();
			this.editor.savePage();
			this.closeLbx();

		},

		createUpload: function ($container) {
			var that = this;
			$container.append("<h3>Upload Image</h3>");
			$container.append("<label>Select image(max 500kb file size) <input type='file' name='file' id='file' /></label><span id='uploaded_image'></span>");
			$container.append("<button class='snap-sm ico-LOM-upload'>Upload</button");
			//$container.append(" <input type='hidden' id='info' name='info' value='upload_image'>");
			$container.children("button").hide();

			var $file = $("#file");
			$file.on("change", function () {
				var fichier = this.files[0];
				var filename = fichier.name;
				var filext = filename.split('.').pop().toLowerCase();
				if (jQuery.inArray(filext, ['gif', 'png', 'jpg', 'jpeg']) === -1) {
					alert("wrong fily type");
					return false;
				} else {
					if (fichier.size > 500000) {
						alert("File too big");
						return false;
					} else {
						var form_data = new FormData();
						form_data.append("file", fichier);
						form_data.append("action", "upload_image");
						form_data.append("filename", that.editor.courseFolder);
						form_data.append("location", "content/medias/images/");
						$.ajax({
							url: "../../editor.php",
							method: "POST",
							data: form_data,
							contentType: false,
							cache: false,
							processData: false,
							beforeSend: function () {
								$("#uploaded_image").html("Image Uploading ... ");
							},
							success: function (data) {


								data = JSON.parse(data);
								var filename = data.filename;
								//console.log(data);
								var newSrc = "content/medias/images/" + filename;

								that.changeImage(newSrc);

								//that.$el.children("img").attr("src", newSrc);
								//$.magnificPopup.close();
							}


						});
					}


				}
			});

		},
		/*---------------------------------------------------------------------------------------------
		-------------------------CLICKABLE
		---------------------------------------------------------------------------------------------*/

		configClickable: function () {
			var that = this;
			var $body = $("#custom_lbx");
			$body.append("<div id='LOM-clickable-action-container'></div>");
			var $action = $("#LOM-clickable-action-container");
			$action.append("<h3>Clickable Actions</h3>");
			$action.append("<label>Action type: <select id='LOM-clickable-action-type' class='LOM-action-type'></select></label>");
			$action.append("&nbsp;<label>Action: <select id='LOM-clickable-action' class='LOM-action'></select></label>");

			var $actionType = $("#LOM-clickable-action-type");
			var $actionSelect = $("#LOM-clickable-action");
			$actionSelect.hide();
			$actionType.append("<option value='null'>No action</option>");
			$actionSelect.append("<option value='null' class='LOM-action-null'>n/a</option>");
			var i = 0;

			//LIGHTBOXES
			var listLightbox = this.editor.getElementsByType("lightbox");
			if (listLightbox.length > 0) {
				$actionType.append("<option value='lightbox'>Lightbox to open :</option>");

				for (i = 0; i < listLightbox.length; i++) {
					var lbxId = listLightbox[i].id + "_lbx";
					$actionSelect.append("<option class='LOM-action-lightbox' value='" + lbxId + "'>Lightbox ID " + lbxId + "</option>");
				}
			}

			/*
			//NAVIGATE
			$actionType.append("<option value='navigate'>Navigate to:</option>");
			for (i=0;i<this.editor.master.flatList.length;i++){
				var navId=this.editor.master.flatList[i].sPosition;
				var navTitle=this.editor.master.flatList[i].title;
				$actionSelect.append("<option class='LOM-action-navigate' value=\""+navId+"\">Navigate to "+navTitle+"</option>");				
			}
			*/

			$actionType.change(function () {
				$actionSelect.attr("data-action-type", this.value);
				var $first = $actionSelect.children(".LOM-action-" + this.value).eq(0);
				$actionSelect.val($first.val());
				if (this.value === "null") {
					$actionSelect.hide();
				} else {
					$actionSelect.show();
				}
				that.adjustAction($actionSelect);


			});
			$actionSelect.change(function () {
				that.adjustAction($(this));
			});
			this.actionPreset($actionType, $actionSelect);

		},
		adjustAction: function ($action) {
			this.connectDom();
			var $img = this.$el.find("img").eq(0);
			var type = $action.attr("data-action-type");
			if ($img.parent().is("a")) {
				$img.unwrap();
			}
			switch (type) {
				case "null":
					//unwrap

					break;
				case "lightbox":
					//wrap
					if (!$img.parent().is("a")) {
						$img.wrap("<a href='#" + $action.val() + "' data-lom-lbx='wb-lbx' onclick='return false;'></a>");

					} else {
						$img.parent("a").attr("data-lom-lbx", "wb-lbx");
					}
					break;
				case "navigate":
					//wrap
					if (!$img.parent().is("a")) {
						$img.wrap("<a href='#' onclick=\"fNav('" + $action.val() + "');return false;\"></a>");
					} else {
						//$img.addClass("wb-lbx");
					}
					break;
			}

			this.storeValue();

		},
		actionPreset: function ($type, $action) {
			var $img = this.$el.find("img");
			if (!$img.parent().is("a")) {
				$type.val("null");
				$action.val("null");
				return false;
			} else {
				if ($img.parent().attr("data-lom-lbx") === "wb-lbx") {
					$type.val("lightbox");
					$action.attr("data-action-type", "lightbox");
					$action.show();
					$action.val($img.parent().attr("href").substring(1));
				}
			}


		},
		/*---------------------------------------------------------------------------------------------
		-------------------------
		---------------------------------------------------------------------------------------------*/

		//-------------------------
		doSomething: function () {


		}
	});
});
