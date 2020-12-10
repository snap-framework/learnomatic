require([
	'../../../../js/editor/LOM_labels',
], function (labels) {
    window.labels = labels;
});

// Our dialog definition.
CKEDITOR.dialog.add( 'glossaryDialog', function( editor ) {
	
	/*
	var glossaryList=masterStructure.resourcesManager.getGlossary();
	var selection = editor.getSelection();
	var element = selection.getStartElement();
	//Line manager
	var value=$(element.$).text();
	
	console.log(value);
	*/
	
	return {
		
		// Basic properties of the dialog window: title, minimum size.
		title: labels.resourcesEdit.glossary.insert,
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
						type: 'select',
						id: 'selectGlossary',
						label: labels.resourcesEdit.glossary.term,
						style: 'width : 100%;',
						'items': glossaryList(),
						//'default':setDefault(this),
						'default':glossaryList()[0][1],
						onChange: targetChanged,
						setup: function( data ) {
							//var list=masterStructure.resourcesManager.getGlossaryArray();
							var index=$(data.$).attr("href").substring(1);
							if (typeof index !=="undefined"){
								this.setValue(index);
							}
							

							
							/*
							if ( data.target )
								this.setValue( data.target.type || 'notSet' );
							targetChanged.call( this );
							*/
						},
						commit: function( element ) {
							element.setAttribute("href", "#"+this.getValue());
							/*
							if ( !data.target )
								data.target = {};

							data.target.type = this.getValue();
							*/
						}
					},
/*
					{
						// Text input field for the glossary title (explanation).
						type: 'text',
						id: 'href',
						label: 'Glossary ID',
						//validate: CKEDITOR.dialog.validate.notEmpty( "Explanation field cannot be empty." ),
						setup: function( element ) {
							//get the href attribute.
							this.setValue( element.getAttribute( "href" ).substring(1)  );
						},
						commit:function(element){
							//element.setAttribute("href", "#"+this.getValue());
						}
					}*/
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
			var selectedText= editor.getSelection().getSelectedText();
			
			
			
			//check if there'S an element selected
			if ( element ){
				element = element.getAscendant( 'a', true );

			}
			
			if ( !element || element.getName() !== 'a' ) {
				//-----CREATE
				element = editor.document.createElement( 'a' );
				element.setAttribute("href", "#boat")
				
				this.insertMode = true;
			}else{
				//-----EDIT
				this.insertMode = false;			
			}
			this.element = element;
			if ( !this.insertMode ){
				this.setupContent( element );
			}else{
				//
				//console.log(this);
				//this.
			}
		},
		/* --------------------------------------------
		 *                     on OK
		 *--------------------------------------------*/
		onOk: function() {
			var dialog = this, glossary = dialog.element;
			
            glossary.setAttribute("class", "csps-glossary");
			
			var textOverride=dialog.getValueOf('tab-basic', 'selectGlossary');
			var label=masterStructure.resourcesManager.getGlossary(textOverride).term;
			
			glossary.setText(label);
            glossary.setAttribute("href", "#" + textOverride);
            glossary.setAttribute("data-cke-saved-href", "#" + textOverride);
            
			dialog.commitContent( glossary );

			if ( dialog.insertMode ){
				editor.insertElement( glossary );			
			}
		}
	};
	
});
	/* --------------------------------------------
	 *                     GLOSSARY LIST
	 *--------------------------------------------*/
	function glossaryList(){

		var list=masterStructure.resourcesManager.getGlossaryArray();
		//var returnList=[["Create New","default"]];
		var returnList=[];
        if(list.length > 0){
            for (var i=0;i<list.length;i++){
                //console.log(list[i]);
                returnList[returnList.length]=[list[i].term, list[i].id];//list[i].term;
                //returnList[i][1]="id";//list[i].id;
            }
        }
        else{
            returnList[returnList.length] = ["", ""];
        }
        
		return returnList;

	}
	/* --------------------------------------------
	 *                     se4t default
	 *--------------------------------------------*/
	function setDefault(editor){
		//console.log(CKEDITOR.dialog);
		/*
			var selection = editor.getSelection();
			//var element = selection.getStartElement();
			var selectedText= editor.getSelection().getSelectedText();
		//var list=masterStructure.resourcesManager.getGlossaryArray();
		var results= masterStructure.resourcesManager.getGlossary("job");
		console.log(selectedText);*/
		/*var returnList=[["Create New","default"]];
		for (var i=0;i<list.length;i++){
			//console.log(list[i]);
			returnList[returnList.length]=[list[i].term, list[i].id];//list[i].term;
			//returnList[i][1]="id";//list[i].id;
		}
		return returnList;*/
		
		
		return "default";

	}

function targetChanged(){



				//var dialog = this.getDialog(),
					//targetName = dialog.getContentElement( 'target', 'linkTargetName' ),
					//glossaryId=dialog.getContentElement('id'),
					//value = this.getValue();

				/*if ( !popupFeatures || !targetName )
					return;
					*/
/*
				popupFeatures = popupFeatures.getElement();
				popupFeatures.hide();
				targetName.setValue( '' );
*/
	/*
				switch ( value ) {
					case 'frame':
						targetName.setLabel( editor.lang.link.targetFrameName );
						targetName.getElement().show();
						break;
					case 'popup':
						popupFeatures.show();
						targetName.setLabel( editor.lang.link.targetPopupName );
						targetName.getElement().show();
						break;
					default:
						targetName.setValue( value );
						targetName.getElement().hide();
						break;
				}	
	
	*/
}

