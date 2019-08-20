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
		   this.permissions.editButtons.config=false;
		   this.permissions.subElements={
				   text:false,
				   image : false,
				   custom : false,
				   details : false
			   };
	   },
		autoEdit:function(){
			var $editView=this.$el.children(".LOM-edit-view");
			if ($editView.children("button.ico-SNAP-edit").length>0){
				//activate this edit
				this.edits[0].activate();
				this.$el.addClass("LOM-editing");
				$editView.children("button.ico-SNAP-edit").addClass("ico-SNAP-save").removeClass("ico-SNAP-edit");
			}else{
				$editView.children("button.ico-SNAP-save").addClass("ico-SNAP-edit").removeClass("ico-SNAP-save");
				this.edits[0].deactivate();
				this.$el.removeClass("LOM-editing");
				
			}
		},
		
		//-------------------------
		doSomething:function(){
			
			
		}
	});
});