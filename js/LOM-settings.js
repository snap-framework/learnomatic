define(['utils'], function (Utils) {
    'use strict';

    /* liste des constantes du framework */

    var settings = {
        defaultCourse: "_default",//"_default", "_defaultESDC"
        social: {
            default: true,
            announcements: true,
            chat: false,
            review: true,
            notifications: false,
            boards: false
        }
    };
    return settings;
});
