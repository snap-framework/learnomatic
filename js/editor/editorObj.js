define([
	
    'jquery',
	'labels',
	'settings-core',
	'utils',
	'modules/BaseModule',
	'./ui/ui-manager',
	'./settings/settings-manager',
	'./LOM_labels',
	'./ui/LOM_ui_buttons',
	'./../plugins/ckeditor/ckeditor',
	'./pageEdit/editBoxObj',
	'./pageEdit/layoutObj',
	'./pageEdit/elementObj',
	'./roles/roles-manager',
	'./structure/structure-manager',
	'./../plugins/jquery-ui/ui/widgets/sortable'
	
	
], function($,labels, CoreSettings, Utils, BaseModule, UImanager,SettingsManager, LOMLabels, LOMButtons,  CKEDITOR,  EditBoxObj, LayoutObj, ElementObj,RolesManager, Structure, Sortable) {
	'use strict';

	return BaseModule.extend({
		initialize: function(options) {
			var that=this;
			this.parent=options.parent;
			this.master=this.parent;
			this.courseFolder=options.courseFolder;
			
			this.isPage404=null;
			this.originalHtml=$(CoreSettings.contentContainer).html();
			
			this.expertMode=null;
			
			$(this.parent).on("Framework:pageLoaded", function() {
				that.pageLoaded();
			});

			this.elements=[];
			this.subElements={};
			this.targetElement=null;
			this.elementMode=null;
			this.edits=[];//all the editor boxes will be logged here
			this.layout=false;

			//------temp things
			this.labels=LOMLabels;
			
			//for when a popper is used
			this.initialized=false;
			this.targetParent=null;
			this.$target=null;
			this.lbxParams=null; // used to pass parameters to poppers
			
			this.$supermenu_en=null;
			this.$supermenu_fr=null;
			
			//append the css file for LOM
			$('head').append('<link rel="stylesheet" type="text/css" href="../../theme/editor.css">');

		},
/*---------------------------------------------------------------------------------------------
		-------------------------INIT and SETUP
---------------------------------------------------------------------------------------------*/	

		/*
		 * @Fires up everytime the page is loaded
		 */
		
		pageLoaded : function(){	
			var mode;
						
			if (!this.initialized){
				this.initialized=true;
				this.firstPageLoad();
			}
			mode=this.ui.currentMode.name;
			if(mode==="pageEdit"){
				this.reset();
				this.detectRogueEditors();
				this.layout=this.detectLayout();
				this.sortable=new Sortable();		
				this.parent.resourcesManager.cleanUp();
				this.activateEditors();
			}
			
		},
		
		/*
		 * @first up once
		 */
		firstPageLoad:function(){
			$("html").addClass("LOM-active");
			this.setupRoles();
			this.setupUI();
			this.setupSettings();
			this.setupStructure();
		},
/*---------------------------------------------------------------------------------------------
		-------------------------MODES SETUP
---------------------------------------------------------------------------------------------*/			
		setupUI : function(){
			var that=this;
			this.ui=new UImanager({
				parent:that,
				modes: LOMButtons
			});
			
		},	
		setupSettings : function(){
			var that=this;
			this.settings=new SettingsManager({
				parent:that,
				labels:that.labels.settingsmode
			});
			
		},
		setupStructure : function(){
			//---------Structure manager
			this.structure= new Structure({
				parent: this,
				labels:this.labels
			});
			
		},
		setupRoles:function(){
			this.roles = new RolesManager({
				parent:this,
				labels:this.labels
			});
		},

/*---------------------------------------------------------------------------------------------
		-------------------------HOUSE KEEPING
---------------------------------------------------------------------------------------------*/	
		//reset the vars when we feel like it
		reset:function(){
			this.edits=[];
			this.layout=null;
			this.removeLomClasses();
		},
		resetAll:function(){
			this.layout.isModified=false;
			this.layout.resetAll();
		},
		removeEditFromList:function(editBoxObj){
			for(var i=0;i<this.edits.length;i++){
				if(editBoxObj===this.edits[i]){
					this.edits.splice(i,1);
				}
			}
		},
		removeLomClasses:function(){
			var classes =["LOM-delete-last"];
			var current;
			for (var i=0;i<classes.length;i++){
				current=classes[i];
				$("."+current).removeClass(current);
			}
			
		},
/*---------------------------------------------------------------------------------------------
		-------------------------DETECTORS
---------------------------------------------------------------------------------------------*/		
		/*
		 * @detect all the editors
		 */
		
		detectRogueEditors : function(){
			
			var $editbox=$(CoreSettings.contentContainer+" .LOM-editable");
			
			for(var i = 0;i<$editbox.length;i++){
				if(!$editbox.eq(i).closest(".LOM-element").hasClass("LOM-element") ){
					//FOUND A ROGUE!
					this.edits[this.edits.length]=new EditBoxObj({
					id:$editbox.eq(i).attr("id"),	
					class:$editbox.eq(i).attr("class"),	
					$el:$editbox.eq(i),	
					parent:this,
					isRogue:true
				});
			}

			}
			
		},

		/*
		 * @detect if there's a layout
		 */
		
		detectLayout : function(){
			
			var $frames=$(".LOM-frame");
				return new LayoutObj({
					parent:this,
					frames:$frames,
					labels:this.labels
				});

			
			
		},
			


/*---------------------------------------------------------------------------------------------
		-------------------------ACTIVATE / DEACTIVATE EDITORS
---------------------------------------------------------------------------------------------*/		
		/*
		 * @activate all the editors
		 */
		
		activateEditors : function(){
			for(var i=0;i<this.edits.length;i++){
				if(!this.edits[i].isActivated){
					this.edits[i].activate();
				}
			}
			return true;
		},
		/*
		 * @deactivate all the editors
		 */
		
		deactivateEditors : function(){
			for(var i=0;i<this.edits.length;i++){
				if (this.edits[i].isActivated){
					this.edits[i].storeValue();
					this.edits[i].deactivate();
				}
			}			
		},	
		toggleEditors:function(){
			var $editToggles=$(".LOM-edit-toggle");
			var anythingActivated=false;
			
			for(var i=0;i<this.edits.length;i++){
				anythingActivated=(this.edits[i].isActivated)?true:anythingActivated;
			}
			if(anythingActivated){
				this.deactivateEditors();
				this.saveEdits();
				$editToggles.html("Enable Edit Mode").removeClass("LOM-save").addClass("LOM-edit");
			}else{
				this.activateEditors();
				$editToggles.html("Save").removeClass("LOM-edit").addClass("LOM-save");
			}
		},
/*---------------------------------------------------------------------------------------------
		-------------------------Page 404
---------------------------------------------------------------------------------------------*/			
		page404:function(){
			var that=this;
			this.isPage404=true;
			$(CoreSettings.contentContainer).load("../../templates/LOM-Layouts/404_editor.html", function(){
				var labels=that.labels.page404;
				$(".LOM-404").find(".gigantic").text(labels.title);
				$(".LOM-404").find(".pnf-404").text(labels.pagenotfound);
				$(".LOM-404").find(".editor-mode").text(labels.editormode);
				$(".LOM-404").find(".wwyltd").text(labels.whattodo);
				$(".LOM-404").find(".LOM-scratch").text(labels.createscratch);
				$(".LOM-404").find(".LOM-template").text(labels.createtemplate);
				
				that.ui.modes[1].select();
				that.ui.currentMode=that.ui.modes[1];
				
				$(".LOM-scratch").click(function() {
				  that.blankPage();
				});
			});
			
		},
		//create a blank page
		blankPage:function(){
			var chooseLabel=this.labels.layout.choose;
			var html="";
			html+="<!-- top banner with side-by-side underneath -->";
			html+="<section class=\"row\">";
			html+="<section class=\"col-md-12 LOM-frame\" id=\"LOMfr_1\">";
			html+="<section class=\"LOM-element placeholder default\" data-LOM-element=\"text\" id=\"LOM_el_1\" data-LOM-subtype=\"title\">";
			html+="<h1><div class=\"LOM-editable\" id=\"LOM-edit-1\">";
			
			html+=this.parent.currentSub.title;
			
			html+="</div></h1>";
			html+="";
			html+="\n<!-- default Object, spawns an object picker -->";
			html+="\n<button class=\"snap-lg ico-LOM-layout LOM-blankpage-layout\" onclick=\"masterStructure.editor.popLayoutPicker();return false;\">"+chooseLabel+"</button>";
			html+="\n</section>";
			html+="</section>";
			html+="</section>	";
			html+="";

			
			$(CoreSettings.contentContainer).html(html);
			this.writeFile();
			$("html").removeClass("page404 ");
			this.pageLoaded();
		},
		popLayoutPicker:function(){
			
			$( document ).trigger( "open.wb-lbx", [[{src: "../../templates/LOM-Layouts/layout_picker.html",type: "ajax"}]]);
		},
		loadLayoutList:function(){
			var defaultFolder="../../templates/LOM-Layouts/";
			var customFolder="content/templates/layouts/";
			

			var that=this;

			$("#layoutpicker").find("button[data-id]").click(function(){
				that.loadChosenLayout(defaultFolder+$(this).attr("data-id")+".html");
			});
			
			
			$.post('../../editor.php', { action:"readfolder", filename: 'courses/'+this.courseFolder+'/'+customFolder, regex:"/^.*\.(html|htm)$/i" }, function(data){
				//parse the jSON
				//console.log(data);
				if(data !== "false"){
					that.loadCustomLayouts(data.slice(0, -1), customFolder);
				}

				

			}).fail(function() {
				alert( "Posting failed." );
			});					
			
		},
		loadChosenLayout:function(filename){
		    //maybe I need to save content?
			this.layout.change(filename);
			//close the popper
			$.magnificPopup.close();

		},
		loadCustomLayouts:function(pages, folder){
			var that=this;
			var aPages=pages.split(",");
			$("#layoutpicker").prepend("<section id='LOM_custom_layouts'></section>");
			var $holder=$("#LOM_custom_layouts");
			$holder.append("<h3>Custom Layouts</h3>");
			
			for (var i=0;i<aPages.length;i++){
				//console.log(aPages[i]);
				//
				$holder.append("<button class=\"snap-lg ico-LOM-custom\" data-id=\""+aPages[i]+"\">"+aPages[i]+"</button>");
			}
			$holder.find(".ico-LOM-custom").click(function(){
				that.loadChosenLayout(folder+$(this).attr("data-id"));
			});
			

		},		
		
/*---------------------------------------------------------------------------------------------
		-------------------------UTILS
---------------------------------------------------------------------------------------------*/			
		/*
		 * @returns the editor with the assigned ID
		 */		
		findEditor: function(objId) {
			//var flag=false;
			
			for(var i=0;i<this.edits.length;i++){
				if(this.edits[i].id===objId){
					return this.edits[i];
				}
			}
			return false;
		},		
		/*
		 * @returns the editor with the assigned ID
		 */		
		findElement: function(objId) {
			var frames=this.layout.frames;
			var elements;
			var found=false;
			for(var i=0;i<frames.length;i++){
				//if(this.edits[i].id===objId){return this.edits[i];}
				elements=frames[i].elements;
				for(var j=0; j<elements.length;j++){
					found=frames[i].elements[j].findElement(objId);
					if (found){return found;}
				}
				
			}
			return false;
		},
		/*
		 * @returns qty lines of LOREM IPSUM
		 */				
		lorem: function(qty){
			var endString="<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>";
			qty=(typeof qty === "undefined")?1:qty;
			if(qty>1){
				endString+="\n"+this.lorem(qty-1);
			}
			
			return endString;
			
		},

/*---------------------------------------------------------------------------------------------
		-------------------------LIGHTBOX POPPERS
---------------------------------------------------------------------------------------------*/	
		popLightbox:function(params){
			this.lbxParams=params;
			// POP!
			$( document ).trigger( "open.wb-lbx", [[{src: "../../templates/LOM-Elements/lbx.html",type: "ajax"}]]);
			
		},
		loadLbx:function(){
			var params=this.lbxParams;
			
			this.lbxParams.lbx.obj.loadLbx(params);
			
			
			this.lbxParams=null;
		},
		closeLbx:function(){
			$.magnificPopup.close();
		},
/*---------------------------------------------------------------------------------------------
		-------------------------ELEMENTS
---------------------------------------------------------------------------------------------*/			
		objElement:function(options){
			new ElementObj(options);
		},
		
		/*
		 *
		 *
		 */
		prepareElement:function(obj){
			//define the target
			var $holderElement=$(obj).closest(".LOM-element,.LOM-frame");
			var element;
			
			if($holderElement.hasClass("LOM-frame")){
				//frame
				//let the frame handle where it wants it ... hihihi
				this.targetParent=this.layout.findFrame($holderElement.attr("id"));
				this.$target=this.targetParent.targetNewElement();
			}else{
				//element
				element=this.findElement($holderElement.attr("id"));
				this.targetParent=element;
				this.$target=element.getTarget(obj);

			}			
		},


		//creates a default element
		autoAddElement:function(obj){
			var id;
			var $parent;
			if (typeof obj === 'string'){
				//this is most likelky an ID
				id=obj;
				$parent=$("#"+id);
			}else{
				//tis is most like NOT an id
				$parent=$(obj).closest(".LOM-element,.LOM-frame");
				id=$parent.attr("id");
			}
			this.elementMode="add";
			if ($parent.hasClass("LOM-frame")){
				this.layout.findFrame(id).addElement();
			}else{
				//this is an element
				this.findElement(id).addElement();
			}
			
			
		},
		
		createElement:function(type, params){
			var parent=this.targetParent;
			this.targetParent=null;
			var switchedElement;
			var $target=this.$target;
			this.$target=null;
			params =(typeof params !== "undefined")?params:null;

			var options; // this will be transfered to the object as options
			
			this.unpopElementPicker();
			if((this.elementMode==="switch")){
				switchedElement=this.findElement($target.attr("id"));
			}else{
				switchedElement=null;
			}
				//create the options
			options={parent:parent, $target:$target, type:type, mode:this.elementMode, switchedElement: switchedElement, params:params};

			this.objElement(options);
			this.savePage();
			this.elementMode="";
		},
/*---------------------------------------------------------------------------------------------
		-------------------------ELEMENT PICKERS
---------------------------------------------------------------------------------------------*/				
		/*
		 * popElementPicker: pops the lightbox to pick elements
		 * pass the obj to prepare
		 * pass the mode ("add" or "switch" ... altghou switch seems to be on its way out)
		 */
		popElementPicker:function(obj,mode ){
			mode=(typeof mode==="undefined")?"add":mode;
			//define the mode.
			this.elementMode=mode;
			//prepare the targts and all
			this.prepareElement(obj);

			
			// POP!
			$( document ).trigger( "open.wb-lbx", [[{src: "../../templates/LOM-Elements/element_picker.html",type: "ajax"}]]);
		},		
		unpopElementPicker:function(){
			$.magnificPopup.close();
		},	
		/*
		 * once the popper for the elements is loaded
		 * add some buttons and remove what's not supposed to be there
		 */

		loadElementList:function(){
			var that=this;
			var $chooseElement=$("#elementpicker").children("section[data-element-type]");
			var isElement=!that.targetParent.isFrame;
			var elemType;
			var perms;
			//remove the useless ones
			for(var i=0;i<$chooseElement.length;i++){
				elemType=$chooseElement.eq(i).attr("data-element-type");
				if(isElement){
					//check out all the permissions of this element
					perms=this.targetParent.permissions.subElements;
				}else{
					perms={
					   text:true,
					   image : true,
					   custom : true,
					   details : true,
					   activity : true,
					   exam : true,
					   multiplechoice : false,
					   checkbox : false
				   };
				}
				for (var key in perms) {
					if(elemType === key && perms[key] !== true){
						//if this is the same element type AND it's false
						$chooseElement.eq(i).remove();
					}
				}				
			}

			$("#elementpicker").children("section[data-element-type]").find("button").click(function(){
				var params;
				var dParams=(typeof $(this).parent().attr("data-params") ==="undefined")?"{}":$(this).parent().attr("data-params");
				params=$.parseJSON(dParams);
				
				that.createElement($(this).closest('[data-element-type]').attr('data-element-type'), params);
						
			});
			
		},
/*---------------------------------------------------------------------------------------------
		-------------------------Sub Elements manager
---------------------------------------------------------------------------------------------*/			
		addElementTemplate:function(type){
			
			//check for the template
			//store it
			var template=this.findElementTemplate(type);
			if(!template){
				this.storeElementTemplate(type);
				return false;
			}else{
				return true;
			}

			
		},
		/*
		 * will search for a template
		 * will return if found
		 * will create if not and return
		 */
		getElementTemplate:function(type){
			var template=this.findElementTemplate(type);
			
			if (!template){
				template=this.storeElementTemplate(type);
			}
			
			return template;
		},
		
		/*
		 * look to make sure the element does or doesn't exist 
		 *  return its value
		 */
		
		findElementTemplate:function(type){
			var templates=this.subElements;
			var template="";
			var flag=false;
			Object.keys(templates).forEach(function(key) {
				if (type===key){
					flag=true;
					template = templates[key];
				}
			});			
			if(flag){
				return template;
			}else{
				return false;
			}
		},
		storeElementTemplate:function(type){
			var templates=this.subElements;
			$.ajax({
					url: "../../templates/LOM-Elements/element_"+type+".html",
					type: 'GET',
					async: false,
					cache: false,
					timeout: 30000,
					error: function(){
						
						return true;
					},
					success: function(msg){ 
						templates[type]=msg;
					}
				});	
			return templates[type];
		},
/*---------------------------------------------------------------------------------------------
		-------------------------PAGE TEMPLATES
---------------------------------------------------------------------------------------------*/	
		getTemplate:function(){
			
			var person = prompt("Please enter the Template Name", this.parent.currentSub.sPosition+"_"+$("html").attr("lang"));
			//sending "something" to savepage gives it that extra templat-ey feel
			this.savePage(person);
							   
		},
		cleanTemplate:function(){
			
		},
		
		
/*---------------------------------------------------------------------------------------------
		-------------------------CLEANUP AND SAVE
---------------------------------------------------------------------------------------------*/	

			

		lastCleanBeforeSave:function(){
			var $blanklayout=$(".LOM-blankpage-layout");
			if($blanklayout.length>0){
				$(".LOM-blankpage-layout").remove();				
			}

			//$( ".LOM-frame" ).sortable( "destroy" );
			
			this.layout.removeBeforeSave();
			$(".LOM-delete-on-save").remove();
			$(CoreSettings.contentContainer).find(".LOM-element[style]").removeAttr("style");
		},
		refreshInfo:function(){
			for(var i=0;i<this.edits.length;i++){
				this.edits[i].refreshInfo();
			}
			this.layout.refreshInfo();
		},

	
		
		/*
		 * this will clean everything out, 
		 * load some fresh code, then 
		 * send out to PHP and init WB again
		 */
		saveEdits:function(){
			if(this.layout!==false){
				this.layout.storeFrameValue();
			}
			this.savePage();
		},

		/*
		 * LOAD CLEAN (could come in handy separately)
		 */
		loadClean:function(){
			var modifiedFlag=false;
			var i;
			//start by disabling the editors
			this.deactivateEditors();
			

			//if there IS a layout... 
			if(this.layout!==false){
				//load clean layout html
				if(this.layout.isModified){
					this.layout.loadClean();
					modifiedFlag=true;
				}				
				//load clean frames html
				for (i=0;i<this.layout.frames.length;i++){
					if(this.layout.frames[i].isModified || this.layout.isModified){
						
						this.layout.frames[i].loadClean();
						modifiedFlag=true;
					}
					this.layout.frames[i].cleanElements();
				}			
			}
			
			//load Clean Editboxes
			for (i=0;i<this.edits.length;i++){
				if(this.edits[i].isModified || 
				   modifiedFlag){
					this.edits[i].loadClean();
				}
			}	
			this.lastCleanBeforeSave();
		},
		
		/*
		 * rewrites the whole page to save
		 * if getTemplate is true, don't save, just return it
		 */
		savePage: function(getTemplate) {
			getTemplate=(typeof getTemplate !== "undefined")?getTemplate:false;

			this.loadClean(); //reloads all the layouts, frames elements and edits
			
			//write the file and init WB back to life
			this.writeFile(getTemplate);
			if(this.layout!==false){
				this.resetAll();
			}
			this.activateEditors();
			return true;

		},
		/*
		 * @write to PHP
		 */		
		writeFile: function(getTemplate) {
			//call the file;
			
			var content=$(CoreSettings.contentContainer).html();
			
			
			//var bkp=content;
			if(getTemplate!== false){
				/*
				$(".LOM-editable").text("template text");
				$("h1").children(".LOM-editable").text(getTemplate);
				
				content=$(CoreSettings.contentContainer).html();
				
				filename="LOM/templates/"+this.parent.currentSub.sPosition+"_"+$("html").attr("lang")+".html";
				*/
			}
			this.originalHtml=content;
			this.updateHtml(content);

		},
		updateHtml:function(){
			var that=this;
			var content=this.originalHtml;
			var filename=this.parent.currentSub.pagePath();
			
			this.roles.checkSessions();
			
			console.log("-----------save--------------"+filename);
			$.post('../../editor.php', { action:"page", filename: "courses/"+this.courseFolder+"/"+filename, content: content }, function(data){
					//$(CoreSettings.contentContainer).html(bkp);
					//parse the jSON
					data=data;
					//console.log(data);
					that.parent.initWbs();

				}).fail(function() {
					alert( "Posting failed." );
				});			
		},
		deletePage:function(){
			//this.clearDataCKE();
			
			if (confirm(this.labels.tools.deleteconfirm)){
				var that=this;
				var filename=this.parent.currentSub.pagePath();
				var content="";
				$.post('../../editor.php', { action:"delete", filename: "courses/"+this.courseFolder+"/"+filename, content: content }, function(data){

					//console.log(data);

					//parse the jSON
					//data = jQuery.parseJSON( data );
					//Reload the page
					$("html").addClass("page404");
					that.page404();
				}).fail(function() {
					alert( "Posting failed." );
				});		
			}
			
		}
	});
});