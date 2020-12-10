define(function () {
    'use strict';

    //Configure loading modules from the js directory.
    require.config({
        waitSeconds: 20,
        //base url to lookup files
        baseUrl: 'js',

        //add timestamp to force no-cache
        urlArgs: "bust=" + (new Date()).getTime(),
        //To get timely, correct error triggers in IE, force a define/shim exports
        enforceDefine: false,

        //some files needs to be shimmed 
        //since they are not AMD (Asynchronous Module Definition) compliant
        //we need to export the global object so that they can be loaded as an AMD
        shim: {

            handlebars: {
                exports: 'Handlebars'
            },
            history: {
                exports: 'History'
            },
            "../../../../js/plugins/ckeditor/ckeditor": { "exports": "CKEDITOR" },
            magnific: { "exports": "magnific" },
            // "plugins/nestable/jquery.nestable": { "exports": "NESTABLE" }
        },
        //shorten path for easier usage
        paths: {
            //libraries
            jquery: '../courses/_default/core/js/lib/jquery/jquery',
            underscore: '../courses/_default/core/js/lib/underscore',
            handlebars: '../courses/_default/core/js/lib/hbs/handlebars',

            //jquery plugins
            fullpage: '../courses/_default/core/js/lib/jquery/plugins/fullpage/fullpage',
            scrollto: '../courses/_default/core/js/lib/jquery/plugins/scrollto/scrollto',

            //requirejs plugins
            hbs: '../courses/_default/core/js/lib/hbs/hbs',
            text: '../courses/_default/core/js/lib/require.text',


            'magnific': '../courses/_default/WET/js/deps/jquery.magnific-popup',

            //WET main script
            //'wet-boew': '../../WET/js/wet-boew',

            //these serve as shortcut paths

            labels: ['./../courses/_default/core/settings/localization/labels'],
            'settings-core': './../courses/_default/core/settings/settings-core',
            'settings-general': './../courses/_default/core/settings/settings-general',
            settingsOverride: './../courses/_default/core/helpers/settingsOveride',
            utils: './../courses/_default/core/js/helpers/utils',
            logger: './../courses/_default/core/helpers/logger',
            router: './../courses/_default/core/modules/router',
            history: './../courses/_default/core/plugins/native.history',
            //script used for creating custom code per course
            /*'ga-List': 'modules/google-analytics/ga-list.json',
            interactions: '../../content/scripts/interactions',

            //hbs templates path
            templates: "../templates",
            content: "../../content"
                */
        },

        //https://github.com/SlexAxton/require-handlebars-plugin
        //DO NOT UPDATE LIBRARY (custom changes)
        hbs: {
            templateExtension: 'html',
            handlebarsPath: 'lib/hbs/handlebars'
        }
    });
});
