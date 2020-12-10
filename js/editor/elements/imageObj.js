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
			this.folder = "content/medias/images/";
		},
		changePermissions: function () {
			this.permissions.editButtons.add = false;
			this.permissions.editButtons.classPicker = true;
			this.permissions.editButtons.config = true;

			if ($("#" + this.id).find(".LOM-element[data-lom-element=\"details\"][data-lom-subtype=\"graphDesc\"]").length) {
				this.permissions.subElements.details = true;
				this.hasGraphDesc = true;
			}
		},

		setLabels: function () {
			this.typeName = this.labels.type.image;
			this.setLabelsDone = true;
			return false;
		},

		initDom: function () {
			var that = this;

			this.$el.find("img").click(function () {
				that.configClicked();

				return false;
			});
		},

		customAfterLoad: function () {
			if (this.hasGraphDesc) {
				this.$el.find(".LOM-holder .LOM-add-element").hide();
			}
		},

		/*---------------------------------------------------------------------------------------------
		-------------------------CONFIGURATION
		---------------------------------------------------------------------------------------------*/
		changeDefaultLbxSettings: function (params) {
			params.title = (Utils.lang === "en") ? "Image Configuration" : "Configuration de l'image";
			return params;
		},
		changeDefaultConfigSettings: function (params) {

			params.$paramTarget = this.$el.find("img");

			params.selector = "img";
			params.attributes = { "alt": "" };
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
				that.loadGraphicDesc(params)
				that.loadGallery(data, params);
				that.configClickable();


			}).fail(function () {
				alert("Posting failed while loading custom config.");
			});
		},

		/*---------------------------------------------------------------------------------------------
		-------------------------IMAGE  GALLERY
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
					$gallery.append("<div class='row' style='margin-left: -15px; margin-right: -15px;'></div>");
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
			$gallery.append("<div class='row' style='margin-left: -15px; margin-right: -15px;'><div class='col-md-3' id='LOM-img-upload'></div></div>");

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
				var save = (Utils.lang === "en") ? "Save Configuration" : "Sauvegarder la configuration"
				popParams.lbx = that.defaultLbxSettings("Configuration", "config", save);
				popParams.config = that.configLbxSettings();
				that.submitConfig(popParams);

			});

		},

		changeImage: function (filename) {
			var $bkp = this.getBkp();

			$bkp.find("#" + this.id).find("img").attr("src", filename);
			this.$el.find("img").attr("src", filename);

			this.saveBkp($bkp);
			this.closeLbx();

		},

		createUpload: function ($container) {
			var that = this;
			$container.append("<h3>" + ((Utils.lang === "en") ? "Upload Image" : "Téléverser une image") + "</h3>");
			$container.append("<label>" + ((Utils.lang === "en") ? "Select image (max 500kb file size)" : "Sélectionner une image (taille maximale&nbsp;: 500Ko)") + " <input type='file' name='file' id='file' /></label><span id='uploaded_image'></span>");
			$container.append("<button class='snap-sm ico-LOM-upload'>" + ((Utils.lang === "en") ? "Upload" : "Téléverser") + "</button");
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

							}


						});
					}


				}
			});
		},

		/*---------------------------------------------------------------------------------------------
		-------------------------GRAPHIC DESCRIPTION
		---------------------------------------------------------------------------------------------*/

		loadGraphicDesc: function (params) {
			var obj = params.lbx.obj;
			var $img = params.config.$paramTarget;
			var $lbx = $("#" + params.lbx.targetId);
			var $altInput = $lbx.find("input[name=\"alt\"]");

			$lbx.prepend("<div class=\"row\" style=\"margin-left: -15px; margin-right: -15px;\"></div>");
			var $row = $lbx.find(".row").first();

			$row.append("<div class=\"col-md-12\"></div>");
			var $col = $row.find(".col-md-12").first();

			$col.append("<label>" + ((Utils.lang === "en") ? "Add a long description box?" : "Ajouter une boîte de description longue?") + " <input type=\"checkbox\" id=\"graph-desc\" name=\"graph-desc\"></label>");

			if (this.hasGraphDesc) {
				$col.find("#graph-desc").prop("checked", true);
				$altInput.attr("disabled", true);
			}

			var that = this;
			$col.find("#graph-desc").change(function () {
				if ($(this).is(":checked")) {
					that.addGraphDesc(obj, $img, $lbx, $altInput, $row, $col);
				}
				else {
					that.removeGraphDesc(obj, $img, $lbx, $altInput, $row, $col);
				}
			});
		},

		addGraphDesc: function (obj, $img, $lbx, $altInput, $row, $col) {
			//Disable alt field and add value
			$altInput.attr("disabled", true);
			$altInput.val(((Utils.lang === "en") ? "Long description follows" : "La description longue suit"));

			//Add the accordion element
			this.permissions.subElements.details = true;
			this.hasGraphDesc = true;

			this.editor.targetParent = obj;
			this.editor.$target = $img.closest(".LOM-element").children(".LOM-holder");
			this.editor.createElement("details", $.parseJSON('{"subtype": "graphDesc"}'), false);
		},

		removeGraphDesc: function (obj, $img, $lbx, $altInput, $row, $col) {
			//Enable alt field and remove value
			$altInput.attr("disabled", false);
			$altInput.val("");

			//Remove the accordion element
			for (var i = 0; i < obj.elements.length; i++) {
				if (obj.elements[i].type == "details" && obj.elements[i].subtype == "graphDesc") {
					obj.elements[i].autoDelete();
				}
			}
			this.hasGraphDesc = false;
		},

		/*---------------------------------------------------------------------------------------------
		-------------------------CLICKABLE
		---------------------------------------------------------------------------------------------*/

		configClickable: function () {
			var that = this;
			var $body = $("#custom_lbx");
			$body.append("<div id='LOM-clickable-action-container'></div>");
			var $action = $("#LOM-clickable-action-container");
			$action.append("<h3>" + ((Utils.lang === "en") ? "Clickable Actions" : "Actions au clic") + "</h3>");
			$action.append("<label>" + ((Utils.lang === "en") ? "Action Type" : "Type d'action") + ": <select id='LOM-clickable-action-type' class='LOM-action-type'></select></label>");
			$action.append("&nbsp;<label>Action: <select id='LOM-clickable-action' class='LOM-action'></select></label>");

			var $actionType = $("#LOM-clickable-action-type");
			var $actionSelect = $("#LOM-clickable-action");
			$actionSelect.hide();
			$actionType.append("<option value='null'>" + ((Utils.lang === "en") ? "No action" : "Aucune action") + "</option>");
			$actionSelect.append("<option value='null' class='LOM-action-null'>n/a</option>");
			var i = 0;

			//LIGHTBOXES
			var listLightbox = this.editor.getElementsByType("lightbox");
			if (listLightbox.length > 0) {
				$actionType.append("<option value='lightbox'>" + ((Utils.lang === "en") ? "Open a lightbox" : "Ouvrir une fenêtre contextuelle") + "</option>");

				for (i = 0; i < listLightbox.length; i++) {
					var lbxId = listLightbox[i].id + "_lbx";
					$actionSelect.append("<option class='LOM-action-lightbox' value='" + lbxId + "'>Lightbox ID " + lbxId + "</option>");
				}
			}

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
			var $bkp = this.getBkp();
			//this.connectDom();

			var $img = this.$el.find("img").eq(0);
			var $bkpImg = $bkp.find("#" + this.id).find("img").eq(0);

			var type = $action.attr("data-action-type");
			if ($img.parent().is("a")) {
				$img.unwrap();
				$bkpImg.unwrap();
			}
			switch (type) {
				case "null":
					//unwrap

					break;
				case "lightbox":
					//wrap
					if (!$img.parent().is("a")) {
						$img.wrap("<a href='#" + $action.val() + "' class='LOM-img-lbx' onclick='$.magnificPopup.open({ items: { src: \"#" + $action.val() + "\" }, type: \"inline\", removalDelay: 500, callbacks: { beforeOpen: function() { this.st.mainClass = \"mfp-zoom-in\"; } }, midClick: true }, 0);'></a>")
						$bkpImg.wrap("<a href='#" + $action.val() + "' class='LOM-img-lbx' onclick='$.magnificPopup.open({ items: { src: \"#" + $action.val() + "\" }, type: \"inline\", removalDelay: 500, callbacks: { beforeOpen: function() { this.st.mainClass = \"mfp-zoom-in\"; } }, midClick: true }, 0);'></a>")
					} else {
						$img.parent("a").addClass("LOM-img-lbx").attr("href", "#" + $action.val()).attr("onclick", "$.magnificPopup.open({ items: { src: '#" + $action.val() + "' }, type: 'inline', removalDelay: 500, callbacks: { beforeOpen: function() { this.st.mainClass = 'mfp-zoom-in'; } }, midClick: true }, 0);");
						$bkpImg.parent("a").addClass("LOM-img-lbx").attr("href", "#" + $action.val()).attr("onclick", "$.magnificPopup.open({ items: { src: '#" + $action.val() + "' }, type: 'inline', removalDelay: 500, callbacks: { beforeOpen: function() { this.st.mainClass = 'mfp-zoom-in'; } }, midClick: true }, 0);");
					}
					break;
				case "navigate":
					//wrap
					if (!$img.parent().is("a")) {
						$img.wrap("<a href='#' onclick=\"fNav('" + $action.val() + "');return false;\"></a>");
						$bkpImg.wrap("<a href='#' onclick=\"fNav('" + $action.val() + "');return false;\"></a>");
					} else {
						//$img.addClass("wb-lbx");
					}
					break;
			}

			this.saveBkp($bkp);

		},
		actionPreset: function ($type, $action) {
			var $img = this.$el.find("img");
			if (!$img.parent().is("a")) {
				$type.val("null");
				$action.val("null");
				return false;
			} else {
				if ($img.parent().hasClass("LOM-img-lbx")) {
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
