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
		   this.permissions.subElements={};
	   },
		
		initDom:function(){
			switch (this.subtype){
			   case "checkbox":
				   this.domCheckbox();
				   break;
			   default:
				   this.domRadio();
								}			

		   return false;
	   	},	
		
	   postCleanup:function(){
		   
		   var $radio=this.$el.children("input");
		   $radio.removeAttr("disabled");
		   

		   
	   },		
		setRadioClick:function(){
			var that=this;
			var $radio=this.$el.children("input");
			$radio.click(function(){
				if($(".sortable-placeholder").length===0){
					//$(this).attr("checked", false);
					//$(this).prop("checked", false);
					that.parent.submitCorrectAnswer(that.id);
				}
			});
			
			
		},
		setCorrect:function(isCorrect){
			
			switch (this.subtype){
				case "checkbox":
					var $check=this.$el.children("input");
					
					if (isCorrect){
						if(!$check.hasClass("ra")){
							$check.removeClass("wa").addClass("ra");
							this.$el.attr("data-ra", "ra");
						}else{
							$check.removeClass("ra").addClass("wa");
							this.$el.attr("data-ra", "wa");
							
						}
					}else{
						
						if(!$check.hasClass("wa") && !$check.hasClass("ra")){
							$check.addClass("wa");
							this.$el.attr("data-ra", "wa");
						}
					}
					
					break;
				default:
					var correctClass=(isCorrect)?"ra":"wa";
					this.$el.children("input").removeClass("ra").removeClass("wa").addClass(correctClass);	
					this.$el.attr("data-ra", correctClass);
								
								}
			
			
			//this.$el.prop("checked", false);

			this.storeValue();
		},
		afterLoad:function(){
			this.setRadioClick();
		},
		
		/* ***********************************
		 * DOM
		 * ***********************************/
		domRadio:function(){
			var $radio;
			$radio=this.$el.children("input");
			$radio.attr("id", "answer_"+this.id);
			$radio.attr("name", "q-"+this.parent.id);
			
		},
		domCheckbox:function(){
			var $checkbox;
			$checkbox=this.$el.children("input");
			$checkbox.attr("id", "answer_"+this.id);
			$checkbox.attr("name", "q-"+this.parent.id);
			$checkbox.attr("type", "checkbox");
			
		},
		
		//-------------------------
		doSomething:function(){
			
			
		}
	});
});