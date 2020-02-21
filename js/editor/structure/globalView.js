//EXTENSIVE TO DO LIST
/*
!!TAKE TWO!!

Things to do:


↑exception + prompt/confirm pour page qui deviens sub/sub qui devient page...then re-sort according to subs


↑Remove sub
-→never show m98 in editable structure
-→chain moves to m98 for archiving


-duplicateLabelFinder(), use to stop user duplicating entries in same sub
-Labelize everything for easy translations
-Stop create new/moving operations in M97, M98, M99... Maybe even hide M97 and error on finding something is still in M97 (should be buffer only)
-main.close structure edit thingy: this/that.master.currentSub.loadPage();
-add new, make sure title is not duplicated
-move sub, rename if duplicate in target sub
-add a close structure editing mode button
-→On cancel, call: masterStructure.currentSub.loadPage()
-Normalize listeners for item operations, remove everything and re-add properly post every operation to ensure single listener (delegation not working properly)



X-New page created, can't edit it anymore? After refresh it works but not before...
X-.isPage, .isSub not following changes, fix it!
X-Editing parent item name now renames children? FIX THIS!!

*/

define([
	'jquery',
	'labels',
	'settings-core',
	'utils',
	'modules/BaseModule',
	'./../../plugins/nestable/jquery.nestable',
	'modules/objSub/objSub-utils',
	'modules/objSub/objSub'

], function ($, labels, CoreSettings, Utils, BaseModule, Nestable, ObjSubUtils, ObjSub) {
	'use strict';

	return BaseModule.extend({
		initialize: function (options) {
			var that = this;

			this.parent = options.parent; //masterStructure.editor
			this.master = this.parent.parent.parent; //masterStructure

			//initialize?

			//--------------------- EXPERIMENTING

			// this.$tmpSitemap=null;
			this.$tmpStructureStack = null;

			//RESET
			this.sObj = [];

			//VARS
			this.lang = $('html').attr('lang');

			//CONST

			//VALID MENU ELEMENT TYPES, ACCEPT ONLY THOSES
			// this.menuElementTypes = ['isIntro','isActivity','isQuiz','only-public','not-public','only-prod','not-prod','only-local','not-local'];
			this.validElementTypes = ['isIntro', 'isActivity', 'isQuiz', 'isLocked', 'isLockedIn'];
			// this.elementTypesEquivalences = {isIntro:'csps-intro',isActivity:'csps-activity',isQuiz:'csps-quiz'};

			//INIT IF EDITMODE

			//ON PAGE LOADED EVENT
			$(this.master).on("Framework:pageLoaded", function () {
				that.pageLoaded();
			});

		},

		/*---------------------------------------------------------------------------------------------
				-------------------------HOUSE KEEPING
		---------------------------------------------------------------------------------------------*/
		pageLoaded: function () {

			//DO WHATEVER SHOULD BE DONE ONCE A PAGE IS LOADED... FOR NOW? NOTHING!

		},

		////////////////////////////////////////////////////////////////////////
		//INIT STRUCTURE EDITOR (NESTABLE PLUGIN)
		initView: function (context) {
			//ALIASES
			var that = this;
			var tMS = that.master.subs;
			var tMF = that.master.flatList;
			var tML = that.master.levels;
			var HTML_dd_schema = {
				main_controls: '<div><button class="LOM-cancel-structure-edit">Cancel</button></div>',
				main_prefix: '<div class="dd" id="LOM-editable-structure">\n',
				main_suffix: '</div>\n',
				ol_prefix: '<ol class="dd-list">\n',
				ol_suffix: '</ol>\n',
				dd_item_prefix: '<li class="dd-item dd3-item" data-module-id="¡MODULEID!" data-element-type="¡ELTYPE!" data-id="¡ID!"><div class="dd-handle dd3-handle">Drag</div><div class="dd3-content"><span class="dded">¡CONTENT!</span><div class="dd-nestable-controls">¡CONTROLS!</div></div>\n',
				dd_item_suffix: '</li>\n'
			};

			//HTML_dd_controls = Structure manipulation control options
			var HTML_dd_controls = {
				edit_button: '<button class="LOM-structure-edititem">EDIT</button>',
				remove_button: '<button class="LOM-structure-removeitem">REMOVE</button>',
				attach_button: '<button class="LOM-structure-attachpage">ATTACH</button>',
				detach_button: '<button class="LOM-structure-detachpage">DETACH</button>',
				add_button: '<button class="LOM-structure-additem">INSERT AFTER</button>'
			};

			//HTML_control_stack = Pre-built control stack
			var HTML_control_stack = HTML_dd_controls.edit_button + HTML_dd_controls.remove_button + HTML_dd_controls.add_button;

			//HTML_Buffer = Temporary build buffer, to be transposed in DOM once completed
			var HTML_Buffer = "";

			//

			//Clear page
			$('#dynamic_content').html('');

			// ----------------------------------------------------------
			// BUILD NESTABLE STRUCTURE FOR MANIPULATION
			// ----------------------------------------------------------

			//Initiate HTML structure
			HTML_Buffer += '<div class="col-md-6" id="LOM-editable-structure-holder">' + HTML_dd_schema.main_prefix + HTML_dd_schema.ol_prefix;

			//Loop through [masterStructure.subs || that.master.subs || tMS] to recreate editable structure
			for (var i in tMS) {
				//Ignore archives, dev specific
				if (tMS[i].sPosition !== "m98" && tMS[i].sPosition !== "m99") {
					HTML_Buffer += HTML_dd_schema.dd_item_prefix
						.split('¡CONTENT!').join(tMS[i].title)
						.split('¡MODULEID!').join(tMS[i].sPosition)
						.split('¡ELTYPE!').join(this.concatElType(tMS[i]))
						.split('¡CONTROLS!').join(HTML_control_stack);
					for (var ii in tMS[i].subs) {
						HTML_Buffer += (ii == 0) ? HTML_dd_schema.ol_prefix : '';
						HTML_Buffer += (HTML_dd_schema.dd_item_prefix)
							.split('¡CONTENT!').join(tMS[i].subs[ii].title)
							.split('¡MODULEID!').join(tMS[i].subs[ii].sPosition)
							.split('¡ELTYPE!').join(this.concatElType(tMS[i].subs[ii]))
							.split('¡CONTROLS!').join(HTML_control_stack);
						for (var iii in tMS[i].subs[ii].subs) {
							HTML_Buffer += (iii == 0) ? HTML_dd_schema.ol_prefix : '';
							HTML_Buffer += (HTML_dd_schema.dd_item_prefix)
								.split('¡CONTENT!').join(tMS[i].subs[ii].subs[iii].title)
								.split('¡MODULEID!').join(tMS[i].subs[ii].subs[iii].sPosition)
								.split('¡ELTYPE!').join(this.concatElType(tMS[i].subs[ii].subs[iii]))
								.split('¡CONTROLS!').join(HTML_control_stack)
								+ HTML_dd_schema.dd_item_suffix;
						}
						HTML_Buffer += ((tMS[i].subs[ii].subs.length != 0) ? HTML_dd_schema.ol_suffix : '') + HTML_dd_schema.dd_item_suffix;
					}
				}
				HTML_Buffer += ((tMS[i].subs.length != 0) ? HTML_dd_schema.ol_suffix : '') + HTML_dd_schema.dd_item_suffix;
			}
			HTML_Buffer += HTML_dd_schema.ol_suffix + HTML_dd_schema.main_suffix + '</div>';

			HTML_Buffer += '<div class="col-md-6" id="LOM-editable-items-holder"></div>';
			// ----------------------------------------------------------
			// DONE BUILDING NESTABLE STRUCTURE FOR MANIPULATION
			// ----------------------------------------------------------

			//Insert editable structure in page
			$('#dynamic_content').html(HTML_Buffer);

			this.addSubOrPageClass($('#LOM-editable-structure'));


			//Load Nestable Plugin CSS
			this.loadNestableCSS();

			//Init Nestable plugin
			$('#LOM-editable-structure').nestable();
			//.on('change',that.getChanges);

			//Reset listeners (try)
			// $('body .dd-nestable-controls button').unbind('click');
			// $('body .dd-nestable-controls button').off('click');
			// $('body .dd-nestable-controls button').off('click','**');
			// $('body .dd-nestable-controls button').off('.operation');
			// $('body').on('click.operation','.dd-nestable-controls button',function(e){
			//Set operation listeners
			// $('body').on('click','.dd-nestable-controls button',function(e){
			$('#LOM-editable-structure .dd-nestable-controls button').on('click', function (e) {
				that.structureOperation(this);
			});

			//Set main controls listeners (cancel for now)
			// $('body').on('click','.LOM-cancel-structure-edit',function(e){
			// 			$('#LOM-editable-structure-holder .LOM-cancel-structure-edit').on('click',function(e){

			// // $("html").removeClass("LOM-structure-active");
			// // that.master.currentSub.loadPage();
			// 			});


		},

		////////////////////////////////////////////////////////////////////////
		//Main operations
		structureOperation: function (el) {
			//ALIASES
			var that = this;
			//VARS

			switch ($(el).attr('class').split('LOM-structure-').join('')) {
				case 'edititem':
					//VARS
					var txt = "TEST";
					var title = $(el).closest('.dd3-content').children('.dded').text();
					var title_oLang = "...skip for now..."
					var HTML_Buffer = "";
					//BUILD HTML
					HTML_Buffer += '<div id="LOM-structure-current-editor" data-related-to="' + $(el).closest('.dd-item').attr('data-module-id') + '">\n';
					HTML_Buffer += '	<div><label>Title: <input id="LOM-edit-title" type="text" maxlength="32" value="' + title + '"></label></div>\n';
					HTML_Buffer += '	<div><label>Title (other language): <input id="LOM-edit-title-olang" type="text" maxlength="32" value="' + title_oLang + '"></label></div>\n';
					HTML_Buffer += '	<div><label>isIntro: <input id="LOM-edit-isIntro" type="checkbox" ' + ((this.checkIfElType('isIntro', el)) ? 'checked' : '') + '></label></div>\n';
					HTML_Buffer += '	<div><label>isQuiz: <input id="LOM-edit-isQuiz" type="checkbox" ' + ((this.checkIfElType('isQuiz', el)) ? 'checked' : '') + '></label></div>\n';
					HTML_Buffer += '	<div><label>isActivity: <input id="LOM-edit-isActivity" type="checkbox" ' + ((this.checkIfElType('isActivity', el)) ? 'checked' : '') + '></label></div>\n';
					HTML_Buffer += '	<div><label>isLocked: <input id="LOM-edit-isLocked" type="checkbox" ' + ((this.checkIfElType('isLocked', el)) ? 'checked' : '') + '></label></div>\n';
					HTML_Buffer += '	<div><label>isLockedIn: <input id="LOM-edit-isLockedIn" type="checkbox" ' + ((this.checkIfElType('isLockedIn', el)) ? 'checked' : '') + '></label></div>\n';
					HTML_Buffer += '	<div><button id="LOM-edit-saveitemchanges">Save changes</button> <button id="LOM-edit-cancelitemchanges">Cancel changes</button></div>\n';
					HTML_Buffer += '</div>\n';

					//Insert in DOM
					$('#LOM-editable-items-holder').html(HTML_Buffer);

					//Listeners
					//Cancel changes
					$('#LOM-edit-cancelitemchanges').on('click', function (e) {
						//Close dialog
						$('#LOM-structure-current-editor').remove();
					});
					//Save & Apply changes in [subs] ... also ammend editable structure
					$('#LOM-edit-saveitemchanges').on('click', function (e) {
						//Get related sub
						var subMod = ObjSubUtils.findSub(Utils.getArrayFromString($('#LOM-structure-current-editor').attr('data-related-to')));
						//Title
						subMod.title = $('#LOM-edit-title').val();
						$('#LOM-editable-structure li.dd-item[data-module-id=' + $('#LOM-structure-current-editor').attr('data-related-to') + ']>div>span.dded').text($('#LOM-edit-title').val());
						//Title other lang
						//SKIP-IT FOR NOW!

						//Element types
						var tElTypes = [];

						//Loop through and recover
						for (var i in that.validElementTypes) {
							subMod[that.validElementTypes[i]] = $('#LOM-edit-' + that.validElementTypes[i]).prop('checked');
							if (subMod[that.validElementTypes[i]]) {
								tElTypes.push(that.validElementTypes[i]);
							}
						}

						//Editable structure attribute
						$('#LOM-editable-structure li.dd-item[data-module-id=' + $('#LOM-structure-current-editor').attr('data-related-to') + ']').attr('data-element-type', tElTypes.join(','));

						//Actual save
						that.master.generateSupermenu();

						//Close dialog
						$('#LOM-structure-current-editor').remove();
					});

					break;
				case 'removeitem':
					var subDeleteConfirmation = confirm('Are you sure you want to remove?');
					if (!subDeleteConfirmation) {
						return false;
					}
					console.log('removeitem');
					/*
					ASSUMPTIONS
					-M98 exists
					LOGIC
					If page {
						if actual file attached {
							move to M98 → push[stack]
						}
						if page 404 {
							remove forever, too bad! → push[stack]
						}
					}else if sub {
						loop through pages (recursive) {
							if page {
								move to M98 *(ignore structure, flatten) → push[stack]
							}else if 404 {
								remove forever, too bad! → push[stack]
							}
							}
						}

					loop through [stack]{
						actual move operation
					}
					*/

					//Up for deletion object
					var targetObj = ObjSubUtils.findSub(Utils.getArrayFromString($(el).closest('.dd-item').attr('data-module-id')));

					//Default destination
					var destination = "m98";

					//Deletion stack
					var opStack = [];

					//Check if contains subs
					if (targetObj.subs.length === 0) {
						//Check if contains actual page (vs empty structure element...meaning no move to m98)
						if (targetObj.isPage) {
							//Is a page → archive
							opStack.push({
								mPos: targetObj.sPosition,
								op: 'archive'
							});
						} else {
							//Is not a page → delete
							opStack.push({
								mPos: targetObj.sPosition,
								op: 'delete'
							});
						}
					} else {
						//Loop through subs
						for (var i in targetObj.subs) {
							//Check if contains subs
							if (targetObj.subs[i].subs.length === 0) {
								//Check if contains actual page (vs empty structure element...meaning no move to m98)
								if (targetObj.subs[i].isPage) {
									opStack.push({
										mPos: targetObj.subs[i].sPosition,
										op: 'archive'
									});
								} else {
									opStack.push({
										mPos: targetObj.subs[i].sPosition,
										op: 'delete'
									});
								}
							} else {
								//Loop through subs in sub
								for (var ii in targetObj.subs[i].subs) {
									//Check if contains actual page (vs empty structure element...meaning no move to m98)
									if (targetObj.subs[i].subs[ii].isPage) {
										opStack.push({
											mPos: targetObj.subs[i].subs[ii].sPosition,
											op: 'archive'
										});
									} else {
										opStack.push({
											mPos: targetObj.subs[i].subs[ii].sPosition,
											op: 'delete'
										});
									}
								}
								//Then remove containing sub - obviously assuming it's not a page
								opStack.push({
									mPos: targetObj.subs[i].sPosition,
									op: 'delete'
								});
							}
						}
						//Then remove containing sub - obviously assuming it's not a page
						opStack.push({
							mPos: targetObj.sPosition,
							op: 'delete'
						});


					}

					//Find next availabe archive (m98) index
					var nextAAID = destination + '-' + (ObjSubUtils.findSub(Utils.getArrayFromString('m98'))).subs.length;

					for (var i in opStack) {
						if (opStack[i].op === "archive") {


							//TESTING? COMMENT THAT OUT ↓
							that.moveSub(opStack[i].mPos, nextAAID);


							//Increment next available archive ID for future operations - assuming flat m98-X 2nd level ALWAYS!
							nextAAID = nextAAID.split('-')[0] + '-' + (+(nextAAID.split('-')[1]) + 1);
						} else if (opStack[i].op === "delete") {
							ObjSubUtils.findSub(Utils.getArrayFromString(opStack[i].mPos)).destroySub();
							//Then truly delete it!
							console.log("---→ " + Utils.getArrayFromString(opStack[i].mPos));


							var mPosToDelete = Utils.getArrayFromString(opStack[i].mPos);
							console.log('→m' + mPosToDelete.join('-'));
							//OPTIMIZE THIS ↓
							switch (mPosToDelete.length) {
								case 1:
									//Confirm that it's the right one (test against index 0 vs index 1, messed up structure etc...)
									if (('m' + mPosToDelete.join('-')) == that.master.subs[mPosToDelete[0]].sPosition) {
										that.master.subs.splice(mPosToDelete[0], 1);
										// console.log('CONFIRMED: 1');
									}
									break;
								case 2:
									//Confirm that it's the right one (test against index 0 vs index 1, messed up structure etc...)
									if (('m' + mPosToDelete.join('-')) == that.master.subs[mPosToDelete[0]].subs[mPosToDelete[1]].sPosition) {
										that.master.subs[mPosToDelete[0]].subs.splice(mPosToDelete[1], 1);
										// console.log('CONFIRMED: 2');
									}
									break;
								case 3:
									//Confirm that it's the right one (test against index 0 vs index 1, messed up structure etc...)
									if (('m' + mPosToDelete.join('-')) == that.master.subs[mPosToDelete[0]].subs[mPosToDelete[1]].subs[mPosToDelete[2]].sPosition) {
										that.master.subs[mPosToDelete[0]].subs[mPosToDelete[1]].subs.splice(mPosToDelete[2], 1);
										console.error('CONFIRMED: 3 (...WAIT, THATS IMPOSSIBLE!)');
									}
									break;
								default:
									console.error('Wrong depth detected');
							}

						}

						//Remove from the editable structure
						$('#LOM-editable-structure .dd-item[data-module-id=' + opStack[i].mPos + ']').remove();


					}
					break;
				case 'additem':
					console.log('additem');

					/*
					ASSUMPTIONS
					-M97 doesn't exist before operation, or after (use it as buffer)
					-Cannot add into page, only add after item pressed then move into manually if necessary

					STEPS
					1.push new sub in subs[M97]
					2.this.moveSub(moveCode,('m'+((destination.length>1)?destination.join('-'):destination)));
					*/

					//VARS
					var newItemTitle = "New Page";
					//Add to supermenu (DOM)
					$('[data-id=nav1]').append('<li><a href="javascript:;" data-target="m97" tabindex="-1" role="menuitem">' + newItemTitle + '</a></li>');

					//new ObjSub to m97
					that.master.levels[0].subs[that.master.levels[0].subs.length] = new ObjSub({
						depth: 0,
						parentLevel: 0,
						el: $('a[data-target=m97]').eq(0),
						router: that.master.router,
						master: that.master,
						wetMenu: cspsWetMenu
					});

					//move m97 to *
					var addFromModuleId = $(el).closest('li.dd-item').attr('data-module-id');
					var newPosition;
					if (addFromModuleId.split('-').length === 1) {
						newPosition = 'm' + (+(addFromModuleId.substring(1, addFromModuleId.length)) + 1);
					} else {
						newPosition = addFromModuleId.split('-').slice(0, addFromModuleId.split('-').length - 1).join('-') + '-' + (+(addFromModuleId.split('-')[(addFromModuleId.split('-').length) - 1]) + 1);
					}

					//Commit new sub and move to newPosition
					that.moveSub('m97', newPosition);

					//Add new sub to editable structure
					var HTML_Buffer = '<li class="dd-item dd3-item isPage" data-module-id="' + newPosition + '" data-element-type="" data-id="¡ID!"><div class="dd-handle dd3-handle">Drag</div><div class="dd3-content"><span class="dded">' + newItemTitle + '</span><div class="dd-nestable-controls"><button class="LOM-structure-edititem">EDIT</button><button class="LOM-structure-removeitem">REMOVE</button><button class="LOM-structure-additem">INSERT AFTER</button></div></div></li>'
					$(el).closest('li.dd-item').after(HTML_Buffer);

					//Add listeners
					$(el).closest('li.dd-item').next().find('.dd-nestable-controls button').on('click', function (e) {
						that.structureOperation(this);
					});

					break;

				default:
					console.error('Operation denied/not recognized as valid');

			}
		},

		////////////////////////////////////////////////////////////////////////
		//Accept comms from Nestable Plugin (get moved item data-module-id)
		moveItemTo: function (moveCode) {
			//VARS


			//tmp Result export?
			var sDestination = this.getDestination(moveCode);

			//Confirm if page to sub
			// var r = confirm("Are you sure?");
			console.log(moveCode + ' GOES TO: ' + sDestination);
			var t = ObjSubUtils.findSub(Utils.getArrayFromString(sDestination));
			if (!t) {
				var tt = sDestination.split('-');
				tt.pop();
				tt = tt.join('-');
				tt = ObjSubUtils.findSub(Utils.getArrayFromString(tt));
				// console.log(ObjSubUtils.findSub(Utils.getArrayFromString(tt)));
				console.log('Going in new sub: ' + tt.title + 'will be loosing it\'s page');
			} else {
				console.log(t);
				console.log('LEN: ' + t.parent.subs.length);
			}
			//Deal with identical target/destination
			if (moveCode == sDestination) {
				console.error('Cannot move, same destination as target');
				return false;
			}

			this.moveSub(moveCode, sDestination);

			//Re-order module ids according to updateSub() (objSub)
			$('#LOM-editable-structure li[data-module-id]').each(function () {
				if (($(this).attr('data-module-id')).charAt(0) === "¡") {
					$(this).attr('data-module-id', ($(this).attr('data-module-id')).substring(1, ($(this).attr('data-module-id')).length));

					//TMP MODULE CODES IN TITLES
					//$(this).find('>.dd3-content>.dded>.tmp').text($(this).attr('data-module-id'));
					//END TMP
				}
			});

			//Re-add .isSub and .isPage classes
			this.addSubOrPageClass($('#LOM-editable-structure'));

		},


		getDestination: function (moveCode) {
			//moved object
			var $moved = $("#LOM-editable-structure").find("[data-module-id='" + moveCode + "']").eq(0);
			var movedID = $moved.attr("data-module-id");
			//next
			var $next = $moved.next();
			var nextID = $next.attr("data-module-id");
			if (typeof nextID !== "undefined") {
				return nextID;
			} else {
				//previous
				var $prev = $moved.prev();
				var prevID = $prev.attr("data-module-id");
				if (typeof prevID !== "undefined") {
					return prevID;
				} else {
					//lonely child
					var $parent = $moved.parent();
					var parentID = $parent.parent().attr("data-module-id");
					if (typeof parentID !== "undefined") {
						//has a parent. this.remiSansFamille = false;
						return parentID + "-0";
					} else {
						//I don't think this is possible?
						return movedID;
					}
				}
			}

		},
		////////////////////////////////////////////////////////////////////////
		//Test against siblings for identical item names, return true if duplicate found
		duplicateLabelFinder: function (stack, itemName) {

		},
		////////////////////////////////////////////////////////////////////////
		//Util to add .isSub or .isPage to the proper item in editable structure mode
		addSubOrPageClass: function (target) {
			$(target).find("[data-module-id]").each(function () {
				var $this = $(this);
				var sPosition = $this.attr("data-module-id");
				var aPosition = Utils.getArrayFromString(sPosition);
				var obj = ObjSubUtils.findSub(aPosition);
				if (obj.isPage) {
					$this.removeClass("isSub");
					$this.addClass("isPage");
				} else {
					$this.removeClass("isPage");
					$this.addClass("isSub");
					/* TMP TURN OFF!!
					$this.children(".dd3-content").click(function(){
						that.selectSub(this);
					});
					*/

				}

				//console.log(obj.sPosition);
			});
		},
		////////////////////////////////////////////////////////////////////////
		//Load CSS for Nestable Plugin
		loadNestableCSS: function () {
			//Load Nestable plugin CSS (if(necessary))
			var cssId = 'nestableCSS';
			if (!document.getElementById(cssId)) {
				var head = document.getElementsByTagName('head')[0];
				var link = document.createElement('link');
				link.id = cssId;
				link.rel = 'stylesheet';
				link.type = 'text/css';
				link.href = 'core/js/plugins/nestable/nestable.css';
				link.media = 'all';
				head.appendChild(link);
			}
		},

		////////////////////////////////////////////////////////////////////////
		//Concat elType utility, based of masterStructure.subs schema
		concatElType: function (lSub) {
			var rStack = [];
			for (var i in this.validElementTypes) {
				if (lSub[this.validElementTypes[i]]) {
					rStack.push(this.validElementTypes[i]);
				}
			}
			return rStack;
		},

		////////////////////////////////////////////////////////////////////////
		//Returns true if needle:String found in haystack:Array (because ( isLocked vs [isLocked]In ) can't simply work)
		checkIfElType: function (nType, el) {
			var tA = ($(el).closest('li.dd-item').attr('data-element-type')).split(',');
			for (var i in tA) {
				if (tA[i] === nType) {
					return true;
				}
			}
			return false;
		},
		selectSub: function (obj) {
			var hasClass = $(obj).parent().hasClass("LOM-selected-sub");

			$("#dynamic_content").find(".LOM-selected-sub").removeClass("LOM-selected-sub");
			if (!hasClass) {
				$(obj).parent().addClass("LOM-selected-sub");
			}
		},
		////////////////////////////////////////////////////////////////////////
		//Util to move sub
		moveSub: function (from, to) {
			console.log('moveSub(from: ' + from + '     to: ' + to + ');');
			console.log('A-' + Utils.getArrayFromString(from));
			console.log('B-' + ObjSubUtils.findSub(Utils.getArrayFromString(from)));
			ObjSubUtils.findSub(Utils.getArrayFromString(from)).move(to);
		}


	});
});
