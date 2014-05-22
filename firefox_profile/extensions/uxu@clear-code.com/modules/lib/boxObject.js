/*
 "getBoxObjectFor()" compatibility library for Firefox 3.6 or later

 Usage:
   // use instead of HTMLDocument.getBoxObjectFor(HTMLElement)
   var boxObject = window['piro.sakura.ne.jp']
                         .boxObject
                         .getBoxObjectFor(HTMLElement);

 license: The MIT License, Copyright (c) 2009-2010 YUKI "Piro" Hiroshi
   http://www.cozmixng.org/repos/piro/fx3-compatibility-lib/trunk/license.txt
 original:
   http://www.cozmixng.org/repos/piro/fx3-compatibility-lib/trunk/boxObject.js
   http://www.cozmixng.org/repos/piro/fx3-compatibility-lib/trunk/boxObject.test.js
   http://www.cozmixng.org/repos/piro/fx3-compatibility-lib/trunk/fixtures/box.html
*/

/* To work as a JS Code Module */
if (typeof window == 'undefined') {
	this.EXPORTED_SYMBOLS = ['boxObject'];

	// If namespace.jsm is available, export symbols to the shared namespace.
	// See: http://www.cozmixng.org/repos/piro/fx3-compatibility-lib/trunk/namespace.jsm
	try {
		let ns = {};
		Components.utils.import('resource://uxu-modules/lib/namespace.jsm', ns);
		/* var */ window = ns.getNamespaceFor('piro.sakura.ne.jp');
	}
	catch(e) {
		window = {};
	}
}

(function() {
	const currentRevision = 6;

	if (!('piro.sakura.ne.jp' in window)) window['piro.sakura.ne.jp'] = {};

	var loadedRevision = 'boxObject' in window['piro.sakura.ne.jp'] ?
			window['piro.sakura.ne.jp'].boxObject.revision :
			0 ;
	if (loadedRevision && loadedRevision > currentRevision) {
		return;
	}

	var Cc = Components.classes;
	var Ci = Components.interfaces;

	window['piro.sakura.ne.jp'].boxObject = {
		revision : currentRevision,

		getBoxObjectFor : function(aNode, aUnify)
		{
			return ('getBoxObjectFor' in aNode.ownerDocument) ?
					this.getBoxObjectFromBoxObjectFor(aNode, aUnify) :
					this.getBoxObjectFromClientRectFor(aNode, aUnify) ;
		},

		getBoxObjectFromBoxObjectFor : function(aNode, aUnify)
		{
			var boxObject = aNode.ownerDocument.getBoxObjectFor(aNode);
			var box = {
					x       : boxObject.x,
					y       : boxObject.y,
					width   : boxObject.width,
					height  : boxObject.height,
					screenX : boxObject.screenX,
					screenY : boxObject.screenY,
					element : aNode
				};
			if (!aUnify) return box;

			var style = this._getComputedStyle(aNode);
			box.left = box.x - this._getPropertyPixelValue(style, 'border-left-width');
			box.top = box.y - this._getPropertyPixelValue(style, 'border-top-width');
			if (style.getPropertyValue('position') == 'fixed') {
				box.left -= frame.scrollX;
				box.top  -= frame.scrollY;
			}
			box.right  = box.left + box.width;
			box.bottom = box.top + box.height;

			return box;
		},

		getBoxObjectFromClientRectFor : function(aNode, aUnify)
		{
			var box = {
					x       : 0,
					y       : 0,
					width   : 0,
					height  : 0,
					screenX : 0,
					screenY : 0,
					element : aNode
				};
			try {
				var zoom = this.getZoom(aNode.ownerDocument.defaultView);

				var rect = aNode.getBoundingClientRect();
				if (aUnify) {
					box.left   = rect.left;
					box.top    = rect.top;
					box.right  = rect.right;
					box.bottom = rect.bottom;
				}

				var style = this._getComputedStyle(aNode);
				var frame = aNode.ownerDocument.defaultView;

				// "x" and "y" are offset positions of the "padding-box" from the document top-left edge.
				box.x = rect.left + this._getPropertyPixelValue(style, 'border-left-width');
				box.y = rect.top + this._getPropertyPixelValue(style, 'border-top-width');
				if (style.getPropertyValue('position') != 'fixed') {
					box.x += frame.scrollX;
					box.y += frame.scrollY;
				}

				// "width" and "height" are sizes of the "border-box".
				box.width  = rect.right - rect.left;
				box.height = rect.bottom - rect.top;

				box.screenX = rect.left * zoom;
				box.screenY = rect.top * zoom;

				box.screenX += frame.mozInnerScreenX * zoom;
				box.screenY += frame.mozInnerScreenY * zoom;
			}
			catch(e) {
			}

			'x,y,screenX,screenY,width,height,left,top,right,bottom'
				.split(',')
				.forEach(function(aProperty) {
					if (aProperty in box)
						box[aProperty] = Math.round(box[aProperty]);
				});

			return box;
		},

		_getComputedStyle : function(aNode)
		{
			return aNode.ownerDocument.defaultView.getComputedStyle(aNode, null);
		},

		_getPropertyPixelValue : function(aStyle, aProperty)
		{
			return parseInt(aStyle.getPropertyValue(aProperty).replace('px', ''));
		},

		Prefs : Cc['@mozilla.org/preferences;1']
			.getService(Ci.nsIPrefBranch)
			.QueryInterface(Ci.nsIPrefBranch2),

		getZoom : function(aFrame)
		{
			try {
				if (!this.Prefs.getBoolPref('browser.zoom.full'))
					return 1;
			}
			catch(e) {
				return 1;
			}
			var markupDocumentViewer = aFrame.top
					.QueryInterface(Ci.nsIInterfaceRequestor)
					.getInterface(Ci.nsIWebNavigation)
					.QueryInterface(Ci.nsIDocShell)
					.contentViewer
					.QueryInterface(Ci.nsIMarkupDocumentViewer);
			return markupDocumentViewer.fullZoom;
		}

	};
})();

if (window != this) { // work as a JS Code Module
	this.boxObject = window['piro.sakura.ne.jp'].boxObject;
}
