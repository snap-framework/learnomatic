//consider replacing this with PHP?

define([
	'jquery',
	'settings-core',
	'modules/BaseModule',
	'./../elements/textObj',
	'./../elements/containerObj',
	'./../elements/faqObj',
	'./../elements/imageObj',
	'./../elements/customObj',
	'./../elements/accordionObj',
	'./../elements/btngroupObj',
	'./../elements/buttonObj',
	'./../elements/detailsObj',
	'./../elements/activityObj',
	'./../elements/multiplechoiceObj',
	'./../elements/radiobtnObj',
	'./../elements/lightboxObj',
	'./../elements/videoObj',
	'./../elements/audioObj',
	'./../elements/carouselObj',
	'./../elements/panelObj'
], function ($, CoreSettings, BaseClass, ElementTextObj, ElementContainerObj, ElementFaqObj, ElementImageObj, ElementCustomObj, ElementAccordionObj, ElementBtngroupObj, ElementButtonObj, ElementDetailsObj, ElementActivityObj, ElementMultiplechoiceObj, ElementRadiobtnObj, ElementLightboxObj, ElementVideoObj, ElementAudioObj, ElementCarouselObj, ElementPanelObj) {
	'use strict';
	return BaseClass.extend({
		initialize: function (options) {

			this.options = options;
			this.parent = options.parent;
			//options.parent=this;

			//detect element type. if one is passed through
			if (typeof options.type !== "undefined") {
				this.elementType = options.type;
			} else if (typeof options.$el !== "undefined") {
				this.elementType = (typeof options.$el.attr("data-lom-element") !== "undefined") ? options.$el.attr("data-lom-element") : "default";
				if (typeof options.$el.attr("data-lom-subtype") !== "undefined") {
					options.params = {
						subtype: options.$el.attr("data-lom-subtype")
					};
				}
			} else {
				this.elementType = "default";
			}

			//decide which object type
			var newObj;
			switch (this.elementType) {
				case "text":
					newObj = new ElementTextObj(options);
					break;
				case "container":
					newObj = new ElementContainerObj(options);
					break;
				case "panel":

					newObj = new ElementPanelObj(options);
					break;
				case "image":
					newObj = new ElementImageObj(options);
					break;
				case "custom":
					newObj = new ElementCustomObj(options);
					break;
				case "html":
					options.type = "text";
					options.params = {
						"subtype": "html"
					};
					newObj = new ElementTextObj(options);
					break;
				case "faq":
					newObj = new ElementFaqObj(options);
					break;
				case "accordion":
					newObj = new ElementAccordionObj(options);
					break;
				case "btngroup":
					newObj = new ElementBtngroupObj(options);
					break;
				case "button":
					newObj = new ElementButtonObj(options);
					break;
				case "details":
					newObj = new ElementDetailsObj(options);
					break;
				case "carousel":
					newObj = new ElementCarouselObj(options);
					break;
				case "activity":
					newObj = new ElementActivityObj(options);
					break;
				case "multiplechoice":
					newObj = new ElementMultiplechoiceObj(options);
					break;
				case "radiobtn":
					newObj = new ElementRadiobtnObj(options);
					break;
				case "checkbox":
					options.type = "radiobtn";
					options.params = {
						"subtype": "checkbox"
					};
					//console.log(params)
					newObj = new ElementRadiobtnObj(options);
					break;
				case "lightbox":
					newObj = new ElementLightboxObj(options);
					break;
				case "video":
					newObj = new ElementVideoObj(options);
					break;
				case "audio":
					newObj = new ElementAudioObj(options);
					break;
				default:
					//default

					break;
			}

			this.parent.elements[this.parent.elements.length] = newObj;


		}
	});
});