//consider replacing this with PHP?

define([
    'jquery',
	'settings-core',
	'modules/BaseModule',
	'./../elements/textObj',
	'./../elements/imageObj',
	'./../elements/customObj',
	'./../elements/accordionObj',
	'./../elements/detailsObj',
	'./../elements/activityObj',
	'./../elements/examObj',
	'./../elements/multiplechoiceObj',
	'./../elements/radiobtnObj',
	'./../elements/checkboxObj'
], function($, CoreSettings, BaseClass, ElementTextObj,ElementImageObj,ElementCustomObj,ElementAccordionObj,ElementDetailsObj, ElementActivityObj, ElementExamObj, ElementMultiplechoiceObj, ElementRadiobtnObj, ElementCheckboxObj) {
	'use strict';
	return BaseClass.extend({
		initialize: function(options) {
		
			this.options=options;
			this.parent=options.parent;
			//options.parent=this;
			
			//detect element type. if one is passed through
			if(typeof options.type !== "undefined"){
				this.elementType=options.type;
			}else if(typeof options.$el !=="undefined"){
				
				this.elementType=(typeof options.$el.attr("data-lom-element") !=="undefined")?options.$el.attr("data-lom-element"):"default";
			}else{
				this.elementType="default";
			}
			
			//decide which object type
			var newObj;
				switch(this.elementType) {
				  	case "text":
						newObj=new ElementTextObj(options);
						break;
				  	case "image":
						newObj=new ElementImageObj(options);
						break;
					case "custom":
						newObj=new ElementCustomObj(options);
						break;
					case "accordion":
						newObj=new ElementAccordionObj(options);
						break;
					case "details":
						newObj=new ElementDetailsObj(options);
						break;
					case "activity":
						newObj=new ElementActivityObj(options);
						break;
					/*
					case "exam":
						newObj=new ElementExamObj(options);
						break;
					*/
					case "multiplechoice":
						newObj=new ElementMultiplechoiceObj(options);
						break;
					case "radiobtn":
						newObj=new ElementRadiobtnObj(options);
						break;
					case "checkbox":
						newObj=new ElementCheckboxObj(options);
						break;
					default:
						//default

						break;
				}

				this.parent.elements[this.parent.elements.length] = newObj;
			
		
		}
	});
});