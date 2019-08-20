define([
    'jquery',
	'labels',
	'settings-core',
	"settings-general",
	'./../../../courses/_default/core/settings/settings-core',
	'utils',
	'modules/BaseModule',
	'./../settings/settingObj',
	'./../ui/ui-manager'

], function($,labels, CoreSettings, GeneralSettings, OriginalSettings, Utils, BaseModule, SettingObj, UiManager) {
	'use strict';

	return BaseModule.extend({
		initialize: function(options) {
			var that=this;
			that=that;
			
			this.parent=options.parent; //masterStructure.editor
			this.editor=this.parent;
			this.master=this.parent.parent; //masterStructure
			
			this.settings=[];
			
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
			$(CoreSettings.contentContainer).find(".LOM-save-settings").click(function(){
				that.saveSettings();
				that.master.editor.ui.addVisualFeedback(this);
			});
			this.connectDom();
		},
		connectDom:function(){
			for (var i=0;i<this.settings.length;i++){
				this.settings[i].connectDom();
			}
		},
/*---------------------------------------------------------------------------------------------
		-------------------------INIT
---------------------------------------------------------------------------------------------*/			
		initTemplate:function(){
			var that=this;
			$.ajax({
					url: "../../templates/settings-ui.html",
					type: 'GET',
					async: true,
					cache: false,
					timeout: 30000,
					error: function(){
						
						return true;
					},
					success: function(tpl){ 

						that.$template=$(tpl);
						that.initSettings();
					}
				});	
		},
		initSettings : function(){
			var that=this;
			
			for (var key in OriginalSettings) {
				//console.log(this);
				if(1===1){ //just in case I need to filter out unwanted properties

					this.settings[this.settings.length]=new SettingObj({
						parent:that,
						name:key,
						labels:this.labels[key],
						defaultValue:OriginalSettings[key],
						value:CoreSettings[key]
					});
				}

			}
			
			

		},
		fileWrite:function(content){
			$.post('../../editor.php', { action:"page", filename: "courses/"+this.editor.courseFolder+"/settings/settings-general.js", content: content }, function(data){
						//$(CoreSettings.contentContainer).html(bkp);
						//parse the jSON
						console.log(data);


					}).fail(function() {
						alert( "Posting failed." );
					});
		},
		saveSettings:function(){
			var saveList={};
			var setting;
			var final;
			//var toolbox;
			for (var i=0;i<this.settings.length;i++){
				
					setting=this.settings[i];
					setting.getValue();
				
					if(setting.value !== setting.defaultValue && !setting.isException()){
						saveList[setting.name]=setting.value;

					}
			
				setting.updateDomLive();

			}

			final="'use strict';\ndefine("+JSON.stringify(saveList, null, 2)+");";
			this.fileWrite(final);
		}


	});
});

