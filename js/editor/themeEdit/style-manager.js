define([
	'jquery',
	'labels',
	'utils',
	'modules/BaseModule',
	'./../themeEdit/ribbonObj',
	'./../themeEdit/iconObj',
	'./../themeEdit/gridObj'

], function ($, labels, Utils, BaseModule, RibbonObj, IconObj, GridObj) {
	'use strict';

	return BaseModule.extend({
		initialize: function (options) {
			var that = this;
			that = that;

			this.parent = options.parent; //masterStructure.editor
			this.element = this.parent; // parent element
			this.editor = this.parent.editor; //editor
			this.root = this.editor; //editor again

			this.iconList = []; //array of icons
			this.icons = []; //icons by name

			this.ribbonList = []; //array of ribbons
			this.ribbons = []; //ribbons by name

			this.gridList = []; //array of grids (bootstrap)
			this.grids = []; //grids by name

			this.findByClass = []; // another  way of finding things... 

			//references to current choices
			this.currentRibbon = null;
			this.currentIcon = null;
			this.currentGrid = null;

			this.labels = options.labels;//not implemented yet


		},
		/*---------------------------------------------------------------------------------------------
				-------------------------DOM INIT
		---------------------------------------------------------------------------------------------*/
		/* ************************************
		* INIT LIGHTBOX
		* everything that happens after MAGNIFIC POPUP
		* returns nothing
		* ***********************************/
		initLbx: function () {
			var that = this;
			this.root.lbxController.pop({
				obj: this,
				action: this.setLbx,
				title: "Style Editor",
				file: "templates/LOM-Elements/style_en.html"
			});
			/*
							//POP IT
							$.magnificPopup.open({
								items: {
									src: this.root.relPath + 'templates/LOM-Elements/style_en.html'
								},
								type: 'ajax',
								removalDelay: 500,
								callbacks: {
									beforeOpen: function () {
										this.st.mainClass = "mfp-zoom-in";
									},
									ajaxContentAdded: function () {
										that.$body = $("#LOM_style_manager"); //LBX body
										$(this.content).children(".modal-header").children(".modal-title").html("Style Editor"); //TITLE
										that.setLbx($(this.content));//initiate the lighbox content
									}
								},
								midClick: true
							});
			
			*/
		},
		/* ************************************
		 * SET LIGHTBOX
		 * initialize the lbx body content
		 * returns nothing
		 * ***********************************/
		setLbx: function ($lbx, params) {
			var that = params.obj;
			that.$body = $lbx;
			that.initResult(); // setup the results box
			that.initStyles(); //setup the different styles (ribbons, icons, grids)
			that.$body.children("button.ico-SNAP-save").click(function () {
				that.applyChanges(); // SAVE / apply the changes to the actual DOM
			})
		},
		/* ************************************
		 * INIT STYLES
		 * initialize the ribbon, icon, grid BUTTONS
		 * returns nothing
		 * ***********************************/
		initStyles: function () {
			var i; //for looping
			// ini the style $objects
			this.$ribbonList = this.$body.children(".LOM-style-ribbon").children(".style-ribbon");
			this.$iconList = this.$body.children(".LOM-style-ribbon").children(".style-icon").children(".icon-list");
			this.$gridList = this.$body.children(".LOM-style-grid").children(".grid-list");
			var newStyleItem;

			this.initRibbons(this.$ribbonList.children("button"));
			this.initIcons(this.$iconList.children("button"));
			this.initGrids(this.$gridList.children("button"))



			//if NO ICONS
			if (this.currentIcon === null) {
				this.icons["null"].isSelected();
			} else {
				this.currentIcon.isSelected();
			}
			//if NO RIBBON
			if (this.currentRibbon === null) {
				this.ribbons["null"].isSelected();
			} else {
				this.currentRibbon.isSelected();
			}
			//SELECT GRID
			//if NO GRID
			if (this.currentGrid === null) {
				//console.log(this.currentGrid);

				this.gridList[0].isSelected();
			} else {
				//console.log(this.currentGrid);
				this.currentGrid.isSelected();
			}


		},



		// ---------------init the result box
		initResult: function () {
			//setup the $object
			this.$result = this.$body.children(".LOM-style-result").children("div").children(".style-result-box")
			//go get the original HTML
			var $element = this.parent.getThisBkp(this.parent.getBkp());
			//inject into LBX dom
			this.$result.html($element.html());
		},
		/*---------------------------------------------------------------------------------------------
				-------------------------JS OBJ INIT
		---------------------------------------------------------------------------------------------*/
		initRibbons: function ($buttons) {
			var newStyleItem;
			// -------- setup the ribbons
			for (var i = 0; i < $buttons.length; i++) {
				//don'T init twice
				if (typeof this.ribbons[$buttons.eq(i).attr("data-style-type")] === "undefined") {
					// Ribbon Object
					newStyleItem = new RibbonObj({
						parent: this,
						labels: this.labels,
						$el: $buttons.eq(i)
					});
					//update the arrays
					this.ribbons[newStyleItem.name] = newStyleItem;
					this.ribbonList[this.ribbonList.length] = newStyleItem;
					this.findByClass[newStyleItem.styleClass] = newStyleItem;
				} else {
					newStyleItem = this.ribbons[$buttons.eq(i).attr("data-style-type")]
					newStyleItem.initBtn($buttons.eq(i));
				}

				if (this.element.$el.hasClass(newStyleItem.styleClass)) {
					this.currentRibbon = newStyleItem;
				}
			}

		},

		initIcons: function ($buttons) {
			var newStyleItem;

			// -------- setup the Icons
			for (var i = 0; i < $buttons.length; i++) {
				//don'T init twice
				if (typeof this.icons[$buttons.eq(i).attr("data-style-icon")] === "undefined") {
					// Icon Object
					newStyleItem = new IconObj({
						parent: this,
						labels: this.labels,
						$el: $buttons.eq(i)
					});
					//setup arrays
					this.icons[newStyleItem.name] = newStyleItem;
					this.iconList[this.iconList.length] = newStyleItem;
					this.findByClass[newStyleItem.styleClass] = newStyleItem;

				} else {
					newStyleItem = this.icons[$buttons.eq(i).attr("data-style-icon")];
				}

				if (this.element.$el.hasClass(newStyleItem.styleClass)) {
					this.currentIcon = newStyleItem;
				}

			}

		},
		initGrids: function ($buttons) {
			var newStyleItem;
			// -------- setup the grids
			for (var i = 0; i < $buttons.length; i++) {
				//don'T init twice
				//console.log(this.grids[$buttons.text()])
				if (typeof this.grids[$buttons.text()] === "undefined") {
					// Grid Object
					newStyleItem = new GridObj({
						parent: this,
						labels: this.labels,
						$el: $buttons.eq(i)
					});
					//setup the arrays
					this.gridList[this.gridList.length] = newStyleItem;
					this.findByClass[newStyleItem.styleClass] = newStyleItem;

				} else {
					newStyleItem = this.icons[$buttons.eq(i).text()];
				}
				if (this.element.$el.hasClass(newStyleItem.styleClass)) {
					this.currentGrid = newStyleItem;
				}
			}

		},


		/*---------------------------------------------------------------------------------------------
				-------------------------CLEAN UP
		---------------------------------------------------------------------------------------------*/
		/* ************************************
		 * STRIP STYLES
		 * STRIPS the former styles
		 * receives an $object, removes its classes
		 * returns nothing
		 * ***********************************/
		stripRibbons: function ($obj) {
			for (var i = 0; i < this.ribbonList.length; i++) {
				$obj.removeClass(this.ribbonList[i].styleClass);
			}
		},
		stripIcons: function ($obj) {
			for (var i = 0; i < this.iconList.length; i++) {
				$obj.removeClass(this.iconList[i].styleClass);
			}
		},
		stripGrids: function ($obj) {
			for (var i = 0; i < this.gridList.length; i++) {
				$obj.removeClass(this.gridList[i].styleClass);
			}
		},

		stripAll: function ($obj) {
			this.stripRibbons($obj);
			this.stripIcons($obj);
			this.stripGrids($obj);

		},
		/*---------------------------------------------------------------------------------------------
				-------------------------NEW STYLE
		---------------------------------------------------------------------------------------------*/
		/* ************************************
		 * APPLY CHANGES
		 * grabs the current styles and send them to DOM
		 * returns nothing
		 * ***********************************/
		applyChanges: function () {
			//strip everything that'S style-related
			this.stripAll(this.parent.$el);
			//get the DOM value from the original HTML
			var $bkp = this.parent.getBkp();
			var $element = this.parent.getThisBkp($bkp);
			//clean up the original HTML
			this.stripAll($element);

			//empty values
			var ribbonClass = (this.currentRibbon === null || this.currentRibbon.styleClass === "LOM-null") ? "" : this.currentRibbon.styleClass;
			var iconClass = (this.currentIcon === null || ribbonClass === "") ? "" : this.currentIcon.styleClass;
			var gridClass = (this.currentGrid === null || this.currentGrid.name === "None") ? "" : this.currentGrid.styleClass;
			//set the back end file (originalHtml) and then the interface
			$element
				.addClass(ribbonClass)
				.addClass(iconClass)
				.addClass(gridClass);
			this.parent.$el
				.addClass(ribbonClass)
				.addClass(iconClass)
				.addClass(gridClass);
			//ICONBOX REALLY needs a placeholder h2
			if (this.$result.find(".LOM-iconbox-warning").length > 0) {
				var h2Placeholder = "<h2>Heading Placeholder</h2>";
				$element.find(".LOM-editable").prepend(h2Placeholder);
				this.parent.$el.find(".cke_editable").prepend(h2Placeholder)
			}
			//save
			this.parent.saveBkp($bkp);
			//close popup;
			$.magnificPopup.close();

		}


	});
});

