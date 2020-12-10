require([
	'../../../../js/editor/LOM_labels',
], function (labels) {
    window.labels = labels;
});

// Register the plugin within the editor.
CKEDITOR.plugins.add( 'abbr', {

	// Register the icons.
	icons: 'abbr',

	// The plugin initialization logic goes inside this method.
	init: function( editor ) {
		/* --------------------------------------------
		 *                     ALLOWED AND REQUIRED
		 *--------------------------------------------*/
		var allowed ="abbr[title,id]";

		// Define an editor command that opens our dialog window.
		/* --------------------------------------------
		 *                     COMMAND
		 *--------------------------------------------*/
		editor.addCommand( 'abbr', new CKEDITOR.dialogCommand( 'abbrDialog', {
			allowedContent:allowed
		} ) );

		// Create a toolbar button that executes the above command.
		
		/* --------------------------------------------
		 *                     BUTTON
		 *--------------------------------------------*/
		
		editor.ui.addButton( 'Abbr', {

			// The text part of the button (if available) and the tooltip.
			label: labels.resourcesEdit.abbr.insert,

			// The command to execute on click.
			command: 'abbr',

			// The button placement in the toolbar (toolbar group name).
			toolbar: 'resources'
		});
		/* --------------------------------------------
		 *                     DIALOG INIT
		 *--------------------------------------------*/
		// Register our dialog file -- this.path is the plugin folder path.
		CKEDITOR.dialog.add( 'abbrDialog', this.path + 'dialogs/abbr.js' );
		/* --------------------------------------------
		 *                  Context Menu (RIGHT CLICK)
		 *--------------------------------------------*/	
		if ( editor.contextMenu ) {
			editor.addMenuGroup( 'abbrGroup' );
			editor.addMenuItem( 'abbrItem', {
				label: labels.resourcesEdit.abbr.edit,
				icon: this.path + 'icons/abbr.png',
				command: 'abbr',
				group: 'abbrGroup'
			});
			//SET LISTENER for new abbr elements
			editor.contextMenu.addListener( function( element ) {
				if ( element.getAscendant( 'abbr', true ) ) {
					 return { abbrItem: CKEDITOR.TRISTATE_OFF };
				 }
			});			
		}		
	}
});
