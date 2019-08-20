define([
	
    'jquery',
	'settings-core',
	'./../pageEdit/elementClass'
], function($, CoreSettings, ElementClass) {
	'use strict';
	return ElementClass.extend({
		initialize: function(options) {
			
			this.options=options;
			

		},
	   changePermissions:function(){
		   this.permissions.editButtons.add=true;
		   this.permissions.editButtons.config=false;
		   this.permissions.subElements={};
	   },
		
		//-------------------------
		doSomething:function(){
			
			
		}
	});
});