// Register the plugin within the editor.
CKEDITOR.plugins.add( 'glossary', {

	// Register the icons.
	icons: 'glossary',

	// The plugin initialization logic goes inside this method.
	init: function( editor ) {
		/* --------------------------------------------
		 *                     ALLOWED AND REQUIRED
		 *--------------------------------------------*/
		var allowed ="a[href,class]";
		//var glossaryList=masterStructure.resourcesManager.getGlossary();
		
		
		

		// Define an editor command that opens our dialog window.
		/* --------------------------------------------
		 *                     COMMAND
		 *--------------------------------------------*/
		editor.addCommand( 'glossary', new CKEDITOR.dialogCommand( 'glossaryDialog', {
			allowedContent:allowed
		} ) );

		// Create a toolbar button that executes the above command.
		
		/* --------------------------------------------
		 *                     BUTTON
		 *--------------------------------------------*/
		
		editor.ui.addButton( 'Glossary', {

			// The text part of the button (if available) and the tooltip.
			label: 'Insert Term',

			// The command to execute on click.
			command: 'glossary',

			// The button placement in the toolbar (toolbar group name).
			toolbar: 'resources'
		});
		/* --------------------------------------------
		 *                     DIALOG INIT
		 *--------------------------------------------*/
		// Register our dialog file -- this.path is the plugin folder path.
		CKEDITOR.dialog.add( 'glossaryDialog', this.path + 'dialogs/glossary.js' );
		/* --------------------------------------------
		 *                  Context Menu (RIGHT CLICK)
		 *--------------------------------------------*/	
		if ( editor.contextMenu ) {
			editor.addMenuGroup( 'glossaryGroup' );
			editor.addMenuItem( 'glossaryItem', {
				label: 'Edit Term',
				icon: this.path + 'icons/glossary.png',
				command: 'glossary',
				group: 'glossaryGroup'
			});
			//SET LISTENER for new glossary elements
			editor.contextMenu.addListener( function( element ) {
				if ( element.getAscendant( 'glossary', true ) ) {
					 return { glossaryItem: CKEDITOR.TRISTATE_OFF };
				 }
			});			
		}		
	}
});
