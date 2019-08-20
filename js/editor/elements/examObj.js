define([
	
    'jquery',
	'settings-core',
	'./../pageEdit/elementClass'
], function($, CoreSettings, ElementClass) {
	'use strict';
	return ElementClass.extend({
		initialize: function(options) {
			
			this.options=options;
		},
	 
		
		//-------------------------
		doSomething:function(){
			
			
		}
	});
});