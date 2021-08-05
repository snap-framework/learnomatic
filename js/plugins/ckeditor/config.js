/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see https://ckeditor.com/legal/ckeditor-oss-license
 */

CKEDITOR.editorConfig = function( config ) {
	
	// %REMOVE_START%
	// The configuration options below are needed when running CKEditor from source files.
	config.plugins = 'balloonpanel,a11ychecker,dialogui,dialog,a11yhelp,about,basicstyles,bidi,blockquote,notification,button,toolbar,clipboard,codeTag,panelbutton,panel,floatpanel,colorbutton,colordialog,menu,contextmenu,copyformatting,dialogadvtab,div,elementspath,enterkey,entities,popup,filetools,filebrowser,find,fakeobjects,flash,floatingspace,listblock,richcombo,font,format,forms,horizontalrule,htmlwriter,iframe,image,indent,indentblock,indentlist,inserthtml4x,justify,menubutton,language,lightbox,link,list,liststyle,loremipsum,magicline,maximize,newpage,pagebreak,xml,ajax,pastetools,pastefromword,pastetext,pbckcode,preview,print,removeformat,resize,save,scayt,selectall,showblocks,showborders,smiley,sourcearea,sourcedialog,specialchar,stylescombo,tab,table,tabletools,tableselection,templates,undo,lineutils,widgetselection,widget,notificationaggregator,uploadwidget,uploadfile,uploadimage,wsc,wysiwygarea,balloontoolbar';
	config.skin = 'moono-lisa';
	// %REMOVE_END%

	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	// config.uiColor = '#AADC6E';
	
	//CUSTOM
	
	config.uploadUrl = '/content/medias/';
};
