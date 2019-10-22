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

	   customRemoveBeforeSave:function(){
		   this.$el.children("summary").removeClass("wb-details-inited");
		   return false;
	   },		
	   initDom:function(){

		   this.$el.removeAttr("open");
		   return false;
	   },		
	   connectDom:function(){
		   this.$el=$("#"+this.id);
		   this.$holder=this.getHolder();
		   this.hoverEffect();
	   },	
	   firstInitCustom:function(){
		   var label=this.labels.default.details;
		   if(this.parent.subtype==="tabs"){
			   label=this.labels.default.tabs;
		   }
		   this.$el.find(".LOM-editable").html(label);
		   return false;
	   },	

		//-------------------------
		hoverEffect:function(){
			this.$el.hover(
			  function() {
				 if(typeof $(this).attr("open")=== "undefined"){
				  $(this).attr("open", "").addClass("LOM-fake-open");
				 }
			  }, function() {
				  if($(this).hasClass("LOM-fake-open")){
				  
					  $(this).removeAttr("open").removeClass("LOM-fake-open");
				  }
			  }
				
			);
			this.$el.click(function(e){
				if($(this).hasClass("LOM-fake-open")){
					if(!$(e.target).hasClass("cke_editable")){
					$(this).removeClass("LOM-fake-open");
					e.preventDefault();
					}
				}

			});
			
		}
	});
});