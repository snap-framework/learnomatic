define([], function () {
	'use strict';

	/* liste des constantes du framework */

	var roles = {

		admin: {
			command: {
				overview: true,
				courses: true,
				users: true,
				seeUserTeam: true,
				seeUserAll: true,
				editUser: true,
				seeCourseTeam: true,
				seeCourseAll: true,
				configCourse: true,
				download: true,
				deleteTeam: true,
				deleteAll: true,
				upload: true
			},
			social: {
				chat: true,
				review: true,
				announcements: true
			},
			preview: {
				default: true,
				comments: true
			},
			pageEdit: {
				default: true,
				editText: true,
				deletePage: true,
				changeLayout: true,
				seeReviews: true,
				createReviews: true,
				deleteAllReviews: true
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
			},
			theme: {
				default: true
			},
			resources: {
				default: true
			},
			level: 1
		},
		manager: {
			command: {
				overview: true,
				courses: true,
				users: true,
				seeUserTeam: true,
				seeUserAll: true,
				editUser: true,
				seeCourseTeam: true,
				seeCourseAll: true,
				configCourse: true,
				download: true,
				deleteTeam: true,
				deleteAll: false,
				upload: true
			},
			social: {
				chat: true,
				review: true,
				announcements: false
			},
			preview: {
				default: true,
				comments: true
			},
			pageEdit: {
				default: true,
				editText: true,
				deletePage: true,
				changeLayout: true,
				seeReviews: true,
				createReviews: true,
				deleteAllReviews: true
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
			},
			theme: {
				default: true
			},
			resources: {
				default: true
			},
			level: 2
		},
		designer: {
			command: {
				overview: true,
				courses: true,
				users: false,
				seeUserTeam: true,
				seeUserAll: true,
				editUser: false,
				seeCourseTeam: true,
				seeCourseAll: false,
				configCourse: true,
				download: true,
				deleteTeam: false,
				deleteAll: false,
				upload: false
			},
			social: {
				chat: true,
				review: true,
				announcements: false
			},
			preview: {
				default: true,
				comments: true
			},
			pageEdit: {
				default: true,
				editText: true,
				deletePage: true,
				changeLayout: true,
				seeReviews: true,
				createReviews: true,
				deleteAllReviews: true
			},
			structure: {
				default: true
			},
			settings: {
				default: true
			},
			theme: {
				default: true
			},
			resources: {
				default: true
			},
			level: 3
		},
		editor: {
			command: {
				overview: true,
				courses: true,
				users: false,
				seeUserTeam: true,
				seeUserAll: true,
				editUser: false,
				seeCourseTeam: true,
				seeCourseAll: false,
				configCourse: false,
				download: false,
				deleteTeam: false,
				deleteAll: false,
				upload: false
			},
			social: {
				chat: true,
				review: true,
				announcements: false
			},
			preview: {
				default: true,
				comments: true
			},
			pageEdit: {
				default: true,
				editText: true,
				deletePage: false,
				changeLayout: false,
				seeReviews: true,
				createReviews: true,
				deleteAllReviews: true
			},
			structure: {
				default: false
			},
			settings: {
				default: false
			},
			theme: {
				default: true
			},
			resources: {
				default: true
			},
			level: 4
		},
		reviewer: {
			command: {
				overview: true,
				courses: true,
				users: false,
				seeUserTeam: true,
				seeUserAll: false,
				editUser: false,
				seeCourseTeam: true,
				seeCourseAll: false,
				configCourse: false,
				download: false,
				deleteTeam: false,
				deleteAll: false,
				upload: false
			},
			social: {
				chat: true,
				review: true,
				announcements: false
			},
			preview: {
				default: true,
				comments: true
			},
			pageEdit: {
				default: true,
				editText: false,
				deletePage: false,
				changeLayout: false,
				seeReviews: true,
				createReviews: true,
				deleteAllReviews: false
			},
			structure: {
				default: false
			},
			settings: {
				default: false
			},
			theme: {
				default: true
			},
			resources: {
				default: false
			},
			level: 5
		},
		user: {
			command: {
				overview: false,
				courses: false,
				users: false,
				seeUserTeam: false,
				seeUserAll: false,
				editUser: false,
				seeCourseTeam: false,
				seeCourseAll: false,
				configCourse: false,
				download: false,
				deleteTeam: false,
				deleteAll: false,
				upload: false
			},
			social: {
			},
			preview: {
				default: true,
				comments: false
			},
			pageEdit: {
				default: false
			},
			structure: {
				default: false
			},
			settings: {
				default: false
			},
			theme: {
				default: true
			},
			resources: {
				default: false
			},
			level: 6
		}
	};


	return roles;
});
