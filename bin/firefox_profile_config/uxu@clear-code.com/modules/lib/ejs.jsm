/**
 * @fileOverview Embedded JavaScript Template Library for Firefox 4 or later
 * @author       ClearCode Inc.
 * @version      3
 *
 * @license
 *   The MIT License, Copyright (c) 2010-2014 ClearCode Inc.
 *   https://github.com/clear-code/js-codemodules/blob/master/license.txt
 * @url https://github.com/clear-code/js-codemodules/blob/master/ejs.jsm
 * @url https://github.com/clear-code/js-codemodules/blob/master/ejs.test.js
 */

if (typeof window == 'undefined' ||
	(window && typeof window.constructor == 'function'))
	this.EXPORTED_SYMBOLS = ['EJS'];

// var namespace;
if (typeof namespace == 'undefined') {
	// If namespace.jsm is available, export symbols to the shared namespace.
	// See: https://github.com/piroor/fxaddonlibs/blob/master/namespace.jsm
	try {
		let ns = {};
		Components.utils.import('resource://uxu-modules/lib/namespace.jsm', ns);
		namespace = ns.getNamespaceFor('clear-code.com');
	}
	catch(e) {
		namespace = (typeof window != 'undefined' ? window : null ) || {};
	}
}

var EJS;
(function() {
	const currentRevision = 3;

	var loadedRevision = 'EJS' in namespace ?
			namespace.EJS.revision :
			0 ;
	if (loadedRevision && loadedRevision > currentRevision) {
		EJS = namespace.EJS;
		return;
	}

	/**
	 * @class
	 *   Embedded JavaScript class implementation.
	 *
	 * @example
	 *   var source = 'Happy new year <%= (new Date()).getFullYear() %>!';
	 *   var result = (new EJS(source)).result();
	 *   // Just same to EJS.result(source);
	 *
	 * @param {string} aCode
	 *   A string including script fragments.
	 */
	EJS = function EJS(aCode) {
		this.code = aCode;
	};
	EJS.prototype = {
		/**
		 * Evaluates script fragments embedded in the string, in the given
		 * scope. <% ... %> work as simple operations, and <%= ... %> will be
		 * replaced with results of embedded expressions.
		 *
		 * @example
		 *   var string = '<% for (var i = 0; i < 3; i++) { %>'+
		 *                '<li><%= label + i %></li>'+
		 *                '<% } %>';
		 *   var ejs = new EJS(string);
		 *   ejs.result({ label: 'item' });
		 *   // => '<li>item0</li><li>item1</li><li>item2</li>'
		 *
		 * @param {Object=} aScope
		 *   The namespace to evaluate script fragments in the string.
		 *   You can access properties of the object from script fragments
		 *   as simple local variables.
		 *
		 * @returns {string}
		 *   The result.
		 */
		result : function(aScope) 
		{
			var __processTemplate__codes = [];
			this.code.split('%>').forEach(function(aPart) {
				let strPart, codePart;
				[strPart, codePart] = aPart.split('<%');
				__processTemplate__codes.push('__processTemplate__results.push('+
				                            strPart.toSource()+
				                            ');');
				if (!codePart) return;
				if (codePart.charAt(0) == '=') {
					__processTemplate__codes.push('__processTemplate__results.push(('+
					                            codePart.substring(1)+
					                            ') || "");');
				}
				else {
					__processTemplate__codes.push(codePart);
				}
			});
			var sandboxPrototype = { __processTemplate__results : [] };
			if (aScope)
				sandboxPrototype = Object.create(aScope, {
					__processTemplate__results : Object.getOwnPropertyDescriptor(sandboxPrototype, '__processTemplate__results')
				});
			var sandbox = new Components.utils.Sandbox(this._global, {
				sandboxPrototype : sandboxPrototype
			});
			Components.utils.evalInSandbox(__processTemplate__codes.join('\n'), sandbox);
			return sandbox.__processTemplate__results.join('');
		},
		/**
		 * @private
		 * Returns the global object on the context.
		 */
		get _global()
		{
			return (function() { return this; })();
		}
	};
	/**
	 * A short-hand for evaluation.
	 *
	 * @example
	 *   var string = '<% for (var i = 0; i < 3; i++) { %>'+
	 *                '<li><%= label + i %></li>'+
	 *                '<% } %>';
	 *   EJS.result(string, { label: 'item' });
	 *   // => '<li>item0</li><li>item1</li><li>item2</li>'
	 *
	 * @param {string} aCode
	 *   A string including script fragments.
	 * @param {Object=} aScope
	 *   The namespace to evaluate script fragments in the string.
	 *   You can access properties of the object from script fragments
	 *   as simple local variables.
	 *
	 * @returns {string}
	 *   The result.
	 *
	 * @see result
	 */
	EJS.result = function(aCode, aScope) {
		return (new EJS(aCode)).result(aScope);
	};
	/** @private */
	EJS.revision = currentRevision;

	namespace.EJS = EJS;
})();
