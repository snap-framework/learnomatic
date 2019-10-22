define([
	
    'jquery',
	'labels',
	'settings-core',
	'utils',
	'modules/BaseModule',
	'./../../plugins/ckeditor/ckeditor'
], function($,labels, CoreSettings, Utils, BaseModule, CKEDITOR) {
	'use strict';

	return BaseModule.extend({
		initialize: function(options) {
			
			this.parent=options.parent;
			this.editor=this.parent;
			this.parentElement=(typeof options.parentElement==="undefined")?null:options.parentElement;

			this.$el=options.$el;
			this.id=(typeof options.id==="undefined")?this.generateId():options.id;
			this.ckeInstance=null;

			
			this.isModified=null;
			this.isActivated=null;
			this.isRestricted=false;
			this.isRogue=(typeof options.isRogue!=="undefined")?options.isRogue:false;
			
			//CKE creates these
			this.ckeId="cke_"+this.id;
			
			this.class=options.class;
			
			this.originalHtml=this.$el.html();
			this.newHtml=this.originalHtml;
			
			this.boxType=this.detectBoxType();
			//this.nesting();
			this.config=this.configCke();
			if(!this.isRogue){
				this.parentElement.storeValue();
			}
		},


/*---------------------------------------------------------------------------------------------
		-------------------------get value
---------------------------------------------------------------------------------------------*/			
		getValue:function(){

			return CKEDITOR.instances[this.id].getData();
		},
		
		saveUpdate:function(){
			var value=this.getValue();
			var $editBoxContent=$($.parseHTML(this.getValue()));
			//are there any calls to lightboxes here?
			if($editBoxContent.find("a[href*=_lbx]").length>0){

				value=this.updateLightbox($editBoxContent);
				//update value!
				
			}

		   
			
			
			var oldHtml=this.editor.originalHtml;
			$(CoreSettings.contentContainer).after("<div id='LOM-temp'></div>");
			$("#LOM-temp").hide().append(oldHtml);
			var $edit=$("#LOM-temp").find("#"+this.id);
			
			$edit.html(value);

			this.editor.originalHtml=$("#LOM-temp").html();
			$("#LOM-temp").remove();
			this.editor.updateHtml();
		   return false;
		},
/*---------------------------------------------------------------------------------------------
		-------------------------LAUNCH CKE
---------------------------------------------------------------------------------------------*/	

		activate: function() {
			var that=this;
			if (!this.isActivated){
				this.refreshInfo();
				this.makeEditable();
				this.initCKE();
				this.isActivated=true;
				this.refreshInfo();//why twice??
				this.$el.next().change(function (e) {
					that.keyPress(e); 
					
				});

				this.$el.next().on('keyup change paste keypress', function (e) {
					
					if (that.isRestricted){
						//prevent space from messing up the details
						if( e.type==="keyup" && e.keyCode===32){
							e.preventDefault();
						}
						//prevent chariot return
						if( e.type==="keypress" && e.keyCode===13){
							e.preventDefault();
							//save on enter key if it'S a single-line
							that.parentElement.autoEdit();
						}
					}else{
						that.keyPress(e); 
					}
					

				});	
				this.checkOverflow();

			}
			this.$el.next().focusout(function(e){
				that.focusOut(e);
			});
		},
		deactivate: function() {
			if (this.isActivated){
				this.makeUneditable();
				this.isActivated=false;
				this.refreshInfo();
				this.storeValue();
				this.parentElement.storeValue();
				if(!this.isRogue){
					this.parentElement.$el.removeClass("LOM-editing");
				}
			}
		},

		
		initCKE: function() {
			CKEDITOR.inline( this.id ,this.config);
		},
		
		// configuration for CKE
		detectBoxType: function() {
			if(this.$el.is("span")){
				return "span";
			}else{
				return "div";
			}
		},
		focusOut:function(event){
			event=event;
			//var currentValue
			this.saveUpdate();

			
			
		},
		autoFocus:function(){
			
			//this.instance.focusManager.focus();
			//somehow this doesn'T work
			
			
		},
/*---------------------------------------------------------------------------------------------
		-------------------------CLEANUP AND PREP
---------------------------------------------------------------------------------------------*/	
		// prepares the html code to allow CKE to do its thing
		makeEditable: function() {
			
			//var that=this;
			var $original=this.$el;
			
			$original.before("<form onclick='return false;'><textarea class='"+this.class+"' id='"+this.id+"' style='display:inherit;'>"+$original.html()+"</textarea></form>");
			$original.remove();


		},
		
		// make the html uneditable, back to how it was.
		makeUneditable: function() {
			$("#"+this.ckeId).remove();
			//define what will soon be deleted
			var $textarea=$("#"+this.id);
			//save whats now in the ID is the textarea
			this.newHtml=$textarea.next().html();
			//create the new object
			$textarea.parent().before("<"+this.boxType+" class='"+this.class+"' id='"+this.id+"'>"+this.newHtml+"</"+this.boxType+">");	

			//remove the excess
			$textarea.parent().remove();

		},
		//refresh the connection between the $el and the real deal
		refreshInfo:function(){
			this.instance=CKEDITOR.instances[this.id];
			this.$el=$("#"+this.id);
		},	
		storeValue:function(){

			if(this.originalHtml!==this.newHtml && this.newHtml!==null){
				
				this.isModified=true;
				this.originalHtml=this.newHtml;
				if(!this.isRogue){
					this.parentElement.isModified=true;
				}
			}else{
				this.isModified=this.isModified;
			}
			return this.isModified;
		},	

		destroy:function(preserve){
			
			$("#"+this.id).remove();
			this.parent.removeEditFromList(this);
			if(!this.isRogue && !preserve){
				this.parentElement.removeEditFromList(this);
			}
			//jsut some cleanup;
			this.parentElement=null;
			
			this.$el=null;
			this.class=null;
			this.originalHtml=null;
			this.newHtml=null;
			this.config=null;
			
		},
		updateLightbox:function($content){
			var $lbxList=$content.find("a[href*='_lbx']");
			var $lbx;
			for (var i=0;i<$lbxList.length;i++){
				$lbx=$lbxList.eq(i);
				if($($lbx.attr("href")).length>0){
					$lbx.addClass("wb-lbx").removeClass("wb-lbx-inited");
					//console.log(this.$el);
					//this.$el.next().find("a[href*='_lbx']").addClass("wb-lbx-inited")
				}
			}

			return $content.html();
		},

/*---------------------------------------------------------------------------------------------
		-------------------------CONFIGURATION FOR CKE
---------------------------------------------------------------------------------------------*/	
		configCke: function() {
			var editorConfig ={
				toolbar : []/*,
				language: lang*/
	
			};
			if(!this.isRogue){
				if(this.parentElement.type==="custom"){
					
					//if the user is in export mode
					editorConfig.toolbar.push({ name: 'Expert', items: [ 'Sourcedialog' ] } );
					//return editorConfig;
				}
			}
			
			if(this.$el.parent().is("h1, h2, h3, h4, summary, label")){
				this.isRestricted=true;
				//RESTRICTED
				editorConfig.enterMode=CKEDITOR.ENTER_BR;
				editorConfig.allowedContent = true;
				editorConfig.keystrokes =					[[ 13 /* Enter */, 'john'],[ CKEDITOR.SHIFT + 13 /* Shift + Enter */, 'blur' ]];
			}else{
				//FULL TEXT
				editorConfig.toolbar.push({ name: 'cutpaste', items: [ 'Copy', 'Cut', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo' ] } );
				editorConfig.toolbar.push({ name: 'basicstyles', items: [ 'Bold', 'Italic', 'Subscript', 'Superscript', '-', 'Language' , 'SpecialChar'] });
				editorConfig.toolbar.push({ name: 'paragraph', items: [ 'NumberedList', 'BulletedList'/*, '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock' */] });
				editorConfig.toolbar.push({ name: 'links', items: [ 'Link', 'Unlink', 'Anchor' ] });
				editorConfig.toolbar.push("/");
				editorConfig.toolbar.push({ name: 'document', items: [ 'Format' ] } );
				editorConfig.toolbar.push({ name: 'resources', items: [ 'Abbr', 'Glossary'] } );
			}
			//if detected a form
			/*
			if(this.$el.closest("form").length>0){
				editorConfig.toolbar.push({ name: 'forms', items: [ 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button' ] });
			}
			*/
			editorConfig.extraPlugins = "abbr, glossary";
			
			return editorConfig;

		},
/*---------------------------------------------------------------------------------------------
		-------------------------
---------------------------------------------------------------------------------------------*/	
		keyPress:function(){
			this.checkOverflow();
		},
		checkOverflow:function(){
			var $edit=this.$el.next();
			var maxchar = 3000;
			var maxParagraphs = 7;
			var totalText=$edit.html().length;
			var warningFlag=false;
			

			if (totalText>maxchar){
				warningFlag=true;
				//alert("Wo! That's enough text now, champ!\n\n(review msg)");
			}
			if($edit.children("p").length>maxParagraphs){
				
				warningFlag=true;
				//alert("Slow down on those paragraphs, cowboy!\n\n(review msg)");
			}
			if (warningFlag){
				this.$el.parent().addClass("LOM-overflow-warning");
			}else{
				this.$el.parent().removeClass("LOM-overflow-warning");
				
			}			
		},
	   generateId:function(){
		   var currentId;
		   var flag=false;
			var i = 0;
			while (!flag) {
				currentId="LOM-edit-" + (i+1);
				if ($("#"+currentId).length<=0 ){
					flag=true;
					this.$el.attr("id", currentId);
				}else if(i===500){
					flag=true;
				}
			  i++;
			}
		   return currentId;
	   },		
		/*
		 * 
		 */
		doSomethingElse: function() {

		}
	});
});