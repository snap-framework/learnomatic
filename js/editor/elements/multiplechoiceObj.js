define([
	
    'jquery',
	'settings-core',
	'./../pageEdit/elementClass'
], function($, CoreSettings, ElementClass) {
	'use strict';
	return ElementClass.extend({
		initialize: function(options) {
			
			this.options=options;
			this.autoLoaded=["radiobtn", "radiobtn", "radiobtn"];
			this.autoAddElement="radiobtn";
			this.autoAddButton=false;
		},

		
	   changePermissions:function(){
		   this.permissions.editButtons.add=true;
		   this.permissions.editButtons.config=true;
		   this.permissions.subElements.radiobtn=true;
	   },
		

	   initDom:function(){
		   var $ex;
		   $ex=this.$el.find(".qs-question").attr("id", "act_"+this.id);
	   },		
		
		
/*---------------------------------------------------------------------------------------------
-------------------------CONFIGURATION
---------------------------------------------------------------------------------------------*/			
	   changeDefaultLbxSettings:function(params){
		   params.title="Question Configuration";
		   params.saveBtn="save the whole thing";
		 return params;
	   },
		changeDefaultConfigSettings:function(params){
		   params.$paramTarget=this.$el.find(".qs-answers");
			params.files=["../../templates/LOM-Elements/element_config_radio.html"];
			params.attributes= {				   "data-random-answers": [
					   "True",
					   "False"]};
			return params;
			
		},		
	   initializeConfigFiles:function(params){
		   this.getQuestionList(params);
	   },	
	   submitCustomConfig:function(params){
   			this.submitCorrectAnswer($("#"+params.lbx.targetId).find("input[name=ra]:checked").attr("data-id"));
		   
		   	return params;
	   },
		
		//---------------------CORRECT ANSWER---------------------------

		getQuestionList:function(params){
			this.connectDom();
		   var $target=$("#"+params.lbx.targetId);
			var radio;
			var text;
			var isRight;
			for (var i=0;i<this.elements.length;i++){
				radio=this.elements[i];
				text=radio.$el.children(".LOM-editable").text();
				isRight=radio.$el.children("input").hasClass("ra");
				$target.append("<label class='qs-answer'><input type=radio name=ra data-id='"+radio.id+"'>"+text+"</label>");
				if(isRight){$target.find("[data-id='"+radio.id+"']").prop("checked", true);}
			}
			
		},
		submitCorrectAnswer:function(answerId){
			
			var $radio;
			var radioId;

			for(var i=0;i<this.elements.length;i++){
				$radio= this.elements[i].$el.children("input");
				radioId=$radio.attr("id");
				radioId=radioId.replace("answer_", "");
				
				this.elements[i].setCorrect(answerId === radioId);

				
				//save the html
				//this.elements[i].storeValue();
			}
			this.storeValue();
			this.editor.savePage();

		},
		
		
		//------------------------------------------------		


	   postCleanup:function(){
		   
		   this.$el.find(".qs-submit").removeAttr("disabled").removeClass("qs-disabled");
	   },
		
		//-------------------------
		doSomething:function(){
			
			
		}
	});
});