require([
	'../../../../js/editor/LOM_labels',
], function (labels) {
    window.labels = labels;
});

// Our dialog definition.
CKEDITOR.dialog.add( 'abbrDialog', function( editor ) {
	
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
		title: labels.resourcesEdit.abbr.insert,
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
						id: 'selectAbbr',
						label: labels.resourcesEdit.abbr.term,
						style: 'width : 100%;',
						'items': abbrList(),
						//'default':setDefault(this),
						'default':abbrList()[0][1].toString(),
						onChange: targetChanged,
						setup: function( data ) {
							//var list=masterStructure.resourcesManager.getGlossaryArray();
							var index=$(data.$).attr("title");
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

					/*{
						// Text input field for the glossary title (explanation).
						type: 'text',
						id: 'href',
						label: 'Abbr ID',
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
			if (element){
				element = element.getAscendant('abbr', true);

			}
			
			if (!element || element.getName() !== 'abbr') {
				//-----CREATE
				element = editor.document.createElement( 'abbr' );
				element.setAttribute("title", "description")
				
				this.insertMode = true;
			}else{
				//-----EDIT
				this.insertMode = false;			
			}
			this.element = element;
            
			if (!this.insertMode){
				this.setupContent(element);
			}
            else{
				//
				//console.log(this);
				//this.
			}
		},
		/* --------------------------------------------
		 *                     on OK
		 *--------------------------------------------*/
		onOk: function() {

			var dialog = this,
				abbr = dialog.element;
			//glossary.setAttribute("class", "csps-glossary");
			
			var textOverride=dialog.getValueOf('tab-basic', 'selectAbbr');
			var label = Object.keys(masterStructure.resourcesManager.abbrs)[textOverride];
			
			abbr.setText(label);            
            //abbr.setAttribute("title", Object.values(masterStructure.resourcesManager.abbrs)[textOverride].description)
			dialog.commitContent(abbr);

			if (dialog.insertMode){
				editor.insertElement(abbr);			
			}
		}
	};
	
});
	/* --------------------------------------------
	 *                     ABBR LIST
	 *--------------------------------------------*/
	function abbrList(){
        
		var terms = Object.keys(masterStructure.resourcesManager.abbrs);
		var defs = Object.values(masterStructure.resourcesManager.abbrs);
		//var returnList=[["Create New","default"]];
		var returnList=[];
        if(terms.length > 0){
            for (var i=0;i<terms.length;i++){
                //console.log(terms[i]);
                returnList[returnList.length]=[terms[i], i];//terms[i].term;
                //returnList[i][1]="id";//terms[i].id;
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

