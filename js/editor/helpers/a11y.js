define([

	'jquery',
	'labels',
	'settings-core',
	'utils',
	'modules/BaseModule'

], function ($, labels, CoreSettings, Utils, BaseModule) {
	'use strict';

	return BaseModule.extend({
		initialize: function (options) {
			var that = this;

			this.parent = options.parent;

			this.root = this.parent.root;
			$(masterStructure)
				.on("Framework:pageLoaded", function () {
					var $toggle = $(".ico-fontawesome-keyword.snap-md");
					$toggle.toggleClass("LOM-a11y-active");

					if ($toggle.hasClass("LOM-a11y-active")) {
						$toggle.removeClass("LOM-a11y-active");
						that.resetDom();
					}
				});
			$(window)
				.on("LOM:switchMode", function (e, newMode) {
					that.modeSwitch(newMode);
				});


		},
		/*---------------------------------------------------------------------------------------------
				-------------------------DOM SETUP
		---------------------------------------------------------------------------------------------*/


		startA11yCheck: function () {
			var $toggle = $(".ico-fontawesome-a11y.snap-md");
			$toggle.toggleClass("LOM-a11y-active");

			if ($toggle.hasClass("LOM-a11y-active")) {
				var params = {
					title: "Accessibility Check",
					obj: this,
					action: this.afterPop,
					onclose: this.onClosePop
				};

				//this.parent.lbxController.pop(params)
				this.setupDomPage($("#dynamic_content"));
			} else {
				this.resetDom();
			}

		},

		resetDom: function () {
			$("html").removeClass("LOM-show-CKE-a11y-suggestions");
			$("#LOM_a11y").remove();
			$("#cke_LOM_a11y").remove();
			$("#dynamic_content").show();
			$(".cke_balloon").remove();

		},
		modeSwitch: function (newMode) {
			if ($(".ico-fontawesome-a11y.snap-md").hasClass("LOM-a11y-active")) {

				this.resetDom();
			}
		},

		setupDomPage: function ($target) {
			$("html").addClass("LOM-show-CKE-a11y-suggestions");
			var id = "LOM_a11y";
			var html = this.parent.originalHtml;
			var content;
			// strip the lom editors
			var $div = $("<div>");
			$div.html(this.parent.originalHtml);
			var $edit = $div.find(".LOM-editable");
			for (var i = 0; i < $edit.length; i++) {
				//remove the editbox for fixing's sake
				content = $edit.eq(i).html();
				$edit.eq(i).parent().html(content);
			}

			//spit it out
			$target.after("<textarea id='" + id + "'></textarea>");
			$target.next("textarea").val($div.html());
			//launch CKE
			this.launchCKE();
			//.cke_button__a11ychecker
			$("#dynamic_content").hide()
		},


		onClosePop(params) {
			$("html").removeClass("LOM-show-CKE-a11y-suggestions");
		},
		//once the megachecker is ready to go, mod it
		checkerReady: function (obj) {
			$(".cke_button__a11ychecker").eq(0).trigger("click");
			//obj.readOnly=true;

			var cke = CKEDITOR.instances["LOM_a11y"]
			cke.setReadOnly(true)
			$(".cke_top").hide();
		},

		launchCKE: function () {
			var that = this;
			var config = {
				on: {
					instanceReady: function () {
						var editor = this,
							a11ychecker = editor._.a11ychecker;

						// Depending on whether it is a dev version or not, Accessibility Checker might not be available yet (#246).
						if (a11ychecker.exec) {
							a11yCheckerReady(editor)
						} else {
							a11ychecker.once('loaded', function () {
								that.checkerReady(this);
								a11yCheckerReady(editor);
							});
						}

						// This function simply registers the meta data of the custom Issues.
						function registerCustomIssueTypes(a11ychecker) {
							a11ychecker.engine.issueDetails.preferHttpsLinks = {
								title: 'Prefer HTTPS links',
								descr: 'It\'s year ' + (new Date()).getFullYear() + ' already - our website uses HTTPS. ' +
									'You should use a safe protocol whenever possible.'
							};

							a11ychecker.engine.issueDetails.avoidStrongs = {
								title: 'Avoid strongs',
								descr: 'Our users do not like <strong>strongs</strong>, use <em>emphasize</em> instead 😉'
							};
						}

						function a11yCheckerReady(editor) {
							var a11ychecker = editor._.a11ychecker;

							registerCustomIssueTypes(a11ychecker);

							a11ychecker.engine.on('process', function (evt) {

								// This is where the actual checking occurs, and this is where you want to report custom issues.
								var Issue = CKEDITOR.plugins.a11ychecker.Issue,
									contentElement = evt.data.contentElement,
									issues = evt.data.issues;

								CKEDITOR.tools.array.forEach(contentElement.find('a[href^="http://ckeditor.com"]').toArray(), function (link) {
									issues.addItem(new Issue({
										originalElement: link,
										testability: Issue.testability.ERROR,
										id: 'preferHttpsLinks'
									}, a11ychecker.engine));
								});

								CKEDITOR.tools.array.forEach(contentElement.find('strong').toArray(), function (strong) {
									issues.addItem(new Issue({
										originalElement: strong,
										testability: Issue.testability.NOTICE,
										id: 'avoidStrongs'
									}, a11ychecker.engine));
								});
							});
						};

					},
					change: function () {
						//console.log("change");
					}
				}
			}

			config.a11ychecker_quailParams = this.testParams();

			CKEDITOR.replace('LOM_a11y', config);
		},
		/*---------------------------------------------------------------------------------------------
				-------------------------SINGLE CKE
		---------------------------------------------------------------------------------------------*/

		singleEditBoxConfig: function (config) {
			config.toolbar.push({
				name: 'accessibility',
				items: ['A11ychecker']
			});
			config.a11ychecker_quailParams = this.testParams();

			return config;
		},
		/*---------------------------------------------------------------------------------------------
				-------------------------TESTS
		---------------------------------------------------------------------------------------------*/


		testParams: function () {
			return {
				jsonPath: 'https://ckeditor.com/docs/ckeditor4/4.16.0/examples/assets/plugins/a11ychecker/libs/quail',
				// Override Accessibility Checker guidelines from the default configuration.
				guideline: [
					'aAdjacentWithSameResourceShouldBeCombined', //Adjacent links that point to the same location should be merged
					'aImgAltNotRepetitive', //Alternative text for image in a link should not repeat the text in the link
					'aInPHasADistinctStyle', //Links should be have a distinct style inside a p tag
					'aLinkTextDoesNotBeginWithRedundantWord', //Link text should not begin with redundant text
					'aLinksAreSeparatedByPrintableCharacters', //Lists of links should be seperated by printable characters
					'aLinksDontOpenNewWindow', //Links should not open a new window without warning
					'aLinksNotSeparatedBySymbols', //Links should not be separated by symbols alone
					'aLinksToMultiMediaRequireTranscript', //Any links to a multimedia file should also include a link to a transcript
					'aLinksToSoundFilesNeedTranscripts', //Any links to a sound file should also include a link to a transcript
					'aLinkWithNonText', //Links with only non-text content should be readable
					'aMultimediaTextAlternative',
					'aMustContainText', //Links should contain text
					'aMustHaveTitle', //All links must have a "title" attribute
					//'aMustNotHaveJavascriptHref',//Links should not use "javascript" in their location
					'aSuspiciousLinkText', //Link text should be useful
					'aTitleDescribesDestination', //The title attribute of all source a (anchor) elements describes the link destination.
					'addressForAuthor', //The document should contain an address for the author
					'addressForAuthorMustBeValid', //The document should contain a valid email address for the author
					'appletContainsTextEquivalent', //All applets should contain the same content within the body of the applet
					'appletContainsTextEquivalentInAlt', //All applets should contain a text equivalent in the "alt" attribute
					'appletProvidesMechanismToReturnToParent', //All applets should provide a way for keyboard users to escape
					'appletTextEquivalentsGetUpdated',
					'appletUIMustBeAccessible', //Any user interface in an applet must be accessible
					'appletsDoNotFlicker', //All applets do not flicker
					'appletsDonotUseColorAlone', //Applets should not use color alone to communicate content
					'areaAltIdentifiesDestination', //All "area" elements must have an "alt" attribute which describes the link destination
					'areaAltRefersToText', //Alt text for "area" elements should replicate the text found in the image
					'areaDontOpenNewWindow', //No "area" elements should open a new window without warning
					'areaHasAltValue', //All "area" elements must have an "alt" attribute
					'areaLinksToSoundFile', //All "area" elements which link to a sound file should also provide a link to a transcript
					'ariaOrphanedContent', //Pages using ARIA roles should not have orphaned content
					'basefontIsNotUsed', //Basefont should not be used
					'blinkIsNotUsed', //The "blink" tag should not be used
					'blockquoteNotUsedForIndentation', //The block quote should not be used just for indentation
					'blockquoteUseForQuotations', //If long quotes are in the document, use the "blockquote" element to mark them
					'boldIsNotUsed', //The "b" (bold) element is not used
					'buttonHasName', //Button should contain text
					'checkboxHasLabel', //All checkboxes must have a corresponding label
					'checkboxLabelIsNearby', //All "checkbox" input elements have a label that is close
					'closingTagsAreUsed', //All tags that require closing tags have closing tags
					'contentPositioningShouldNotChangeMeaning', //Meaning should not be created through positioning
					'cssDocumentMakesSenseStyleTurnedOff', //The document must be readable with styles turned off

					'colorFontContrast', //All elements should have appropriate color contrast
					//'colorElementBehindContrast',//All elements should have appropriate color contrast
					'colorBackgroundImageContrast', //All elements should have appropriate color contrast
					'colorElementBehindBackgroundImageContrast', //All elements should have appropriate color contrast
					'colorBackgroundGradientContrast', //All elements should have appropriate color contrast
					'colorElementBehindBackgroundGradientContrast', //All elements should have appropriate color contrast

					'definitionListsAreUsed', //Use a definition list for defining terms
					'doctypeProvided', //The document should contain a valid "doctype" declaration
					//'documentAbbrIsUsed',//Abbreviations must be marked with an "abbr" element
					//'documentAcronymsHaveElement',//Acronyms must be marked with an "acronym" element
					'documentAutoRedirectNotUsed', //Auto-redirect with "meta" elements must not be used
					'documentContentReadableWithoutStylesheets', //Content should be readable without style sheets
					'documentHasTitleElement', //The document should have a title element
					'documentIDsMustBeUnique', //All element "id" attributes must be unique
					'documentIsWrittenClearly', //The document should be written to the target audience and read clearly
					'documentLangIsISO639Standard', //The document's language attribute should be a standard code
					'documentLangNotIdentified', //The document must have a "lang" attribute
					'documentMetaNotUsedWithTimeout', //Meta elements must not be used to refresh the content of a page
					'documentReadingDirection', //Reading direction of text is correctly marked
					'documentStrictDocType', //The page uses a strict doctype
					'documentTitleDescribesDocument', //The title describes the document
					'documentTitleIsNotPlaceholder', //The document title should not be placeholder text
					'documentTitleIsShort', //The document title should be short
					'documentTitleNotEmpty', //The document should not have an empty title
					'documentValidatesToDocType', //Document must validate to the doctype
					'documentVisualListsAreMarkedUp', //Lists of items should be marked using list markup
					'domOrderMatchesVisualOrder', //Ensure that the visual order of the page matches the DOM
					'elementAttributesAreValid', //Attributes should have spaces between them and be wrapped in quotes
					'embedHasAssociatedNoEmbed', //All "embed" elements have an associated "noembed" element
					'elementsDoNotHaveDuplicateAttributes', //Elements should not have duplicate attributes
					'embedMustHaveAltAttribute', //"Embed" elements must have an "alt" attribute
					//'embedMustNotHaveEmptyAlt', //"Embed" elements cannot have an empty "alt" attribute //causes js error
					'embedProvidesMechanismToReturnToParent', //All embed elements should provide a way for keyboard users to escape
					'emoticonsExcessiveUse', //Emoticons should not be used excessively
					'emoticonsMissingAbbr', //Emoticons should have abbreviations
					'fieldsetHasLabel', //Fieldsets require a label element
					'fileHasLabel', //All "file" input elements have a corresponding label
					'fileLabelIsNearby', //All "file" input elements have a label that is close
					//'focusIndicatorVisible',//Focus indicators have high visibility
					'fontIsNotUsed', //Font elements should not be used
					'formAllowsCheckIfIrreversable',
					'formButtonsHaveValue', //Input elements for button, submit, or reset must have a value attribute
					'formDeleteIsReversable', //Deleting items using a form should be reversable
					'formErrorMessageHelpsUser', //Forms offer the user a way to check the results of their form before performing an irrevocable action
					'formHasGoodErrorMessage', //Form error messages should assist in solving errors
					'formHasSubmitButton', //Form should have a submit button
					'formWithRequiredLabel', //Input items which are required are marked as so in the label element
					'frameIsNotUsed', //Frames are not used
					'frameRelationshipsMustBeDescribed', //Complex framesets should contain a "longdesc" attribute
					'framesAreUsedToGroupContent', //Use frame elements to group repeated materials
					'frameSrcIsAccessible', //The source for each frame is accessible content.
					'frameTitlesDescribeFunction', //All "frame" elements should have a "title" attribute that describes the purpose of the frame
					'frameTitlesNotEmpty', //Frames cannot have empty "title" attributes
					'frameTitlesNotPlaceholder', //Frames cannot have "title" attributes that are just placeholder text
					'framesHaveATitle', //All "frame" elements should have a "title" attribute
					'framesetIsNotUsed', //The "frameset" element should not be used
					'framesetMustHaveNoFramesSection', //All framesets should contain a noframes section
					'headersAttrRefersToATableCell', //Table cell headers attributes must within the same table have an associated data cell with the same id
					'headerH1', //Header level 1 can only be followed by level 2
					//'headerH1Format',//All h1 elements are not used for formatting
					'headerH2', //Header level 2 can not be followed by levels from 4 to 6
					'headerH2Format', //All h2 elements are not used for formatting
					'headerH3', //Header level 3 can not be followed by levels 5 and 6
					'headerH3Format', //All h3 elements are not used for formatting
					'headerH4', //Header level 4 can not be followed by level 6
					'headerH4Format', //All h4 elements are not used for formatting
					'headerH5Format', //All h5 elements are not used for formatting
					'headerH6Format', //All h6 elements are not used for formatting
					'headerTextIsTooLong', //Header text is too long
					'headersHaveText', //All headers should contain readable text
					'headersUsedToIndicateMainContent', //Use header to indicate start of main content
					'headersUseToMarkSections', //Use headers to mark the beginning of each section
					'idRefHasCorrespondingId', //Elements with an idref type attribute must correspond to an element with an ID
					'idrefsHasCorrespondingId', //Elements with an idref attribute must correspond to an element with an ID
					'iIsNotUsed', //The "i" (italic) element is not used
					'iframeMustNotHaveLongdesc', //Inline frames ("iframes") should not have a "longdesc" attribute
					'imageMapServerSide', //All links in a server-side map should have duplicate links available in the document
					'imgAltEmptyForDecorativeImages', //If an image is purely decorative, the "alt" text must be empty
					'imgAltIdentifiesLinkDestination', //Any image within a link must have "alt" text the describes the link destination
					'imgAltIsDifferent', //Image alternative text should not be the same as the file name
					'imgAltIsSameInText', //Check that any text within an image is also in the "alt" attribute
					'imgAltIsTooLong', //Image alternative text is too long
					'imgAltNotEmptyInAnchor', //An image within a link cannot have an empty alternative text if there is no other text within the link
					'imgAltNotPlaceHolder', //Images should not have a simple placeholder text as an "alt" attribute
					'imgAltTextNotRedundant', //Unless the image files are the same, no image should contain redundant alt text
					'imgGifNoFlicker', //Any animated GIF should not flicker
					'imgHasAlt', //Images must provide alternative text
					'imgHasLongDesc', //A "longdesc" attribute is required for any image where additional information not in the "alt" attribute is required
					'imgImportantNoSpacerAlt', //Images that are important should not have a purely white-space "alt" attribute
					'imgMapAreasHaveDuplicateLink', //All links within a client-side image are duplicated elsewhere in the document
					'imgNonDecorativeHasAlt', //Any non-decorative images should have a non-empty "alt" attribute
					'imgNotReferredToByColorAlone', //For any image, the "alt" text cannot refer to color alone
					'imgServerSideMapNotUsed', //Server-side image maps should not be used
					'imgShouldNotHaveTitle', //Images should not have a "title" attribute
					'imgWithEmptyAlt', //Use empty alternative text only for decorative images
					'imgWithMapHasUseMap', //Any image with an "ismap" attribute have a valid "usemap" attribute
					//'imgWithMathShouldHaveMathEquivalent',//Images which contain math equations should provide equivalent MathML
					'inputCheckboxHasTabIndex', //All "checkbox" input elements require a valid "tabindex" attribute
					'inputCheckboxRequiresFieldset', //Logical groups of check boxes should be grouped with a fieldset
					'inputDoesNotUseColorAlone', //An "input" element should not use color alone
					'inputElementsDontHaveAlt', //Input elements which are not images should not have an "alt" attribute
					'inputFileHasTabIndex', //All "file" input elements require a valid "tabindex" attribute
					'inputImageAltIdentifiesPurpose', //All "input" elements with a type of "image" must have an "alt" attribute that describes the function of the input
					'inputImageAltIsNotFileName', //All "input" elements with a type of "image" must have an "alt" attribute which is not the same as the filename
					'inputImageAltIsNotPlaceholder', //All "input" elements with a type of "image" must have an "alt" attribute which is not placeholder text.
					'inputImageAltIsShort', //All "input" elements with a type of "image" must have an "alt" attribute which is as short as possible
					'inputImageAltNotRedundant', //The "alt" text for input "image" submit buttons must not be filler text
					'inputImageHasAlt', //All "input" elements with a type of "image" must have an "alt" attribute
					'inputImageNotDecorative', //The "alt" text for input "image" buttons must be the same as text inside the image
					'inputPasswordHasTabIndex', //All "password" input elements require a valid "tabindex" attribute
					'inputRadioHasTabIndex', //All "radio" input elements require a valid "tabindex" attribute
					'inputSubmitHasTabIndex', //All "submit" input elements require a "tabindex" attribute
					'inputTextHasLabel', //All "input" elements should have a corresponding "label"
					'inputTextHasTabIndex', //All "text" input elements require a valid "tabindex" attribute
					'inputTextHasValue', //All "input" elements of type "text" must have a default text
					'inputTextValueNotEmpty', //Text input elements require a non-whitespace default text
					'inputWithoutLabelHasTitle', //Form controls without label should have a title attribute
					'labelDoesNotContainInput', //Label elements should not contain an input element
					'labelMustBeUnique', //Every form input must have only one label
					'labelMustNotBeEmpty', //Labels must contain text
					'labelsAreAssignedToAnInput', //All labels should be associated with an input
					'languageDirAttributeIsUsed', //Use the dir attribute when the language direction changes
					'languageChangesAreIdentified', //Use language attributes to indicate changes in language
					'languageDirectionPunctuation', //Place punctuation around language direction changes in the right order
					//'languageUnicodeDirection',//Use the unicode language direction
					'legendDescribesListOfChoices', //All "legend" elements must describe the group of choices
					'legendTextNotEmpty', //Legend text must not contain just whitespace
					'legendTextNotPlaceholder', //"Legend" text must not contain placeholder text
					'liDontUseImageForBullet',
					'linkHasAUniqueContext', //Links should have a unique context
					'linkUsedForAlternateContent', //Use a "link" element for alternate content
					'linkUsedToDescribeNavigation', //The document uses link elements to describe navigation if it is within a collection.
					'listNotUsedForFormatting', //Lists should not be used for formatting
					'listOfLinksUseList', //A list of links separated by non-readable characters should be in an ul or ol
					'marqueeIsNotUsed', //The "marquee" tag should not be used
					'menuNotUsedToFormatText', //Menu elements should not be used for formatting
					'newWindowIsOpened', //A link should not open a new window
					'noembedHasEquivalentContent', //Noembed elements must be the same content as their "embed" element
					'noframesSectionMustHaveTextEquivalent', //All "noframes" elements should contain the text content from all frames
					'objectContentUsableWhenDisabled', //When objects are disabled, content should still be available
					'objectDoesNotFlicker', //Objects do not flicker
					'objectDoesNotUseColorAlone', //Objects must not use color to communicate alone
					'objectInterfaceIsAccessible', //Interfaces within objects must be accessible
					'objectLinkToMultimediaHasTextTranscript', //Objects which reference multimedia files should also provide a link to a transcript
					'objectMustContainText', //Objects must contain their text equivalents
					'objectMustHaveEmbed', //Every object should contain an "embed" element
					'objectMustHaveTitle', //Objects should have a title attribute
					'objectMustHaveValidTitle', //Objects must not have an empty title attribute
					'objectProvidesMechanismToReturnToParent', //All objects should provide a way for keyboard users to escape
					'objectShouldHaveLongDescription', //An object might require a long description
					'objectTextUpdatesWhenObjectChanges', //The text equivalents of an object should update if the object changes
					'objectUIMustBeAccessible', //Content within an "object" element should be usable with objects disabled
					'objectWithClassIDHasNoText', //Objects with "classid" attributes should change their text if the content of the object changes


					'pNotUsedAsHeader', //Paragraphs must not be used for headers
					//'paragraphIsWrittenClearly', //this caused UNDEFINED errors
					'passwordHasLabel', //All password input elements should have a corresponding label

					'passwordLabelIsNearby', //All "password" input elements have a label that is close
					'preShouldNotBeUsedForTabularLayout', //Pre elements should not be used for tabular data
					'radioHasLabel', //All "radio" input elements have a corresponding label
					'radioLabelIsNearby', //All "radio" input elements have a label that is close
					'radioMarkedWithFieldgroupAndLegend', //All radio button groups are marked using fieldset and legend elementsTodos os grupos de botões de rádio são marcados usando os elementos fieldset e legenda
					'scriptContentAccessibleWithScriptsTurnedOff', //Content on the page should still be available if scripts are disabled
					'scriptInBodyMustHaveNoscript', //Scripts should have a corresponding "noscript" element
					//'scriptOnclickRequiresOnKeypress',//If an element has an "onclick" attribute it should also have an "onkeypress" attribute
					'scriptOndblclickRequiresOnKeypress', //Any element with an "ondblclick" attribute should have a keyboard-related action as well
					'scriptOnmousedownRequiresOnKeypress', //If an element has a "mousedown" attribute it should also have an "onkeydown" attribute
					'scriptOnmousemove', //Any element with an "onmousemove" attribute should have a keyboard-related action as well
					'scriptOnmouseoutHasOnmouseblur', //If an element has a "onmouseout" attribute it should also have an "onblur" attribute
					'scriptOnmouseoverHasOnfocus', //If an element has a "onmouseover" attribute it should also have an "onfocus" attribute
					'scriptOnmouseupHasOnkeyup', //If an element has a "onmouseup" attribute it should also have an "onkeyup" attribute
					'scriptUIMustBeAccessible', //The user interface for scripts should be accessible
					'scriptsDoNotFlicker', //Scripts should not cause the screen to flicker
					'scriptsDoNotUseColorAlone', //The interface in scripts should not use color alone
					'selectDoesNotChangeContext', //"Select" elements must not contain an "onchange" attribute
					'selectHasAssociatedLabel', //All select elements have an explicitly associated label
					'selectJumpMenu', //Select jump menus should jump on button press, not on state change
					'selectWithOptionsHasOptgroup', //Form select elements should use optgroups for long selections
					'siteMap', //Websites must have a site map
					'skipToContentLinkProvided', //A "skip to content" link should exist as one of the first links on the page
					'svgContainsTitle', //Inline SVG should use Title elements
					'tableAxisHasCorrespondingId', //Axis attribute should have corresponding IDs
					'tabIndexFollowsLogicalOrder', //The tab order of a document is logical
					'tableCaptionIdentifiesTable', //Captions should identify their table
					'tableComplexHasSummary', //Complex tables should have a summary
					'tableDataShouldHaveTh', //Data tables should contain a header
					'tableHeaderLabelMustBeTerse', //Table header lables must be terse
					'tableIsGrouped', //Mark up the areas of tables using thead and tbody
					'tableLayoutDataShouldNotHaveTh', //Layout tables should not contain "th" elements
					'tableLayoutHasNoCaption', //All tables used for layout have no "caption" element
					'tableLayoutHasNoSummary', //All tables used for layout have no summary or an empty summary
					'tableLayoutMakesSenseLinearized', //All tables used for layout should make sense when removed
					'tableNotUsedForLayout', //Tables should not be used for layout
					'tableShouldUseHeaderIDs', //Table cells use IDs to identify headers
					'tableSummaryDescribesTable', //Table summaries should describe the navigation and structure of the table
					'tableSummaryDoesNotDuplicateCaption', //Table "summary" elements should not duplicate the "caption" element
					'tableSummaryIsEmpty', //All data tables should have a summary
					'tableSummaryIsNotTooLong',
					'tableSummaryIsSufficient', //All data tables should have an adequate summary
					'tableUseColGroup', //Group columns using "colgroup" or "col" elements
					'tableUsesAbbreviationForHeader', //Table headers over 20 characters should provide an "abbr" attribute
					'tableUsesCaption', //Data tables should contain a "caption" element if not described elsewhere
					'tableUsesScopeForRow', //Data tables should use scoped headers for rows with headers
					'tableWithBothHeadersUseScope', //Data tables with multiple headers should use the "scope" attribute
					'tableWithMoreHeadersUseID', //Complex data tables should provide "id" attributes to headers
					'tagsAreNestedCorrectly', //All tags should be nested correctly
					'tabularDataIsInTable', //All tabular information should use a table
					'textIsNotSmall', //The text size is not less than 9 pixels high
					'textareaHasAssociatedLabel', //All textareas should have a corresponding label
					'textareaLabelPositionedClose', //All textareas should have a label that is close to it
					'videoProvidesCaptions', //All video tags must provide captions
					'videosEmbeddedOrLinkedNeedCaptions', //All linked or embedded videos need captions
					'whiteSpaceInWord', //Whitespace should not be used between characters in a word
					'whiteSpaceNotUsedForFormatting', //Whitespace should not be used for conveying information
					//'doNotUseGraphicalSymbolToConveyInformation',//Using a graphical symbol alone to convey information
					'linkDoesNotChangeContextOnFocus', //Link elements must not contain an "onfocus" attribute
					'buttonDoesNotChangeContextOnFocus', //Buttons must not contain an "onfocus" attribute
					//'KINGStrongList',//Use strong in lists only
					'KINGUseLongDateFormat', //Use a long date format
					'KINGUsePercentageWithSymbol', //Use a symbol within a percentage
					'KINGUseCurrencyAsSymbol', //Use a symbol for a currency
					'videoMayBePresent', //Video or object uses a link that points to a file with a video extension
					'audioMayBePresent', //Audio or object uses a link that points to a file with a video extension
					'animatedGifMayBePresent', //Test if a .gif is used on the page. Test if the .gif contains more then one frame
					'userInputMayBeRequired' //Test if user input is required

				]
			};

		}
	});
});