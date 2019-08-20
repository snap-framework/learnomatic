define([
	
    'jquery',
	'labels',
	'settings-core',
	'utils',
	'modules/BaseModule',
	'./../ui/objMode'
	
], function($,labels, CoreSettings, Utils, BaseModule, ObjMode) {
	'use strict';

	return BaseModule.extend({
		initialize: function(options) {
			//var that=this;
			this.parent=options.parent;
			this.master=this.parent.parent;
			this.editor=options.parent;
			
			this.labels=options.labels;
			//options.modes;
			this.modes=[];
			this.currentMode=null;
			
			//this.modesList=options.modes;
			this.prepareHtml();
			this.$dashboard=this.prepareHtmlDashboard();
			this.initModes(options.modes);

			var firstMode=(this.editor.isPage404)?1:0;
			this.currentMode=this.modes[firstMode].select();
			
			
			
			this.$modes=null;
			this.$dashboard=null;
			
			//this.setupModes();
			//this.setupDashboard();

			
			this.parent=options.parent;

		},
		
		initModes:function(modesList){
			var that=this;
			//add the html to the dom
			var $target=this.prepareHtmlModes();

			//create the mode objects
			for (var i=0;i<modesList.length;i++){
				//console.log(this.editor.roles.role[modesList[i].name]);
				//console.log(modesList[i].name)

				this.modes[this.modes.length]=new ObjMode({
					parent:that,
					name:modesList[i].name,
					labels:modesList[i].labels,
					tools:modesList[i].tools,
					permissions:this.editor.roles.role[modesList[i].name]
				});
				this.modes[i].generateButtonHtml($target);

				
				
			}
		},
		
		
		
		getModeClasses:function(){
			var aModes=[];
			for(var i=0;i<this.aModes.length;i++){
				aModes[aModes.length]="LOM-"+this.aModes[i]+"-active";
			}
			return aModes;
		},
		
/*---------------------------------------------------------------------------------------------
		-------------------------DOM SETUP
---------------------------------------------------------------------------------------------*/	
		prepareHtml:function(){
			$(CoreSettings.contentContainer).before("<div id=\"LOM-toolbox\"></div>");
		},
		
		prepareHtmlModes:function(){
			$("#LOM-toolbox").prepend("<div class=\"LOM-modetoggle\"><div class='LOM-modes-title'>Modes</div></div>");
			return $(".LOM-modetoggle").eq(0);
			
			
		},
		prepareHtmlDashboard:function(){
			$("#LOM-toolbox").append("<div class=\"LOM-dashboard\"><div class='LOM-modes-title'>Tools</div></div>");
			return $(".LOM-dashboard").eq(0);
			
			
		},


/*---------------------------------------------------------------------------------------------
		-------------------------UI Visual feedback
---------------------------------------------------------------------------------------------*/	
		addVisualFeedback:function(el){
			//TODO: Add other styles, switch to deal with different sort of visual feedback required... - CSPS-TD
			$(el).removeClass('LOM-feedback-transition').addClass('LOM-feedback-transition').delay(750).queue(function(){
				$(el).removeClass('LOM-feedback-transition').dequeue();
			});
		},
		
/*---------------------------------------------------------------------------------------------
		-------------------------CHANGE MODES
---------------------------------------------------------------------------------------------*/	
		changeMode:function(to){
			
			Utils.classToggle($("html"), this.modeClasses, "LOM-"+to+"-active");
		},

		doSomething:function(){

		
		}
	});
});