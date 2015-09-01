// -*- indent-tabs-mode: t; tab-width: 4 -*- 
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is UxU - UnitTest.XUL.
 *
 * The Initial Developer of the Original Code is YUKI "Piro" Hiroshi.
 * Portions created by the Initial Developer are Copyright (C) 2010-2014
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s): YUKI "Piro" Hiroshi <shimoda@clear-code.com>
 *                 mooz <stillpedant@gmail.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

if (typeof window == 'undefined')
	this.EXPORTED_SYMBOLS = ['Action'];

var ns = {};
Components.utils.import('resource://uxu-modules/lib/inherit.jsm', ns);
Components.utils.import('resource://uxu-modules/utils.js', ns);
Components.utils.import('resource://uxu-modules/lib/action.jsm', ns);

function CommonDialogWrapper(aWindow) {
	this.window = aWindow;
	this.document = aWindow.document;

	if (aWindow.Dialog) {
		// Firefox > 10
		this.dialog = aWindow.Dialog;
		this.title = this.dialog.args.title;
		this.message = this.dialog.args.text;
		this.buttonsCount = this.dialog.numButtons;
		this.type = aWindow.Dialog.args.promptType;
	} else {
		throw Error("Failed to get common dialog parameters");
	}
}

CommonDialogWrapper.prototype = {
	// Checkbox

	get checkbox() {
		return this.document.getElementById('checkbox');
	},

	set checked(checkedStatus) {
		this.checkbox.checked = checkedStatus;
		this.dialog.onCheckbox();
	},

	DIALOG_TYPE: {
		ALERT: "alert",
		ALERT_CHECK: "alertCheck",
		CONFIRM_CHECK: "confirmCheck",
		CONFIRM: "confirm",
		CONFIRM_EX: "confirmEx",
		PROMPT: "prompt",
		PROMPT_USER_AND_PASS: "promptUserAndPass",
		PROMPT_PASSWORD: "promptPassword"
	},

	// Button

	BUTTON_TYPE: {
		ACCEPT: "accept",
		CANCEL: "cancel",
		EXTRA1: "extra1"
	},

	getButtonTypeByIndex: function (buttonIndex) {
		var buttonType = -1;

		switch (buttonIndex) {
		case 0:
			buttonType = this.BUTTON_TYPE.ACCEPT;
			break;
		case 1:
			buttonType = this.BUTTON_TYPE.CANCEL;
			break;
		case 2:
			buttonType = this.BUTTON_TYPE.EXTRA1;
			break;
		default:
			break;
		}

		return buttonType;
	},

	getButtonByType: function (buttonType) {
		return this.document.documentElement.getButton(buttonType);
	},

	clickButtonByType: function (buttonType) {
		this.getButtonByType(buttonType).doCommand();
	},

	getButtonByIndex: function (buttonIndex) {
		var buttonType = this.getButtonTypeByIndex(buttonIndex);
		return this.getButtonByType(buttonType);
	},

	clickButtonByIndex: function (buttonIndex) {
		this.getButtonByIndex(buttonIndex).doCommand();
	},

	// Wrapper

	accept: function () {
		this.clickButtonByType(this.BUTTON_TYPE.ACCEPT);
	},

	cancel: function () {
		this.clickButtonByType(this.BUTTON_TYPE.CANCEL);
	},

	// Input

	get usernameField() {
		return this.document.getElementById('loginTextbox');
	},

	get password1Field() {
		return this.document.getElementById('password1Textbox');
	},

	set username(value) {
		this.usernameField.value = value;
	},

	set password1(value) {
		this.password1Field.value = value;
	}
};

CommonDialogWrapper.isCommonDialog = function (aWindow) {
	return !!aWindow.CommonDialog;
};

CommonDialogWrapper.onReady = function (aWindow, onReadyFunction) {
	function onDialogReady() {
		try {
			onReadyFunction(new CommonDialogWrapper(aWindow));
		} catch (x) {
			ns.utils.log("Failed => " + x);
			ns.utils.log("Stack => " + x.stack);
		}
	}

	aWindow.setTimeout(onDialogReady, 0);
};


function Action(aSuite)
{
	this._suite = aSuite;
	this._readiedActionListener = null;
}

