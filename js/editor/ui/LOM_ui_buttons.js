define(['utils','./../LOM_labels'], function (Utils, Labels) {
	'use strict';
	
/* liste des constantes du framework */

	var buttons = [
		{
			name:"preview",
			labels: Labels.modes.preview,
		 	tools:[]
		},
		{
			name:"pageEdit",
			labels: Labels.modes.pageEdit,
		 	tools:[
				{
					name:"layout",
					icon:"LOM-layout",
					labels:Labels.tools.layout,
					action:"things"
				},
				{
					name:"savetemplate",
					icon:"SNAP-save",
					labels:Labels.tools.template,
					action:"things"
				},
				{
					name:"deletepage",
					icon:"LOM-trash",
					labels:Labels.tools.deletepage,
					action:"things"
				}
			]
		}, 
		{
			name:"structure",
			labels: Labels.modes.structure,
		 	tools:[
				{
					name:"localview",
					icon:"LOM-newpage",
					labels:Labels.tools.localView,
					action:"things"
				}/*,
				{
					name:"globalview",
					icon:"LOM-plus",
					labels:Labels.tools.globalView,
					action:"things"
				}*/
			]
		}, 
		/*{
			name:"theme",
			labels: Labels.modes.theme,
		 	tools:[
				{
					name:"test",
					icon:"QS-checkbox",
					labels:Labels.tools.test,
					action:"things"
				}
			]
		},*/
		{
			name:"settings",
			labels: Labels.modes.settings,
		 	tools:[
			]
		}
					
	];
return buttons;
});