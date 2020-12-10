define(['utils', './../LOM_labels'], function (Utils, Labels) {
	'use strict';

	/* liste des constantes du framework */

	var buttons = [{
		name: "preview",
		interface: "editor",
		labels: Labels.modes.preview,
		tools: []
	},
	{
		name: "pageEdit",
		labels: Labels.modes.pageEdit,
		interface: "editor",
		tools: [{
			name: "layout",
			icon: "LOM-layout",
			labels: Labels.tools.layout,
			action: "things"
		},
		{
			name: "savetemplate",
			icon: "SNAP-save",
			labels: Labels.tools.template,
			action: "things"
		},
		{
			name: "searchreplace",
			icon: "LOM-search",
			labels: Labels.tools.searchreplace,
			action: "things"
		},
		{
			name: "deletepage",
			icon: "LOM-trash",
			labels: Labels.tools.deletepage,
			action: "things"
		}
		]
	},
	{
		name: "structure",
		labels: Labels.modes.structure,
		interface: "editor",
		tools: [
			/*{
				name:"localview",
				icon:"LOM-newpage",
				labels:Labels.tools.localView,
				action:"things"
			}*/
			/*,
			{
				name:"globalview",
				icon:"LOM-plus",
				labels:Labels.tools.globalView,
				action:"things"
			}*/
		]
	},

	{
		name: "settings",
		labels: Labels.modes.settings,
		interface: "editor",
		tools: []
	},

	{
		name: "resources",
		labels: Labels.modes.resources,
		interface: "editor",
		tools: []
	},

	{
		name: "overview",
		labels: Labels.modes.overview,
		interface: "command",
		tools: []
	},
	{
		name: "courses",
		labels: Labels.modes.courses,
		interface: "command",
		tools: []
	},

	{
		name: "users",
		labels: Labels.modes.users,
		interface: "command",
		tools: []
	},
	/* *******************
	 *         SOCIAL
	 * *******************/
	{
		name: "notifications",
		labels: Labels.modes.notifications,
		interface: "social",
		tools: []
	},
	{
		name: "chat",
		labels: Labels.modes.chat,
		interface: "social",
		tools: []
	},
	{
		name: "review",
		labels: Labels.modes.review,
		interface: "social",
		tools: []
	},
	{
		name: "boards",
		labels: Labels.modes.boards,
		interface: "social",
		tools: []
	},
	{
		name: "announcements",
		labels: Labels.modes.announcements,
		interface: "social",
		tools: []
	}

	];
	return buttons;
});
