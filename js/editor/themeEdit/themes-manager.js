define([
    'jquery',
	'labels',
	'settings-core',
	"settings-general",
	'./../../../courses/_default/core/settings/settings-core',
	'utils',
	'modules/BaseModule',
	'./../themeEdit/objTheme'

], function($,labels, CoreSettings, GeneralSettings, OriginalSettings, Utils, BaseModule, Theme) {
	'use strict';

	return BaseModule.extend({
		initialize: function(options) {
			var that=this;
			that=that;
			
			this.parent=options.parent; //masterStructure.editor
			this.editor=this.parent;
			this.master=this.parent.parent; //masterStructure
			
			this.$theme=$("#theme-style");
			this.$main=$("#main-style");

			this.themes=[];
			
			this.$template=null;
			this.labels=options.labels;
			
			this.initTemplate();

			
		},
/*---------------------------------------------------------------------------------------------
		-------------------------DOM INIT
---------------------------------------------------------------------------------------------*/				
		setDom:function(){
			
			var that=this;
			$(CoreSettings.contentContainer).html(this.$template.html()).hide().fadeIn();
			// ----- Set General Themes
			for(var i=0;i<this.themes.length;i++){
				this.themes[i].generateSelectButton($("#themes-list"));
				
			}
			
			
		},
		
		connectDom:function(){
		},
		
		
		
		stepTwo:function(obj){
			//$("#themes-list").find("button").removeClass("btn-selected").removeClass("snap-lg").addClass("snap-md");
			$("#themes-list").find("button").removeClass("btn-selected");
			$(obj).addClass("btn-selected");
			$("#LOM-theme-customize").show().focus().attr("open", "true");
			$("#LOM-theme-picker").removeAttr('open');
		},
		
/*---------------------------------------------------------------------------------------------
		-------------------------INIT
---------------------------------------------------------------------------------------------*/			
		initTemplate:function(){
			var that=this;
			$.ajax({
					url: "../../templates/themes-ui.html",
					type: 'GET',
					async: true,
					cache: false,
					timeout: 30000,
					error: function(){
						
						return true;
					},
					success: function(tpl){ 

						that.$template=$(tpl);
						that.initThemes();
					}
				});	
		},
		initThemes : function(){
			var that=this;
			$.post('../../editor.php', { action:"readfolder", filename: 'templates/LOM-themes/', regex:"/^[a-zA-Z]/" }, function(data){
				//parse the jSON
				if(data !== "false" && typeof data !=="undefined" && data!==""){
					//console.log(data.charAt(data.length-1));
					if(data.charAt(data.length-1)===","){
						data=data = data.slice(0, -1); 
					}
					var themesList=data.split(",");
					for(var i=0;i<themesList.length;i++){
						that.themes[that.themes.length]=new Theme({
							parent:that,
							name:themesList[i]
						});
					}
					//this.themes[this.themes.length]=data.split(",");
					
					
					
				}

				

			}).fail(function() {
				alert( "Posting failed while initializing theme." );
			});
		}
	});
});

