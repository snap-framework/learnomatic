require([
	'../../../../js/editor/LOM_labels',
], function (labels) {
    window.labels = labels;
});

// Register the plugin within the editor.
CKEDITOR.plugins.add( 'ext-links', {

	// Register the icons.
	icons: 'ext-links',

	// The plugin initialization logic goes inside this method.
	init: function( editor ) {
		/* --------------------------------------------
		 *                     ALLOWED AND REQUIRED
		 *--------------------------------------------*/
		var allowed ="a[href, class, data-ext]";
		//var glossaryList=masterStructure.resourcesManager.getGlossary();
		
		
		

		// Define an editor command that opens our dialog window.
		/* --------------------------------------------
		 *                     COMMAND
		 *--------------------------------------------*/
		editor.addCommand( 'ext-links', new CKEDITOR.dialogCommand( 'extDialog', {
			allowedContent:allowed
		} ) );

		// Create a toolbar button that executes the above command.
		
		/* --------------------------------------------
		 *                     BUTTON
		 *--------------------------------------------*/
		
		editor.ui.addButton( 'ext-links', {

			// The text part of the button (if available) and the tooltip.
			label: labels.resourcesEdit.ext.insert,

			// The command to execute on click.
			command: 'ext-links',

			// The button placement in the toolbar (toolbar group name).
			toolbar: 'resources'
		});
		/* --------------------------------------------
		 *                     DIALOG INIT
		 *--------------------------------------------*/
		// Register our dialog file -- this.path is the plugin folder path.
		CKEDITOR.dialog.add( 'extDialog', this.path + 'dialogs/ext-links.js' );
		/* --------------------------------------------
		 *                  Context Menu (RIGHT CLICK)
		 *--------------------------------------------*/	
		if ( editor.contextMenu ) {
			editor.addMenuGroup( 'extGroup' );
			editor.addMenuItem( 'extItem', {
				label: labels.resourcesEdit.ext.edit,
				icon: this.path + 'icons/ext-links.png',
				command: 'ext-links',
				group: 'extGroup'
			});
			//SET LISTENER for new glossary elements
			editor.contextMenu.addListener( function( element ) {
				if ( element.getAscendant(function( el ) {
                    return (el.$.tagName == "A" && el.$.hasAttribute("data-ext"));
                }, true ) ) {
					 return { extItem: CKEDITOR.TRISTATE_OFF };
				 }
			});			
		}		
	}
});
