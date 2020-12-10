'use strict';

//Load the configs, then load the app.
require(['require-configs'], function () {
	require([
		'jquery',
		'command/app'

	], function ($, App) {
		$.ajaxSetup({ cache: false });
		App.initialize();

	});
});