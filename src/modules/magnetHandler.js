"use strict";

/* This js module doesn't export anything, it's meant to handle the protocol registration/unregistration */
var EXPORTED_SYMBOLS = [];

const Cc = Components.classes;
const Ci = Components.interfaces;

var manager = Components.manager.QueryInterface(Ci.nsIComponentRegistrar);

// Utility function to handle the preferences
// https://developer.mozilla.org/en/Code_snippets/Preferences
function PrefListener(branchName, func) {
    var prefService = Components.classes["@mozilla.org/preferences-service;1"]
                                .getService(Ci.nsIPrefService);
    var branch = prefService.getBranch(branchName);
    branch.QueryInterface(Components.interfaces.nsIPrefBranch2);

    this.register = function() {
        branch.addObserver("", this, false);
        branch.getChildList("", { })
              .forEach(function (name) { func(branch, name); });
    };

    this.unregister = function unregister() {
        if (branch)
            branch.removeObserver("", this);
    };

    this.observe = function(subject, topic, data) {
        if (topic == "nsPref:changed")
            func(branch, data);
    };
}


// our XPCOM components to handle the protocols
Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

function Magnet_ProtocolWrapper()
{
	var myHandler = function() {};

	myHandler.prototype = {
		QueryInterface: XPCOMUtils.generateQI([Ci.nsIProtocolHandler]),

		_xpcom_factory: {
			singleton: null,
			createInstance: function (aOuter, aIID) {
				if (aOuter) throw Components.results.NS_ERROR_NO_AGGREGATION;

				if (!this.singleton) this.singleton = new myHandler();
				return this.singleton.QueryInterface(aIID);
			}
		  },

		// nsIProtocolHandler implementation:

		// default attributes
		protocolFlags : Ci.nsIProtocolHandler.URI_LOADABLE_BY_ANYONE,
		defaultPort : -1,

		newURI : function(aSpec, aCharset, aBaseURI)
		{
			var uri = Components.classes["@mozilla.org/network/simple-uri;1"].createInstance(Ci.nsIURI);
			uri.spec = aSpec;
			return uri;
		},

		newChannel : function(aURI)
		{
			var observerService = Cc["@mozilla.org/observer-service;1"]
						.getService(Components.interfaces.nsIObserverService);
			observerService.notifyObservers(aURI, "magnet-on-open-uri", "magnet");

			// create dummy nsIURI and nsIChannel instances 
			var ios = Cc["@mozilla.org/network/io-service;1"]
						.getService(nsIIOService);
			return ios.newChannel("javascript:void()", null, null);
		},
		scheme : "magnet",
		classDescription : "Torrent Magnet Handler",
		classID : Components.ID( "{6dfabfd0-0aba-11e1-be50-0800200c9a66}" ),
		contractID : "@mozilla.org/network/protocol;1?name=magnet"
	}

	return myHandler;
}

// This function takes care of register/unregister the protocol handlers as requested
// It's called when the preferences change.
function toggleProtocolHandler(branch, name)
{
	if (name != "use_magnet") return;
	
	// Get the value in preferences
	var register = branch.getBoolPref(name);
	// Retrieve the object for that protocol
	
	var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
			.getService(Components.interfaces.nsIConsoleService);
	consoleService.logStringMessage("Synoloader: attempting to register protocol");

	try
	{
		var protocolHandler = magnetProtocol;
		var proto = protocolHandler.prototype;
	}
	catch (e)
	{
		consoleService.logStringMessage("Synoloader: error " + e);
	}

	if (register)
	{
		consoleService.logStringMessage("Synoloader: enabling");
		if (!protocolHandler.registered  && !manager.isCIDRegistered(proto.classID))
			manager.registerFactory(proto.classID,
							proto.classDescription,
							proto.contractID,
							proto._xpcom_factory);

		protocolHandler.registered = true;
	}
	else
	{
		consoleService.logStringMessage("Synoloader: disabling");
		if (protocolHandler.registered)
		    manager.unregisterFactory(proto.classID, proto._xpcom_factory);
		protocolHandler.registered = false;
	}
}

// Each protocol handler
var magnetProtocol = Magnet_ProtocolWrapper();

// Listen for changes in the preferences and register the protocols as needed.
var preferencesListener = new PrefListener("extensions.SynoLoader.", toggleProtocolHandler);
preferencesListener.register();
