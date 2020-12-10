require([
	'../../../../js/editor/LOM_labels',
], function (labels) {
    window.labels = labels;
});

// Register the plugin within the editor.
CKEDITOR.plugins.add( 'QS', {

	// Register the icons.
	icons: 'nb-question, nb-total',

	// The plugin initialization logic goes inside this method.
	init: function( editor ) {
        
		/* --------------------------------------------
		 *                     COMMAND
		 *--------------------------------------------*/
		editor.addCommand( 'nb-question', commandNbQuestion );
		editor.addCommand( 'nb-total', commandNbTotal );

		// Create a toolbar button that executes the above command.
		
		/* --------------------------------------------
		 *                     BUTTON
		 *--------------------------------------------*/
		
		editor.ui.addButton( 'nb-question-button', {

			// The text part of the button (if available) and the tooltip.
			label: labels.element.editview.QS.insertNbQuestion,

			// The command to execute on click.
			command: 'nb-question',

			// The button placement in the toolbar (toolbar group name).
			toolbar: 'QS',
            
            icon: this.path + '/icons/nb-question.png'
		});
        
        editor.ui.addButton( 'nb-total-button', {

			// The text part of the button (if available) and the tooltip.
			label: labels.element.editview.QS.insertNbTotal,

			// The command to execute on click.
			command: 'nb-total',

			// The button placement in the toolbar (toolbar group name).
			toolbar: 'QS',
            
            icon: this.path + '/icons/nb-total.png'
		});        
	}
});

var commandNbQuestion = {
            
    exec: function( editor ) {
        var el = new CKEDITOR.dom.element("span");
        el.addClass("qs-get-current-question");
        el.appendText("{" + labels.element.editview.QS.nbQuestion + "}");
        
        editor.insertElement(el);
    },

    allowedContent: 'span[class]',
    requiredContent: 'span[class]'
};

var commandNbTotal = {

    exec: function( editor ) {
        var el = new CKEDITOR.dom.element("span");
        el.addClass("qs-get-nb-questions");
        el.appendText("{" + labels.element.editview.QS.nbTotal + "}");
        
        editor.insertElement(el);
    },

    allowedContent: 'span[class]',
    requiredContent: 'span[class]'
};
