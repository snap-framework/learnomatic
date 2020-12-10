require([
	'../../../../js/editor/LOM_labels',
], function (labels) {
    window.labels = labels;
});

// Register the plugin within the editor.
CKEDITOR.plugins.add( 'linktopage', {

	// Register the icons.
	icons: 'linktopage',

	// The plugin initialization logic goes inside this method.
	init: function( editor ) {
		/* --------------------------------------------
		 *                     ALLOWED AND REQUIRED
		 *--------------------------------------------*/
		var allowed ="a[href, class, data-link-type]";
		//var glossaryList=masterStructure.resourcesManager.getGlossary();
		
		
		

		// Define an editor command that opens our dialog window.
		/* --------------------------------------------
		 *                     COMMAND
		 *--------------------------------------------*/
		editor.addCommand( 'linktopage', new CKEDITOR.dialogCommand( 'linktopageDialog', {
			allowedContent:allowed
		} ) );

		// Create a toolbar button that executes the above command.
		
		/* --------------------------------------------
		 *                     BUTTON
		 *--------------------------------------------*/
		
		editor.ui.addButton( 'linktopage', {

			// The text part of the button (if available) and the tooltip.
			label: labels.element.editview.linkToPage.insert,

			// The command to execute on click.
			command: 'linktopage',

			// The button placement in the toolbar (toolbar group name).
			toolbar: 'resources'
		});
		/* --------------------------------------------
		 *                     DIALOG INIT
		 *--------------------------------------------*/
		// Register our dialog file -- this.path is the plugin folder path.
		CKEDITOR.dialog.add( 'linktopageDialog', this.path + 'dialogs/linktopage.js' );
		/* --------------------------------------------
		 *                  Context Menu (RIGHT CLICK)
		 *--------------------------------------------*/	
		if ( editor.contextMenu ) {
			editor.addMenuGroup( 'linktopageGroup' );
			editor.addMenuItem( 'linktopageItem', {
				label: labels.element.editview.linkToPage.edit,
				icon: this.path + 'icons/linktopage.png',
				command: 'linktopage',
				group: 'linktopageGroup'
			});
			//SET LISTENER for new glossary elements
			editor.contextMenu.addListener( function( element ) {
				if ( element.getAscendant(function( el ) {
                    return (el.$.tagName == "A" && el.$.getAttribute("data-link-type") == "link-to-page");
                }, true ) ) {
					 return { linktopageItem: CKEDITOR.TRISTATE_OFF };
				 }
			});			
		}		
	}
});
