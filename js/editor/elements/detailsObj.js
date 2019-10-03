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
		   this.permissions.editButtons.add=false;

		   this.permissions.subElements.text=true;
		   this.permissions.subElements.image=true;
		   this.permissions.subElements.custom=true;
		   
		   
	   },
	   postCleanup:function(){
		   console.log(this.$el);
		   this.$el.children("details").children("summary").removeClass("wb-details-inited");
		   //var $radio=this.$el.children("input");
		   //$radio.removeAttr("disabled");
		   

		   
	   },		
	   initDom:function(){
		   this.$el.children("details").removeAttr("open");
		   return false;
	   },		
		//-------------------------
		doSomething:function(){
			
			
		}
	});
});