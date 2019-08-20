define([
	
    'jquery',
	'labels',
	'settings-core',
	'modules/BaseModule'
], function($,labels, CoreSettings, BaseModule) {
	'use strict';

	return BaseModule.extend({
		initialize: function(options) {
			
			this.isFrame=true;
			this.id=options.id;
			this.class=options.class;
			this.parent=options.parent;
			this.editor=this.parent.parent;
			this.$el=options.$el;
			this.initialized=false;
			
			this.edits=[];//try to remove this
			
			this.isModified=null;
			
			this.elements=[];
			this.labels=options.labels;

			
			this.originalHtml=this.$el.html();
			this.newHtml=this.originalHtml;
			this.detectElements();
			this.verifyInit();

		},
		
		
		verifyInit:function(){
			var flag=true;
			
			if (!this.initialized){
				for (var i=0;i<this.elements.length;i++){
					flag=(!this.elements[i].isInitialized)?false:flag;
				}
				if(flag===true){
					this.initialized=true;
					this.doneInit();
				}
			}
			
		},
	   doneInit:function(){
		   
			this.addOnLoad();
	   },
		
/*---------------------------------------------------------------------------------------------
		-------------------------HOUSE KEEPING
---------------------------------------------------------------------------------------------*/		
		connectDom:function(){
			this.$el=$("#"+this.id);
		},
		refreshInfo:function(){
			this.originalHtml=this.newHtml;
			this.newHtml=this.$el.html();
			for (var i=0;i<this.elements.length;i++){
				this.elements[i].refreshInfo();
			}
			//this.detectEditBoxes();
		},

		resetAll:function(){
			this.refreshInfo();
			for (var i=0;i<this.elements.length;i++){
				this.elements[i].isModified=false;
				this.elements[i].resetAll();
			}
			this.addOnLoad();
		},
	   addOnLoad:function(){
		   //console.log("add buttons for "+this.id);
		   
		   this.autoAddBtn();
		   this.addSortable();
	   },

	   removeBeforeSave:function(){
		   this.$el.find(".LOM-delete-on-save").remove();
			for (var i=0;i<this.elements.length;i++){
				this.elements[i].removeBeforeSave();
			}
	   },
		
		autoAddBtn:function(){
			var that=this;
			var iconSize="";
			if(this.$el.find(".LOM-blankpage-layout").length===0){
				iconSize=(this.elements.length===0)?"lg":"md";
				this.$el.append("<button class=\"snap-"+iconSize+" align-left ico-LOM-plus LOM-delete-on-save\" title=\"Add An Element\">Add An Element</button>");
				this.$el.children(".ico-LOM-plus").click(function() {
					that.editor.popElementPicker(this);
					return false;
				});
				
				
			}
			
			
		},
		addSortable:function(){
			var that=this;
	

		   this.$el.sortable({
			  //axis: "y",
			   //helper:"clone",
			   handle:".LOM-ui-handle",
			   //containment: "parent",
			   cursor: "move",
			   items: ">.LOM-element",
			   opacity: 0.1,
			   revert: true,
			   placeholder: "sortable-placeholder",
			   tolerance: "pointer",
			   cursorAt: { left: 0, top: 0 },
			   connectWith: ".LOM-frame",
			   
			   classes: {
				"ui-sortable": "highlight"
			  	},
			
			  start: function(	 ) {
				  /*var startFrame=that;
				  event=event;
				  var item=ui.item;
				  
				  that.isModified=true;
				  */
				  
				  
			  },
			   stop: function(event, ui) {
				  event=event;
				  var item=ui.item;
				   var newFrame=that.parent.findFrame($(item).parent().attr("id"));
				   
				   //save
				   newFrame.detectElements();
				   that.detectElements();
				   that.refreshInfo();
				   that.editor.savePage();
			   }
						   
			});		   
		   
		   this.addHandle();

		},

	   addHandle:function(){
		   var title=this.labels.element.editview.move;
		   //var $element=this.$el.find(".LOM-element");
		   var $element=this.$el.children(".LOM-element");
		   for (var i=0;i<$element.length;i++){
			   if($element.eq(i).find("h1").length<=0){
				$element.eq(i).append("<div class='LOM-ui-handle LOM-delete-on-save'  title='"+title+"'></div>");
			   }
		   }
		  return false;
	   },		
/*---------------------------------------------------------------------------------------------
		-------------------------ELEMENTS
---------------------------------------------------------------------------------------------*/				
		detectElements:function(){
			//ONLY detect the elements that are directly under the frame.
			var $elements=this.$el.children(".LOM-element");
			for(var i=0;i<$elements.length;i++){
				
				this.createElement($elements.eq(i));
			}
		},
		/*
		 * create an element. blank ?
		 */
		createElement:function($element){
			var that=this;
			this.editor.objElement({parent:that, $el:$element});
		},
		blankElement:function($element){
			var that=this;
			this.editor.objElement({parent:that, $target:$element});
			
		},
		//whenever Add New Element is called, it'll need answers
		targetNewElement:function(){
			return this.$el;
		},
	   
	   addElement:function(){
		   	this.editor.prepareElement(this.$el);
			this.editor.createElement("default");
	   },
		destroy:function(){
			$("#"+this.id).remove();
			for(var i=0;i<this.elements.length;i++){
				this.elements[i].destroy();
			}
			//just some cleanup;
			this.originalHtml=null;
			this.newHtml=null;		
		},
/*---------------------------------------------------------------------------------------------
		-------------------------Manage Elements
---------------------------------------------------------------------------------------------*/	
		
		cleanElements:function(){
			for(var i=0;i<this.elements.length;i++){
				this.elements[i].cleanElements();
				
			}
		},
/*---------------------------------------------------------------------------------------------
		-------------------------CHANGING FRAME
---------------------------------------------------------------------------------------------*/	
		/*
		 * record what's currently in the frame.
		 */
		storeValue:function() {
			//lets take care of edits first
			this.editor.deactivateEditors();
			//lets take a look at whats in the page
			this.newHtml=this.$el.html();
			//is there a change?
			if(this.newHtml!==this.originalHtml){this.isModified=true;}

		},		

		loadClean: function() {
			this.connectDom();
			this.$el.html(this.newHtml);
			
		},


		/*
		 * 
		 */
		doSomethingElse: function() {

		}
	});
});