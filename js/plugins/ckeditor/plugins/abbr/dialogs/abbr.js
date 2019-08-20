
// Our dialog definition.
CKEDITOR.dialog.add( 'abbrDialog', function( editor ) {
	return {

		// Basic properties of the dialog window: title, minimum size.
		title: 'Abbreviation Properties',
		minWidth: 400,
		minHeight: 200,

		// Dialog window content definition.
		contents: [
			{
				// Definition of the Basic Settings dialog tab (page).
				id: 'tab-basic',
				label: 'Basic Settings',

				// The tab content.
				elements: [
					{
						// Text input field for the abbreviation text.
						type: 'text',
						id: 'abbr',
						label: 'Abbreviation',

						// Validation checking whether the field is not empty.
						validate: CKEDITOR.dialog.validate.notEmpty( "Abbreviation field cannot be empty." ),
						setup: function(element){
							//get the text from inside the element (abbr)
							this.setValue(element.getText() );
						},
						commit:function(element){
							//commit is to update the element instead of override
							element.setText(this.getValue());
						}
					},
					{
						// Text input field for the abbreviation title (explanation).
						type: 'text',
						id: 'title',
						label: 'Explanation',
						validate: CKEDITOR.dialog.validate.notEmpty( "Explanation field cannot be empty." ),
						setup: function( element ) {
							//get the title attribute.
							this.setValue( element.getAttribute( "title" ) );
						},
						commit:function(element){
							element.setAttribute("title", this.getValue());
						}
					}
				]
			},

			// Definition of the Advanced Settings dialog tab (page).
			{
				id: 'tab-adv',
				label: 'Advanced Settings',
				elements: [
					{
						// Another text field for the abbr element id.
						type: 'text',
						id: 'id',
						label: 'Id',
						setup: function( element ) {
							this.setValue( element.getAttribute( "id" ) );
						},
						commit:function(element){
							var id=this.getValue();
							if(id){
								element.setAttribute('id', id);
							}else if(!this.insertMode){
								element.removeAttribute('id');
							}
						}
					}
				]
			}
		],
		/* --------------------------------------------
		 *                     on SHOW
		 *--------------------------------------------*/
		onShow: function() {
			// The code that will be executed when a dialog window is loaded.
			var selection = editor.getSelection();
			var element = selection.getStartElement();
			//check if there'S an element selected
			if ( element ){
				element = element.getAscendant( 'abbr', true );
			}
			
			if ( !element || element.getName() !== 'abbr' ) {
				//-----CREATE
				element = editor.document.createElement( 'abbr' );
				this.insertMode = true;
			}
			else{
				//-----EDIT
				this.insertMode = false;			
			}
			this.element = element;
			if ( !this.insertMode ){
				this.setupContent( element );
			}
		},
		/* --------------------------------------------
		 *                     on OK
		 *--------------------------------------------*/
		onOk: function() {
			/* BASIC VERSION
			// The context of this function is the dialog object itself.
			var dialog = this;

			// Create a new <abbr> element.
			var abbr = editor.document.createElement( 'abbr' );

			// Set element attribute and text by getting the defined field values.
			abbr.setAttribute( 'title', dialog.getValueOf( 'tab-basic', 'title' ) );
			abbr.setText( dialog.getValueOf( 'tab-basic', 'abbr' ) );

			// Now get yet another field value from the Advanced Settings tab.
			var id = dialog.getValueOf( 'tab-adv', 'id' );
			if ( id ){
				abbr.setAttribute( 'id', id );
			}

			// Finally, insert the element into the editor at the caret position.
			editor.insertElement( abbr );
			// end basic version
			*/
			var dialog = this,
				abbr = dialog.element;

			dialog.commitContent( abbr );

			if ( dialog.insertMode ){
				editor.insertElement( abbr );			
			}
		}
	};
});
