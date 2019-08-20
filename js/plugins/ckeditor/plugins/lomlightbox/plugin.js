/*
 * LIGHTBOX GENERATPOR
 */


CKEDITOR.plugins.add( 'lomlightbox', {

	icons: 'lomlightbox',

	init: function( editor ) {
		editor.addCommand( 'insertLightbox', {

			// Define the function that will be fired when the command is executed.
			exec: function( editor ) {
				var now = new Date();

				console.log(this);
				console.log(editor);
				// Insert the timestamp into the document.
				editor.insertHtml( 'The current date and time is: <em>' + now.toString() + '</em>' );
			}
		});

		// Create the toolbar button that executes the above command.
		editor.ui.addButton( 'Lomlightbox', {
			label: 'Insert Lightbox',
			command: 'insertLightbox',
			toolbar: 'resources'
		});
	}
});