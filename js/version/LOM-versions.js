define(['utils'], function (Utils) {
    'use strict';

    /* liste des constantes du framework */

    var versions = {

        "2.0.0": {

        },
        "2.0.1": {
            "modified": [
                "content/tools/help_en.html#",
                "content/tools/help_fr.html#",
                "content/tools/favorites_en.html",
                "content/tools/favorites_fr.html",
                "content/tools/glossary_en.html#",
                "content/tools/glossary_fr.html#",
                "content/tools/resources_en.html#",
                "content/tools/resources_fr.html#",
                "core/js/modules/scorm/scorm-controller.js",
                "core/js/modules/environment.js",
                "core/js/plugins/qsbeta.js",
                "core/settings/settings-core.js"
            ]
        },
        "2.0.2": {
            "modified": []

        },
        "2.0.3": {
            "modified": ["index_en.html",
                "index_fr.html",
                "theme/base/",
                "theme/scss/_newicons.scss",
                "theme/scss/_vars#",
                "core/js/",
                "core/scss/",
                "core/settings/",
                "core/templates/admin-mode/admin-mode.html"
            ]

        },
        "2.0.4": {
            "modified": []
        }

    };
    return versions;
});
