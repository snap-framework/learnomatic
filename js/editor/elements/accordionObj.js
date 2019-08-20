define([
	
    'jquery',
	'settings-core',
	'./../pageEdit/elementClass'
], function($, CoreSettings, ElementClass) {
	'use strict';
	return ElementClass.extend({
		initialize: function(options) {
			this.options=options;
			this.autoLoaded=["details", "details", "details"];
			this.autoAddElement="details";
			this.autoAddButton=false;
		},		
	   changePermissions:function(){
		   this.permissions.editButtons.add=true;
		   this.permissions.subElements.details=true;
	   },

	   startSort:function(){
		   this.storeElementsValues();
	   },

		
		
		//-------------------------
		doSomething:function(){
			
			
		}
	});
});