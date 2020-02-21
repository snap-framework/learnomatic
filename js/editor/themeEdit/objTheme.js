define([
	
    'jquery',
	'labels',
	'settings-core',
	'utils',
	'modules/BaseModule'
	
], function($,labels, CoreSettings, Utils, BaseModule) {
	'use strict';

	return BaseModule.extend({
		initialize: function(options) {
			//var that=this;
			this.parent=options.parent;
			this.master=this.parent.master;
			this.editor=this.parent.editor;
			
			this.name=options.name;
			this.themeFile="theme.css";
			this.mainFile="main.css";
			this.themeLocation="templates/LOM-themes/"+this.name+"/";
			

			
			this.$el=null;

		},
/*---------------------------------------------------------------------------------------------
		-------------------------DOM SETUP
---------------------------------------------------------------------------------------------*/			
	
		select:function(){
			$("html").hide();
			this.parent.$theme.attr("href", "../../"+this.themeLocation+this.themeFile);
			this.parent.$main.attr("href", "../../"+this.themeLocation+this.mainFile);
			$("html").fadeIn("slow");
		},
		generateSelectButton:function($target){
			var that=this;
			$target.append("<button class='snap-lg ico-LOM-theme' name='"+this.name+"'>"+this.name+"</button>");
			var $btn=$target.children("button").eq($target.children("button").length-1);
			//$btn.attr("style", ":before{background-color:red!important;}");
			$btn.append("<style>#themes-list [name='"+this.name+"']:before{background-image:url(../../templates/LOM-themes/"+this.name+"/preview.jpg);}</style>")
			$btn.click(function(){
				that.select();
				that.parent.stepTwo(this);
			});
			/*btnHtml="<button class='snap-md ico-LOM-theme' value=\""+this.themes[i].name+"\">"+this.themes[i].name+"</button>";
							$("#themes-list").append(btnHtml);
							$("#themes-list").children("button").eq(i).click(function(){
								console.log(that);
							});*/			
		},
		
		doSomething:function(){



		
		}
	});
});