define([], function () {
	'use strict';

	/* liste des constantes du framework */

	var roles = {

		admin: {
			preview: {
				default: true,
				comments: true
			},
			pageEdit: {
				defauilt: true,
				editText: true,
				deletePage: true,
				changeLayout: true
			},
			structure: {
				default: true,
				createPage: true,
				editPage: true,
				createFolder: true,
				editFolder: true,
				moveItem: true,
				deletePage: true
			},
			settings: {
				default: true,
				changeTitles: true,
				changeMenu: true
			}
		},
		manager: {
			preview: {
				default: true,
				comments: true
			},
			pageEdit: {
				defauilt: true,
				editText: true,
				deletePage: true,
				changeLayout: true
			},
			structure: {
				default: true,
				createPage: true,
				editPage: true,
				createFolder: true,
				editFolder: true,
				moveItem: true,
				deletePage: true
			},
			settings: {
				default: true,
				changeTitles: true,
				changeMenu: true
			}
		},
		designer: {
			preview: {
				default: true,
				comments: true
			},
			pageEdit: {
				defauilt: true,
				editText: true,
				deletePage: true,
				changeLayout: true
			},
			structure: {
				default: false
			},
			settings: {
				default: false
			}
		},
		editor: {
			preview: {
				default: true,
				comments: true
			},
			pageEdit: {
				defauilt: true,
				editText: true,
				deletePage: false,
				changeLayout: false
			},
			structure: {
				default: false
			},
			settings: {
				default: false
			}
		},
		reviewer: {
			preview: {
				default: true,
				comments: true
			},
			pageEdit: {
				defauilt: false
			},
			structure: {
				default: false
			},
			settings: {
				default: false
			}
		},
		user: {
			preview: {
				default: true,
				comments: false
			},
			pageEdit: {
				defauilt: false
			},
			structure: {
				default: false
			},
			settings: {
				default: false
			}
		},
	};


	return roles;
});
