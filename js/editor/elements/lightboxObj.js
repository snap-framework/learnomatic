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
		initDom:function(){
			this.$el.children(".modal-content").children(".modal-header").prepend("<div class='LOM-delete-on-save LOM-popup-ID'>"+this.id+"_lbx</div>");
		},

	   postCleanup:function(){
		   //console.log
		   var $lbx=this.$el.children(".modal-dialog").eq(0);
		   var lbxId=this.id+"_lbx";
		   $lbx.attr("id", lbxId);
		   var $ref=$("a[href='#"+lbxId+"']");
		   $ref.removeClass("wb-lbx-inited");
		   $ref.addClass("wb-lbx");
	   }		
	});
});