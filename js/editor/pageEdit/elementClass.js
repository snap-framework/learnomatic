define([
   'underscore',
   'jquery',
   'settings-core',
   'helpers/BaseClass',
	'utils',
	'./../pageEdit/editBoxObj'
], function(_, $, CoreSettings, BaseClass, Utils, EditBoxObj) {
   'use strict';

   // Usage: var Module = BaseModule.extend({});
   // ...
   // var myModule = new Module({options});


   return BaseClass.extend({
      //Base init.
      //This will be called *before* the init of the module extending this class
      //
      //Note: options here are attached from the Module instantiation. e.g.: new Module(options)
      __initialize: function(options) {
         var that = this;
         var args = arguments;
         //module id
         //creates a unique id for the module in case
         this.mid = _.uniqueId();
		  
		  //-------------------CONSTANTS-------------
		  this.isFrame=false;
		  this.idPrefix="LOM_el_";

         options = options || {};
         this.options = options;
		  this.params=options.params;
		  
		  
		  /*------------------------- properties ---------------------*/
		  this.isInitialized=false;
		  this.isFirstLoad=false;
		  this.id=(typeof options.id=== "undefined")?null:options.id;
		  this.$el=(typeof options.$el !== "undefined")?options.$el:null;	
		  this.type=(typeof options.type !=="undefined")?options.type:this.getType();
		  this.lang=Utils.lang;
		  
		  /*------------------------- customized params ---------------------*/
		  this.subtype=null;
		  this.getParams(options);
		  
		  //--------------relations
		  this.parent=options.parent;
		  this.parentFrame=this.findFrame();
		  this.layout=this.parentFrame.parent;
		  this.editor=this.parentFrame.parent.parent;
		  this.editor.elements[this.editor.elements.length]=this;
		  
		  this.elements=[];
		  this.autoLoaded=[];
		  
		  this.edits=[];
		  
		  //--------------content management
		  
		  this.$holder=null;
		  
		  //if it's nothing
		  this.$target=(typeof options.$target==="undefined")?null:options.$target;
		  
		  this.isModified=null;
		  this.originalHtml=null;
		  this.newHtml=null;
		  this.autoAddElement=null;
		  this.autoAddButton=true;
		  
		  this.labels=this.editor.labels.element;
		  this.typeName=this.labels.type.default;
		  
		  
		  this.creationMode=(typeof options.mode==="undefined")?"existing":options.mode;
		 this.switchedElement=options.switchedElement;
		  //----------------PERMISSIONS---------
		  this.permissions=(typeof options.permissions !=="undefined")?options.permissions:this.getPermissions();
		   this.changePermissions();		  
          //preload all subElements into editor.
		  this.preloadSubElements();

		  //----------------
		  that.initialize.apply(that, args);
		  
		  if(this.$el===null){
			  //lets create a new object ! 
			  this.initNew();
		  }else{
			  //$el exists, we're initializing
			  this.initExisting();
		  }

      },
/*---------------------------------------------------------------------------------------------
		-------------------------PERMISSIONS
---------------------------------------------------------------------------------------------*/		
	   getPermissions:function(){
		   var perms;
		   perms={
			   editButtons:{
				   add:false,
				   edit : false,
				   config : false,
				   delete : true
			   },
			   subElements:{
				   text:false,
				   image : false,
				   custom : false,
				   accordion : false,
				   details : false,
				   activity : false,
				   exam : false,
				   multiplechoice : false,
				   radiobtn : false,
				   checkbox : false,
				   lightbox : false
			   },
			   sortable:true,
			   functionalities:{
				   
			   }
		   };
		   return perms;
	   },
	   changePermissions:function(){
		   return this.permissions;
	   },	
/*---------------------------------------------------------------------------------------------
-------------------------PARAMETERS definition
---------------------------------------------------------------------------------------------*/			   
	   getParams:function(options){
		   if(typeof options.params !== "undefined"){
			   this.subtype=(typeof options.params.subtype !== "undefined")?options.params.subtype:null;
			  
		   }
		   
	   },
	   
/*---------------------------------------------------------------------------------------------
-------------------------INITIALIZE NEW
---------------------------------------------------------------------------------------------*/		   


	   //--------------------------INITIALIZE/BUILD a new ELEMENT---
	   initNew:function(){
		   //$el does NOT exist, we're creating from scratch
			this.id=this.generateId();
			this.fetchTemplate();
	   },
	   fetchTemplate:function(){
		   var that=this;
		   var template=this.editor.findElementTemplate(this.type);
		   
		   
		   
		   
		   if (template === false){
			   this.editor.addElementTemplate(this.type);
			   template=this.editor.findElementTemplate(this.type);
		   }
		   
		   
		   if(template === false){
			   $.get("../../templates/LOM-Elements/element_"+this.type+".html", function( data ) {
				   that.editor.subElements[that.type]= data;
				   
					that.finishInitNew(data);
				});
		   }else{
			   
			   that.finishInitNew(template);
		   }
		   
		   
	   },
	   finishInitNew:function(templateHtml){ 
		   //write HTML to page
		   this.initNewElementHtml(templateHtml);
		   if(this.creationMode==="add"){
			   var $children;
			   $children=this.$target.children(".LOM-element");
			   this.$el=$children.eq($children.length-1);
		   }else{
			   this.$el=this.$target;
			   
		   }
		   this.$el.attr("id", this.id);
		   //DONE, better check everything is initialized;
		   this.initExisting();
	   },
	   /*
	    * write the HTML to the page
		*/
	   initNewElementHtml:function(templateHtml){

			this.isFirstLoad=true;
			this.$target.append(templateHtml);

			if(this.subtype!== null){
				this.$target.children(".LOM-element").last().attr("data-LOM-subtype", this.subtype);

			}
				

	   },
	   
/*---------------------------------------------------------------------------------------------
-------------------------INITIALIZE EXISTING
---------------------------------------------------------------------------------------------*/	
	   initExisting:function(){
		//first, we need an ID
		  if(this.id===null){
			  if(this.creationMode==="existing"){
				  this.id=this.$el.attr("id");
			  }else{
			  //generate the ID
			  this.id=this.generateId();
			  }
		  }
		   this.refreshInfo();

		   //get subtype

		   if(this.subtype===null){
			  this.subtype=(typeof this.$el.attr("data-LOM-subtype") !== "undefined" )?this.$el.attr("data-LOM-subtype"):null;
		   }

			   
		   this.$holder=this.getHolder();
		   this.initDom();
		   //how about initialize sub elements?
		   this.initSubElements();
		   this.setLabels();
		   
		   this.verifyInit();
		   if(this.creationMode!== "existing"){
			   
			   
			   this.refreshInfo();
			   this.connectDom();
			   this.firstInitCustom();
			   this.creationMode="existing";
		   }
		   this.storeValue();
	   },
	   firstInitCustom:function(){
		   return false;
	   },
/*---------------------------------------------------------------------------------------------
-------------------------DOM attach and set
---------------------------------------------------------------------------------------------*/	
	   connectDom:function(){
		   this.$el=$("#"+this.id);
		   this.$holder=this.getHolder();
		   
	   },
	   getHolder:function(){
		   var that=this;
		   var $holder=this.$el.find(".LOM-holder").filter(function() {
				if ($(this).closest(".LOM-element").attr("id") === that.$el.attr("id")){
				   return true;
			   }else{
				   return false;
			   }
			   
		  });
		   if ($holder.length>0){
			   return $holder;
		   }else{
			   return this.$el;
		   }
	   },
	   /*
	    * editor calls this to aim at where to put the new element
	    */
	   getTarget:function(){
		   var target;
		   target=this.$holder;
		   return target;
	   },
	   getType:function(){
		   var type=null;
		   type=this.$el.attr("data-lom-element");
		   return type;
	   },
	   setAnimations:function(){
		   var that=this;
		   that=that;

		   this.$el.hide();
		   this.$el.slideDown("swing", function () {
		       // Animation complete.
		       //WHY STORE VALUE HERE???
		       //that.storeValue();
		       //that.editor.activateEdits();
			  });
	   },
/*---------------------------------------------------------------------------------------------
-------------------------POST INITIALIZATION
---------------------------------------------------------------------------------------------*/		   
	   verifyInit:function(){
		   
	       var counter = 0;

		   for(var i=0;i<this.elements.length;i++){
			   counter=(this.elements[i].isInitialized)?counter+1:counter;
		   }
		   if (counter===this.elements.length && !this.isInitialized){
			   this.isInitialized=true;
		   		this.parent.verifyInit();
			   	this.doneInit();
			   if(this.creationMode ==="existing"){
				   this.addOnLoad();
			   }
			   
		   }
	   },
	   initDom:function(){
		   return false;
	   },
	   setLabels:function(){
		   
		   return false;
	   },
	   doneInit:function(){
		   return false;
	   },


/*---------------------------------------------------------------------------------------------
		-------------------------House Keeping
---------------------------------------------------------------------------------------------*/	
		refreshInfo:function(){
			this.storeValue();
		
		   this.$el.attr("id", this.id);
			
			
		},	   
	   
	   storeValue:function(){
 			var storeEditsCheck;
		   //lets take a look at whats in the page

		   this.connectDom();
			this.newHtml=this.$el.html();
			//is there a change in edits?
		   storeEditsCheck=this.storeEdits();
		   
		   
			if(storeEditsCheck || this.newHtml!==this.originalHtml){
				this.originalHtml=this.newHtml;
				this.isModified=true;
				this.parent.storeValue();
			}else{
				//this is not inside an element
			}

	   },
	   storeElementsValues:function(){
		   var element;
		   for(var i=0;i<this.elements.length;i++){
			   element=this.elements[i];
			   element.storeValue();
		   }
	   },
	   storeEdits:function(){
		   var modified=false;
		   //lets take care of edits
			//this.editor.deactivateEditors();
			for(var i=0;i<this.edits.length;i++){
				modified=(this.edits[i].storeValue())?true:modified;
			}

			return modified;
	   },
	   activateEdits:function(){
			for(var i=0;i<this.edits.length;i++){
				this.edits[i].activate();
			}
	   },
	   deactivateEdits:function(){
		   for(var i=0;i<this.edits.length;i++){
					this.edits[i].deactivate();
			}
	   },

		resetAll:function(){
			//refresh??
			this.refreshInfo();
			for (var i=0;i<this.elements.length;i++){
				this.elements[i].isModified=false;
				this.elements[i].resetAll();
			}
			this.addOnLoad();

		},
	   addOnLoad:function(){
		   this.initEditBar();
		   this.autoAddBtn();
			if(this.permissions.sortable){
				this.addSortable();
			}	

		   this.customAfterLoad();

	   },
	   customAfterLoad:function(){
		   return false;
	   },
	   removeBeforeSave:function(){
		   for (var i=0;i<this.elements.length;i++){
			   this.elements[i].removeBeforeSave();
		   }
		   this.$el.children(".LOM-delete-on-save").remove();
		   this.customRemoveBeforeSave();
	   },
	   customRemoveBeforeSave:function(){
		   return false;
	   },
	   //this might not be used anymore
	   beforeUpdate:function(){
		   return false;
	   },
	   
/*---------------------------------------------------------------------------------------------
-------------------------EDIT BAR
---------------------------------------------------------------------------------------------*/	
	   initEditBar:function(){
		   this.changePermissions();
		   this.$el.children(".LOM-edit-view").remove();
		   this.$el.append("<div class=\"LOM-delete-on-save LOM-edit-view\" tabindex=\"-1\"><span class=\"LOM-label\"></span></div>");
		   if(this.permissions.editButtons.add){this.initAddBtn();}
		   if(this.permissions.editButtons.edit){this.initEditsBtn();}
		   if(this.permissions.editButtons.config){this.initConfigBtn();}
		   if(this.permissions.editButtons.delete){this.initDeleteBtn();}
		   
	   },
	   //-------------- ADD -----------
	   initAddBtn:function(){
		   var icon="LOM-plus";
		   var text=this.labels.editview.add;
		   var $btn;
		   var that=this;
		   $(this.$el).children(".LOM-edit-view").append("<button class=\"snap-xs ico-"+icon+"\" title=\""+text+"\">"+text+"</button>");
		   $btn=$(this.$el).children(".LOM-edit-view").children("button.ico-"+icon+"");
		   $btn.click(function() {
			   that.addClicked();
			});
		   
	   },
	   addClicked:function(){
		   this.autoAdd();
	   },
	   autoAdd:function(){
		   if(this.autoAddElement!==null){
			   var $target=this.getHolder();
				var options={parent:this, $target:$target, type:this.autoAddElement, mode:"add", switchedElement: null};
				this.editor.objElement(options);
				this.storeValue();
				this.editor.savePage();
		   }
	   },
	   //-------------- EDIT -----------
	   initEditsBtn:function(){
		   var icon="SNAP-edit";
		   var text=this.labels.editview.edit+" "+this.typeName;
		   var that=this;
		   var $btn;
		   $(this.$el).children(".LOM-edit-view").append("<button class=\"snap-xs ico-"+icon+"\" title=\""+text+"\">"+text+"</button>");
		   $btn=$(this.$el).children(".LOM-edit-view").children("button.ico-"+icon+"");
		   $btn.click(function() {
			   that.editsClicked();
			});
		   $btn.hover(
			  function() {
				  $(this).parent().children("span").text(text);
			  }, function() {
				  $(this).parent().children("span").text("");

			  }
			);
		   
	   },
	  	editsClicked:function(){
			this.autoEdit();
		   
	   },
	   autoEdit:function(){
		  
		},
	   autoFocus:function(){
		   this.edits[0].autoFocus();
	   },
	
	   //-------------- CONFIG -----------
	   initConfigBtn:function(){
		   var icon="LOM-wrench";
		   var text=this.labels.editview.config+" "+this.typeName;
		   var that=this;
		   var $btn;
		   $(this.$el).children(".LOM-edit-view").append("<button class=\"snap-xs ico-"+icon+"\"  disabled title=\""+text+"\">"+text+"</button>");
		   $btn=$(this.$el).children(".LOM-edit-view").children("button.ico-"+icon+"");
		   $btn.click(function() {
			   that.configClicked();
			});
		   $btn.hover(
			  function() {

				  $(this).parent().children("span").text(text);
			  }, function() {
				  $(this).parent().children("span").text("");

			  }
			);
		   
	   },
	  	configClicked:function(){
			this.autoConfig();
		   
	   },
	   autoConfig:function(parameters){
		   var params=(typeof parameters !== "undefined")?parameters:null;
		   params=params;
		   this.popConfig();
	   },
	   //-------------- DELETE -----------
	   initDeleteBtn:function(){
		   var that=this;
		   var icon="SNAP-delete";
		   var text=this.labels.editview.delete+" "+this.typeName;
		   var $btn;
		   $(this.$el).children(".LOM-edit-view").append("<button class=\"snap-xs ico-"+icon+"\" title=\""+text+"\">"+text+"</button>");
		   $btn=$(this.$el).children(".LOM-edit-view").children("button.ico-"+icon+"");
		   
		   $btn.hover(
			  function() {

				  $(this).parent().children("span").text(text);
				  $( this ).parent().parent().addClass("LOM-pending-delete");

			  }, function() {
				  $(this).parent().children("span").text("");

				$( this ).parent().parent().removeClass("LOM-delete-last").removeClass("LOM-pending-delete");
			  }
			);
		   
		   $btn.click(function() {
			   that.deleteClicked();
			});
		   

		   		   
	   },
	  	deleteClicked:function(){

		var delText="Delete this element?";
			if (confirm(delText)){
				this.autoDelete();
				return false;
			}

		   
	   },
	   autoDelete:function(parameters){
		   var params=(typeof parameters !== "undefined")?parameters:null;
		   params=params;
		   this.destroy();
		   this.editor.savePage();
	   },

	   

/*---------------------------------------------------------------------------------------------
-------------------------LBX management
---------------------------------------------------------------------------------------------*/		   
	   defaultLbxSettings:function(title, action, save){
		   var params={
			   title:title,
			   action:action,
			   targetId: "custom_lbx",
			   saveBtn:save,
			   obj:this
		   };
		   return this.changeDefaultLbxSettings(params);
	   },
	   changeDefaultLbxSettings:function(params){
		 return params;
	   },
	   configLbxSettings:function(){
		   var that=this;
		   var params={
		   		$paramTarget:that.$el,
			   	files:[
				   //"../../templates/LOM-Elements/element_config_default.html"
				   ],
			   	attributes: {
				   //"data-text":"Text Value",
				   /*"data-options": [
					   "Option 1",
					   "Option 2"]*/
					}
		   };
		   return this.changeDefaultConfigSettings(params);
	   },
	   changeDefaultConfigSettings:function(params){
		 return params;
	   },
	  
	   
	   
	   
	   loadLbx:function(params){
		   var that=this;
		   var title=params.lbx.title;
		   var saveBtn=params.lbx.saveBtn;
		   var targetId=params.lbx.targetId;
		   //change the title
		   $("#lbx-title").text(title);	
		   
		   //change save Msg
		   $("#"+targetId).parent().children(".modal-footer").html("<button class=\"snap-md ico-SNAP-save\">"+saveBtn+"</button></div>");		   
		   
			switch(params.lbx.action) {
			  case "config":
				// code block
					this.loadConfigLbx(params);
					$("#"+targetId).parent().children(".modal-footer").children("button").click(function(){that.submitConfig(params);});
				break;

			  default:
				// code block
			}		   
	   },
	   closeLbx:function(){
		   this.editor.closeLbx();
	   },
	   
	   
/*---------------------------------------------------------------------------------------------
-------------------------CONFIGURATION
---------------------------------------------------------------------------------------------*/	
	   popConfig:function(){
		   var popParams={};
		   //send title and action
		   popParams.lbx=this.defaultLbxSettings("Configuration", "config", "Save Configuration");
		   popParams.config=this.configLbxSettings();

		   this.editor.popLightbox(popParams);
	   },
	   
	   loadConfigLbx:function(params){
		   //load files
		   if(params.config.files.length>0){
			   this.loadConfigFiles(params);
		   }
		   //load attributes
		   this.loadConfigAttributes(params);
		   this.loadConfigCustom(params);
		   
		   
	   },
	   /*
	    * this loads ajax files for the configuration
		*/
	   loadConfigFiles:function(params){
		   var that=this;
		   var files=params.config.files;
		   var $target=$("#"+params.lbx.targetId);
		   that.configPages=0;
		   that.configPagesCount=files.length;

		   for(var i=0;i<that.configPagesCount;i++){
			   $target.append("<div class='LOM-config-load'></div>");
			   $target.children(".LOM-config-load").eq(i).load(files[i],function(){
				   that.checkConfigFilesInit(params);
			   });
		   }
	   },
	   /*
	    * this relays after the config files were loaded
		*/
	   
	   checkConfigFilesInit:function(params){
		   this.configPages++;
		   
		   if(this.configPages===this.configPagesCount){
			   this.initializeConfigFiles(params);
		   }
		   
	   },
	   initializeConfigFiles:function(params){
		   
		   return params;
		   
	   },
	   loadConfigCustom:function(){
	   		return false;
   
	   },
	   
	   
	   submitConfig:function(params){
		   var id=params.lbx.targetId;
		   var $paramTarget=params.config.$paramTarget;
		   
		    //LOM-attr-value
		   var $attributes=$("#"+id).find(".LOM-attr-value");
		   var value;
		   var name;
		   
		   for(var i=0;i<$attributes.length;i++){
			  	name=$attributes.eq(i).attr("name");
				value=$attributes.eq(i).val();
			   $paramTarget.attr(name, value);
			   
		   }
		   this.submitCustomConfig(params);
		   this.storeValue();
		   this.closeLbx();
		   this.editor.savePage();
		   
	   },
   		
	   submitCustomConfig:function(params){
		   return params;
	   },


/*---------------------------------------------------------------------------------------------
-------------------------CONFIGURATION ATTRIBUTES
---------------------------------------------------------------------------------------------*/		
	   
	   loadConfigAttributes:function(params){
		   var that=this;
		   var attr=params.config.attributes;
		   var $target=$("#"+params.lbx.targetId);
		   var oldValue;
		   var newAttr;
		   var value;
		   var options;
		   Object.keys(attr).forEach(function(key) {
			   //whats the attr
			   newAttr=key;
				oldValue = params.config.$paramTarget.attr(newAttr);
			   switch(typeof attr[key]){
					case "string":
					   //------------------------ TEXT BOX
					   //check if it exists
					   if (typeof oldValue !== typeof undefined && oldValue !== false) {
						   //replace old value
						   value=oldValue;
					   }else{
					   	//use the default
					   	value=attr[key];
					   }
					   that.loadConfigAttrString($target, newAttr, value);
    				break;
				   case "object":
					   
					   //whats the default
					   value=attr[key];
					   if (Array.isArray(value)){
						   options=value;
						   //------------------------ ARRAY OF OPTIONS
							//check if it exists
						   if (typeof oldValue !== typeof undefined && oldValue !== false) {
							   //replace old value
							   value=oldValue;
						   }else{
							//use the default
								value=null;
						   }						   
						   
						   
					   		that.loadConfigAttrOptions($target, newAttr, options, value);
					   }
					   break;
				   default:
					   
				}
			});
		   
	   },		   
	   
   	loadConfigAttrString:function($target, newAttr, defaultValue){
		//the the attr akready exist
		$target.append("<p><label>"+newAttr+" : <input class=\"LOM-attr-value\" type=\"text\" name=\""+newAttr+"\" value=\""+defaultValue+"\"></label></p>");
		
	},
		   
   	loadConfigAttrOptions:function($target, newAttr, options, oldValue){
		var $container;
		var selected="";
		// might be deleted
		$target.append("<p><label>"+newAttr+" : </label></p>");
		
		$container=$target.children("p").last().children("label");
		$container.append("<select class=\"LOM-attr-value\" name=\""+newAttr+"\"><option disabled>Choose</option></select");
		for(var i=0;i<options.length;i++){
			selected=(oldValue === options[i])?" selected":"";
			$container.children("select").append("<option value=\""+options[i]+"\" "+selected+">"+options[i]+"</option>");
		}

	}, 	   
	   
	   
	   
	   
	
/*---------------------------------------------------------------------------------------------
-------------------------Functionnality
---------------------------------------------------------------------------------------------*/	
		targetNewElement:function(){
		   return this.$el;
	   },   
	   
	   findFrame:function(){
		   var frame;

		   if(!this.parent.isFrame){
			   frame=this.parent.findFrame();
		   }else{
			   frame=this.parent;
		   }
		   return frame;
	   },
/*---------------------------------------------------------------------------------------------
		-------------------------EDIT BOX
---------------------------------------------------------------------------------------------*/	
	   
		detectEditBoxes:function(){
			//detect
			var that=this;
			
			//lets look for an edit element
			var $edits=this.$el.find(".LOM-editable").filter(function(){
				var newId=$(this).closest(".LOM-element").attr("id");
				if(newId===that.id){

					return true;
				}else{
					return false;
				}
			});

			var foundEdit;
			for(var i=0;i<$edits.length;i++){
				foundEdit=this.editor.findEditor($edits.eq(i).attr("id"));
				//does it already exist
				if(!foundEdit){
					//instanciate a new editbox
					this.edits[this.edits.length]=new EditBoxObj({
										id:$edits.eq(i).attr("id"),	
										class:$edits.eq(i).attr("class"),	
										$el:$edits.eq(i),	
										parent:that.editor,
										parentElement:that
									});	
					this.editor.edits[this.editor.edits.length]=this.edits[this.edits.length-1];

					
					
				}else{
					//it already exists (probably a rogue Edit)
					this.edits[this.edits.length]=foundEdit;
					foundEdit.parentElement=this;
				}
				
			}
			
		},

	   
	   removeEdit:function($deletable){
		   var $deleteThis=$deletable.find(".LOM-editable");
		   var currentId;
		   
		   for (var i=0;i<$deleteThis.length;i++){
			   currentId=$deleteThis.eq(i).attr("id");
			   this.editor.findEditor(currentId).destroy();
			   
			   
			   
		   }
		   
	   },
		removeEditFromList:function(editBoxObj){
			for(var i=0;i<this.edits.length;i++){
				if(editBoxObj===this.edits[i]){
					this.edits.splice(i,1);
				}
			}
		},
	   
/*---------------------------------------------------------------------------------------------
		-------------------------sub elements
---------------------------------------------------------------------------------------------*/		   
	   autoLoadElements:function(){
		   var that=this;
		   var elements= this.autoLoaded;
		   var id;
		   for(var i=0;i<elements.length;i++){

			   id=this.generateId();
			   //this.createElementObj({parent:that, $target:that.$holder, type:elements[i], mode:"add", id:id});
			   this.createElementObj({parent:that, $target:that.$holder, type:elements[i], mode:"add"});
		   }
		   this.storeValue();
	   },
       preloadSubElements: function() {
       		var that=this;
		   var permissions=this.permissions.subElements;
			Object.keys(permissions).forEach(function (key) {
				if(permissions[key]) {
					that.editor.addElementTemplate(key);
					}
				});
			},
	   
	   initSubElements:function(){
		   this.detectElements();
		   if(this.creationMode!== "existing"){this.autoLoadElements();}
		   this.detectEditBoxes();
	   },
	   detectElements:function(){
		   var that=this;
		   var $newElements=this.$holder.children(".LOM-element");
		   for(var i=0;i<$newElements.length;i++){
			   //ask te editor to create the object
			   this.createElementObj({
				   parent:that, 
				   $el:$newElements.eq(i)
			   });
		   }
	   
	   },
	   createElementObj:function(options){
			   this.editor.objElement(options);		   
	   },


	   createNewElement:function(type, $target, params){
		   var that=this;
		   params=(typeof params ==="undefined")?{}:params;
		   $target=(typeof $target ==="undefined")?this.$holder:$target;
		   this.editor.unpopElementPicker();
		   this.createElementObj({parent:that, target:$target}, params);
	   },

	   
	   addElement:function(){
		   	this.editor.prepareElement(this.$el);
			this.editor.createElement("default");
	   },
	   destroy:function(preserve){
		   this.destroySubEdits();
		   this.destroySubElements();
		   var preserveIndex=(typeof preserve==="undefined")?false:preserve;
		   this.originalHtml=null;
		   this.newHtml=null;
		   for(var i=0;i<this.parent.elements.length;i++){
			   if(this.parent.elements[i].id===this.id){
				   if (preserveIndex){
					   return i;
				   }else{
					   this.parent.elements.splice(i, 1);
				   }
			   }
		   }
		   this.$el.remove();
		   this.parent.storeValue();
		   this.parent=null;
	   },
	   destroySubElements:function(){
		   //destroy subElements
		   for(var i=0;i<this.elements.length;i++){
			   this.elements[i].destroy(true);
		   }
		   
	   },
	   destroySubEdits:function(){
		   for(var i=0;i<this.edits.length;i++){
			   this.edits[i].destroy(true);
		   }
		   this.edits=[];
		   
	   },
		autoAddBtn:function(){
			if(this.autoAddButton){
				var val;
				var permissions=false;
				var permCount=0;
				var permissionsList=this.permissions.subElements;
				this.$holder=this.getHolder();
				Object.keys(permissionsList).forEach(function(key) {
				  val = permissionsList[key];
					permissions=(val === true)?true:permissions;
					if(val === true){permCount++;}
				});
				if(permissions){

					this.appendAddBtn();			


				}
			}
			

		},
/*---------------------------------------------------------------------------------------------
		-------------------------SORTABLE
---------------------------------------------------------------------------------------------*/			   
		addSortable:function(){
			var that=this;
			
			var $container=this.getSortableContainer();

		   $container.sortable({
			  axis: "y",
			   //helper:"clone",
			   handle:".LOM-ui-handle",
			   //containment: "parent",
			   //cursor: "progress",
			   items: "> .LOM-element",
			   opacity: 0.1,
			   revert: true,
			   placeholder: "sortable-placeholder",
			   tolerance: "pointer",
			   cursorAt: { left: 0, top: 0 },
			   //connectWith: ".LOM-frame",
			   
			   classes: {
				"ui-sortable": "highlight"
			  	},
			
			  start: function(	 ) {
				  $("html").addClass("LOM-sortable-active");
				  that.startSort();
				  
				  
			  },
			   stop: function() {
				  $("html").removeClass("LOM-sortable-active");
				  that.stopSort();
				   //event, ui
				   that.refreshInfo();
				   that.editor.savePage();
			   }
						   
			});		   
		   
		   this.addHandle();

		},
	   startSort:function(){
		   return false;
	   },
	   stopSort:function(){
		   return false;
		   
	   },
	   getSortableContainer:function(){

		   this.connectDom();
		   var $container=this.getHolder();
		   return $container;
	   },
	   addHandle:function(){
		   var $element=this.$holder.children(".LOM-element");
		   var title=this.labels.editview.move;
		   for (var i=0;i<$element.length;i++){
			   if($element.eq(i).find("h1").length<=0 ){
				   if ($element.eq(i).children(".LOM-handle").length<=0){
					$element.eq(i).append("<div class='LOM-ui-handle LOM-delete-on-save' title='"+title+"'></div>");
				   }
			   }
		   }
		  return false;
	   },	
/*---------------------------------------------------------------------------------------------
		-------------------------ADD BTN
---------------------------------------------------------------------------------------------*/			   
	   appendAddBtn:function(){
		   var that=this;
		   var iconSize;
		   for (var i=0;i<this.$holder.length;i++){  
			   //for each holder separately
			   iconSize=(this.$holder.children(".LOM-element").length===0)?"lg":"md";
			   if(this.$holder.eq(i).children("button.LOM-add-element").length===0){
			   		this.$holder.eq(i).append("<button class=\"LOM-add-element snap-"+iconSize+" align-left ico-LOM-plus LOM-delete-on-save subElement"+this.type+"\" title=\""+this.addElementBtnTxt()+"\">"+this.addElementBtnTxt()+"</button>");
			   }
		   }
		   this.$holder.children(".ico-LOM-plus").click(function() {
				that.editor.$target=that.$el.parent();
				//define the target
				that.editor.popElementPicker(this);
				return false;
			});
	   },

	   addElementBtnTxt:function(){
		   return "Add Element";
	   },
/*---------------------------------------------------------------------------------------------
		-------------------------UTILS
---------------------------------------------------------------------------------------------*/	
	   findElement:function(objId){
		   var check=false;
		   if (this.id===objId){
			   return this;
		   }else{
			   for (var i=0;i<this.elements.length;i++){
				   check=this.elements[i].findElement(objId);
				   if (check !== false){
					   return check;
				   }
			   }
		   }
					  
					  return false;
	   },
	   generateId:function(){
		   var currentId;
		   var flag=false;
			var i = 0;
			while (!flag) {
				currentId=this.idPrefix + (i+1);
				if ($("#"+currentId).length<=0 ){
					flag=true;
				}else if(i===500){
					flag=true;
				}
			  i++;
			}
		   return currentId;
	   },	   
/*---------------------------------------------------------------------------------------------
		-------------------------CHANGING ELEMENT
---------------------------------------------------------------------------------------------*/		

	   
	   
	   switchElement:function(){
		   this.editor.elementMode="switch";
		   this.destroy(true);
		   
		   
	   },
	   firstLoad:function(){
		   this.setAnimations();
		   
	   },
	   postCleanup:function(){
		   return false;
	   },

	   loadClean:function(){
		   this.connectDom();
		   this.$el.html(this.newHtml);
		   this.postCleanup();
		   this.$el.removeAttr("style");
		   if(this.isFirstLoad){
			   this.isFirstLoad=false;
			   this.firstLoad();
		   }else{
			   this.$el.removeAttr("style");
		   }
		   
	   },
	   		
		cleanElements:function(){
			this.loadClean();
			for(var i=0;i<this.elements.length;i++){
				this.elements[i].cleanElements();
			}
		}


   });
});
