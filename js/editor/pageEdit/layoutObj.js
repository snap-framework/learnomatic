define([
	
    'jquery',
	'labels',
	'settings-core',
	'utils',
	'modules/BaseModule',
	'./../pageEdit/frameObj'
], function($,labels, CoreSettings, Utils, BaseModule, FrameObj) {
	'use strict';

	return BaseModule.extend({
		initialize: function(options) {
			this.isModified=null;
			this.parent=options.parent;
			
			this.labels=options.labels;
			this.frames=[];
			this.initFrames(options.frames);
			this.layoutName=null;
			this.currentLayout=null;

		},

		/*
		 * @init all the frames
		 */
		
		initFrames : function($frames){
			for(var i=0;i<$frames.length;i++){
				this.frames[this.frames.length]=new FrameObj({
					parent:this,
					$el:$frames.eq(i),
					id:$frames.eq(i).attr("id"),
					class:$frames.eq(i).attr("class"),
					labels:this.labels
				});
			}
			
		},
		
/*---------------------------------------------------------------------------------------------
		-------------------------HOUSEKEEPING
---------------------------------------------------------------------------------------------*/			
		refreshInfo:function(){
			for (var i=0;i<this.frames.length;i++){
				this.frames[i].refreshInfo();
			}
		},	
		resetAll:function(){
			this.$el=$("#"+this.id);
			for (var i=0;i<this.frames.length;i++){
				this.frames[i].isModified=false;
				this.frames[i].resetAll();
			}
			this.addOnLoad();
			
		},
	   addOnLoad:function(){
		   
	   },

	   removeBeforeSave:function(){
			for (var i=0;i<this.frames.length;i++){
				this.frames[i].removeBeforeSave();
			}
	   },		
/*---------------------------------------------------------------------------------------------
		-------------------------CHANGING LAYOUT
---------------------------------------------------------------------------------------------*/
		change:function(filename){
			
			var i;
			var that=this;
			var newValue;
			var confirmDelete;
			var newID;
			$.get(filename, function (data) {
				//save the new layout
				that.newHtml=data;
				//evaluate
				var $newFrames=$(that.newHtml).find(".LOM-frame");
				var newLength=$newFrames.length;
				var oldLength=that.frames.length;
				

				//if we need to create new frames
				if(oldLength<newLength){
					//IF there is currently NO layout/frames
					if(oldLength===0){
						//
						oldLength=(that.wrapLayout())?1:0;

					}					
					var nbNewFrames=newLength-oldLength;
					for(i=0;i<nbNewFrames;i++){
						if(that.createFrame()){oldLength++;}
					}
					
				}
				//if we need to delete frames
				if(newLength<oldLength){
					var nbDelete=oldLength-newLength;
					confirmDelete=confirm("Are you Certain?\nThis will delete "+nbDelete+" frames, otherwise, the content will be added at the bottom.");
					for(i=0;i<nbDelete;i++){
						if (confirmDelete){
							if(that.destroyLastFrame()){oldLength--;}
						}else{
							newValue=newLength+1+i;
							newID="LOMfr_"+newValue;
							that.newHtml+="\n<section class='row'><section class=\"col-md-12 LOM-frame\" id=\""+newID+"\"></section></section>";
						}
					}
									
				}
				//IF everything is fine
				that.swap(filename, that.html);
				//SWAP
				
			});
			
			
		},
		/*
		 * @exchange equal-value layouts
		 */
		swap: function(filename) {
			if(this.currentLAyout !== filename){
				this.currentLAyout=filename;
				this.isModified=true;
			}
			//shut down the shop!
			this.parent.deactivateEditors();
			//load the new layout
			this.storeFrameValue();
			// data contains your html
			this.parent.savePage();
		},


		
		/* so now we have new frames coming.
		 * go through current frames 
		 * and save their content to their originalHtml
		 */
		storeFrameValue:function(){

			for(var i=0;i<this.frames.length;i++){
				this.frames[i].storeValue();
			}

		},
		/* refresh the $(CoreSettings.contentContainer
		 * with the new value and 
		 */		
		loadClean:function(){
			$(CoreSettings.contentContainer).html(this.newHtml);
		},
/*---------------------------------------------------------------------------------------------
		-------------------------Creating/deleting new frames/elements and wrapping
---------------------------------------------------------------------------------------------*/

		
		wrapLayout:function(){
			//figure the ID out			
			var id="LOMfr_1";
			
			var oldContent=$(CoreSettings.contentContainer).html();
			
			$(CoreSettings.contentContainer).html("<!-- Layout 1 frame -->"+this.generateFrameHtml(id,oldContent));
			this.initFrames($("#LOMfr_1"));
			return true;

		},
		createFrame:function(){
			var id="LOMfr_"+(this.frames.length+1);
			
			$(CoreSettings.contentContainer).append(this.generateFrameHtml(id));
			this.initFrames($("#"+id));
			return true;

		},	
		
		
		generateFrameHtml:function(id, content){
			//check if there's old stuff
			var newContent=(typeof content ==="undefined")?this.createElement():content;
			//crete the html
			var newHtml="<section class='row'><section class='col-md-12 LOM-frame' id='"+id+"'>"+newContent+"</section></section>";
			
			
			return newHtml;
		},	
		destroyLastFrame:function(){
			//which frame to destroy
			var indexDelete=(this.frames.length)-1;
			//tell the frame to go ... 
			this.frames[indexDelete].destroy();
			//delete the reference from the layout
			this.frames.splice(indexDelete,1);
			return false;
			
		},
		
		//----------------------------------------INSERT ELEMENT TECHNOLOGY HERE
		
		createElement:function(){
			var html="";//"<button class=\"snap-lg ico-LOM-plus\" onclick=\"masterStructure.editor.popElementPicker('switch', this);return false;\">Add Element</button>";
			return html;
		},
		
/*---------------------------------------------------------------------------------------------
		-------------------------UTILS
---------------------------------------------------------------------------------------------*/			
		/*
		 * @do something
		 */		
		findFrame: function(objId) {
			
			
			for(var i=0;i<this.frames.length;i++){
				if(this.frames[i].id===objId){return this.frames[i];}
			}
			return false;
		},		

/*---------------------------------------------------------------------------------------------
		-------------------------
---------------------------------------------------------------------------------------------*/	
		/*
		 * 
		 */
		doSomethingElse: function() {

		}
	});
});