Action.prototype = {

destroy : function()
{
	this.cancelReadiedActions();
	delete this._suite;
},

/* ダイアログ操作の予約 */
COMMON_DIALOG_URL : 'chrome://global/content/commonDialog.xul',
SELECT_DIALOG_URL : 'chrome://global/content/selectDialog.xul',

_getWindowWatcherListener : function()
{
	if (this._readiedActionListener)
		return this._readiedActionListener;

	var self = this;
	var listener = function(aWindow) {
			var index = -1;
			listener.listeners.some(function(aListener, aIndex) {
				if (aListener.call(null, aWindow)) {
					index = aIndex;
					return true;
				}
				return false;
			});
			if (index > -1)
				self._removeWindowWatcherListener(listener.listeners[index]);
		};
	listener.listeners = [];
	this._suite.addWindowWatcher(listener, 'load');
	return this._readiedActionListener = listener;
},
 
_addWindowWatcherListener : function(aListener)
{
	this._getWindowWatcherListener().listeners.push(aListener);
},
 
_removeWindowWatcherListener : function(aListener)
{
	if (!this._readiedActionListener)
		return;

	var listener = this._getWindowWatcherListener();
	listener.listeners =
		listener.listeners
			.filter(function(aRegisteredListener) {
				return aRegisteredListener != aListener;
			});
	if (!listener.listeners.length) {
		this._suite.removeWindowWatcher(this._readiedActionListener);
		this._readiedActionListener = null;
	}
},

readyToOK : function(aOptions)
{
	aOptions = aOptions || {};

	var self = this;
	var listener = function(aWindow) {
			if (aWindow.location.href != self.COMMON_DIALOG_URL ||
				!CommonDialogWrapper.isCommonDialog(aWindow) ||
				aWindow.__uxu__willBeClosed)
				return false;

			CommonDialogWrapper.onReady(aWindow, function (commonDialog) {
				var { buttonsCount, title, message } = commonDialog;

				if ((buttonsCount != 1) ||
					('title' in aOptions && aOptions.title != title) ||
					('message' in aOptions && aOptions.message != message))
					throw Error("Invalid Dialog");

				aWindow.__uxu__willBeClosed = true;

				if ('checked' in aOptions)
					commonDialog.checked = aOptions.checked;
				commonDialog.accept();
			});

			return true;
		};
	this._addWindowWatcherListener(listener);
	return listener;
},
readyToOk : function(aOptions) { return this.readyToOK(aOptions); },

readyToConfirm : function(aYes, aOptions)
{
	aOptions = aOptions || {};

	var self = this;
	var listener = function(aWindow) {
			if (aWindow.location.href != self.COMMON_DIALOG_URL ||
				!CommonDialogWrapper.isCommonDialog(aWindow) ||
				aWindow.__uxu__willBeClosed)
				return false;

			CommonDialogWrapper.onReady(aWindow, function (commonDialog) {
				var { buttonsCount, title, message } = commonDialog;

				if ((buttonsCount != 2 && buttonsCount != 3) ||
					('title' in aOptions && aOptions.title != title) ||
					('message' in aOptions && aOptions.message != message))
					throw Error("Invalid Dialog");

				aWindow.__uxu__willBeClosed = true;

				if ('checked' in aOptions) {
					commonDialog.checked = aOptions.checked;
				}

				var button = (typeof aYes == 'number') ? aYes : (aYes ? 0 : 1 );
				button = Math.min(button, buttonsCount - 1);
				commonDialog.clickButtonByIndex(button);
			});


			return true;
		};
	this._addWindowWatcherListener(listener);
	return listener;
},

readyToPrompt : function(aInput, aOptions)
{
	aOptions = aOptions || {};

	var self = this;
	var listener = function(aWindow) {
			if (aWindow.location.href != self.COMMON_DIALOG_URL ||
				!CommonDialogWrapper.isCommonDialog(aWindow) ||
				aWindow.__uxu__willBeClosed)
				return false;

			CommonDialogWrapper.onReady(aWindow, function (commonDialog) {
				var { type, title, message } = commonDialog;

				if ((aOptions.inputFieldsType === 'both' &&
						commonDialog.type !== commonDialog.DIALOG_TYPE.PROMPT_USER_AND_PASS) ||
					((aOptions.inputFieldsType === 'password') &&
						commonDialog.type !== commonDialog.DIALOG_TYPE.PROMPT_PASSWORD) ||
					('title' in aOptions && aOptions.title !== title) ||
					('message' in aOptions && aOptions.message !== message))
					throw Error("Not a prompt dialog");

				aWindow.__uxu__willBeClosed = true;

				if ('checked' in aOptions) {
					commonDialog.checked = aOptions.checked;
				}

				switch (aOptions.inputFieldsType) {
				case 'password':
					commonDialog.password1 = aOptions.password;
					break;
				case 'both':
					commonDialog.username = aOptions.username;
					commonDialog.password1 = aOptions.password;
					break;
				default:
					commonDialog.username = aInput;
					break;
				}

				commonDialog.accept();
			});


			return true;
		};
	this._addWindowWatcherListener(listener);
	return listener;
},

readyToPromptPassword : function(aPassword, aOptions)
{
	this.readyToPrompt(
		null,
		ns.inherit(aOptions, {
			password : aPassword,
			inputFieldsType : 'password'
		})
	);
},
 
readyToPromptUsernameAndPassword : function(aUsername, aPassword, aOptions) 
{
	this.readyToPrompt(
		null,
		ns.inherit(aOptions, {
			username : aUsername,
			password : aPassword,
			inputFieldsType : 'both'
		})
	);
},
 
readyToSelect : function(aSelectedIndexes, aOptions) 
{

	aOptions = aOptions || {};
	if (typeof aSelectedIndexes == 'number')
		aSelectedIndexes = [aSelectedIndexes];

	var self = this;
	var listener = function(aWindow) {
			if (aWindow.location.href != self.SELECT_DIALOG_URL ||
				aWindow.__uxu__willBeClosed)
				return false;

			aWindow.setTimeout(function () {
				var params = aWindow.gArgs;
				var title = params.getProperty('title');
				var message = params.getProperty('text');

				if (('title' in aOptions && aOptions.title != title) ||
					('message' in aOptions && aOptions.message != message))
					return false;

				aWindow.__uxu__willBeClosed = true;

				var doc = aWindow.document;

				var list = doc.getElementById('list');
				aSelectedIndexes.forEach(function(aIndex) {
					var item = list.getItemAtIndex(aIndex);
					if (!item)
						return;

					if (list.selType == 'multiple')
						list.addItemToSelection(item);
					else
						list.selectedIndex = aIndex;
				});
				doc.documentElement.getButton('accept').doCommand();
			}, 0);

			return true;
		};
	this._addWindowWatcherListener(listener);
	return listener;
},
 
cancelReadiedActions : function() 
{
	if (!this._readiedActionListener)
		return;

	this._suite.removeWindowWatcher(this._readiedActionListener);
	this._readiedActionListener = null;
},
	
cancelReadiedAction : function(aListener) 
{
	this._removeWindowWatcherListener(aListener);
},
   
export : function(aNamespace, aForce) 
{
	var self = this;
	var prototype = Action.prototype;
	aNamespace.__defineGetter__('action', function() {
		return self;
	});
	aNamespace.__defineSetter__('action', function(aValue) {
		return aValue;
	});
	for (var aMethod in prototype)
	{
		if (
			!prototype.hasOwnProperty(aMethod) ||
			typeof prototype[aMethod] != 'function' ||
			aMethod.charAt(0) == '_' ||
			aMethod == 'export' ||
			(!aForce && (ns.utils.lookupGetter(aNamespace, aMethod) || aMethod in aNamespace))
			)
			continue;

		(function(aMethod, aPrefix) {
			var alias = aPrefix+aMethod.charAt(0).toUpperCase()+aMethod.substring(1);
			if (!aForce && (ns.utils.lookupGetter(aNamespace, alias) || alias in aNamespace))
				return;

			if (ns.utils.lookupGetter(prototype, aMethod) || (typeof prototype[aMethod] != 'function')){
				aNamespace.__defineGetter__(alias, function() {
					return self[aMethod];
				});
			}
			else {
				aNamespace[alias] = ns.utils.bind(prototype[aMethod], self);
			}
		})(aMethod, 'action');
	}
}
 
}; 

ns.action.export(Action.prototype);
  
